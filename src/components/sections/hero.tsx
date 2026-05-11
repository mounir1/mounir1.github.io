import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Download, MapPin, Calendar } from "lucide-react";
import { Signature } from "@/components/ui/signature";
import { useSettings } from "@/hooks/useSettings";

const AVAILABILITY_CONFIG = {
  available:   { label: "Available for Work",   color: "bg-green-500",  badgeClass: "bg-green-500/10 text-green-700 border-green-500/30" },
  limited:     { label: "Limited Availability", color: "bg-yellow-500", badgeClass: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  busy:        { label: "Currently Busy",        color: "bg-orange-500", badgeClass: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  unavailable: { label: "Not Available",         color: "bg-red-500",    badgeClass: "bg-red-500/10 text-red-700 border-red-500/30" },
};

export const Hero = () => {
  const { settings } = useSettings();
  const { personalInfo, heroStats, social } = settings;

  const availability = AVAILABILITY_CONFIG[personalInfo.availability] ?? AVAILABILITY_CONFIG.available;

  const handleDownloadCV = () => {
    const link = document.createElement("a");
    link.href = personalInfo.resumeUrl ?? "/Mounir_CV_2025.pdf";
    link.download = "Mounir_Abderrahmani_CV_2025.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-subtle px-6 py-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: Text Content ── */}
        <div className="text-center lg:text-left space-y-8">

          {/* Availability badge */}
          <div className="flex justify-center lg:justify-start">
            <Badge className={`${availability.badgeClass} text-sm px-4 py-1.5 flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${availability.color} animate-pulse`} />
              {availability.label}
              {personalInfo.availabilityNote && (
                <span className="text-xs opacity-70">· {personalInfo.availabilityNote}</span>
              )}
            </Badge>
          </div>

          {/* Name & title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {personalInfo.name.split(" ")[0]}
              </span>
              <br />
              <span className="text-foreground/80">
                {personalInfo.name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-medium text-muted-foreground">
                {personalInfo.title}
              </h2>
              <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{heroStats.yearsExperience}+ Years Experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {personalInfo.bio}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Button
              size="lg"
              className="text-lg px-10 py-4 shadow-glow hover:shadow-large transition-all duration-300 hover:scale-105"
              onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span>View My Work</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-4 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
              onClick={handleDownloadCV}
            >
              <Download className="mr-2 h-5 w-5" />
              <span>Download CV</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-8 justify-center lg:justify-start flex-wrap">
            <div className="text-center group cursor-default">
              <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                {heroStats.yearsExperience}+
              </div>
              <div className="text-sm text-muted-foreground">Years</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center group cursor-default">
              <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                {heroStats.projectsCompleted}+
              </div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center group cursor-default">
              <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                {heroStats.usersServed}
              </div>
              <div className="text-sm text-muted-foreground">Users Served</div>
            </div>
            {heroStats.clientSatisfaction && (
              <>
                <div className="w-px h-12 bg-border" />
                <div className="text-center group cursor-default">
                  <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                    {heroStats.clientSatisfaction}
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </>
            )}
          </div>

          {/* Social links */}
          {(social.linkedin || social.github) && (
            <div className="flex items-center gap-3 justify-center lg:justify-start pt-2">
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {social.linkedin && social.github && (
                <span className="text-border">·</span>
              )}
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          )}

          {/* Signature */}
          <div className="flex justify-center lg:justify-start pt-4">
            <Signature size="sm" variant="minimal" className="opacity-60" />
          </div>
        </div>

        {/* ── Right: Profile Image ── */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative">
              <img
                src={personalInfo.profilePhoto ?? "/profile.webp"}
                alt={`${personalInfo.name} — ${personalInfo.title}`}
                className="relative w-full max-w-lg rounded-3xl shadow-large hover:shadow-glow transition-all duration-500 group-hover:scale-105 object-cover aspect-square"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent rounded-3xl" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
