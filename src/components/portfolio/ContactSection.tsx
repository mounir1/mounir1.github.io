/**
 * Contact and Networking Section
 * Animated contact form, social media integration, availability status, and downloadable resume
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Download,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  Globe,
  MessageSquare,
  Clock,
  User,
  Building2
} from 'lucide-react';

// Define type for dataLayer
interface DataLayerEvent {
  event: string;
  [key: string]: string | number | boolean | object | undefined;
}

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  projectType?: 'web-development' | 'mobile-app' | 'consulting' | 'other';
  budget?: 'under-5k' | '5k-15k' | '15k-50k' | '50k-plus' | 'discuss';
  timeline?: 'asap' | '1-month' | '3-months' | '6-months' | 'flexible';
}

// Social media links interface
interface SocialLink {
  platform: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  username?: string;
  followers?: number;
  verified?: boolean;
}

// Availability status interface
interface AvailabilityStatus {
  available: boolean;
  status: 'available' | 'busy' | 'partially-available' | 'unavailable';
  message: string;
  nextAvailable?: Date;
  responseTime: string;
  workingHours: {
    timezone: string;
    start: string;
    end: string;
    days: string[];
  };
}

interface ContactSectionProps {
  className?: string;
  contactInfo?: {
    email: string;
    phone?: string;
    location: string;
    resumeUrl?: string;
  };
  socialLinks?: SocialLink[];
  availability?: AvailabilityStatus;
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

// Floating label input component
interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  className
}) => {
  const id = useRef(`input-${Math.random().toString(36).substr(2, 9)}`).current;
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={cn(
          "pt-6 pb-2 px-4 transition-all duration-200",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "text-muted-foreground",
          focused || value ? "top-2 text-xs" : "top-1/2 -translate-y-1/2 text-base",
          error && "text-destructive"
        )}
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {error && (
        <div className="flex items-center mt-1 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

// Contact Section Component
export const ContactSection: React.FC<ContactSectionProps> = ({
  className,
  contactInfo = {
    email: "mounir.webdev@gmail.com",
    phone: "+213 555 123 456",
    location: "Algiers, Algeria",
    resumeUrl: "/resume.pdf"
  },
  socialLinks = [
    {
      platform: "GitHub",
      url: "https://github.com/mounir",
      icon: Github,
      username: "@mounir",
      followers: 1200,
      verified: true
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/mounir",
      icon: Linkedin,
      username: "Mounir Abderrahmani",
      followers: 5000,
      verified: true
    },
    {
      platform: "Twitter",
      url: "https://twitter.com/mounir",
      icon: Twitter,
      username: "@mounir",
      followers: 3200,
      verified: false
    }
  ],
  availability = {
    available: true,
    status: "available",
    message: "Currently available for new projects",
    responseTime: "Within 2 hours",
    workingHours: {
      timezone: "CET (UTC+1)",
      start: "09:00",
      end: "18:00",
      days: ["Mon-Fri"]
    }
  },
  onSubmit
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const formRef = useRef<HTMLDivElement>(null);

  // Push event to dataLayer if available
  const pushToDataLayer = (eventData: DataLayerEvent) => {
    if (typeof window !== 'undefined' && (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer) {
      (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer.push(eventData);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = "Please enter your full name";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission event
    pushToDataLayer({
      event: 'contact_form_submit',
      formType: 'contact_section'
    });
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset form after successful submission
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle form visibility with dataLayer tracking
  const toggleForm = () => {
    const newShowForm = !showForm;
    setShowForm(newShowForm);
    
    pushToDataLayer({
      event: 'contact_form_toggle',
      action: newShowForm ? 'open' : 'close'
    });
  };

  // Status badge component
  const StatusBadge = () => {
    const statusConfig = {
      available: { text: "Available", className: "bg-green-100 text-green-800 border-green-200" },
      busy: { text: "Busy", className: "bg-red-100 text-red-800 border-red-200" },
      "partially-available": { text: "Partially Available", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      unavailable: { text: "Unavailable", className: "bg-gray-100 text-gray-800 border-gray-200" }
    };
    
    const config = statusConfig[availability.status] || statusConfig.available;
    
    return (
      <Badge 
        className={cn(
          "px-3 py-1 text-xs font-medium border",
          config.className
        )}
      >
        <div className={cn(
          "w-2 h-2 rounded-full mr-2",
          availability.status === "available" && "bg-green-500",
          availability.status === "busy" && "bg-red-500",
          availability.status === "partially-available" && "bg-yellow-500",
          availability.status === "unavailable" && "bg-gray-500"
        )} />
        {config.text}
      </Badge>
    );
  };

  return (
    <section id="contact-section" className={cn("py-16 md:py-24", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how we can bring your ideas to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Availability Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge />
                  <span className="text-sm text-muted-foreground">{availability.message}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {availability.responseTime}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${contactInfo.email}`} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => pushToDataLayer({ event: 'contact_email_click' })}
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <a 
                        href={`tel:${contactInfo.phone}`} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => pushToDataLayer({ event: 'contact_phone_click' })}
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{contactInfo.location}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <p className="font-medium mb-3">Connect with me</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="track-click flex items-center gap-2"
                        onClick={() => {
                          pushToDataLayer({
                            event: 'social_link_click',
                            platform: link.platform,
                            url: link.url
                          });
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {link.username}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Resume Download */}
              {contactInfo.resumeUrl && (
                <Button 
                  className="w-full track-click"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'resume_download',
                      action: 'click'
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showForm ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground mb-6">
                    Ready to start a project or have questions? Click below to open the contact form.
                  </p>
                  <Button 
                    onClick={toggleForm}
                    className="track-click"
                  >
                    Open Contact Form
                  </Button>
                </div>
              ) : (
                <div 
                  ref={formRef}
                  className={cn(
                    "contact-form-container",
                    showForm ? "contact-form-expanded" : "contact-form-collapsed"
                  )}
                >
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. I'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <FloatingLabelInput
                        label="Full Name"
                        value={formData.name}
                        onChange={(value) => handleInputChange("name", value)}
                        required
                        error={errors.name}
                      />
                      
                      <FloatingLabelInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        required
                        error={errors.email}
                      />
                      
                      <FloatingLabelInput
                        label="Subject"
                        value={formData.subject}
                        onChange={(value) => handleInputChange("subject", value)}
                        required
                        error={errors.subject}
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Message <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Tell me about your project, goals, or any questions you have..."
                          rows={5}
                          className={cn(
                            "min-h-[120px]",
                            errors.message && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {errors.message && (
                          <div className="flex items-center text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="track-click flex-1"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={toggleForm}
                          className="track-click flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};