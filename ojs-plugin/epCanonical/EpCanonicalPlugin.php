<?php

/**
 * @file plugins/generic/epCanonical/EpCanonicalPlugin.php
 *
 * EP Journals Group — point each OJS article page's canonical URL at its copy
 * on www.ep-journals.org, the version of record. Without this, Google sees two
 * near-identical pages per article (OJS and the main site), each claiming to be
 * the original, and indexes only one of them — usually the OJS copy.
 *
 * The OJS-id → main-site-URL map comes from
 * https://www.ep-journals.org/api/ojs-canonical?journal=<path> and is cached on
 * disk for six hours. If the map is unavailable, OJS's own canonical is kept.
 *
 * Written for OJS 3.4 / 3.5.
 */

namespace APP\plugins\generic\epCanonical;

use APP\core\Application;
use PKP\core\Core;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;

class EpCanonicalPlugin extends GenericPlugin
{
    private const MAP_URL = 'https://www.ep-journals.org/api/ojs-canonical?journal=';
    private const CACHE_SECONDS = 21600; // 6 hours

    public function register($category, $path, $mainContextId = null)
    {
        $success = parent::register($category, $path, $mainContextId);
        if ($success && $this->getEnabled($mainContextId)) {
            Hook::add('TemplateManager::display', [$this, 'replaceCanonical']);
        }
        return $success;
    }

    public function getDisplayName()
    {
        return 'EP Journals canonical URLs';
    }

    public function getDescription()
    {
        return 'Sets each article page\'s canonical URL to its version of record on www.ep-journals.org.';
    }

    /**
     * Runs just before a template renders. On article landing pages, replace the
     * canonical <link> that ArticleHandler added under the header name "canonical".
     */
    public function replaceCanonical(string $hookName, array $args): bool
    {
        $templateMgr = $args[0];
        $template = $args[1];
        if ($template !== 'frontend/pages/article.tpl') {
            return Hook::CONTINUE;
        }

        $article = $templateMgr->getTemplateVars('article');
        $context = Application::get()->getRequest()->getContext();
        if (!$article || !$context) {
            return Hook::CONTINUE;
        }

        $map = $this->getMap($context->getPath());
        $target = $map[(string) $article->getBestId()] ?? $map[(string) $article->getId()] ?? null;
        if ($target && str_starts_with($target, 'https://www.ep-journals.org/')) {
            $templateMgr->addHeader(
                'canonical',
                '<link rel="canonical" href="' . htmlspecialchars($target, ENT_QUOTES) . '">'
            );
        }
        return Hook::CONTINUE;
    }

    /** OJS article id → main-site URL for one journal, cached on disk. */
    private function getMap(string $journalPath): array
    {
        $cacheFile = Core::getBaseDir() . '/cache/epCanonical-' . preg_replace('/[^a-z0-9]/i', '', $journalPath) . '.json';
        if (is_readable($cacheFile) && time() - filemtime($cacheFile) < self::CACHE_SECONDS) {
            $cached = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        try {
            $response = Application::get()->getHttpClient()->request(
                'GET',
                self::MAP_URL . rawurlencode($journalPath),
                ['timeout' => 5, 'headers' => ['Accept' => 'application/json']]
            );
            $map = json_decode((string) $response->getBody(), true);
            if (is_array($map) && !isset($map['error'])) {
                @file_put_contents($cacheFile, json_encode($map));
                return $map;
            }
        } catch (\Throwable $e) {
            error_log('epCanonical: could not load canonical map: ' . $e->getMessage());
        }

        // Fall back to a stale cache rather than nothing.
        if (is_readable($cacheFile)) {
            $stale = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($stale)) {
                return $stale;
            }
        }
        return [];
    }
}
