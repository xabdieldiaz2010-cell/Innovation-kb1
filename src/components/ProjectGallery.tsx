import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, MapPin, ZoomIn, Info, ShieldCheck, Heart, Calendar, Layers, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  segment: 'residential' | 'commercial';
  image: string;
  location: string;
  stoneUsed: string;
  cabinetStyle: string;
  description: string;
  fabricationDetail: string;
  dateCompleted: string; // YYYY-MM for sorting
  scale: string; // Linear feet or sq ft
}

const PROJECTS: ProjectItem[] = [
  {
    id: 'kitchen-windermere',
    title: 'The Windermere Double Waterfall Kitchen',
    category: 'Kitchen Remodel',
    segment: 'residential',
    image: '/src/assets/images/ogc_hero_kitchen_1782306639623.jpg',
    location: 'Windermere, FL',
    stoneUsed: 'Premium Calacatta Gold Quartz (3cm)',
    cabinetStyle: 'Chantilly White Premium Shaker',
    description: 'A masterpiece of symmetrical bookmatching featuring dual culinary islands with mitered waterfall gables flowing seamlessly to the European white oak floors. Cabinetry features soft-close Blum hinges and full-extension solid walnut dovetail drawers.',
    fabricationDetail: 'Each vein on the waterfall corners was precision-aligned using our digital laser templator to ensure a continuous pattern flow.',
    dateCompleted: '2025-11',
    scale: '78 Linear Feet'
  },
  {
    id: 'bathroom-winter-park',
    title: 'Modern Master Bath Sanctuary',
    category: 'Bathroom Oasis',
    segment: 'residential',
    image: '/src/assets/images/ogc_hero_bathroom_1782306655535.jpg',
    location: 'Winter Park, FL',
    stoneUsed: 'Bookmatched Statuario Porcelain Slabs',
    cabinetStyle: 'Charcoal Oak Minimalist Floating Vanities',
    description: 'This master bathroom sanctuary features floor-to-ceiling porcelain cladding. The double floating charcoal vanities are topped with custom hand-polished ramp sinks crafted from a single sheet of porcelain for a seamless aesthetic.',
    fabricationDetail: 'The mitered miter joints of the ramp sinks were reinforced with structural fiberglass mesh underneath for extreme durability.',
    dateCompleted: '2026-02',
    scale: '45 Sq Ft Vanity Area'
  },
  {
    id: 'lobby-lake-nona',
    title: 'Statuario Porcelain Clad Commercial Lobby',
    category: 'Commercial Suite',
    segment: 'commercial',
    image: '/src/assets/images/ogc_commercial_lobby_1782306668882.jpg',
    location: 'Lake Nona, FL',
    stoneUsed: 'Ultra-durable Polished Statuario Porcelain Slabs',
    cabinetStyle: 'Bespoke White Oak Feature Wall Slats',
    description: 'Bespoke reception and lounge crafted for a premier technology & medical center. Features a massive monolithic cantilevered greeting desk fully clad in heavy bookmatched high-gloss porcelain panels paired with seamless micro-gap timber slats.',
    fabricationDetail: 'We engineered the underlying aluminum honeycomb substructure to distribute load and prevent stress fractures in the high-traffic zone.',
    dateCompleted: '2026-04',
    scale: '160 Sq Ft Feature Facade'
  },
  {
    id: 'kitchen-celebration',
    title: 'Celebration Estate Transitional Kitchen',
    category: 'Kitchen Remodel',
    segment: 'residential',
    image: '/src/assets/images/ogc_hero_kitchen_1782306639623.jpg',
    location: 'Celebration, FL',
    stoneUsed: 'Absolute Black Granite (Leathered Finish)',
    cabinetStyle: 'Slate Gray Shaker & Brass Accents',
    description: 'An architectural remodel designed for high-frequency culinary entertaining. The dual-purpose utility island includes seamless stone drop inserts for induction hobs, framed by beautiful matte-leathered absolute black granite.',
    fabricationDetail: 'The leathered texture was custom polished to a satin sheen at our fabrication studio to prevent glare under the modern glass atrium.',
    dateCompleted: '2025-08',
    scale: '65 Linear Feet'
  },
  {
    id: 'restaurant-dr-phillips',
    title: 'Nouveau Chic Bistro Cocktail Bar',
    category: 'Restaurant / Retail',
    segment: 'commercial',
    image: '/src/assets/images/ogc_commercial_lobby_1782306668882.jpg',
    location: 'Dr. Phillips, FL',
    stoneUsed: 'Blue Bahia Exotic Quartzite Slabs',
    cabinetStyle: 'Gilded Brass Under-Counter Frame & Led Lighting',
    description: 'A high-impact luxury entertainment space. This statement cocktail bar utilizes natural semi-precious blue quartzite slabs under-lit by custom warm LED diffusers, reflecting high-contrast dramatic gold veins across the lounge.',
    fabricationDetail: 'Quartzite was reinforced with epoxy backer and precision wet-sawn to bypass natural fissure lines while maintaining structurally sound corners.',
    dateCompleted: '2025-12',
    scale: '42 Linear Feet Bar Top'
  },
  {
    id: 'bathroom-clermont',
    title: 'Clermont Hillside Spa Ensuite',
    category: 'Bathroom Oasis',
    segment: 'residential',
    image: '/src/assets/images/ogc_hero_bathroom_1782306655535.jpg',
    location: 'Clermont, FL',
    stoneUsed: 'Taj Mahal Quartzite (Polished)',
    cabinetStyle: 'Warm Alderwood Floating Frameless Drawers',
    description: 'An expansive modern spa layout matching continuous slab graining along the main double vanity, tub deck surrounds, and walk-in steam shower threshold.',
    fabricationDetail: 'Constructed custom miters for the 6-inch thick tub deck to give a monolithic block stone appearance with zero visible seams.',
    dateCompleted: '2026-01',
    scale: '55 Sq Ft Vanity & Surrounds'
  }
];

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

function ProgressiveImage({ src, alt, className = "", referrerPolicy }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    setIsLoaded(false);
    
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  const getPlaceholderStyle = (imagePath: string) => {
    if (imagePath.includes('kitchen')) {
      return 'bg-gradient-to-br from-amber-100/30 via-neutral-300/20 to-stone-400/20';
    } else if (imagePath.includes('bathroom')) {
      return 'bg-gradient-to-br from-stone-200/30 via-neutral-100/20 to-neutral-400/30';
    } else {
      return 'bg-gradient-to-br from-neutral-800/40 via-amber-950/20 to-neutral-900/40';
    }
  };

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      {/* Blurred background block reflecting key colors of the image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-out z-0 ${getPlaceholderStyle(src)} ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Shimmer overlay */}
      {!isLoaded && (
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer z-10" />
      )}

      {/* Actual High-Res image using absolute mounter */}
      <img
        src={currentSrc || src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
          isLoaded ? 'blur-0 opacity-100 scale-100' : 'blur-2xl opacity-40 scale-105'
        }`}
      />
    </div>
  );
}

type SortOption = 'newest' | 'alphabetical' | 'location';
type FilterOption = 'all' | 'residential' | 'commercial';

interface ProjectGalleryProps {
  onNavigate?: (tab: 'showroom' | 'gallery' | 'customizer' | 'estimator' | 'assistant' | 'schedule' | 'admin') => void;
}

export default function ProjectGallery({ onNavigate }: ProjectGalleryProps = {}) {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter projects
  const filteredProjects = PROJECTS.filter(p => {
    if (filter === 'all') return true;
    return p.segment === filter;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.dateCompleted.localeCompare(a.dateCompleted);
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'location') {
      return a.location.localeCompare(b.location);
    }
    return 0;
  });

  // Handle consultation click inside modal
  const handleInquire = () => {
    setSelectedProject(null);
    const element = document.getElementById('consultation-form');
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else if (onNavigate) {
      onNavigate('schedule');
    }
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6" id="ogc-project-gallery">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">ELITE STONEWORK SHOWCASE</span>
          <h3 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
            Completed Projects Gallery
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Review completed projects and custom stone remodeling benchmarks completed by the IKB expert crews across Central Florida.
          </p>
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-50 p-3 rounded-2xl border border-neutral-200/60">
        
        {/* Category Filters */}
        <div className="flex gap-1.5 p-1 bg-neutral-200/55 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            All Showcase
          </button>
          <button
            onClick={() => setFilter('residential')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'residential'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Residential
          </button>
          <button
            onClick={() => setFilter('commercial')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === 'commercial'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Commercial
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className="text-xs text-neutral-500 flex items-center gap-1 font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs bg-white border border-neutral-200 rounded-lg py-1.5 px-3 font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="newest">Latest Completed</option>
            <option value="alphabetical">Project Name (A-Z)</option>
            <option value="location">Location (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Project Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {sortedProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
              className="group relative bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[310px] border border-neutral-200 cursor-pointer"
            >
              {/* Background Image with Blur-Up progressive loading */}
              <div className="absolute inset-0 z-0">
                <ProgressiveImage
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700"
                />
                {/* Overlay shadow for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
              </div>

              {/* Top Bar for Favorites */}
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={(e) => toggleFavorite(project.id, e)}
                  className="p-2 rounded-full bg-neutral-950/40 backdrop-blur-md border border-white/10 text-white hover:bg-neutral-950/85 hover:scale-105 transition-all cursor-pointer"
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      favorites.includes(project.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`} 
                  />
                </button>
              </div>

              {/* Bottom Info Overlay */}
              <div className="relative z-20 p-5 text-white flex flex-col gap-1 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md">
                    {project.category}
                  </span>
                  <span className="text-[10px] text-neutral-300 flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-amber-500" /> {project.location}
                  </span>
                </div>
                <h4 className="font-display font-bold text-base text-white tracking-tight mt-1.5 leading-snug">
                  {project.title}
                </h4>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-[10px] text-neutral-400 font-mono">
                  <span>Stone: {project.stoneUsed.split('(')[0]}</span>
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    View Details <Maximize2 className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detailed Lightbox Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Project Image with Progressive Blur-Up loading */}
                <div className="relative h-[250px] md:h-auto min-h-[300px] overflow-hidden">
                  <ProgressiveImage
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-neutral-900/30 z-10" />
                  
                  {/* Segment Tag */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase tracking-wider rounded-md font-mono">
                      {selectedProject.segment}
                    </span>
                    <span className="px-3 py-1 bg-neutral-950/85 text-white text-[10px] font-medium tracking-wider rounded-md font-mono border border-white/10 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" /> {selectedProject.dateCompleted}
                    </span>
                  </div>
                </div>

                {/* Right: Project Details */}
                <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-mono">
                      {selectedProject.category}
                    </span>
                    <h3 className="font-display font-bold text-xl md:text-2xl mt-1 text-white leading-tight">
                      {selectedProject.title}
                    </h3>

                    <div className="flex items-center gap-2 text-neutral-400 text-xs mt-2 pb-4 border-b border-neutral-800">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>{selectedProject.location}</span>
                      <span className="text-neutral-700">•</span>
                      <span>{selectedProject.scale}</span>
                    </div>

                    <p className="text-neutral-300 text-xs leading-relaxed mt-4">
                      {selectedProject.description}
                    </p>

                    {/* Premium Specs Grid */}
                    <div className="grid grid-cols-1 gap-3.5 mt-5 bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/60">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">Slab Material Used</span>
                        <span className="text-xs text-amber-400 font-medium">{selectedProject.stoneUsed}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">Cabinet Architecture</span>
                        <span className="text-xs text-neutral-200">{selectedProject.cabinetStyle}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-800/60">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-amber-500/70 block flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-500" /> In-House Fabrication Detail
                        </span>
                        <p className="text-[11px] text-neutral-400 mt-1 italic">
                          "{selectedProject.fabricationDetail}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleInquire}
                      className="flex-1 py-3 px-4 bg-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors shadow-md text-center cursor-pointer"
                    >
                      Inquire About This Style
                    </button>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="py-3 px-5 bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

