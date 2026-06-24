import React from 'react';
import { ShieldCheck, Heart, Sparkles, Award, Star, Quote, ArrowRight } from 'lucide-react';

export default function AboutUs() {
  return (
    <section className="bg-gradient-to-br from-stone-100 via-white to-stone-50 border border-neutral-200 rounded-3xl p-6 md:p-10 lg:p-12 shadow-sm relative overflow-hidden" id="ogc-family-about">
      {/* Subtle background graphics */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.02)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[radial-gradient(circle_at_bottom_left,rgba(212,163,89,0.015)_0%,transparent_60%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Founders story & text content (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block font-mono">
              THE INNOVATION KITCHEN & BATH LEGACY
            </span>
            <h3 className="font-display text-2xl md:text-4xl text-neutral-900 font-semibold tracking-tight mt-1.5 leading-tight">
              Orlando's Premier Stone & Cabinet Specialists <br />
              <span className="text-amber-600 font-serif font-medium">Built on Architectural Precision</span>
            </h3>
          </div>
 
          <div className="text-xs md:text-sm text-neutral-600 space-y-4 leading-relaxed font-sans">
            <p>
              Since 2011, we have operated as Central Florida's dedicated stone cutting and cabinet fabrication specialists. Our facility was founded with an unwavering commitment to technical precision and exceptional client service for every kitchen and bathroom remodel.
            </p>
            <p>
              While other contractors moved to high-volume outsourced models, <strong>Innovation Kitchen and Bath (IKB)</strong> chose a different path: keeping 100% of our templating, digital laser layout modeling, and heavy CNC waterjet cutting fully in-house. This comprehensive quality control is why Orlando’s leading custom home builders, commercial developers, and homeowners count on us for flawless alignment.
            </p>
            <p className="font-medium text-neutral-800">
              Today, our crew of master craftsmen continues to raise the standard of local fabrication. We do not use third-party sales brokers or random sub-contractors. Every kitchen island, bathroom vanity, and custom cabinet is measured, cut, polished, and installed by our dedicated, in-house trained IKB specialists.
            </p>
          </div>
 
          {/* Core values row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-200/60 pt-6 mt-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-display font-bold text-neutral-900 text-xs">Direct Accountability</h5>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">Direct project management and open communication on every contract.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-display font-bold text-neutral-900 text-xs">No Sub-Contractors</h5>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">100% in-house certified staff, fully licensed & bonded.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-display font-bold text-neutral-900 text-xs">Laser Precision</h5>
                <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">Double-checked digital mapping for perfect seams.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: IKB pledge visual quote box (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden border border-neutral-800 shadow-xl">
            <div className="absolute top-4 right-4 text-amber-500/10 pointer-events-none">
              <Quote className="w-24 h-24 stroke-[4px]" />
            </div>

            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-[9px] text-neutral-400 font-mono font-bold tracking-wider ml-1 uppercase">
                  15 Years of Excellence
                </span>
              </div>

              <blockquote className="text-xs md:text-sm text-neutral-200 italic leading-relaxed font-light">
                "Our professional reputation is bound to every slab we polish and every cabinet we align. We do not ask for final payment until you inspect the seams and agree they are absolutely seamless. That has been our standard since 2011."
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-display font-bold flex items-center justify-center text-sm shadow">
                  IKB
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-display">IKB Founders & Directors</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Master Slab Fabricators & Engineers</p>
                </div>
              </div>

              {/* In-House Fabrication badge details */}
              <div className="mt-2 bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[9px] text-neutral-500 font-mono uppercase block">Est. Year</span>
                  <span className="text-sm font-bold text-white mt-0.5 block font-display">2011</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 font-mono uppercase block">Slabs shop</span>
                  <span className="text-sm font-bold text-amber-400 mt-0.5 block font-display">Orlando, FL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
