/**
 * Case Studies Index
 * Export all case studies for easy importing
 */

export { ecommerceModernization } from './ecommerce-modernization';

// Import all case studies
const caseStudies = [
  ecommerceModernization,
];

// Filter published and featured
export const getAllCaseStudies = () => caseStudies;
export const getPublishedCaseStudies = () => 
  caseStudies.filter(cs => cs.published);
export const getFeaturedCaseStudies = () => 
  caseStudies.filter(cs => cs.featured && cs.published);
export const getCaseStudyBySlug = (slug: string) => 
  caseStudies.find(cs => cs.slug === slug);

export default caseStudies;
