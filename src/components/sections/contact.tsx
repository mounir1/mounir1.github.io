/**
 * Contact Form Section
 * – Zod-validated form (react-hook-form)
 * – Saves to Firestore "contact_messages" collection
 * – Falls back to mailto: when Firebase is off
 * – Tracks submission via useAnalytics
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDoc, collection } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle, Mail, MapPin, Phone, Send, Loader2,
  Github, Linkedin, Clock,
} from "lucide-react";
import { useSectionTracker } from "@/hooks/useAnalytics";

// ─── Schema ───────────────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});
type ContactFormData = z.infer<typeof contactSchema>;

const BUDGET_OPTIONS = [
  "< $1,000", "$1,000 – $5,000", "$5,000 – $15,000",
  "$15,000 – $50,000", "$50,000+", "To be discussed",
];

const TIMELINE_OPTIONS = [
  "ASAP", "1–2 weeks", "1 month", "2–3 months", "3–6 months", "Flexible",
];

// ─── Floating info card ───────────────────────────────────────────────────────
function InfoItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 group">
      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  return <div>{content}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ContactForm() {
  const sectionRef = useSectionTracker("contact");
  const { trackContact, trackLink } = useAnalytics();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactFormData) {
    setSubmitError(null);
    try {
      if (isFirebaseEnabled && db) {
        await addDoc(collection(db, "contact_messages"), {
          ...data,
          createdAt: Date.now(),
          read: false,
          replied: false,
          source: "portfolio_contact_form",
        });
        trackContact();
        setSubmitted(true);
        reset();
      } else {
        // Fallback: open mailto
        const body = encodeURIComponent(
          `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company ?? "N/A"}\n\n${data.message}`
        );
        window.open(`mailto:mounir.webdev@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${body}`);
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitError("Failed to send message. Please try again or email directly.");
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef as React.Ref<HTMLElement>}
      className="py-20 px-6 bg-gradient-to-br from-card/30 via-background to-card/30"
    >
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30">Get In Touch</Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Let's Build Something Great
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to transform your ideas into reality? I specialize in creating scalable,
            high-performance solutions that drive business growth.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* ── Left: info ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardContent className="pt-6 space-y-5">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-4">
                  <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value="mounir.webdev@gmail.com" href="mailto:mounir.webdev@gmail.com" />
                  <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone / WhatsApp" value="+213 674 09 48 55" href="tel:+213674094855" />
                  <InfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value="Algeria · Available Remote" />
                  <InfoItem icon={<Clock className="w-4 h-4" />} label="Response time" value="Usually within 24 hours" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Follow Me</h3>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://linkedin.com/in/mounir1badi"
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => trackLink("linkedin")}
                    className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100/60 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">LinkedIn Profile</span>
                  </a>
                  <a
                    href="https://github.com/mounir1"
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => trackLink("github")}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors group"
                  >
                    <Github className="w-5 h-5" />
                    <span className="text-sm font-medium">GitHub Profile</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Open For</h3>
                <div className="flex flex-wrap gap-2">
                  {["Full-Stack Projects", "React / Node.js", "E-commerce", "API Integrations", "Consulting", "Remote Work"].map((t) => (
                    <Badge key={t} variant="outline" className="text-xs border-primary/30 text-primary">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: form ───────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 h-full flex items-center justify-center">
                <CardContent className="text-center space-y-4 py-16">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. I'll get back to you within 24 hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {submitError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" placeholder="John Doe" {...register("name")} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@company.com" {...register("email")} />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input id="company" placeholder="Acme Corp" {...register("company")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input id="subject" placeholder="Project Inquiry" {...register("subject")} />
                        {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="budget">Budget Range</Label>
                        <select
                          id="budget"
                          {...register("budget")}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select budget…</option>
                          {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="timeline">Timeline</Label>
                        <select
                          id="timeline"
                          {...register("timeline")}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select timeline…</option>
                          {TIMELINE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="Tell me about your project, goals, and any technical requirements…"
                        {...register("message")}
                      />
                      {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full shadow-glow hover:shadow-large transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" />Send Message</>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree your data will be used to respond to your inquiry.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
