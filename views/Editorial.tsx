"use client";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstitutionalSidebar from "@/components/InstitutionalSidebar";
import MetaTags from "@/components/MetaTags";
import { Separator } from "@/components/ui/separator";

const Editorial = () => {
  const editorialBoard = [
    {
      name: "Prof. Dr. Alireza Heidari",
      degree: "Ph.D., D.Sc.",
      field: "Chemistry, Molecular Spectroscopy, Cancer Research",
      affiliation: "California South University",
      country: "USA",
      additionalInfo: "WATOC, AACR, ASBMB – President, AISI"
    },
    {
      name: "Prof. Dr. Hasan Köten",
      degree: "Ph.D.",
      field: "Mechanical Engineering",
      affiliation: "Marmara University / Istanbul Medeniyet University",
      country: "Turkey",
      orcid: "0000-0002-1907-9420",
      scopusId: "36157946800"
    },
    {
      name: "Fadele Ayotunde Alaba",
      degree: "Ph.D.",
      field: "Computer Science",
      affiliation: "Federal University of Education, Zaria",
      country: "Nigeria"
    },
    {
      name: "Dr. Mohammad Taghipour",
      degree: "Ph.D.",
      field: "Industrial Engineering",
      affiliation: "Islamic Azad University, Tehran",
      country: "Iran",
      orcid: "0000-0003-3720-3795"
    },
    {
      name: "Dr. Chukwuebuka Okwonna",
      degree: "Ph.D.",
      field: "Mechanical Engineering",
      affiliation: "Abia State University",
      country: "Nigeria"
    },
    {
      name: "Dr. Harsh Vardhan Harsh",
      degree: "Ph.D.",
      field: "Research",
      affiliation: "Parul University",
      country: "India",
      orcid: "0000-0003-1310-8400",
      scopusId: "57105665500",
      researcherId: "F-4035-2016"
    },
    {
      name: "Dr. Abdullah Aydın",
      degree: "Ph.D.",
      field: "Science/Chemistry Education",
      affiliation: "Kırşehir Ahi Evran University",
      country: "Turkey"
    },
    {
      name: "Assoc. Prof. Dr. Ahmed Hameed Kaleel",
      degree: "Ph.D.",
      field: "Mechanical Engineering",
      affiliation: "JMI",
      country: "India",
      scopusId: "35118884500"
    },
    {
      name: "Dr. Ahmad Majar",
      degree: "Ph.D.",
      field: "Soil Engineering & Reclamation",
      affiliation: "Armenian National University of Architecture and Construction",
      country: "Armenia"
    },
    {
      name: "Dr. Brahim Necib",
      degree: "Ph.D.",
      field: "Aeronautics & Astronautics",
      affiliation: "Purdue University / University of Mentouri Constantine 1",
      country: "USA / Algeria"
    },
    {
      name: "Dr. Chan Chee Ming",
      degree: "Ph.D.",
      field: "Geotechnical Engineering",
      affiliation: "University of Sheffield / UTHM",
      country: "UK / Malaysia"
    },
    {
      name: "Dr. Maria Ciurea",
      degree: "Ph.D.",
      field: "Economics",
      affiliation: "University of Petrosani",
      country: "Romania",
      orcid: "0000-0001-5385-1464",
      scopusId: "57190949983",
      researcherId: "F-7861-2016"
    },
    {
      name: "Dr. Ahasanul Haque",
      degree: "Ph.D., FCIM UK",
      field: "Marketing",
      affiliation: "International Islamic University Malaysia",
      country: "Malaysia",
      orcid: "0000-0002-8084-7724",
      scopusId: "46461377600"
    },
    {
      name: "Dr. Ubaldo Comite",
      degree: "Ph.D.",
      field: "Public Administration & Management",
      affiliation: "Università Telematica Giustino Fortunato",
      country: "Italy"
    },
    {
      name: "Dr. Nwokeocha Ifeanyi Martins",
      degree: "Ph.D.",
      field: "Mass Communication",
      affiliation: "Federal University Otuoke",
      country: "Nigeria"
    },
    {
      name: "Dr. Nkiru Abumchukwu Enukora",
      degree: "Ph.D.",
      field: "Industrial/Organizational Psychology",
      affiliation: "",
      country: ""
    },
    {
      name: "Dr. Sunny Nwakanma",
      degree: "Ph.D.",
      field: "Vocational & Technical Education",
      affiliation: "Ignatius Ajuru University of Education",
      country: "Nigeria"
    },
    {
      name: "Dr. Ibrahim Shehu Kura Tabako",
      degree: "Ph.D.",
      field: "Medical Entomology",
      affiliation: "Abdulkadir Kure University",
      country: "Nigeria"
    },
    {
      name: "Dr. Paulino A. Oñal Jr.",
      degree: "Ph.D.",
      field: "Management",
      affiliation: "",
      country: "",
      orcid: "0000-0003-3365-058X"
    },
    {
      name: "Dr. Shaza Ahmad Asaad",
      degree: "Ph.D.",
      field: "Agricultural Engineering",
      affiliation: "Tishreen University & Tartous University",
      country: "Syria"
    },
    {
      name: "Dr. Pescaru Maria",
      degree: "Ph.D.",
      field: "Sociology",
      affiliation: "Politehnica University of Bucharest (Pitești)",
      country: "Romania"
    },
    {
      name: "Dr. Iwegbue Ishioma Nwanapayi",
      degree: "Ph.D.",
      field: "Library & Information Science",
      affiliation: "Delta State University, Abraka",
      country: "Nigeria"
    },
    {
      name: "Dr. Addi Juma Faki",
      degree: "Ph.D.",
      field: "Monitoring & Evaluation",
      affiliation: "Open University of Tanzania",
      country: "Tanzania"
    }
  ];

  // Inject Person JSON-LD for each editorial board member
  useEffect(() => {
    const origin = window.location.origin;
    const ld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "EP Journals Group Editorial Board",
      description: "International editorial board members across engineering, sciences, management, and social sciences.",
      url: `${origin}/editorial`,
      itemListElement: editorialBoard.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: m.name,
          honorificPrefix: m.degree || undefined,
          affiliation: m.affiliation ? { "@type": "Organization", name: m.affiliation } : undefined,
          ...(m.orcid ? { sameAs: [`https://orcid.org/${m.orcid}`] } : {}),
        },
      })),
    };
    const id = "ld-editorial";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) { el = document.createElement("script"); el.id = id; el.type = "application/ld+json"; document.head.appendChild(el); }
    el.textContent = JSON.stringify(ld);
    return () => { el?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Editorial Board | EP Journals Group"
        description="Meet the international editorial board of EP Journals Group, comprising scholars and researchers across engineering, sciences, management, and social sciences."
      />
      <Header />
      
      {/* Page Header */}
      <section className="py-6 bg-ep-cream border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-heading font-semibold text-foreground mb-1">
            Editorial Board
          </h1>
          <p className="text-muted-foreground text-sm">
            EP Journals Group Editorial Advisory Board — International scholars supporting rigorous peer review.
          </p>
        </div>
      </section>

      {/* Two-Column Academic Layout */}
      <main className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            
            {/* Left Column - Editorial Board */}
            <div className="min-w-0">
              
              {/* Introduction */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Advisory Board
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    The Editorial Advisory Board of EP Journals Group comprises distinguished scholars and researchers from institutions across the globe. Board members contribute expertise spanning engineering, natural sciences, social sciences, economics, management, and humanities. All members are accorded equal standing and participate collectively in upholding the standards of EP Journals Group publications.
                  </p>
                  <p className="text-muted-foreground">
                    The organisation does not employ hierarchical editorial structures. Editorial decisions are made collectively based on peer review recommendations and scholarly merit. Board members provide guidance on editorial policy, assist with peer review, and support the development of their respective journals.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Editorial Board Members Table */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Board Members
                </h2>
                
                <div className="space-y-4">
                  {editorialBoard.map((member, index) => (
                    <div key={index} className="border border-border p-4 bg-background">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-heading font-medium text-foreground text-sm">
                            {member.name}
                          </h3>
                          <p className="text-xs text-ep-orange font-medium">{member.degree}</p>
                          <p className="text-xs text-muted-foreground mt-1">{member.field}</p>
                          {member.affiliation && (
                            <p className="text-xs text-muted-foreground">
                              {member.affiliation}{member.country && `, ${member.country}`}
                            </p>
                          )}
                          {!member.affiliation && member.country && (
                            <p className="text-xs text-muted-foreground">{member.country}</p>
                          )}
                          {member.additionalInfo && (
                            <p className="text-xs text-muted-foreground italic mt-1">{member.additionalInfo}</p>
                          )}
                        </div>
                        
                        {/* Research Identifiers */}
                        <div className="text-xs space-y-0.5">
                          {member.orcid && (
                            <a 
                              href={`https://orcid.org/${member.orcid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ep-orange hover:underline block"
                            >
                              ORCID: {member.orcid}
                            </a>
                          )}
                          {member.scopusId && (
                            <a 
                              href={`https://www.scopus.com/authid/detail.uri?authorId=${member.scopusId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ep-orange hover:underline block"
                            >
                              Scopus: {member.scopusId}
                            </a>
                          )}
                          {member.researcherId && (
                            <p className="text-muted-foreground">ResearcherID: {member.researcherId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Editorial Process */}
              <div className="mb-6">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Editorial Process
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    All manuscripts submitted to EP Journals Group publications undergo rigorous double-blind peer review. The editorial process is designed to ensure objectivity, fairness, and scholarly quality.
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">1. Initial Screening</h3>
                      <p className="text-muted-foreground text-xs">
                        Manuscripts are reviewed for scope, quality, and adherence to journal guidelines. Submissions that do not meet basic requirements may be returned to authors without peer review.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">2. Peer Assignment</h3>
                      <p className="text-muted-foreground text-xs">
                        Papers are assigned to expert reviewers in the relevant field for thorough evaluation. A minimum of two independent reviewers evaluate each submission.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">3. Quality Assessment</h3>
                      <p className="text-muted-foreground text-xs">
                        Reviewers evaluate methodology, significance, originality, and contribution to the field. Reviewers provide constructive feedback to support author revisions.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-foreground mb-1">4. Editorial Decision</h3>
                      <p className="text-muted-foreground text-xs">
                        Final decision based on reviewer feedback and editorial assessment. Decisions may include acceptance, minor revision, major revision, or rejection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact */}
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3 border-b border-border pb-2">
                  Contact the Editorial Office
                </h2>
                <div className="prose-academic text-foreground text-sm">
                  <p>
                    For enquiries regarding the editorial process, peer review, or editorial board matters, please contact:
                  </p>
                  <div className="mt-3 p-4 bg-muted border border-border">
                    <p className="text-sm">
                      <strong>Editorial Office:</strong>{" "}
                      <a href="mailto:editor@ep-journals.org" className="text-ep-orange hover:underline">
                        editor@ep-journals.org
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Institutional Sidebar */}
            <InstitutionalSidebar variant="editorial" />

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Editorial;
