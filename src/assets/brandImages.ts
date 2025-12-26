// Mumtaz Health Brand Images
// These are the official brand photos of Mumtaz to be used throughout the app

import mumtazYoga1 from "@/assets/mumtaz-yoga-1.jpg";
import mumtazYoga2 from "@/assets/mumtaz-yoga-2.jpeg";
import mumtazYoga3 from "@/assets/mumtaz-yoga-3.jpg";
import mumtazYoga4 from "@/assets/mumtaz-yoga-4.jpeg";
import mumtazYoga5 from "@/assets/mumtaz-yoga-5.jpeg";
import mumtazYoga6 from "@/assets/mumtaz-yoga-6.jpeg";
import mumtazYoga7 from "@/assets/mumtaz-yoga-7.jpeg";
import mumtazYoga8 from "@/assets/mumtaz-yoga-8.jpg";
import mumtazYoga9 from "@/assets/mumtaz-yoga-9.jpg";
import mumtazYoga10 from "@/assets/mumtaz-yoga-10.jpg";

// Export all brand images
export const brandImages = {
  // Dynamic/Active poses
  yoga1: mumtazYoga1,      // Red outfit, dynamic kneeling leg lift
  yoga2: mumtazYoga2,      // Teal outfit, kneeling hamstring stretch
  yoga3: mumtazYoga3,      // Splits pose with arms overhead
  yoga4: mumtazYoga4,      // Core work, legs up with block
  yoga5: mumtazYoga5,      // Core scissors pose with block
  yoga6: mumtazYoga6,      // Reverse warrior in black
  yoga7: mumtazYoga7,      // Thread the needle shoulder stretch
  yoga8: mumtazYoga8,      // Pigeon pose variation, brick wall
  yoga9: mumtazYoga9,      // One-legged king pigeon, purple hijab
  yoga10: mumtazYoga10,    // Extended side angle, outdoor park
};

// Categorized brand images for different content types
export const brandImagesByCategory = {
  yoga: [brandImages.yoga1, brandImages.yoga6, brandImages.yoga10, brandImages.yoga8],
  mobility: [brandImages.yoga2, brandImages.yoga7, brandImages.yoga9],
  core: [brandImages.yoga4, brandImages.yoga5],
  flexibility: [brandImages.yoga3, brandImages.yoga9, brandImages.yoga8],
  meditation: [brandImages.yoga8, brandImages.yoga9],
  ayurveda: [brandImages.yoga6, brandImages.yoga10],
  pregnancy: [brandImages.yoga2, brandImages.yoga7],
  menopause: [brandImages.yoga7, brandImages.yoga2],
  emotional: [brandImages.yoga8, brandImages.yoga7],
};

// Get a brand image based on content type and tags
export const getBrandImage = (contentType: string, tags?: string[]): string => {
  // Check for specific tag matches first
  if (tags?.some(tag => ['core', 'abdominal', 'strength'].includes(tag))) {
    return brandImagesByCategory.core[0];
  }
  if (tags?.some(tag => ['flexibility', 'stretchy', 'splits'].includes(tag))) {
    return brandImagesByCategory.flexibility[0];
  }
  if (tags?.some(tag => ['mobility', 'arthritis', 'joint-care', 'gentle'].includes(tag))) {
    return brandImagesByCategory.mobility[Math.floor(Math.random() * brandImagesByCategory.mobility.length)];
  }
  if (tags?.some(tag => ['meditation', 'breathwork', 'spiritual', 'calming'].includes(tag))) {
    return brandImagesByCategory.meditation[0];
  }
  if (tags?.some(tag => ['pregnancy', 'prenatal', 'postpartum'].includes(tag))) {
    return brandImagesByCategory.pregnancy[0];
  }
  if (tags?.some(tag => ['menopause', 'perimenopause'].includes(tag))) {
    return brandImagesByCategory.menopause[0];
  }
  if (tags?.some(tag => ['emotional', 'stress', 'anxiety'].includes(tag))) {
    return brandImagesByCategory.emotional[0];
  }
  
  // Default based on content type
  switch (contentType) {
    case 'yoga':
      return brandImagesByCategory.yoga[Math.floor(Math.random() * brandImagesByCategory.yoga.length)];
    case 'meditation':
      return brandImagesByCategory.meditation[0];
    case 'article':
    case 'learning':
      return brandImagesByCategory.ayurveda[0];
    default:
      return brandImages.yoga6; // Default brand image
  }
};

// Get a random brand image
export const getRandomBrandImage = (): string => {
  const allImages = Object.values(brandImages);
  return allImages[Math.floor(Math.random() * allImages.length)];
};

// Export individual images for direct use
export {
  mumtazYoga1,
  mumtazYoga2,
  mumtazYoga3,
  mumtazYoga4,
  mumtazYoga5,
  mumtazYoga6,
  mumtazYoga7,
  mumtazYoga8,
  mumtazYoga9,
  mumtazYoga10,
};
