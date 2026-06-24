import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Home, 
  Sparkles, 
  Compass, 
  Layers, 
  Calculator, 
  CalendarDays, 
  Database,
  Hammer, 
  ShieldCheck, 
  Award, 
  Phone, 
  Clock, 
  MapPin, 
  Star, 
  Menu, 
  X, 
  ChevronRight, 
  CheckCircle,
  Gem,
  Image
} from 'lucide-react';
import MaterialCatalog from './components/MaterialCatalog';
import CountertopCustomizer from './components/CountertopCustomizer';
import BudgetEstimator from './components/BudgetEstimator';
import AiDesignAssistant from './components/AiDesignAssistant';
import ConsultationScheduler from './components/ConsultationScheduler';
import AdminPortal from './components/AdminPortal';
import AboutUs from './components/AboutUs';
import ProjectGallery from './components/ProjectGallery';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import ServiceAreas from './components/ServiceAreas';
import { Stone, CustomizerSelection, EstimatorInputs, EstimateBreakdown } from './types';

// Images we generated dynamically
const HERO_KITCHEN = "/src/assets/images/ogc_hero_kitchen_1782306639623.jpg";
const HERO_BATHROOM = "/src/assets/images/ogc_hero_bathroom_1782306655535.jpg";
const HERO_COMM_LOBBY = "/src/assets/images/ogc_commercial_lobby_1782306668882.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<'showroom' | 'gallery' | 'customizer' | 'estimator' | 'assistant' | 'schedule' | 'admin'>('showroom');
  const [sector, setSector] = useState<'residential' | 'commercial'>('residential');
  
  // Mobile Nav menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Shared state: Customizer selections saved or applied
  const [savedCustomizer, setSavedCustomizer] = useState<CustomizerSelection>({
    stoneId: 'calacatta-gold',
    cabinetId: 'chantilly-white',
    backsplash: 'full-slab',
    edgeId: 'eased',
    sinkType: 'undermount',
  });

  // Shared state: Estimated values applied to booking form
  const [appliedInputs, setAppliedInputs] = useState<EstimatorInputs | undefined>(undefined);
  const [appliedBreakdown, setAppliedBreakdown] = useState<EstimateBreakdown | undefined>(undefined);

  // Beautiful state-based in-app toast notifications for iframe safety
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Scroll to designated spot when changing tabs
  useEffect(() => {
    if (activeTab === 'showroom') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById('main-content');
      if (element) {
        const yOffset = -90; // offset for sticky header height
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  // Testimonials
  const testimonials = [
    {
      name: "Richard & Sarah Vance",
      location: "Windermere, FL",
      text: "IKB transformed our master kitchen into a work of art. The bookmatched Calacatta quartz double islands with waterfall edges are absolutely stunning. Their local Orlando fabrication was incredibly precise, and they installed everything in just one day!",
      stars: 5,
      project: "Full Luxury Kitchen Remodel"
    },
    {
      name: "Dr. Alistair Webb",
      location: "Lake Nona, FL",
      text: "We hired IKB to fabricate and clad Statuario porcelain counters across our new pediatric offices. They delivered custom solutions under extreme high-traffic specifications. Exceptional commercial precision and zero mess.",
      stars: 5,
      project: "Commercial Medical Suite"
    },
    {
      name: "Marcus Peterson",
      location: "Winter Park, FL",
      text: "The hand-polished Absolute Black granite countertops they crafted for our outdoor summer kitchen look pristine even after years in the Florida sun. IKB represents elite quality and premium craftsmanship.",
      stars: 5,
      project: "Outdoor Summer Kitchen"
    }
  ];

  // Helper callbacks
  const handleSaveSelection = (sel: CustomizerSelection) => {
    setSavedCustomizer(sel);
    showToast("Your design selections have been saved! You can see them applied when booking your consultation.", "success");
    setActiveTab('schedule');
  };

  const handleSendToAi = (sel: CustomizerSelection) => {
    setSavedCustomizer(sel);
    showToast("Transferred selection to Caleb. AI Assistant is updated with your custom design profile!", "info");
    setActiveTab('assistant');
  };

  const handleApplyEstimate = (inputs: EstimatorInputs, breakdown: EstimateBreakdown) => {
    setAppliedInputs(inputs);
    setAppliedBreakdown(breakdown);
    showToast("Estimate applied successfully! Your pricing breakdown and specifications are now attached to the Consultation Form.", "success");
    setActiveTab('schedule');
  };

  const handleSelectStoneFromCatalog = (stone: Stone) => {
    setSavedCustomizer(prev => ({ ...prev, stoneId: stone.id }));
    setActiveTab('customizer');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-800 flex flex-col font-sans select-text selection:bg-amber-100 selection:text-neutral-900">
      
      {/* 1. TOP INFORMATION RIBBON */}
      <div className="bg-neutral-950 text-neutral-400 py-2.5 px-4 text-[11px] font-medium border-b border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Serving Central Florida Since 2011</span>
            <span className="hidden md:flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-500" /> Mon-Sat: 8:00 AM - 6:00 PM</span>
          </div>
          <div className="flex items-center gap-4 font-mono font-semibold text-white">
            <a href="tel:4075550111" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-500" /> (407) 555-0111
            </a>
            <span className="bg-amber-500 text-neutral-950 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">In-House Slabs Shop</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & PREMIUM NAV */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <button 
            onClick={() => setActiveTab('showroom')}
            className="flex items-center gap-3 cursor-pointer group/logo text-left hover:opacity-90 transition-opacity focus:outline-none"
            aria-label="Return to Slab Showroom"
          >
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-display font-semibold tracking-wider border border-neutral-800 shadow-md group-hover/logo:border-amber-500/50 transition-colors">
              IKB
            </div>
            <div>
              <h1 className="font-display font-bold text-neutral-900 text-base md:text-lg tracking-tight leading-none flex items-center gap-1 group-hover/logo:text-amber-500 transition-colors">
                Innovation Kitchen and Bath <span className="text-amber-500 font-serif">®</span>
              </h1>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-widest uppercase block mt-1">High-End Remodeling & Stone Fabrication</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-xs text-neutral-600">
            {[
              { id: 'showroom', label: 'Slab Showroom', icon: <Compass className="w-4 h-4" /> },
              { id: 'gallery', label: 'Project Gallery', icon: <Image className="w-4 h-4 text-amber-500" /> },
              { id: 'customizer', label: 'Studio Customizer', icon: <Layers className="w-4 h-4" /> },
              { id: 'estimator', label: 'Cost Planner', icon: <Calculator className="w-4 h-4" /> },
              { id: 'assistant', label: 'AI Consultant', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'schedule', label: 'Book Consult', icon: <CalendarDays className="w-4 h-4" /> },
              { id: 'admin', label: 'Leads Ledger', icon: <Database className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-sm font-semibold'
                    : 'hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Call-to-Action Call Out & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }}
              className="hidden sm:inline-flex bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer items-center gap-1"
            >
              Request Quote
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer text-neutral-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1 shadow-lg">
            {[
              { id: 'showroom', label: 'Slab Showroom Show', icon: <Compass className="w-4 h-4" /> },
              { id: 'gallery', label: 'Project Gallery Showcase', icon: <Image className="w-4 h-4 text-amber-500" /> },
              { id: 'customizer', label: 'Studio Customizer', icon: <Layers className="w-4 h-4" /> },
              { id: 'estimator', label: 'Cost Planner Calculator', icon: <Calculator className="w-4 h-4" /> },
              { id: 'assistant', label: 'AI Design Consultant Caleb', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
              { id: 'schedule', label: 'Book Consult Meeting', icon: <CalendarDays className="w-4 h-4" /> },
              { id: 'admin', label: 'Leads Ledger database', icon: <Database className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs py-3 rounded-xl text-center mt-2 shadow-sm transition-all"
            >
              Request In-Home Quote
            </button>
          </div>
        )}
      </header>

      {/* 3. LUXURY HERO ACCENT & DUAL PORTAL SWITCH */}
      <section className="bg-neutral-900 relative text-white overflow-hidden" id="hero-banner">
        {/* Real Generated Background Hero Image with Blend */}
        <div className="absolute inset-0 z-0">
          <img 
            src={sector === 'residential' ? HERO_KITCHEN : HERO_COMM_LOBBY} 
            alt="Innovation Kitchen and Bath Installations" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 transition-all duration-1000 scale-105"
          />
          {/* Elite Gradient Layer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-28 relative z-10 flex flex-col justify-center min-h-[460px]">
          
          {/* Dual sector toggle (Residential / Commercial switcher) */}
          <div className="inline-flex bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-sm self-start mb-6">
            <button
              onClick={() => setSector('residential')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                sector === 'residential' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Residential Renovations
            </button>
            <button
              onClick={() => setSector('commercial')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                sector === 'commercial' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Commercial Stone Projects
            </button>
          </div>

          <motion.div 
            key={sector}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05
                }
              }
            }}
            className="max-w-3xl"
          >
            <motion.span 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block mb-2 font-mono"
            >
              {sector === 'residential' ? 'CENTRAL FLORIDA PRESTIGE LIVING' : 'ARCHITECTURAL STONE FABRICATION'}
            </motion.span>
            
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="font-display font-medium text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none mb-4 md:mb-5"
            >
              {sector === 'residential' 
                ? 'Crafting High-End Custom Residential Spaces' 
                : 'Premium Commercial Slabs & Remodeling'}
            </motion.h2>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl mb-6 md:mb-8 font-light"
            >
              {sector === 'residential'
                ? 'Since 2011, we have specialized in fabricating luxury kitchen, bath, and cabinetry layouts using premium granite, quartz, porcelain, and natural stone slabs.'
                : 'From bookmatched onyx reception desks in Winter Park to high-density medical vanities in Lake Nona, IKB combines precision, CNC waterjet cutting, and structural reliability.'}
            </motion.p>

            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="flex flex-wrap gap-3.5"
            >
              <button
                onClick={() => setActiveTab('customizer')}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-1 cursor-pointer"
              >
                Launch Studio Customizer <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className="bg-neutral-800/80 hover:bg-neutral-750 text-white font-semibold text-xs py-3.5 px-6 rounded-xl border border-neutral-700/60 backdrop-blur-sm transition-all cursor-pointer"
              >
                Cost Calculator
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. VALUE ACCENT PROPOSITION BLOCK */}
      <section className="bg-white border-y border-neutral-150 py-8 px-4 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-neutral-900 text-sm">In-House Slabs Sourcing</h4>
              <p className="text-xs text-neutral-500 leading-normal mt-1">We handle selection, measuring, waterjet CNC fabrication, and certified installations ourselves.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-neutral-900 text-sm">Indestructible Materials</h4>
              <p className="text-xs text-neutral-500 leading-normal mt-1">Premium quartzites, high-tech non-porous Spanish porcelain, and thermal-treated granite with full life warranties.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-neutral-900 text-sm">Digital Laser templating</h4>
              <p className="text-xs text-neutral-500 leading-normal mt-1">We perform 3D sub-millimeter measurements, creating digital layouts for a flawless hand-finished seam fit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE COMPONENT SWITCHER */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full flex flex-col gap-12" id="main-content">
        
        {/* Dynamic Header describing active Tab and its business context */}
        <div>
          {activeTab === 'showroom' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">Premium Slab Catalog</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Orlando Material Showroom</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Explore our hand-selected catalog of exquisite granite, engineered quartz, Spanish porcelain, and luxury natural stone slabs. Click 'Customize' to test them inside the design studio.
              </p>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">ELITE STONEWORK SHOWCASE</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Completed Projects Gallery</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Filter and browse residential and commercial projects completed by our Florida fabrication experts. Experience the continuous vein matching and hand-polished precision.
              </p>
            </div>
          )}

          {activeTab === 'customizer' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">3D Interactive customizer</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Design Studio & Overlay Editor</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Coordinate cabinetry stains with natural stone veins in real-time. Change edge profiles, configure subway tile or slab backsplashes, and save your finished layout blueprint.
              </p>
            </div>
          )}

          {activeTab === 'estimator' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">Instant Quote planner</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Interactive Renovation Estimator</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Get transparent pricing for your kitchen or vanity remodel. Slide lengths, choose cabinet customized grades, toggle demolition or sink plumbing, and lock in IKB estimates.
              </p>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">IKB AI design network</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">AI Design Assistant Caleb</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Consult with our senior stone consultant. Ask Caleb about slab comparisons, color coordination, and custom installation guidelines. Caleb analyzes active customizer selections!
              </p>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">Laser Mapping & Estimation Booking</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Schedule Precision Consultation</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Book a face-to-face evaluation at your home or commercial site. Our fabricators will carry physical stone samples, map the space digitally, and refine custom estimates.
              </p>
            </div>
          )}

          {activeTab === 'admin' && (
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">In-House Designer database</span>
              <h2 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Consultation Ledger & Custom specs</h2>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-2xl leading-normal">
                Staff portal to track homeowner custom schedules, evaluate estimates, review applied customizer blueprints, and update job status. Fully integrated with database endpoints.
              </p>
            </div>
          )}
        </div>

        {/* Core Component mounting based on Active Navigation Tab */}
        <div className="transition-all duration-300">
          {activeTab === 'showroom' && (
            <div className="flex flex-col gap-12">
              <MaterialCatalog onSelectStone={handleSelectStoneFromCatalog} />
              <ProjectGallery onNavigate={setActiveTab} />
              <BeforeAfterSlider onNavigate={setActiveTab} />
              <ServiceAreas onBookConsult={() => setActiveTab('schedule')} />
              <AboutUs />
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="flex flex-col gap-12">
              <ProjectGallery onNavigate={setActiveTab} />
              <BeforeAfterSlider onNavigate={setActiveTab} />
            </div>
          )}

          {activeTab === 'customizer' && (
            <CountertopCustomizer 
              onSaveSelection={handleSaveSelection} 
              onSendToAi={handleSendToAi}
              savedSelection={savedCustomizer}
            />
          )}

          {activeTab === 'estimator' && (
            <BudgetEstimator onApplyEstimate={handleApplyEstimate} />
          )}

          {activeTab === 'assistant' && (
            <AiDesignAssistant currentSelection={savedCustomizer} />
          )}

          {activeTab === 'schedule' && (
            <ConsultationScheduler 
              appliedInputs={appliedInputs} 
              appliedBreakdown={appliedBreakdown}
              onSubmitSuccess={() => {
                setAppliedInputs(undefined);
                setAppliedBreakdown(undefined);
              }}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPortal />
          )}
        </div>

        {/* 6. COMPREHENSIVE SERVICES CARDS SHOWCASE */}
        <section className="border-t border-neutral-200/70 pt-12">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">WHAT WE DELIVER</span>
            <h3 className="font-display text-2xl md:text-3xl text-neutral-900 font-medium tracking-tight mt-1">Our Remodeling & Slabs Services</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Kitchen Remodeling", desc: "Complete luxury kitchen transformations. Relocate layouts, install custom cabinets, waterfalls, and built-in professional appliances." },
              { title: "Bathroom Remodeling", desc: "Spa-like bathroom suites. Custom quartz double vanities, floor-to-ceiling porcelain wall cladding, and walk-in natural stone showers." },
              { title: "Custom Cabinets", desc: "Premium, furniture-grade custom cabinets built and finished right in our Orlando woodworking shop. Unlimited solid hardwood styles." },
              { title: "Granite & Quartz Countertops", desc: "Expert templating, cutting, hand-polishing, and seamless placement of exotic granite slabs, compound quartz, and natural quartzites." },
              { title: "Commercial Stone Fabrication", desc: "Backlit onyx bar counters, corporate quartz lobby registration desks, medical-grade solid composite workspaces, and tile layouts." },
              { title: "Flooring & Tile Work", desc: "Precision alignment of large-format porcelain slabs, glass mosaics, marble tiles, and custom medallions with flawless waterjet grout line widths." }
            ].map((serv, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-neutral-950 text-sm mb-2">{serv.title}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">{serv.desc}</p>
                </div>
                <button
                  onClick={() => { setActiveTab('schedule'); }}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-neutral-900 hover:text-amber-600 transition-colors cursor-pointer text-left self-start"
                >
                  Schedule Layout Survey <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PRESTIGIOUS CLIENT TESTIMONIALS */}
        <section className="bg-neutral-900 text-white rounded-3xl p-8 md:p-12 border border-neutral-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.02)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 z-10 relative">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-mono">IKB CLIENT PORTAL</span>
              <h3 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight mt-1">Praise From Our Florida Clients</h3>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              <span className="text-xs font-semibold text-neutral-300 ml-2">4.9/5 Average Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-neutral-950/60 border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col justify-between">
                <p className="text-xs text-neutral-400 leading-relaxed italic">
                  "{test.text}"
                </p>
                <div className="border-t border-neutral-850 pt-4 mt-5">
                  <span className="text-xs font-bold text-white block">{test.name}</span>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1">
                    <span>{test.location}</span>
                    <span className="text-amber-400 font-sans uppercase font-bold">{test.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 8. ELITE FOOTER */}
      <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 pt-16 pb-12 px-4 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-neutral-950 rounded-xl flex items-center justify-center font-display font-semibold tracking-wider shadow-md">
                IKB
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base tracking-tight leading-none">
                  Innovation Kitchen and Bath
                </h4>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Remodeling & Stones Shop</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              We specialized in high-end, bespoke space remodeling in Central Florida since 2011. Equipped with a local design workshop and robotic waterjet CNC fabrication facility, we control flawless quality at every stage.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-neutral-900 border border-neutral-850 text-neutral-400 rounded-md text-[10px] font-mono">Orlando fabrication</span>
              <span className="px-3 py-1 bg-neutral-900 border border-neutral-850 text-neutral-400 rounded-md text-[10px] font-mono">Winter Park Dev.</span>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Interactive Studio</h5>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-500">
              <button onClick={() => setActiveTab('showroom')} className="text-left hover:text-white transition-colors cursor-pointer">Material Slab Showroom</button>
              <button onClick={() => setActiveTab('customizer')} className="text-left hover:text-white transition-colors cursor-pointer">Kitchen Customizer Studio</button>
              <button onClick={() => setActiveTab('estimator')} className="text-left hover:text-white transition-colors cursor-pointer">Instant Price Cost Calculator</button>
              <button onClick={() => setActiveTab('assistant')} className="text-left hover:text-white transition-colors cursor-pointer">AI Consultant Caleb</button>
              <button onClick={() => setActiveTab('schedule')} className="text-left hover:text-white transition-colors cursor-pointer">Book Layout survey</button>
            </div>
          </div>

          {/* Services Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Remodels</h5>
            <ul className="flex flex-col gap-2.5 text-xs text-neutral-500">
              <li>Kitchen Remodeling</li>
              <li>Bathroom Suites</li>
              <li>Granite Countertops</li>
              <li>Quartz Islands</li>
              <li>Spanish Porcelain</li>
              <li>Custom Cabinetry</li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-3 flex flex-col gap-3.5">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Connect With IKB</h5>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-500 font-mono">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-neutral-600 flex-shrink-0" /> Orlando, Central Florida Service</p>
              <a href="tel:4075550111" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-amber-500 flex-shrink-0" /> (407) 555-0111</a>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-600 flex-shrink-0" /> Mon-Sat: 8:00 AM - 6:00 PM</p>
              <p className="text-[10px] text-zinc-600 italic">Licensed & Insured Orlando Contractor</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto border-t border-neutral-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} Innovation Kitchen and Bath. All rights reserved. In-house Stone Cutting & Hardwood Assembly.</p>
          <div className="flex gap-4">
            <span className="hover:text-neutral-500 cursor-default">Privacy Protocol</span>
            <span className="hover:text-neutral-500 cursor-default">Contractor Terms</span>
            <span className="hover:text-neutral-500 cursor-default">Digital Layout Map</span>
          </div>
        </div>
      </footer>



      {/* Beautiful in-app toast notification for iframe safety */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-fade-in" id="in-app-toast">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
            toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-sky-400' : 'bg-amber-400'
          }`} />
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest font-mono">IKB Studio Notification</p>
            <p className="text-xs text-neutral-200 mt-1 leading-relaxed font-sans">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-neutral-500 hover:text-neutral-300 text-[10px] font-bold px-1.5 py-0.5 hover:bg-neutral-800 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
