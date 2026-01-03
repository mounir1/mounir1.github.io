import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  pimExpertise, 
  etlExpertise, 
  companyPartners,
  integrationTechStack 
} from "@/data/pim-expertise";
import { caseStudies, serviceOfferings } from "@/data/case-studies";
import { ArrowRight, CheckCircle, Zap, TrendingUp } from "lucide-react";

/**
 * PIM & Integration Expertise Showcase Component
 * Displays expertise in Akeneo, Pimcore, Magento, and enterprise integrations
 */
export const PIMExpertiseSection: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [selectedETL, setSelectedETL] = useState(0);

  const platform = pimExpertise[selectedPlatform];
  const etl = etlExpertise[selectedETL];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 space-y-16">
        {/* Hero Section */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            PIM & Enterprise Integration Expertise
          </h2>
          <p className="text-xl text-muted-foreground">
            Bridge the gap between Product Information Management and eCommerce platforms.
            Specialized in Akeneo, Pimcore, and Magento 2 integrations.
          </p>
        </div>

        {/* Platform Expertise Tabs */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Platform Expertise</h3>
            <Tabs value={selectedPlatform.toString()} onValueChange={(v: string) => setSelectedPlatform(parseInt(v))}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {pimExpertise.map((p, idx) => (
                  <TabsTrigger key={idx} value={idx.toString()} className="data-[state=active]:bg-primary">
                    {p.icon} {p.platform}
                  </TabsTrigger>
                ))}
              </TabsList>

              {pimExpertise.map((p, idx) => (
                <TabsContent key={idx} value={idx.toString()} className="space-y-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Card */}
                    <div className="lg:col-span-2">
                      <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <CardTitle className="text-3xl">{p.platform}</CardTitle>
                              <CardDescription className="text-base mt-2">
                                {p.description}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-lg px-4 py-2 h-fit">
                              {p.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                            <Badge variant="secondary">{p.experience} Experience</Badge>
                            <div className="text-sm text-muted-foreground">
                              Integrated with: {p.integratedWith.join(", ")}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Key Features & Capabilities
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {p.keyFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-1">▸</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Metrics Card */}
                    <div className="space-y-4">
                      <Card className="border-primary/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Success Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {p.successMetrics.map((metric, i) => (
                            <div key={i} className="space-y-1">
                              <div className="text-sm text-muted-foreground">{metric.label}</div>
                              <div className="text-2xl font-bold text-primary">{metric.value}</div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* ETL Expertise */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">ETL & Data Pipeline Expertise</h3>
            <Tabs value={selectedETL.toString()} onValueChange={(v: string) => setSelectedETL(parseInt(v))}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {etlExpertise.map((e, idx) => (
                  <TabsTrigger key={idx} value={idx.toString()}>
                    {e.icon} {e.name.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {etlExpertise.map((e, idx) => (
                <TabsContent key={idx} value={idx.toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        {e.icon} {e.name}
                      </CardTitle>
                      <CardDescription className="text-base">{e.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Tools & Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {e.tools.map((tool, i) => (
                              <Badge key={i} variant="secondary">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Key Features
                          </h4>
                          <ul className="space-y-2">
                            {e.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-1">▸</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="font-semibold mb-4">Use Cases</h4>
                        <ul className="space-y-2">
                          {e.useCases.map((useCase, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Featured Case Studies */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Featured Case Studies</h3>
            <div className="grid lg:grid-cols-2 gap-6">
              {caseStudies
                .filter((cs) => cs.featured)
                .sort((a, b) => b.priority - a.priority)
                .map((study) => (
                  <Card key={study.id} className="border-primary/20 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <CardTitle>{study.title}</CardTitle>
                          <CardDescription>{study.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline">{study.client}</Badge>
                        <Badge variant="secondary">{study.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {study.results.slice(0, 4).map((result, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3">
                            <div className="text-2xl mb-1">{result.icon}</div>
                            <div className="text-lg font-bold text-primary">{result.value}</div>
                            <div className="text-xs text-muted-foreground">{result.metric}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Company Partners */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Company Partnerships</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {companyPartners.map((partner) => (
                <Card key={partner.name} className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      {partner.icon} {partner.name}
                    </CardTitle>
                    <CardDescription>{partner.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Expertise Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {partner.expertise.map((exp, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.collaboration}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6">Integration Tech Stack</h3>
            <div className="grid lg:grid-cols-2 gap-6">
              {integrationTechStack.map((stack, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{stack.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stack.technologies.map((tech, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{tech.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {tech.proficiency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{tech.yearsExperience}+ years</span>
                            <span>•</span>
                            <span>{tech.relevance.join(", ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Services CTA */}
        <div className="space-y-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold">Service Offerings</h3>
            <p className="text-muted-foreground">
              Comprehensive services to optimize your PIM and integration infrastructure
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceOfferings.map((service) => (
              <Card key={service.id} className="border-primary/20 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Includes</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Timeline: </span>
                      <span className="font-medium">{service.timeline}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PIMExpertiseSection;
