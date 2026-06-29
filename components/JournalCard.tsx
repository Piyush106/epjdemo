"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";

interface JournalCardProps {
  title: string;
  abbrev: string;
  issn: string;
  description: string;
  focus: string;
  scope: string;
  topics: string;
  url: string;
  submitUrl?: string;
}

const JournalCard = ({ title, abbrev, issn, description, focus, scope, topics, url, submitUrl }: JournalCardProps) => {
  return (
    <Card className="h-full bg-gradient-card border-0 shadow-card hover:shadow-elegant transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-ep-orange group-hover:text-ep-brown transition-colors duration-300">
              {title}
            </CardTitle>
            <CardDescription className="text-ep-gray mt-1 font-medium">
              {abbrev} ({issn})
            </CardDescription>
          </div>
          <FileText className="w-8 h-8 text-ep-orange opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-ep-cream text-ep-brown-dark px-3 py-1 rounded-full text-sm font-medium">
              {focus}
            </span>
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
              {scope}
            </span>
          </div>
          
          <div>
            <p className="text-sm font-medium text-ep-gray mb-1">Key Topics:</p>
            <p className="text-sm text-muted-foreground">{topics}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="ep" 
            className="flex-1"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Journal
            </a>
          </Button>
          
          <Button 
            variant="ep-teal" 
            className="flex-1"
            asChild
          >
            <a href={submitUrl || `mailto:editor@ep-journals.org`} target="_blank" rel="noopener noreferrer">
              Submit Paper
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalCard;