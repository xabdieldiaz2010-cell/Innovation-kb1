export interface Stone {
  id: string;
  name: string;
  category: 'Granite' | 'Quartz' | 'Porcelain' | 'Natural Stone';
  description: string;
  durability: number; // 1-5 scale
  maintenance: 'Low' | 'Medium' | 'High';
  priceTier: 'Standard' | 'Premium' | 'Luxury';
  origin: string;
  recommendedEdges: string[];
  colorHex: string; // fallback color representation
  bgStyle: string; // Tailwind gradient/style class to simulate stone texture
}

export interface CabinetColor {
  id: string;
  name: string;
  description: string;
  hex: string;
  bgClass: string;
}

export interface EdgeProfile {
  id: string;
  name: string;
  description: string;
  imageFallback: string; // icon name or geometric description
}

export interface CustomizerSelection {
  stoneId: string;
  cabinetId: string;
  backsplash: 'subway' | 'full-slab' | 'mosaic' | 'none';
  edgeId: string;
  sinkType: 'undermount' | 'farmhouse' | 'apron-front' | 'none';
}

export interface EstimatorInputs {
  projectType: 'kitchen' | 'bathroom';
  sizeCategory: 'small' | 'medium' | 'large';
  cabinetLinearFeet: number;
  countertopLinearFeet: number;
  materialTier: 'Standard' | 'Premium' | 'Luxury';
  cabinetGrade: 'stock' | 'semi-custom' | 'custom';
  needsBacksplash: boolean;
  needsSinkPlumbing: boolean;
  needsDemolition: boolean;
}

export interface EstimateBreakdown {
  materials: number;
  cabinets: number;
  fabricationInstallation: number;
  backsplash: number;
  sinkPlumbing: number;
  demolitionPrep: number;
  totalMin: number;
  totalMax: number;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  category: 'inspiration' | 'floorplan' | 'measurement' | 'other';
  dataUrl?: string;
}

export interface ConsultationRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  zipCode: string;
  projectType: 'Kitchen' | 'Bathroom' | 'Full House' | 'Commercial';
  scope: 'Countertops Only' | 'Cabinets Only' | 'Complete Transformation' | 'Custom Remodeling';
  preferredMaterial: string;
  budgetRange: string;
  timeline: string;
  message: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: string;
  savedSelection?: CustomizerSelection;
  uploadedFiles?: UploadedFile[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
