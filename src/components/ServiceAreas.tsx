import React, { useState } from 'react';
import { MapPin, Navigation, Car, ShieldCheck, Phone, Sparkles } from 'lucide-react';

interface ServiceRegion {
  name: string;
  counties: string;
  cities: string[];
}

const REGIONS: ServiceRegion[] = [
  {
    name: "Orlando Metro Core",
    counties: "Orange County",
    cities: ["Downtown Orlando", "Lake Nona", "Dr. Phillips", "Baldwin Park", "Winter Park", "Maitland", "Windermere", "Bay Hill"]
  },
  {
    name: "Kissimmee & South Core",
    counties: "Osceola County",
    cities: ["Kissimmee", "Celebration", "St. Cloud", "Hunters Creek", "Poinciana", "ChampionsGate", "Campbell", "Intercession City"]
  },
  {
    name: "West Orange & Lakes",
    counties: "Orange & Lake Counties",
    cities: ["Winter Garden", "Ocoee", "Clermont", "Minneola", "Horizon West", "Apopka", "Oakland", "Gotha"]
  },
  {
    name: "Seminole & North",
    counties: "Seminole County",
    cities: ["Lake Mary", "Sanford", "Altamonte Springs", "Longwood", "Casselberry", "Winter Springs", "Oviedo", "Heathrow"]
  }
];

interface ServiceAreasProps {
  onBookConsult?: () => void;
}

export default function ServiceAreas({ onBookConsult }: ServiceAreasProps = {}) {
  const [searchCity, setSearchCity] = useState('');
  
  // Flatten cities to allow searching
  const allCities = REGIONS.flatMap(r => r.cities.map(c => ({ city: c, region: r.name })));
  
  const filteredSearch = searchCity.trim() === '' 
    ? [] 
    : allCities.filter(item => item.city.toLowerCase().includes(searchCity.toLowerCase()));

  return (
    <section className="bg-neutral-900 text-white rounded-3xl p-6 md:p-10 lg:p-12 border border-neutral-800 relative overflow-hidden" id="ikb-service-areas">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle_at_bottom_left,rgba(212,163,89,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left column: Text and Coverage Message */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-mono">
              PREMIER LOCAL COVERAGE
            </span>
            <h3 className="font-display text-2xl md:text-4xl text-white font-medium tracking-tight mt-1.5 leading-tight">
              Central Florida <br />
              <span className="text-amber-400 font-serif font-medium">Service Areas</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed mt-4 font-light">
              Our state-of-the-art mobile scanning and design vans are fully equipped with physical stone slabs, solid hardwood cabinet samples, and 3D sub-millimeter laser systems. 
              <strong> We bring the entire showroom experience directly to your doorstep.</strong>
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white font-display">100% Orlando & Kissimmee Coverage</h5>
                <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                  We serve almost any residential community or commercial venue within a 50-mile radius of the Orlando/Kissimmee central core.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-neutral-800/60 pt-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white font-display font-medium">Sub-Millimeter Site Surveys</h5>
                <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                  Our digital templating crews regularly visit homeowners across Windermere, Celebration, Lake Nona, and beyond to map walls with absolute alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Do we serve your neighborhood?</label>
            <div className="relative">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search your Central Florida town (e.g., Celebration)..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <MapPin className="absolute right-3.5 top-3 w-4 h-4 text-neutral-500" />
            </div>
            
            {searchCity.trim() !== '' && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 max-h-[120px] overflow-y-auto flex flex-col gap-1.5">
                {filteredSearch.length > 0 ? (
                  filteredSearch.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-neutral-300">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {item.city}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono uppercase">{item.region}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-amber-400 font-medium italic">
                    We serve almost anywhere near Orlando/Kissimmee! Call us at (407) 555-0111 to confirm.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Serviced Regions Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REGIONS.map((region, idx) => (
              <div key={idx} className="bg-neutral-950/40 border border-neutral-850 rounded-2xl p-5 hover:border-neutral-750 transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                  <h4 className="font-display font-bold text-white text-sm">{region.name}</h4>
                  <span className="text-[9px] text-amber-500 font-mono font-medium">{region.counties}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {region.cities.slice(0, 4).map((city, cIdx) => (
                    <span 
                      key={cIdx} 
                      className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-400" /> {city}
                    </span>
                  ))}
                  {region.cities.length > 4 && (
                    <span className="bg-neutral-900/60 border border-neutral-850/60 text-neutral-500 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono italic">
                      etc.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800/80 pt-6 mt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-neutral-400 leading-normal max-w-md">
                All fabrication work is managed by fully licensed, certified, and insured crew members with a direct focus on local Florida residential and commercial code standards.
              </p>
            </div>
            {onBookConsult && (
              <button
                onClick={onBookConsult}
                className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Book Free Home Survey <Sparkles className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
