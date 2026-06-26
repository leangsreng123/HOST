import { Site, PresetTheme } from '../types';

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'default-teal',
    name: 'SmartBuild Teal (Original)',
    description: 'The elegant green-teal layout from the screenshots.',
    accentColor: 'teal',
    bannerGradient: 'from-teal-850 to-emerald-900',
  },
  {
    id: 'modern-blue',
    name: 'Construct Blue',
    description: 'A clean, high-trust blue-indigo theme.',
    accentColor: 'blue',
    bannerGradient: 'from-blue-800 to-indigo-900',
  },
  {
    id: 'warm-amber',
    name: 'Cozy Renovation',
    description: 'A warm, approachable amber-rose theme.',
    accentColor: 'amber',
    bannerGradient: 'from-amber-700 to-rose-900',
  },
  {
    id: 'minimal-slate',
    name: 'Architect Slate',
    description: 'A minimalist dark slate and emerald layout.',
    accentColor: 'emerald',
    bannerGradient: 'from-slate-800 to-slate-950',
  }
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    slug: 'smartbuild',
    title: 'SmartBuild',
    tagline: 'Find help for your build',
    accentColor: 'teal',
    bannerGradient: 'from-emerald-950 via-teal-900 to-emerald-950',
    categories: [
      'House Construction',
      'Home Renovation',
      'Interior Design',
      'Electrical',
      'Plumbing',
      'Architecture'
    ],
    contractors: [
      {
        id: 'c-1',
        name: 'Sok Pisey',
        specialty: 'Civil Engineer',
        experience: 9,
        rating: 4.8,
        reviewsCount: 142,
        location: 'Toul Kork',
        priceRange: '$$$',
        avatarLetters: 'SP',
        avatarColor: 'bg-blue-600 text-white'
      },
      {
        id: 'c-2',
        name: 'Chan Dara',
        specialty: 'Electrician',
        experience: 5,
        rating: 4.6,
        reviewsCount: 88,
        location: 'Sen Sok',
        priceRange: '$$',
        avatarLetters: 'CD',
        avatarColor: 'bg-teal-600 text-white'
      },
      {
        id: 'c-3',
        name: 'Keo Sophea',
        specialty: 'Interior Designer',
        experience: 7,
        rating: 4.9,
        reviewsCount: 112,
        location: 'Boeung Keng Kang 1',
        priceRange: '$$$',
        avatarLetters: 'KS',
        avatarColor: 'bg-purple-600 text-white'
      },
      {
        id: 'c-4',
        name: 'Oum Vandy',
        specialty: 'Plumber',
        experience: 4,
        rating: 4.5,
        reviewsCount: 64,
        location: 'Chroy Changvar',
        priceRange: '$',
        avatarLetters: 'OV',
        avatarColor: 'bg-orange-600 text-white'
      },
      {
        id: 'c-5',
        name: 'Mean Samnang',
        specialty: 'Architect',
        experience: 12,
        rating: 4.9,
        reviewsCount: 195,
        location: 'Daun Penh',
        priceRange: '$$$',
        avatarLetters: 'MS',
        avatarColor: 'bg-emerald-600 text-white'
      }
    ],
    projectRequests: [
      {
        id: 'r-1',
        title: 'Kitchen Renovation',
        description: 'Need a full redesign of our ground floor kitchen, including modern cabinets, tiling, and upgraded electrical sockets.',
        location: 'Toul Kork, Phnom Penh',
        budgetRange: '$1,500 - $3,000',
        timeline: '3 weeks',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'],
        createdAt: '2026-06-25T14:30:00Z',
        status: 'pending'
      },
      {
        id: 'r-2',
        title: 'Complete Villa Wiring',
        description: 'New construction villa requires full conduit installation, distribution board setup, and socket wiring.',
        location: 'Sen Sok, Phnom Penh',
        budgetRange: '$2,000 - $4,500',
        timeline: '4 weeks',
        images: [],
        createdAt: '2026-06-26T02:15:00Z',
        status: 'pending'
      }
    ]
  }
];
