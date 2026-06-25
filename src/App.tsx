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
  Image,
  Mail,
  Facebook,
  Instagram,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import MaterialCatalog from './components/MaterialCatalog';
import CountertopCustomizer from './components/CountertopCustomizer';
import BudgetEstimator from './components/BudgetEstimator';
import AiDesignAssistant from './components/AiDesignAssistant';
import ConsultationScheduler from './components/ConsultationScheduler';
import AdminPortal from './components/AdminPortal';
import ContractorLogin from './components/ContractorLogin';
import AboutUs from './components/AboutUs';
import ProjectGallery from './components/ProjectGallery';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import ServiceAreas from './components/ServiceAreas';
import { Stone, CustomizerSelection, EstimatorInputs, EstimateBreakdown } from './types';
import { Helmet } from './components/Helmet';

// Images we generated dynamically
const HERO_KITCHEN = "images/ogc_hero_kitchen_1782306639623.jpg";
const HERO_BATHROOM = "images/ogc_hero_bathroom_1782306655535.jpg";
const HERO_COMM_LOBBY = "images/ogc_commercial_lobby_1782306668882.jpg";

export function InnovationLogo({ className = "h-11 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 380 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Logo Outline Frame */}
      <path 
        d="M 194,56 L 194,22 L 328,22 L 328,118 L 261,118" 
        stroke="#595959" 
        strokeWidth="2.8" 
        strokeLinecap="square" 
        strokeLinejoin="miter" 
        fill="none" 
      />
      
      {/* "INNOVATION" Text - Gray Serif font matching user logo */}
      <text 
        x="190" 
        y="72" 
        textAnchor="middle" 
        fill="#555555" 
        fontSize="31" 
        fontFamily="'Playfair Display', 'Georgia', 'Times New Roman', serif" 
        fontWeight="600" 
        letterSpacing="1.2"
      >
        INNOVATION
      </text>
      
      {/* "KITCHEN & BATH" Text - Royal Blue Serif font matching user logo */}
      <text 
        x="190" 
        y="104" 
        textAnchor="middle" 
        fill="#0e4ab5" 
        fontSize="17.5" 
        fontFamily="'Playfair Display', 'Georgia', 'Times New Roman', serif" 
        fontWeight="700" 
        letterSpacing="4.5"
      >
        KITCHEN & BATH
      </text>
    </svg>
  );
}

const SEO_METADATA: Record<string, { title: string; description: string }> = {
  showroom: {
    title: "Innovation Kitchen & Bath | Premium Countertops & Cabinets Orlando",
    description: "Innovation Kitchen & Bath (IKB) specializes in premium quartz, granite, quartzite, and porcelain countertops and custom cabinet fabrication in Central Florida."
  },
  gallery: {
    title: "Project Gallery | Innovation Kitchen & Bath Orlando",
    description: "Explore our portfolio of luxurious kitchen remodels, custom bathroom oases, and sleek commercial slab claddings crafted by Central Florida's premier fabricators."
  },
  customizer: {
    title: "3D Kitchen & Bath Design Customizer | Innovation Kitchen & Bath",
    description: "Design your dream space in real-time with our interactive countertop and cabinet customizer. Visualize quartz, granite, porcelain slab, and cabinet pairings."
  },
  estimator: {
    title: "Instant Remodeling & Countertop Cost Estimator | IKB Orlando",
    description: "Calculate realistic countertop and cabinet pricing in real-time. Input your dimensions, materials, and edge profiles for an instant, transparent cost breakdown."
  },
  assistant: {
    title: "Caleb - AI Design Assistant & Consultant | IKB",
    description: "Consult Caleb, our expert AI interior design assistant. Get tailored countertop advice, cabinet color chemistry analysis, and custom hardware recommendations."
  },
  schedule: {
    title: "Schedule Custom Laser-Templating & Consultation | IKB",
    description: "Book your free, professional layout laser-templating consultation and material slab preview with Central Florida's leading fabrication team."
  },
  admin: {
    title: "Lead Management Portal | Innovation Kitchen & Bath Admin",
    description: "Secure lead management, contractor directories, and scheduling portal for authorized Innovation Kitchen and Bath design consultants."
  },
  login: {
    title: "Contractor & Partner Access Portal | IKB Orlando",
    description: "Authorized login for local building contractors, architects, and design partners of Innovation Kitchen and Bath."
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'showroom' | 'gallery' | 'customizer' | 'estimator' | 'assistant' | 'schedule' | 'admin' | 'login'>('showroom');
  const [sector, setSector] = useState<'residential' | 'commercial'>('residential');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
      if (!usr) {
        setIsApproved(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsApproved(null);
      return;
    }
    
    if (currentUser.email === 'xabdieldiaz2010@gmail.com') {
      setIsApproved(true);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'contractors', currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsApproved(docSnap.data()?.approved === true);
        } else {
          setIsApproved(false);
        }
      },
      (err) => {
        console.error("Error fetching approval status:", err);
        setIsApproved(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);
  
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
      {/* Dynamic React Helmet for SEO Optimization */}
      <Helmet 
        title={SEO_METADATA[activeTab]?.title || "Innovation Kitchen & Bath | Premier Stone Fabrication"}
        description={SEO_METADATA[activeTab]?.description || "Innovation Kitchen and Bath premier stone fabrication."}
      />
      
      {/* 1. TOP INFORMATION RIBBON */}
      <div className="bg-neutral-950 text-neutral-400 py-2.5 px-4 text-[11px] font-medium border-b border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Serving Central Florida Since 2011</span>
            <span className="hidden md:flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-500" /> Mon-Sat: 8:00 AM - 6:00 PM</span>
            <a href="mailto:Innovationkb1@gmail.com" className="hidden lg:flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-500" /> Innovationkb1@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono font-semibold text-white">
            <a href="tel:4079892802" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-500" /> (407) 989-2802
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
            className="flex items-center gap-3 cursor-pointer group/logo text-left hover:opacity-95 transition-opacity focus:outline-none"
            aria-label="Return to Slab Showroom"
          >
            <InnovationLogo className="h-12 w-auto hover:scale-102 transition-transform" />
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
            <a
              href="tel:4079892802"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 transition-all cursor-pointer shadow-sm"
              title="Call (407) 989-2802"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">(407) 989-2802</span>
              <span className="sm:hidden">Call</span>
            </a>

            {currentUser ? (
              <button
                onClick={() => { setActiveTab(isApproved ? 'admin' : 'login'); setIsMobileMenuOpen(false); }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeTab === 'admin' || activeTab === 'login'
                    ? 'bg-neutral-900 text-white border-neutral-950 shadow-sm'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200'
                }`}
                title="Access Contractor Leads Ledger"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline-block max-w-[120px] truncate">{currentUser.email?.split('@')[0]} Ledger</span>
                <span className="sm:hidden">Ledger</span>
              </button>
            ) : (
              <button
                onClick={() => { setActiveTab('login'); setIsMobileMenuOpen(false); }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-neutral-900 text-white border-neutral-950 shadow-sm'
                    : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200'
                }`}
                title="Contractor Login"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Login</span>
              </button>
            )}

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
                onClick={() => { 
                  if (tab.id === 'admin') {
                    setActiveTab(isApproved ? 'admin' : 'login');
                  } else {
                    setActiveTab(tab.id as any);
                  }
                  setIsMobileMenuOpen(false); 
                }}
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
            isApproved ? (
              <AdminPortal />
            ) : (
              <div className="max-w-md mx-auto my-12 text-center bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
                <Lock className="w-10 h-10 text-amber-500" />
                <h3 className="font-display font-medium text-lg text-neutral-900">Leads Ledger Security Lock</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  This database is restricted. Please sign in with your verified contractor credentials to view active leads. Only approved contractor partners can access custom client templates.
                </p>
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Go to Contractor Login
                </button>
              </div>
            )
          )}

          {activeTab === 'login' && (
            <ContractorLogin 
              currentUser={currentUser}
              isApproved={isApproved}
              onNavigateToShowroom={() => setActiveTab('showroom')}
              onNavigateToAdmin={() => setActiveTab(isApproved ? 'admin' : 'login')}
            />
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
              <motion.div 
                key={i} 
                whileHover={{ y: -6, scale: 1.02, boxShadow: "0 12px 30px -4px rgba(10, 17, 40, 0.08)" }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-neutral-300/80 transition-all flex flex-col justify-between"
              >
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
              </motion.div>
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
              <InnovationLogo className="h-10 w-auto" />
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
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Connect With Us</h5>
            <div className="flex flex-col gap-2.5 text-xs text-neutral-500 font-mono">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-neutral-600 flex-shrink-0" /> Orlando, Central Florida Service</p>
              <a href="tel:4079892802" className="flex items-center gap-2 hover:text-white transition-colors"><Phone className="w-4 h-4 text-amber-500 flex-shrink-0" /> (407) 989-2802</a>
              <a href="mailto:Innovationkb1@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors"><Mail className="w-4 h-4 text-amber-500 flex-shrink-0" /> Innovationkb1@gmail.com</a>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-600 flex-shrink-0" /> Mon-Sat: 8:00 AM - 6:00 PM</p>
              <p className="text-[10px] text-zinc-600 italic">Licensed & Insured Orlando Contractor</p>
            </div>
            {/* Social media connections */}
            <div className="flex gap-2.5 mt-2">
              <a href="https://www.facebook.com/share/19ApsVbi7f/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-md text-neutral-400" title="Follow us on Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/innovationkb1?utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-md text-neutral-400" title="Follow us on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@innovationkb1?_r=1&_t=ZP-97UetNL4oLm" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-md text-neutral-400" title="Follow us on TikTok">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.99-1.72-.28-.25-.53-.53-.75-.83-.02 2.73-.01 5.46-.02 8.19-.08 2.22-.81 4.54-2.52 6.07-1.89 1.77-4.7 2.41-7.18 1.93-3-.49-5.61-2.91-6.1-5.91-.6-3.13 1.15-6.52 4.14-7.53.07 1.43.1 2.87.16 4.31-.77.24-1.52.75-1.92 1.46-.74 1.19-.66 2.85.25 3.9 1 1.23 2.87 1.6 4.3 1 1.48-.56 2.45-2.11 2.45-3.69-.02-3.81-.01-7.62-.01-11.43.01-1.63.01-3.26.01-4.89z"/>
                </svg>
              </a>
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
