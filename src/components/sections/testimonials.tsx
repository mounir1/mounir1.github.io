import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/hooks/useTestimonials";
import { ChevronLeft, ChevronRight, Quote, CheckCircle, Star, Loader2 } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  email: "Email",
  upwork: "Upwork",
  direct: "Direct",
  referral: "Referral",
  other: "Other",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { testimonials, featured, loading } = useTestimonials();
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show ALL visible testimonials, featured ones first — a testimonial added
  // via Admin should appear even if the "featured" flag wasn't ticked.
  // (The section still auto-hides while there are zero testimonials.)
  const visible = [
    ...featured,
    ...testimonials.filter((t) => !t.disabled && !featured.includes(t)),
  ];

  if (loading) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (visible.length === 0) return null;

  const total = visible.length;

  function goTo(index: number) {
    setCurrent(((index % total) + total) % total);
  }

  const t = visible[current % total];

  return (
    <section id="testimonials" className="py-24 px-6 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            Client Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            What Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from clients and collaborators I've worked with over the years.
          </p>
        </div>

        {/* Main Featured Testimonial */}
        <div className="relative">
          {/* Navigation — left */}
          {total > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(current - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full shadow-medium hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Card */}
          <div
            ref={containerRef}
            className="relative mx-auto max-w-3xl rounded-3xl bg-card/80 border border-border/60 p-8 md:p-12 shadow-large overflow-hidden"
          >
            {/* Background quote mark */}
            <Quote className="absolute top-6 right-8 h-24 w-24 text-primary/5 rotate-180" />

            <div className="relative space-y-6">
              {/* Stars + Source */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <StarRating rating={t.rating} />
                <div className="flex items-center gap-2">
                  {t.verified && (
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {SOURCE_LABELS[t.source] ?? t.source}
                  </Badge>
                </div>
              </div>

              {/* Quote text */}
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
                <Quote className="inline h-5 w-5 text-primary/60 mr-1 -mt-1" />
                {t.content}
                <Quote className="inline h-5 w-5 text-primary/60 ml-1 -mb-1 rotate-180" />
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-2">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-lg font-bold text-primary">
                      {t.author.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-bold text-base">{t.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.role}
                    {t.company && (
                      <span>
                        {" · "}
                        {t.companyUrl ? (
                          <a
                            href={t.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {t.company}
                          </a>
                        ) : (
                          t.company
                        )}
                      </span>
                    )}
                  </div>
                  {t.projectName && (
                    <div className="text-xs text-primary/70 mt-0.5">
                      Project: {t.projectName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation — right */}
          {total > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => goTo(current + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full shadow-medium hidden md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Dot indicators + mobile nav */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goTo(current - 1)}
              className="md:hidden h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {visible.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goTo(current + 1)}
              className="md:hidden h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mini testimonial grid (show all except current on desktop) */}
        {total > 1 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {visible
              .filter((_, i) => i !== current)
              .slice(0, 3)
              .map((testimonial, i) => (
                <button
                  key={testimonial.id ?? i}
                  onClick={() => goTo(visible.indexOf(testimonial))}
                  className="text-left p-4 rounded-2xl bg-card/50 border border-border/60 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 space-y-3 group"
                >
                  <StarRating rating={testimonial.rating} />
                  <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-2">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-28">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
