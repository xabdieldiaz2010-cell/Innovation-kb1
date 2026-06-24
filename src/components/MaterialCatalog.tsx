import { useState } from 'react';
import { STONES } from '../data';
import { Stone } from '../types';
import { Search, Filter, ShieldCheck, Award, ArrowUpRight, Check, MapPin, Sparkles } from 'lucide-react';

interface MaterialCatalogProps {
  onSelectStone: (stone: Stone) => void;
}

export default function MaterialCatalog({ onSelectStone }: MaterialCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('All');

  // Categories available
  const categories = ['All', 'Granite', 'Quartz', 'Porcelain', 'Natural Stone'];
  const priceTiers = ['All', 'Standard', 'Premium', 'Luxury'];

  const filteredStones = STONES.filter((stone) => {
    const matchesSearch = stone.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          stone.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stone.category === selectedCategory;
    const matchesPrice = selectedPriceTier === 'All' || stone.priceTier === selectedPriceTier;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="flex flex-col gap-6" id="material-catalog">
      {/* Search & Filter Controls bar */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search slabs (e.g. Calacatta, Granite)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="md:col-span-5 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Tier Filters */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">Tier:</span>
            <div className="flex gap-1 w-full">
              {priceTiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedPriceTier(tier)}
                  className={`flex-1 text-center py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    selectedPriceTier === tier
                      ? 'bg-neutral-950 text-white'
                      : 'bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-500'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Showroom Grid */}
      {filteredStones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStones.map((stone) => (
            <div 
              key={stone.id} 
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between group"
            >
              {/* Image / Simulated Slab Showcase */}
              <div className="relative h-44 overflow-hidden border-b border-neutral-100 flex items-center justify-center">
                <div className={`absolute inset-0 transition-all duration-700 group-hover:scale-105 ${stone.bgStyle}`} />
                {/* Simulated high-end texture reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />
                
                {/* Category tag */}
                <div className="absolute left-4 top-4 bg-neutral-900/95 border border-neutral-700 backdrop-blur-sm text-[10px] uppercase tracking-wider font-mono font-semibold text-white px-2.5 py-1 rounded-full shadow-sm">
                  {stone.category}
                </div>

                {/* Origin tag */}
                <div className="absolute right-4 top-4 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-neutral-700 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  {stone.origin.split(' ')[0]}
                </div>
              </div>

              {/* Stone Information */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-display font-medium text-neutral-900 text-base group-hover:text-amber-600 transition-colors">
                      {stone.name}
                    </h4>
                    <span className="text-xs font-semibold text-amber-600 font-mono">
                      {stone.priceTier === 'Luxury' ? '$$$' : stone.priceTier === 'Premium' ? '$$' : '$'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                    {stone.description}
                  </p>
                </div>

                {/* Durability / Maintenance parameters */}
                <div className="border-t border-neutral-100 pt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block mb-1">Durability Scale</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-neutral-900 h-full rounded-full" 
                            style={{ width: `${(stone.durability / 5) * 100}%` }} 
                          />
                        </div>
                        <span className="text-xs font-semibold text-neutral-800 font-mono">{stone.durability}/5</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block mb-1">Maintenance</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        stone.maintenance === 'Low' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" /> {stone.maintenance} Upkeep
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold mr-1.5 self-center">Optimal Edges:</span>
                    {stone.recommendedEdges.map((edge) => (
                      <span key={edge} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded capitalize">
                        {edge}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectStone(stone)}
                    className="w-full mt-2 bg-neutral-50 hover:bg-neutral-900 hover:text-white border border-neutral-200 hover:border-neutral-900 text-neutral-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Customize This Slab <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">No slabs matched your current filter criteria.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedPriceTier('All'); }}
            className="mt-4 text-xs font-semibold text-neutral-900 underline hover:text-neutral-700 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Educational Footer */}
      <div className="bg-neutral-900 text-neutral-300 rounded-2xl p-6 md:p-8 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-medium text-white text-base">In-House Quality Precision Fabrication</h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl mt-1">
              At Innovation Kitchen and Bath, we do not outsource. Every slab is hand-selected and precision-cut at our local Florida fabrication shop using waterjet CNC technology. We control the quality from measurement to final installation.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="bg-neutral-850 border border-neutral-800 rounded-lg p-3 text-center sm:min-w-[120px]">
            <span className="text-xl font-bold text-white block">100%</span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block mt-1">In-house Fabric.</span>
          </div>
          <div className="bg-neutral-850 border border-neutral-800 rounded-lg p-3 text-center sm:min-w-[120px]">
            <span className="text-xl font-bold text-white block">15+ Yrs</span>
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold block mt-1">Master Craft.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
