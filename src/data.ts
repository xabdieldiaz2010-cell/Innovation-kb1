import { Stone, CabinetColor, EdgeProfile } from './types';

export const STONES: Stone[] = [
  {
    id: 'calacatta-gold',
    name: 'Calacatta Gold Quartz',
    category: 'Quartz',
    description: 'An elegant premium quartz mirroring natural marble, featuring a crisp white background with bold, dramatic veins in shades of gold and warm gray.',
    durability: 5,
    maintenance: 'Low',
    priceTier: 'Luxury',
    origin: 'Italy (In-house fabricated)',
    recommendedEdges: ['eased', 'ogee', 'bevel'],
    colorHex: '#faf9f6',
    bgStyle: 'bg-gradient-to-br from-neutral-50 via-amber-50 to-neutral-200 border-neutral-300'
  },
  {
    id: 'absolute-black',
    name: 'Absolute Black Granite',
    category: 'Granite',
    description: 'An ultra-consistent, deep-black natural basaltic stone that conveys immense depth, sophistication, and raw power. Extremely dense and heat-resistant.',
    durability: 5,
    maintenance: 'Low',
    priceTier: 'Premium',
    origin: 'India',
    recommendedEdges: ['eased', 'bevel', 'bullnose'],
    colorHex: '#111111',
    bgStyle: 'bg-neutral-900 border-neutral-800'
  },
  {
    id: 'blue-bahia',
    name: 'Blue Bahia Quartzite',
    category: 'Natural Stone',
    description: 'One of the rarest stones on earth. This exotic Brazilian sodalite quartzite boasts a rich royal-blue backdrop patterned with dramatic white, cream, and green sweeps.',
    durability: 4,
    maintenance: 'Medium',
    priceTier: 'Luxury',
    origin: 'Brazil',
    recommendedEdges: ['ogee', 'bevel', 'eased'],
    colorHex: '#1e3a8a',
    bgStyle: 'bg-gradient-to-tr from-blue-900 via-sky-800 to-indigo-950 border-sky-900'
  },
  {
    id: 'emerald-green-porcelain',
    name: 'Emerald Green Porcelain',
    category: 'Porcelain',
    description: 'High-tech architectural porcelain slab replicating majestic dark emerald-green marble with dramatic golden-white crystallization. Zero absorption and chemically inert.',
    durability: 5,
    maintenance: 'Low',
    priceTier: 'Luxury',
    origin: 'Spain',
    recommendedEdges: ['eased', 'bevel'],
    colorHex: '#064e3b',
    bgStyle: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-900 border-emerald-800'
  },
  {
    id: 'colonial-white',
    name: 'Colonial White Granite',
    category: 'Granite',
    description: 'A popular natural granite from India featuring soft cotton-white background accented by charcoal grey swirls and tiny garnet-colored specks.',
    durability: 4,
    maintenance: 'Medium',
    priceTier: 'Standard',
    origin: 'India',
    recommendedEdges: ['eased', 'bullnose', 'bevel'],
    colorHex: '#e5e5e5',
    bgStyle: 'bg-gradient-to-r from-neutral-200 via-stone-200 to-neutral-300 border-stone-300'
  },
  {
    id: 'statuario-porcelain',
    name: 'Statuario White Porcelain',
    category: 'Porcelain',
    description: 'High-tech Spanish porcelain with a polished finish. Flawless white base accented by deep, sweeping charcoal veins, offering the absolute pinnacle of luxury without the fragile nature of marble.',
    durability: 5,
    maintenance: 'Low',
    priceTier: 'Luxury',
    origin: 'Spain',
    recommendedEdges: ['eased', 'bevel'],
    colorHex: '#ffffff',
    bgStyle: 'bg-gradient-to-br from-white via-neutral-100 to-zinc-300 border-zinc-200'
  },
  {
    id: 'empire-gray',
    name: 'Empire Gray Quartz',
    category: 'Quartz',
    description: 'A beautiful sleek industrial gray quartz with tiny white and charcoal granules. Highly versatile, clean, and complements both modern and classic cabinet layouts.',
    durability: 5,
    maintenance: 'Low',
    priceTier: 'Standard',
    origin: 'USA',
    recommendedEdges: ['eased', 'bevel', 'bullnose'],
    colorHex: '#6b7280',
    bgStyle: 'bg-neutral-500 border-neutral-600'
  }
];

export const CABINET_COLORS: CabinetColor[] = [
  {
    id: 'chantilly-white',
    name: 'Chantilly Lace White',
    description: 'A crisp, clean, bright neutral white that maximizes ambient light and opens up any custom kitchen or bathroom space.',
    hex: '#fbfcfc',
    bgClass: 'bg-slate-50 border-slate-200 shadow-sm'
  },
  {
    id: 'charcoal-gray',
    name: 'Charcoal Slate Gray',
    description: 'A sophisticated deep grey with cool undertones, providing a dramatic foundation that beautifully highlights white veined stone countertops.',
    hex: '#374151',
    bgClass: 'bg-gray-700 border-gray-600 shadow-sm text-white'
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy Blue',
    description: 'An elegant, luxury deep navy that adds bold architectural contrast. Perfect for double kitchen islands or statement bathroom vanities.',
    hex: '#1e293b',
    bgClass: 'bg-slate-800 border-slate-750 shadow-sm text-white'
  },
  {
    id: 'warm-oak',
    name: 'Warm Oak woodgrain',
    description: 'A premium natural oak woodgrain finished with a light honey sealant. Instills an organic, modern farmhouse comfort into the design.',
    hex: '#d97706',
    bgClass: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-600 to-amber-900 border-amber-800 shadow-sm text-amber-50'
  }
];

export const EDGE_PROFILES: EdgeProfile[] = [
  {
    id: 'eased',
    name: 'Eased / Flat Edge',
    description: 'A clean, slightly softened square edge that forms the standard for modern or minimalist custom kitchen countertop designs.',
    imageFallback: 'M4 8 h16 v2 h-16 z'
  },
  {
    id: 'bevel',
    name: 'Beveled Edge',
    description: 'Featuring a sharp 45-degree angle cut on the top corner, this edge catches the light beautifully and adds crisp linear detail.',
    imageFallback: 'M4 10 L10 4 H20 V12 H4 Z'
  },
  {
    id: 'bullnose',
    name: 'Full Bullnose Edge',
    description: 'Fully rounded on both the top and bottom corners, creating a smooth, family-safe, fluid circular profile that accentuates natural stone thickness.',
    imageFallback: 'M4 4 C12 4 16 8 16 12 C16 16 12 20 4 20 Z'
  },
  {
    id: 'ogee',
    name: 'Classic Ogee Edge',
    description: 'A sophisticated, dual-curve S-profile. Emulates classical stone architecture, adding standard-setting luxury and prestige to traditional and transitional kitchens.',
    imageFallback: 'M4 4 C8 4 10 8 10 12 C10 14 14 16 18 18 H20 V20 H4 Z'
  }
];
