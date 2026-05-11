import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContactMessages, type MessageType } from "@/hooks/useContactMessages";
import {
  Mail, Phone, MapPin, Send, CheckCircle, Loader2,
  Linkedin, Github, MessageSquare, Briefcase, Users, Lightbulb,
} from "lucide-react";

const MESSAGE_TYPES: { value: MessageType; label: string; icon: any; description: string }[] = [
  { value: "hire",          label: "Hire Me",        icon: Briefcase,     description: "Full-time or contract position" },
  { value: "project",       label: "Project",        icon: Lightbulb,     description: "New project collaboration" },
  { value: "collaboration", label: "Collaboration",  icon: Users,         description: "Partnership or open-source" },
  { value: "general",       label: "General",        icon: MessageSquare, description: "Say hello or ask a question" },
];

const BUDGET_OPTIONS = [
  "< $1,000",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Let's discuss",
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  type: MessageType;
  budget: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
  type: "general",
  budget: "",
};

export function Contact() {
  const { submitMessage } = useContactMessages();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      await submitMessage({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        subject: form.subject || `${form.type} inquiry from ${form.name}`,
        message: form.message,
        type: form.type,
        budget: form.budget || undefined,
        metadata: {
          referrer: document.referrer,
          page: window.location.pathname,
        },
      });
      setStatus("sent");
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("Failed to send message:", err);
      setStatus("error");
      setErrorMsg("Failed to send your message. Please try emailing directly.");
    }
  }

  const selectedType = MESSAGE_TYPES.find((t) => t.value === form.type) ?? MESSAGE_TYPES[0];
  const showBudget = form.type === "hire" || form.type === "project";

  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-br from-card/20 via-background to-card/30">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            Let's Connect
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Start a Conversation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a project in mind, a role to fill, or just want to say hello?
            I read every message and respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">

          {/* ── Left: Contact Info ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Message type selector */}
            <div className="space-y-3">
              <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                What brings you here?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MESSAGE_TYPES.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("type", value)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 space-y-1 ${
                      form.type === value
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-card/50 border-border/60 hover:border-primary/30 hover:bg-card/80"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${form.type === value ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-4 p-5 rounded-2xl bg-card/60 border border-border/60">
              <p className="font-semibold">Direct Contact</p>
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "mounir.webdev@gmail.com",
                  href: "mailto:mounir.webdev@gmail.com",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+213 674 09 48 55",
                  href: "tel:+213674094855",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Algeria • Remote worldwide",
                  href: undefined,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    {href ? (
                      <a href={href} className="font-medium hover:text-primary transition-colors text-sm">
                        {value}
                      </a>
                    ) : (
                      <div className="font-medium text-sm">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/in/mounir1badi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              >
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                LinkedIn
              </a>
              <a
                href="https://github.com/mounir1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            {/* Response time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Typically responds within 24 hours
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 rounded-2xl bg-green-500/5 border border-green-500/20">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Message Sent!</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Thanks for reaching out. I'll get back to you within 24 hours.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStatus("idle")}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6 md:p-8 rounded-2xl bg-card/60 border border-border/60 shadow-medium"
              >
                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cf-name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cf-name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf-email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cf-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Company + Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cf-company">Company</Label>
                    <Input
                      id="cf-company"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cf-phone">Phone</Label>
                    <Input
                      id="cf-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="cf-subject">Subject</Label>
                  <Input
                    id="cf-subject"
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder={`${selectedType.label} inquiry`}
                  />
                </div>

                {/* Budget (conditional) */}
                {showBudget && (
                  <div className="space-y-2">
                    <Label htmlFor="cf-budget">Budget Range</Label>
                    <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                      <SelectTrigger id="cf-budget">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGET_OPTIONS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="cf-message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="cf-message"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder={
                      form.type === "hire"
                        ? "Tell me about the role, team, and what you're looking for…"
                        : form.type === "project"
                        ? "Describe your project, goals, timeline, and tech stack…"
                        : form.type === "collaboration"
                        ? "What are you building and how can we work together?"
                        : "Hi Mounir, I wanted to reach out because…"
                    }
                    rows={5}
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {form.message.length} characters
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={status === "sending" || !form.name || !form.email || !form.message}
                  className="w-full h-12 text-base shadow-glow hover:shadow-large transition-all duration-300"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your message is sent securely and stored privately. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
