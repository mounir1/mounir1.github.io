/**
 * Testimonials – public portfolio section
 * Auto-rotates featured testimonials, falls back gracefully if Firebase is off.
 */
import { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useSectionTracker } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// ─── Static fallback data (shown when Firebase is off / no data yet) ──────────
const FALLBACK: Array<{
  clientName: string; clientTitle: string; clientCompany: string;
  content: string; rating: number; clientPhoto?: string;
}> = [
  {
    clientName: "Ahmed Benali",
    clientTitle: "CTO",
    clientCompany: "HoTech Systems",
    rating: 5,
    content:
      "Mounir delivered an enterprise-grade ETL platform that processes millions of records daily with sub-second latency. His architectural decisions saved us months of rework and his code quality is exceptional.",
  },
  {
    clientName: "Sarah Mansouri",
    clientTitle: "Product Manager",
    clientCompany: "TechnoStationery",
    rating: 5,
    content:
      "We went from a broken Magento store to a fully automated B2B e-commerce platform in just 4 months. Mounir's expertise in WooCommerce and API integrations was exactly what we needed.",
  },
  {
    clientName: "Karim Djaballah",
    clientTitle: "CEO",
    clientCompany: "Noor Al Maarifa",
    rating: 5,
    content:
      "Our React application now handles 10x more traffic thanks to Mounir's optimisations. The code is clean, well-documented, and the team can easily maintain it. Highly recommended.",
  },
  {
    clientName: "Leila Chabane",
    clientTitle: "Engineering Lead",
    clientCompany: "JSKit",
    rating: 5,
    content:
      "Mounir brought deep React and TypeScript expertise to our team. He introduced best practices that elevated the whole codebase and mentored junior developers along the way.",
  },
];

// ─── Star rating ──────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("w-4 h-4", i < rating ? "fill-amber-400 text-amber-400" : "text-border")} />
      ))}
    </div>
  );
}

// ─── Single card ──────────────────────────────────────────────────────────────
function TestimonialCard({
  clientName, clientTitle, clientCompany, content, rating, clientPhoto, index, active,
}: {
  clientName: string; clientTitle: string; clientCompany: string;
  content: string; rating: number; clientPhoto?: string;
  index: number; active: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative border border-border/60 transition-all duration-500 hover:shadow-large",
        active ? "opacity-100 scale-100" : "opacity-60 scale-[0.97]"
      )}
    >
      <CardContent className="pt-6 pb-6 px-6 space-y-5">
        <Quote className="w-8 h-8 text-primary/30" />
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base italic">
          "{content}"
        </p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {clientPhoto ? (
              <img
                src={clientPhoto}
                alt={clientName}
                className="w-10 h-10 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary/60" />
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{clientName}</div>
              <div className="text-xs text-muted-foreground">{clientTitle}</div>
              <Badge variant="outline" className="text-[10px] mt-0.5 py-0">{clientCompany}</Badge>
            </div>
          </div>
          <Stars rating={rating} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function Testimonials() {
  const { testimonials, loading } = useTestimonials();
  const sectionRef = useSectionTracker("testimonials");
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use live data or fallback
  const items = testimonials.length > 0 ? testimonials : FALLBACK;
  const total = items.length;

  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  // Auto-rotate every 5s
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const pauseRotation = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeRotation = () => { timerRef.current = setInterval(next, 5000); };

  if (loading) {
    return (
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          Loading testimonials…
        </div>
      </section>
    );
  }

  // Show 3 cards at a time on lg, 1 on mobile
  const visibleIndexes = [
    (active - 1 + total) % total,
    active,
    (active + 1) % total,
  ];

  return (
    <section
      id="testimonials"
      ref={sectionRef as React.Ref<HTMLElement>}
      className="py-20 px-6 bg-gradient-to-br from-background via-card/20 to-background"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30">
            Client Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            What Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted by teams across Algeria and beyond to deliver quality software solutions.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseRotation}
          onMouseLeave={resumeRotation}
        >
          {/* Mobile: single card */}
          <div className="block lg:hidden">
            <TestimonialCard {...items[active]} index={active} active={true} clientName={(items[active] as {clientName:string}).clientName} clientTitle={(items[active] as {clientTitle:string}).clientTitle} clientCompany={(items[active] as {clientCompany:string}).clientCompany} content={(items[active] as {content:string}).content} rating={(items[active] as {rating:number}).rating} clientPhoto={(items[active] as {clientPhoto?:string}).clientPhoto} />
          </div>

          {/* Desktop: 3-column */}
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {visibleIndexes.map((idx, pos) => {
              const item = items[idx];
              return (
                <TestimonialCard
                  key={`${idx}-${pos}`}
                  clientName={(item as {clientName:string}).clientName}
                  clientTitle={(item as {clientTitle:string}).clientTitle}
                  clientCompany={(item as {clientCompany:string}).clientCompany}
                  content={(item as {content:string}).content}
                  rating={(item as {rating:number}).rating}
                  clientPhoto={(item as {clientPhoto?:string}).clientPhoto}
                  index={idx}
                  active={pos === 1}
                />
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    i === active ? "bg-primary w-6" : "bg-border hover:bg-primary/50"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-border/40">
          {[
            { value: "150+", label: "Projects Delivered" },
            { value: "50+", label: "Happy Clients" },
            { value: "10+", label: "Years Experience" },
            { value: "5.0", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
