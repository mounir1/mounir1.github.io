import { type TestimonialInput } from "@/hooks/useTestimonials";

/**
 * Testimonials — intentionally empty.
 *
 * Only REAL, verifiable testimonials from actual clients/colleagues belong here.
 * The Testimonials section automatically hides itself while this list is empty
 * (and while the Firestore collection has no documents).
 *
 * To add a real testimonial, either:
 *  1. Add it via the Admin dashboard (/admin → Testimonials), or
 *  2. Add an entry here with the person's real name, role, company, and a
 *     source link (LinkedIn recommendation URL, email, etc.) so it can be verified.
 */
export const initialTestimonials: TestimonialInput[] = [];
