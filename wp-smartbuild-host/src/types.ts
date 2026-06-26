export interface Contractor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  location: string;
  priceRange: string;
  avatarLetters: string;
  avatarColor: string;
}

export interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  budgetRange: string;
  timeline: string;
  images: string[];
  createdAt: string;
  status: 'pending' | 'accepted' | 'completed';
}

export interface Site {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  accentColor: 'teal' | 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose';
  categories: string[];
  contractors: Contractor[];
  projectRequests: ProjectRequest[];
  bannerGradient: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  accentColor: 'teal' | 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose';
  bannerGradient: string;
}
