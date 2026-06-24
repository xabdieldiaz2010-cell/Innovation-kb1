import { useState, useEffect } from 'react';
import { EstimatorInputs, EstimateBreakdown } from '../types';
import { Calculator, DollarSign, Info, RefreshCw, Layers, ShieldCheck, Check } from 'lucide-react';

interface BudgetEstimatorProps {
  onApplyEstimate: (inputs: EstimatorInputs, breakdown: EstimateBreakdown) => void;
}

export default function BudgetEstimator({ onApplyEstimate }: BudgetEstimatorProps) {
  const [inputs, setInputs] = useState<EstimatorInputs>({
    projectType: 'kitchen',
    sizeCategory: 'medium',
    cabinetLinearFeet: 15,
    countertopLinearFeet: 15,
    materialTier: 'Premium',
    cabinetGrade: 'semi-custom',
    needsBacksplash: true,
    needsSinkPlumbing: true,
    needsDemolition: true,
  });

  const [breakdown, setBreakdown] = useState<EstimateBreakdown>({
    materials: 0,
    cabinets: 0,
    fabricationInstallation: 0,
    backsplash: 0,
    sinkPlumbing: 0,
    demolitionPrep: 0,
    totalMin: 0,
    totalMax: 0,
  });

  // Automatically adjust linear feet sliders based on size category selection
  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    let cabFeet = 10;
    let counterFeet = 10;
    
    if (inputs.projectType === 'kitchen') {
      if (size === 'small') { cabFeet = 8; counterFeet = 10; }
      else if (size === 'medium') { cabFeet = 15; counterFeet = 15; }
      else { cabFeet = 24; counterFeet = 25; }
    } else {
      if (size === 'small') { cabFeet = 4; counterFeet = 4; }
      else if (size === 'medium') { cabFeet = 6; counterFeet = 6; }
      else { cabFeet = 10; counterFeet = 10; }
    }

    setInputs({
      ...inputs,
      sizeCategory: size,
      cabinetLinearFeet: cabFeet,
      countertopLinearFeet: counterFeet
    });
  };

  const handleProjectTypeChange = (type: 'kitchen' | 'bathroom') => {
    let cabFeet = type === 'kitchen' ? 15 : 6;
    let counterFeet = type === 'kitchen' ? 15 : 6;
    
    setInputs({
      ...inputs,
      projectType: type,
      sizeCategory: 'medium',
      cabinetLinearFeet: cabFeet,
      countertopLinearFeet: counterFeet
    });
  };

  // Compute estimate details
  useEffect(() => {
    // 1. Countertop Material Base Costs (per linear foot)
    let stoneFootCostMin = 100;
    let stoneFootCostMax = 140;
    if (inputs.materialTier === 'Premium') {
      stoneFootCostMin = 150;
      stoneFootCostMax = 200;
    } else if (inputs.materialTier === 'Luxury') {
      stoneFootCostMin = 240;
      stoneFootCostMax = 350;
    }

    // Adjust for bathroom vs kitchen (kitchen slab is deeper, bathroom is shallower, so bathroom is ~70% cost)
    const typeModifier = inputs.projectType === 'bathroom' ? 0.7 : 1.0;
    const materialsMin = inputs.countertopLinearFeet * stoneFootCostMin * typeModifier;
    const materialsMax = inputs.countertopLinearFeet * stoneFootCostMax * typeModifier;

    // 2. Cabinets Base Costs (per linear foot)
    let cabFootCostMin = 180;
    let cabFootCostMax = 260;
    if (inputs.cabinetGrade === 'semi-custom') {
      cabFootCostMin = 300;
      cabFootCostMax = 480;
    } else if (inputs.cabinetGrade === 'custom') {
      cabFootCostMin = 600;
      cabFootCostMax = 900;
    }
    const cabinetsMin = inputs.cabinetLinearFeet * cabFootCostMin * typeModifier;
    const cabinetsMax = inputs.cabinetLinearFeet * cabFootCostMax * typeModifier;

    // 3. Fabrication & Assembly Installation
    // Countertop fab-install run: ~$45/ft. Cabinet layout run: ~$65/ft.
    const fabInstallMin = (inputs.countertopLinearFeet * 40 + inputs.cabinetLinearFeet * 55);
    const fabInstallMax = (inputs.countertopLinearFeet * 65 + inputs.cabinetLinearFeet * 85);

    // 4. Backsplash
    let backsplashMin = 0;
    let backsplashMax = 0;
    if (inputs.needsBacksplash) {
      if (inputs.materialTier === 'Luxury') {
        // Full matching slab splash is gorgeous and premium
        backsplashMin = inputs.countertopLinearFeet * 80;
        backsplashMax = inputs.countertopLinearFeet * 130;
      } else {
        // Standard high-quality tiling
        backsplashMin = inputs.countertopLinearFeet * 25;
        backsplashMax = inputs.countertopLinearFeet * 45;
      }
    }

    // 5. Sink Assembly Plumbing
    let plumbingMin = 0;
    let plumbingMax = 0;
    if (inputs.needsSinkPlumbing) {
      plumbingMin = inputs.projectType === 'kitchen' ? 500 : 350;
      plumbingMax = inputs.projectType === 'kitchen' ? 950 : 600;
    }

    // 6. Demolition & Disposal Prep
    let demoMin = 0;
    let demoMax = 0;
    if (inputs.needsDemolition) {
      demoMin = inputs.projectType === 'kitchen' ? 600 : 300;
      demoMax = inputs.projectType === 'kitchen' ? 1100 : 500;
    }

    const matAverage = (materialsMin + materialsMax) / 2;
    const cabAverage = (cabinetsMin + cabinetsMax) / 2;
    const fabAverage = (fabInstallMin + fabInstallMax) / 2;
    const splashAverage = (backsplashMin + backsplashMax) / 2;
    const plumbAverage = (plumbingMin + plumbingMax) / 2;
    const demoAverage = (demoMin + demoMax) / 2;

    const totalMin = Math.round(materialsMin + cabinetsMin + fabInstallMin + backsplashMin + plumbingMin + demoMin);
    const totalMax = Math.round(materialsMax + cabinetsMax + fabInstallMax + backsplashMax + plumbingMax + demoMax);

    setBreakdown({
      materials: Math.round(matAverage),
      cabinets: Math.round(cabAverage),
      fabricationInstallation: Math.round(fabAverage),
      backsplash: Math.round(splashAverage),
      sinkPlumbing: Math.round(plumbAverage),
      demolitionPrep: Math.round(demoAverage),
      totalMin,
      totalMax,
    });
  }, [inputs]);

  const totalAverage = Math.round((breakdown.totalMin + breakdown.totalMax) / 2);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden" id="budget-estimator">
      {/* Banner Header */}
      <div className="bg-neutral-900 px-6 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-semibold block mb-1">Cost Estimator</span>
          <h3 className="font-display text-xl font-medium flex items-center gap-2 text-white">
            <Calculator className="w-5 h-5 text-amber-400" /> Interactive Cost Planner
          </h3>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleProjectTypeChange('kitchen')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              inputs.projectType === 'kitchen' ? 'bg-amber-500 text-neutral-950 font-semibold' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Kitchen
          </button>
          <button
            onClick={() => handleProjectTypeChange('bathroom')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              inputs.projectType === 'bathroom' ? 'bg-amber-500 text-neutral-950 font-semibold' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Bathroom / Vanity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Input Parameters Section */}
        <div className="lg:col-span-5 p-6 border-r border-neutral-100 flex flex-col gap-5">
          {/* Size category */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
              Approximate {inputs.projectType === 'kitchen' ? 'Kitchen' : 'Bathroom'} Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'Small', desc: inputs.projectType === 'kitchen' ? '< 80 sq ft' : 'Powder' },
                { id: 'medium', label: 'Medium', desc: inputs.projectType === 'kitchen' ? '80-150 sq' : 'Master' },
                { id: 'large', label: 'Large', desc: inputs.projectType === 'kitchen' ? '150+ sq ft' : 'Luxury' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSizeChange(s.id as 'small' | 'medium' | 'large')}
                  className={`flex flex-col p-2.5 rounded-xl border text-center transition-all ${
                    inputs.sizeCategory === s.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-neutral-900 block">{s.label}</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slabs Tier */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
              Stone Slab Quality Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Standard', label: 'Standard', desc: 'Granite/Quartz' },
                { id: 'Premium', label: 'Premium', desc: 'Fine Granite' },
                { id: 'Luxury', label: 'Luxury', desc: 'Calacatta/Porcel.' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setInputs({ ...inputs, materialTier: m.id as any })}
                  className={`flex flex-col p-2.5 rounded-xl border text-center transition-all ${
                    inputs.materialTier === m.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-neutral-900 block">{m.label}</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cabinet grade */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
              Cabinet Customization Grade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'stock', label: 'Stock Cabinets', desc: 'Ready-Made' },
                { id: 'semi-custom', label: 'Semi-Custom', desc: 'Tailored' },
                { id: 'custom', label: 'Custom IKB', desc: 'In-House Build' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setInputs({ ...inputs, cabinetGrade: c.id as any })}
                  className={`flex flex-col p-2.5 rounded-xl border text-center transition-all ${
                    inputs.cabinetGrade === c.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-neutral-900 block leading-tight">{c.label.split(' ')[0]}</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="border-t border-neutral-100 pt-4 flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Countertop length:</span>
                <span className="text-xs font-mono font-bold text-neutral-900">{inputs.countertopLinearFeet} Lin. Ft.</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                value={inputs.countertopLinearFeet}
                onChange={(e) => setInputs({ ...inputs, countertopLinearFeet: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Cabinet Length run:</span>
                <span className="text-xs font-mono font-bold text-neutral-900">{inputs.cabinetLinearFeet} Lin. Ft.</span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                value={inputs.cabinetLinearFeet}
                onChange={(e) => setInputs({ ...inputs, cabinetLinearFeet: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
            </div>
          </div>

          {/* Optional Services Checkboxes */}
          <div className="border-t border-neutral-100 pt-4 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Included Renovations Services</span>
            
            {[
              { id: 'needsBacksplash', label: 'Tiled/Slab Backsplash', desc: 'Protective matching wall stone' },
              { id: 'needsSinkPlumbing', label: 'Sink Cutout & Plumbing Assembly', desc: 'Sink integration, faucet, shutoffs' },
              { id: 'needsDemolition', label: 'Demolition & Environmental disposal', desc: 'Hauling off old materials' }
            ].map((option) => (
              <label key={option.id} className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(inputs as any)[option.id]}
                  onChange={(e) => setInputs({ ...inputs, [option.id]: e.target.checked })}
                  className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-4 w-4"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-neutral-950 block group-hover:text-neutral-700 transition-colors">
                    {option.label}
                  </span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cost Estimation Outputs Section */}
        <div className="lg:col-span-7 p-6 bg-neutral-50/50 flex flex-col justify-between">
          <div>
            {/* Projected Cost Range Banner */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm text-center mb-6">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-semibold block mb-1">Orlando Custom Quote Range</span>
              <div className="flex items-baseline justify-center gap-2">
                <DollarSign className="w-5 h-5 text-neutral-400 self-center" />
                <span className="text-3xl font-display font-bold text-neutral-900">${breakdown.totalMin.toLocaleString()}</span>
                <span className="text-neutral-400 font-display font-medium text-lg">to</span>
                <span className="text-3xl font-display font-bold text-neutral-900">${breakdown.totalMax.toLocaleString()}</span>
              </div>
              <div className="mt-3.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Controls Quality End-To-End • Lifetime Craftsmanship Warranty
              </div>
            </div>

            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Itemized Estimates breakdown</h4>
            
            {/* Line Item breakdown with small simulated progress bars to represent cost weight */}
            <div className="flex flex-col gap-3 mb-6">
              {[
                { label: 'Premium Slabs Materials', val: breakdown.materials, desc: `${inputs.countertopLinearFeet} LF of ${inputs.materialTier} Stone` },
                { label: 'Cabinet Assembly', val: breakdown.cabinets, desc: `${inputs.cabinetLinearFeet} LF of ${inputs.cabinetGrade} Cabinets` },
                { label: 'IKB Precision Fabrication & Install', val: breakdown.fabricationInstallation, desc: 'Professional templating, cutting & fit' },
                { label: 'Backsplash Protection', val: breakdown.backsplash, desc: inputs.needsBacksplash ? 'Tile/Matching stone slab layout' : 'Not Requested', disabled: !inputs.needsBacksplash },
                { label: 'Sink Integration & Plumbing Connection', val: breakdown.sinkPlumbing, desc: inputs.needsSinkPlumbing ? 'New sink fitment & fixture connections' : 'Not Requested', disabled: !inputs.needsSinkPlumbing },
                { label: 'Environmental Demolition Prep', val: breakdown.demolitionPrep, desc: inputs.needsDemolition ? 'Old countertop/cabinet disposal' : 'Not Requested', disabled: !inputs.needsDemolition }
              ].map((item, index) => {
                const percentage = totalAverage > 0 ? (item.val / totalAverage) * 100 : 0;
                return (
                  <div key={index} className={`flex flex-col gap-1.5 ${item.disabled ? 'opacity-40' : ''}`}>
                    <div className="flex justify-between text-xs font-medium">
                      <div className="truncate pr-4">
                        <span className="text-neutral-900 font-semibold">{item.label}</span>
                        <span className="text-[10px] text-neutral-500 block truncate font-normal">{item.desc}</span>
                      </div>
                      <span className="font-mono text-neutral-950 text-right">
                        {item.val > 0 ? `$${item.val.toLocaleString()}` : '$0'}
                      </span>
                    </div>
                    {item.val > 0 && (
                      <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-neutral-900 rounded-full" 
                          style={{ width: `${Math.max(percentage, 2)}%` }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-neutral-200/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-2 max-w-sm">
              <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-500 leading-normal">
                These numbers represent average Central Florida price metrics for IKB custom fabrications. Actual costs may vary based on slab scarcity, exact wall contours, and plumbing configurations. Custom consultations include visual 3D design plans.
              </p>
            </div>
            <button
              onClick={() => onApplyEstimate(inputs, breakdown)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-3 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end sm:self-center"
            >
              <Check className="w-4 h-4 text-amber-400" /> Apply Estimate to Consult Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
