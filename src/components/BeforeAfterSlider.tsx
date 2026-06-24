import { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye, Info, RefreshCw, Layers } from 'lucide-react';

interface SliderProject {
  id: string;
  name: string;
  beforeLabel: string;
  afterLabel: string;
  beforeDesc: string;
  afterDesc: string;
  image: string;
}

const SLIDER_PROJECTS: SliderProject[] = [
  {
    id: 'kitchen',
    name: 'Modern Waterfall Culinary Island',
    beforeLabel: 'BEFORE: 1990s Builder-Grade Laminate',
    afterLabel: 'AFTER: IKB Custom Calacatta Gold Quartz',
    beforeDesc: 'Cluttered, light-starved kitchen with yellowing oak cabinets and chipped, moisture-swollen laminate counters.',
    afterDesc: 'Slab-matched Calacatta Gold quartz countertops, bookmatched waterfall island corners, and floor-to-ceiling white custom shaker cabinets.',
    image: '/src/assets/images/ogc_hero_kitchen_1782306639623.jpg'
  },
  {
    id: 'bathroom',
    name: 'Sovereign Master Bathroom Suite',
    beforeLabel: 'BEFORE: Dated Ceramic Tile & Acrylic Tub',
    afterLabel: 'AFTER: IKB Polished Statuario Porcelain Slabs',
    beforeDesc: 'Mildew-prone tile grout lines, leaky ceramic fixtures, and restricted vanity storage.',
    afterDesc: 'Bookmatched Spanish Porcelain cladding, custom hand-polished ramp sinks, floating dark oak cabinetry, and frameless custom LED mirrors.',
    image: '/src/assets/images/ogc_hero_bathroom_1782306655535.jpg'
  },
  {
    id: 'lobby',
    name: 'Commercial Executive Lobby Desk',
    beforeLabel: 'BEFORE: Heavy Drywall & Worn Veneer Counter',
    afterLabel: 'AFTER: IKB Polished Statuario White Cladding',
    beforeDesc: 'Scuffed walnut-colored plastic veneer with dated curves and exposed cables.',
    afterDesc: 'Monolithic reception deck wrapped in continuous seamless porcelain slabs, reinforced with aluminum honeycomb, paired with modern oak features.',
    image: '/src/assets/images/ogc_commercial_lobby_1782306668882.jpg'
  }
];

interface BeforeAfterSliderProps {
  onNavigate?: (tab: 'showroom' | 'gallery' | 'customizer' | 'estimator' | 'assistant' | 'schedule' | 'admin') => void;
}

export default function BeforeAfterSlider({ onNavigate }: BeforeAfterSliderProps = {}) {
  const [activeProj, setActiveProj] = useState<SliderProject>(SLIDER_PROJECTS[0]);
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set position based on click or drag
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: any) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };

    const handleGlobalUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  return (
    <div className="bg-gradient-to-br from-stone-100 via-white to-stone-50 border border-neutral-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden" id="ogc-before-after-section">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">REMODELING TRANSFORMATIONS</span>
          <h3 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">
            Before & After Interactive Slider
          </h3>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-xl leading-relaxed">
            Drag the gold handle across the image to reveal the contrast between dated spaces and IKB’s precision hand-finished installations.
          </p>
        </div>

        {/* Project Selector Toggles */}
        <div className="flex flex-wrap gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          {SLIDER_PROJECTS.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProj(proj);
                setSliderPos(50);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeProj.id === proj.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
              }`}
            >
              {proj.id === 'kitchen' ? 'Kitchen' : proj.id === 'bathroom' ? 'Master Bath' : 'Lobby Desk'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Slider Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Slider Canvas (Col span 7) */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative h-[320px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 select-none cursor-ew-resize group"
            id="before-after-slider-viewport"
          >
            {/* AFTER IMAGE (Background - fully visible on the right) */}
            <div className="absolute inset-0">
              <img 
                src={activeProj.image} 
                alt="IKB Professional Slab Remodel After"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* After label */}
              <div className="absolute right-4 bottom-4 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 text-amber-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 select-none pointer-events-none uppercase tracking-wider">
                {activeProj.afterLabel}
              </div>
            </div>

            {/* BEFORE IMAGE (Overlay - clipped on the left) */}
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${sliderPos}%` }}
            >
              {/* The image inside needs a fixed width equal to parent container for alignment */}
              <img 
                src={activeProj.image} 
                alt="Original kitchen bathroom before remodel"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover max-w-none grayscale sepia brightness-50 contrast-125 saturate-50 blur-[1px]"
                style={{ width: containerRef.current?.offsetWidth || '100%', height: containerRef.current?.offsetHeight || '100%' }}
              />

              {/* Distressing texture overlay to look older/vintage */}
              <div className="absolute inset-0 bg-yellow-900/10 mix-blend-color-burn" />

              {/* Before label */}
              <div className="absolute left-4 bottom-4 bg-red-950/85 backdrop-blur-sm border border-red-900/50 text-white font-mono text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-lg z-10 select-none pointer-events-none uppercase tracking-wider">
                {activeProj.beforeLabel}
              </div>
            </div>

            {/* SLIDING SPLIT HANDLE */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-amber-500 z-20 cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Drag controller knob */}
              <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95">
                <div className="flex gap-0.5 items-center justify-center">
                  <span className="text-[10px] font-bold">◀</span>
                  <span className="text-[10px] font-bold">▶</span>
                </div>
              </div>
              <div className="absolute top-4 bg-amber-500 text-neutral-950 font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-tighter shadow select-none pointer-events-none">
                SLIDE
              </div>
            </div>

            {/* Instructions Prompt Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] text-neutral-200 pointer-events-none transition-opacity duration-300 group-hover:opacity-0 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Slide handle to see transformation
            </div>
          </div>
        </div>

        {/* Details and Specs Card (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-neutral-200/60 rounded-2xl p-5 md:p-6 shadow-sm">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-mono text-neutral-400 font-bold block mb-1">PROJECT TRANSFORMATION DETAIL</span>
            <h4 className="font-display font-semibold text-neutral-900 text-lg leading-tight mb-4">
              {activeProj.name}
            </h4>

            {/* Before description box */}
            <div className="space-y-4">
              <div className="border-l-2 border-red-500/60 pl-3">
                <span className="text-[10px] font-mono uppercase font-bold text-red-600 block mb-0.5">The Challenges</span>
                <p className="text-xs text-neutral-600 leading-normal">
                  {activeProj.beforeDesc}
                </p>
              </div>

              {/* After description box */}
              <div className="border-l-2 border-emerald-500/60 pl-3">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 block mb-0.5">The IKB Precision Solution</span>
                <p className="text-xs text-neutral-600 leading-normal">
                  {activeProj.afterDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 mt-6 flex flex-col gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[10px] text-neutral-500 text-left leading-tight">
                All IKB stone and cabinet transformations are backed by our custom sub-millimeter layout guarantee.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('budget-estimator') || document.getElementById('consultation-form');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else if (onNavigate) {
                  onNavigate('customizer');
                }
              }}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Start Planning Your Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
