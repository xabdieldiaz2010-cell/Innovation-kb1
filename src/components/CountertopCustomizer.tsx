import React, { useState, useRef, useEffect } from 'react';
import { STONES, CABINET_COLORS, EDGE_PROFILES } from '../data';
import { CustomizerSelection } from '../types';
import { Shield, Sparkles, Check, ChevronRight, Layers, HelpCircle, Plus, Minus, RotateCcw } from 'lucide-react';

interface CountertopCustomizerProps {
  onSaveSelection: (selection: CustomizerSelection) => void;
  onSendToAi: (selection: CustomizerSelection) => void;
  savedSelection?: CustomizerSelection;
}

export default function CountertopCustomizer({ onSaveSelection, onSendToAi, savedSelection }: CountertopCustomizerProps) {
  const [selection, setSelection] = useState<CustomizerSelection>(
    savedSelection || {
      stoneId: 'calacatta-gold',
      cabinetId: 'chantilly-white',
      backsplash: 'full-slab',
      edgeId: 'eased',
      sinkType: 'undermount',
    }
  );

  const [viewAngle, setViewAngle] = useState<'iso-left' | 'iso-right' | 'front' | 'custom'>('iso-left');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Free interactive 360-degree rotation states
  const [rotateX, setRotateX] = useState<number>(25);
  const [rotateY, setRotateY] = useState<number>(-35);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ x: number; y: number }>({ x: 25, y: -35 });

  const selectedStone = STONES.find((s) => s.id === selection.stoneId) || STONES[0];
  const selectedCabinet = CABINET_COLORS.find((c) => c.id === selection.cabinetId) || CABINET_COLORS[0];
  const selectedEdge = EDGE_PROFILES.find((e) => e.id === selection.edgeId) || EDGE_PROFILES[0];

  const handleUpdate = (field: keyof CustomizerSelection, value: string) => {
    const updated = { ...selection, [field]: value } as CustomizerSelection;
    setSelection(updated);
  };

  const setPresetAngle = (preset: 'iso-left' | 'iso-right' | 'front') => {
    setViewAngle(preset);
    if (preset === 'iso-left') {
      setRotateX(25);
      setRotateY(-35);
    } else if (preset === 'iso-right') {
      setRotateX(25);
      setRotateY(35);
    } else if (preset === 'front') {
      setRotateX(10);
      setRotateY(0);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const factor = 0.55;
      let newY = rotationStartRef.current.y + dx * factor;
      let newX = rotationStartRef.current.x - dy * factor;
      
      // Keep rotation slightly restricted in the vertical pitch to keep the model recognizable
      newX = Math.max(-20, Math.min(85, newX));
      
      setRotateX(newX);
      setRotateY(newY);
      if (viewAngle !== 'custom') {
        setViewAngle('custom');
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      
      const factor = 0.55;
      let newY = rotationStartRef.current.y + dx * factor;
      let newX = rotationStartRef.current.x - dy * factor;
      
      newX = Math.max(-20, Math.min(85, newX));
      
      setRotateX(newX);
      setRotateY(newY);
      if (viewAngle !== 'custom') {
        setViewAngle('custom');
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, viewAngle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = { x: rotateX, y: rotateY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      rotationStartRef.current = { x: rotateX, y: rotateY };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="customizer-container">
      {/* Visual Live 3D Preview Column */}
      <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[520px]">
        {/* Subtle decorative background radial glowing mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Top bar with labels and 3D Rotation Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 pb-4 border-b border-neutral-800/60">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-semibold block mb-0.5">3D INTERACTIVE STUDIO</span>
            <h3 className="font-display text-lg text-white font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Precision 3D Room Render
            </h3>
          </div>
          
          {/* 3D View Angle & Zoom Controls */}
          <div className="flex flex-wrap gap-2 items-center self-stretch sm:self-auto justify-between sm:justify-start">
            {/* View Angle Presets */}
            <div className="flex bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/50 backdrop-blur-sm justify-between gap-1">
              <button
                onClick={() => setPresetAngle('iso-left')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  viewAngle === 'iso-left' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ISO L
              </button>
              <button
                onClick={() => setPresetAngle('iso-right')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  viewAngle === 'iso-right' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                ISO R
              </button>
              <button
                onClick={() => setPresetAngle('front')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  viewAngle === 'front' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                FRONT
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex bg-neutral-800/80 p-1 rounded-lg border border-neutral-700/50 backdrop-blur-sm items-center gap-1">
              <button
                onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
                title="Zoom Out"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold text-amber-500 px-1 min-w-[32px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(1.6, z + 0.15))}
                title="Zoom In"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                title="Reset Zoom"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer ml-0.5 border-l border-neutral-700/50 pl-1.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main 3D Render Canvas using pure CSS 3D perspectives */}
        <div 
          className="my-12 flex flex-col items-center justify-center relative min-h-[420px] select-none cursor-grab active:cursor-grabbing touch-none bg-neutral-950/10 rounded-2xl border border-neutral-800/20 p-4" 
          style={{ perspective: '1500px' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          
          {/* Drag Instruction Overlay Banner */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-neutral-950/85 border border-neutral-800 px-3.5 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 z-10 pointer-events-none shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[9px] font-semibold text-neutral-200 uppercase tracking-wider font-mono">
              Drag anywhere to rotate 360°
            </span>
          </div>

          {/* Dimension guidelines helper */}
          <div className="absolute top-2 left-2 text-neutral-400 text-[9px] font-mono pointer-events-none flex flex-col gap-0.5 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/40 backdrop-blur-xs z-10">
            <div className="text-amber-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">📐 Specs Overview</div>
            <div>🔄 Pitch: {Math.round(rotateX)}° | Yaw: {Math.round(rotateY)}°</div>
            <div>⤢ L-Shape Modular Layout</div>
            <div>⚡ Integrated Dishwasher & Fridge</div>
            <div>↕ Backsplash: 18" Slab / Tile</div>
            <div>↔ Dual Arm Countertops: 3cm Slabs</div>
          </div>

          {/* Core Interactive 3D Room Container */}
          <div 
            className={`relative w-full max-w-[420px] h-[340px] flex items-center justify-center ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
            style={{ 
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg) scale(${zoomLevel})`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 1. ROOM ENVIRONMENT: Wood Plank Floor (Sitting Flat at the Bottom) */}
            <div 
              className="absolute w-[440px] h-[280px] transition-all duration-500"
              style={{ 
                transform: 'rotateX(90deg) translateZ(-110px) translateY(10px) translateX(0px)',
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(rgba(100,60,20,0.18) 2px, transparent 2px) #dfa76e',
                backgroundSize: '100% 16px',
              }}
            >
              {/* Floor Shadow / Border Trim */}
              <div className="absolute inset-0 border border-amber-950/20 rounded-xl shadow-[inset_0_0_35px_rgba(0,0,0,0.45)]" />
            </div>

            {/* 2. ROOM ENVIRONMENT: Back Wall (Textured plaster backdrop) */}
            <div 
              className="absolute w-[440px] h-[220px] bg-neutral-800/30 border border-neutral-700/20 shadow-inner rounded-t-lg transition-all duration-500 flex flex-col justify-between p-3"
              style={{ 
                transform: 'translateZ(-130px) translateY(-15px) translateX(0px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Subtle grid lines to simulate clean tiles / architectural panels */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:100%_20px] pointer-events-none opacity-40" />
            </div>

            {/* 3. ROOM ENVIRONMENT: Left Wall (Perpendicular left corner block) */}
            <div 
              className="absolute w-[280px] h-[220px] bg-neutral-800/25 border-r border-neutral-700/20 transition-all duration-500"
              style={{ 
                transform: 'rotateY(90deg) translateZ(-220px) translateY(-15px) translateX(110px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* 4. UPPER FLOATING OAK SHELF with accessories on Back Wall */}
            <div 
              className="absolute w-[220px] h-[35px] bg-amber-800 border border-amber-900/40 rounded-sm shadow-md transition-all duration-500"
              style={{ 
                transform: 'rotateX(90deg) translateZ(-65px) translateY(-110px) translateX(-35px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Shelf Accessories sticking straight up (rotated back -90 deg) */}
              <div 
                className="absolute inset-x-0 bottom-1 h-20 flex justify-around items-end"
                style={{ transform: 'rotateX(-90deg) translateZ(10px)' }}
              >
                {/* Small potted hanging plant */}
                <div className="w-8 h-8 rounded-full bg-emerald-800/20 relative flex items-center justify-center border border-emerald-900/10">
                  <div className="w-5 h-5 rounded-full bg-amber-950 flex items-center justify-center overflow-hidden border border-amber-900">
                    <span className="text-[5px] text-emerald-400 font-bold uppercase">IVY</span>
                  </div>
                  {/* Trailing plant vines */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-emerald-500/80 to-transparent rounded-b-md blur-[0.5px]" />
                </div>
                {/* Ceramic Stacked Cups */}
                <div className="flex flex-col-reverse items-center justify-end h-8">
                  <div className="w-6 h-3 bg-neutral-100 border border-neutral-200 rounded-sm shadow-sm" />
                  <div className="w-5 h-2.5 bg-amber-100 border border-amber-200 rounded-sm shadow-xs -mb-1" />
                </div>
                {/* Plate Stack */}
                <div className="w-7 h-4 flex flex-col justify-end gap-0.5">
                  <div className="w-full h-0.5 bg-neutral-200 rounded-full border border-neutral-300" />
                  <div className="w-full h-0.5 bg-neutral-200 rounded-full border border-neutral-300" />
                  <div className="w-full h-0.5 bg-neutral-200 rounded-full border border-neutral-300" />
                </div>
              </div>
            </div>

            {/* 5. TALL REFRIGERATOR (Stainless Steel Double Door on the Right End) */}
            <div 
              className="absolute w-[80px] h-[175px] transition-all duration-500"
              style={{ 
                transform: 'translateZ(-95px) translateY(-2.5px) translateX(155px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* REFRIGERATOR FRONT FACE */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border border-zinc-400 shadow-2xl rounded-t-lg flex flex-col justify-between p-2.5"
                style={{ transform: 'translateZ(35px)' }}
              >
                {/* French Door split line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-500/40" />

                {/* Left & Right Door Grab Handles */}
                <div className="absolute right-[41px] top-24 w-1 h-14 bg-amber-400 rounded-sm shadow border border-amber-500/30" />
                <div className="absolute left-[41px] top-24 w-1 h-14 bg-amber-400 rounded-sm shadow border border-amber-500/30" />

                {/* High-Tech Ice & Water Dispenser */}
                <div className="absolute left-3 top-12 w-10 h-12 bg-neutral-900 border border-neutral-800 rounded p-1 shadow-inner flex flex-col justify-between items-center">
                  {/* Glowing touch interface screen */}
                  <div className="w-full h-3 bg-sky-950 border border-sky-800/50 rounded-[1px] flex items-center justify-center">
                    <span className="text-[5px] text-sky-400 font-mono font-bold tracking-tighter">68°F COOL</span>
                  </div>
                  {/* Dispenser cavity */}
                  <div className="w-6 h-5 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-center">
                    <div className="w-1 h-2.5 bg-zinc-700 rounded-full" />
                  </div>
                </div>

                {/* Freezer Bottom Drawer */}
                <div className="absolute bottom-0 left-0 right-0 h-44 border-t border-zinc-400/80 bg-gradient-to-b from-zinc-300 via-zinc-200 to-zinc-400 flex items-start justify-center pt-3">
                  {/* Freezer handle */}
                  <div className="w-14 h-1 bg-amber-400 rounded-sm shadow" />
                </div>
              </div>

              {/* REFRIGERATOR LEFT SIDE FACE (Visible in ISO view) */}
              <div 
                className="absolute top-0 bottom-0 left-[-70px] w-[70px] bg-neutral-700 border-l border-neutral-600 transition-all duration-500 filter brightness-75"
                style={{ 
                  transform: 'rotateY(-90deg) translateZ(35px)',
                  transformOrigin: 'right'
                }}
              />
            </div>

            {/* 6. BACKSPLASH STYLE (Standing upright along the back wall) */}
            {selection.backsplash !== 'none' && (
              <div 
                className="absolute w-[270px] h-[55px] border border-neutral-700/30 overflow-hidden shadow-2xl transition-all duration-500"
                style={{ 
                  transform: 'translateZ(-125px) translateY(-32px) translateX(-20px)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {selection.backsplash === 'full-slab' && (
                  <div className={`absolute inset-0 ${selectedStone.bgStyle} opacity-95 transition-all duration-500`} />
                )}
                {selection.backsplash === 'subway' && (
                  <div className="absolute inset-0 bg-neutral-100 transition-all duration-500 flex flex-wrap gap-[1px] p-1 justify-center content-start">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="w-7 h-3.5 bg-white border border-neutral-200 rounded-[0.5px] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.05)]" />
                    ))}
                  </div>
                )}
                {selection.backsplash === 'mosaic' && (
                  <div className="absolute inset-0 bg-neutral-850 transition-all duration-500 grid grid-cols-12 gap-[0.5px] p-0.5">
                    {Array.from({ length: 84 }).map((_, i) => (
                      <div key={i} className={`w-full h-1.5 rounded-[0.5px] ${i % 4 === 0 ? 'bg-amber-100/60' : i % 4 === 1 ? 'bg-stone-300' : 'bg-neutral-500'}`} />
                    ))}
                  </div>
                )}
                
                {/* Backsplash base shadow depth onto countertop */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-950/45 blur-[0.5px]" />
              </div>
            )}

            {/* 7. SINK ASSEMBLY & GOOSENECK FAUCET (Standing straight up out of Countertop) */}
            <div 
              className="absolute w-[40px] h-[40px] z-20"
              style={{ 
                transform: 'translateZ(-95px) translateY(-28px) translateX(-20px) rotateX(-90deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Gooseneck physical golden/brass faucet */}
              <svg className="w-8 h-12 text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {/* Base collar */}
                <path d="M 8 34 L 16 34" strokeWidth="3" />
                <path d="M 12 34 L 12 20" strokeWidth="2" />
                {/* Spout curve */}
                <path d="M 12 20 Q 12 6 17 6 Q 22 6 22 14" fill="none" />
                {/* Handles */}
                <path d="M 6 30 L 10 30" strokeWidth="2" />
                <path d="M 14 30 L 18 30" strokeWidth="2" />
              </svg>
            </div>

            {/* 8. MAIN BACK COUNTERTOP SLAB (L-Shape Back Arm, laying horizontally) */}
            <div 
              className="absolute w-[270px] h-[60px] transition-all duration-500 z-10"
              style={{ 
                transform: 'rotateX(90deg) translateZ(-5px) translateX(-20px) translateY(-95px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* TOP SLAB FACE */}
              <div 
                className={`absolute inset-0 rounded border border-white/10 overflow-hidden ${selectedStone.bgStyle} transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.35)]`}
                style={{ transform: 'translateZ(10px)' }}
              >
                {/* Stone vein highlight details */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
                
                {/* Interactive Sink Cutout */}
                {selection.sinkType !== 'none' && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-8 w-24 bg-neutral-950 rounded-md border border-neutral-700 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-20 h-5 rounded bg-neutral-900 border-b border-neutral-800 flex items-center justify-center">
                      <span className="text-[6px] text-neutral-400 font-mono tracking-tight uppercase">
                        {selection.sinkType === 'undermount' ? 'Undermount Stainless' : selection.sinkType === 'farmhouse' ? 'Farmhouse Apron' : 'Slab Apron'}
                      </span>
                    </div>
                    {/* Tiny simulated water drain circle */}
                    <div className="w-1 h-1 rounded-full bg-neutral-700/80 mt-0.5 border border-neutral-600 shadow-inner" />
                  </div>
                )}
              </div>

              {/* FRONT LIP FACE (Thickness) */}
              <div 
                className={`absolute bottom-[-10px] left-0 right-0 h-[10px] border border-white/5 overflow-hidden ${selectedStone.bgStyle} filter brightness-75 transition-all duration-500`}
                style={{ 
                  transform: 'rotateX(-90deg) translateZ(55px)',
                  transformOrigin: 'bottom'
                }}
              >
                {/* Highlight edge strip */}
                <div className="w-full h-[1.5px] bg-white/40 blur-[0.2px] animate-pulse" />
              </div>

              {/* RIGHT SIDE FACE (Thickness, ends at refrigerator) */}
              <div 
                className={`absolute top-0 bottom-0 right-[-10px] w-[10px] border border-white/5 overflow-hidden ${selectedStone.bgStyle} filter brightness-85 transition-all duration-500`}
                style={{ 
                  transform: 'rotateY(90deg) translateZ(265px)',
                  transformOrigin: 'right'
                }}
              />
            </div>

            {/* 9. MAIN BACK CABINETS (Underneath main countertop, containing dishwasher & shaker doors) */}
            <div 
              className="absolute w-[270px] h-[100px] transition-all duration-500"
              style={{ 
                transform: 'translateZ(-95px) translateY(45px) translateX(-20px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* CABINET FRONT FACE */}
              <div 
                className="absolute inset-0 rounded-b-lg border border-white/5 p-2 flex justify-between gap-3 shadow-2xl transition-all duration-500 bg-neutral-900/40"
                style={{ transform: 'translateZ(35px)' }}
              >
                {/* 9A. INTEGRATED STAINLESS STEEL DISHWASHER (Left Side) */}
                <div className="w-[70px] bg-gradient-to-b from-zinc-300 via-zinc-100 to-zinc-400 border border-zinc-400 rounded-sm p-1 flex flex-col justify-between relative shadow-md">
                  {/* Dishwasher top panel screen */}
                  <div className="h-4 bg-neutral-950 text-[5px] text-emerald-400 flex items-center justify-between px-1.5 border-b border-neutral-800 font-mono tracking-tighter">
                    <span>⚡ CLEAN</span>
                    <span className="animate-pulse">01:45</span>
                  </div>
                  {/* Dishwasher grab pull bar handle */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-neutral-800 rounded border border-neutral-700 shadow flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-neutral-600 rounded" />
                  </div>
                  {/* Dishwasher status laser indicator (shines on floor) */}
                  <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981] animate-pulse" />
                </div>

                {/* 9B. SINK CABINET DOORS (Center) */}
                <div className={`flex-1 border border-white/5 rounded relative flex flex-col justify-between p-1 transition-all duration-500 ${selectedCabinet.bgClass}`}>
                  
                  {/* Farmhouse apron sink front cutout projection */}
                  {selection.sinkType === 'farmhouse' ? (
                    <div className="absolute top-0 inset-x-0 h-8 bg-white border-b border-stone-300 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] rounded-t-sm flex items-center justify-center">
                      <span className="text-[6px] text-zinc-400 font-mono font-bold tracking-widest uppercase">FIRECLAY APRON</span>
                    </div>
                  ) : null}

                  <div className={`flex w-full h-full gap-1 mt-auto ${selection.sinkType === 'farmhouse' ? 'h-[44px]' : 'h-full'}`}>
                    {/* Left Cabinet Door */}
                    <div className="flex-1 border border-current/10 rounded relative flex flex-col justify-end p-1">
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-amber-400 rounded-sm shadow-sm" />
                    </div>
                    {/* Right Cabinet Door */}
                    <div className="flex-1 border border-current/10 rounded relative flex flex-col justify-end p-1">
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-amber-400 rounded-sm shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* 9C. DRAWER STACK (Right Side) */}
                <div className={`w-[70px] border border-white/5 rounded relative flex flex-col justify-between p-1 transition-all duration-500 ${selectedCabinet.bgClass}`}>
                  {/* Top drawer */}
                  <div className="h-5 border border-current/10 rounded relative flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-amber-400 rounded" />
                  </div>
                  {/* Middle drawer */}
                  <div className="h-5 border border-current/10 rounded relative flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-amber-400 rounded" />
                  </div>
                  {/* Bottom drawer */}
                  <div className="h-5 border border-current/10 rounded relative flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-amber-400 rounded" />
                  </div>
                </div>

              </div>

              {/* CABINET RIGHT SIDE FACE (Closing up the line at the fridge) */}
              <div 
                className={`absolute top-0 bottom-0 right-[-30px] w-[30px] border-y border-white/5 filter brightness-75 transition-all duration-500 ${selectedCabinet.bgClass}`}
                style={{ 
                  transform: 'rotateY(90deg) translateZ(255px) translateX(-4px)',
                  transformOrigin: 'right'
                }}
              />
            </div>

            {/* 10. LEFT RETURN COUNTERTOP (The L-Wing stone surface extending forward) */}
            <div 
              className="absolute w-[60px] h-[130px] transition-all duration-500 z-10"
              style={{ 
                transform: 'rotateX(90deg) rotateZ(90deg) translateZ(-5px) translateY(120px) translateX(45px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* TOP SLAB FACE */}
              <div 
                className={`absolute inset-0 rounded border border-white/10 overflow-hidden ${selectedStone.bgStyle} transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.35)]`}
                style={{ transform: 'translateZ(10px)' }}
              >
                {/* Stone vein highlight details */}
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
              </div>

              {/* OUTER EDGE PROFILE FACE (Facing the viewer directly!) */}
              <div 
                className={`absolute bottom-[-10px] left-0 right-0 h-[10px] border border-white/5 overflow-hidden ${selectedStone.bgStyle} filter brightness-75 transition-all duration-500`}
                style={{ 
                  transform: 'rotateX(-90deg) translateZ(125px)',
                  transformOrigin: 'bottom'
                }}
              >
                {/* Highlight edge strip */}
                <div className="w-full h-[1.5px] bg-white/40 blur-[0.2px] animate-pulse" />
              </div>
            </div>

            {/* 11. LEFT RETURN CABINETS (Underneath Left Return countertop, facing right) */}
            <div 
              className="absolute w-[130px] h-[100px] transition-all duration-500"
              style={{ 
                transform: 'rotateY(90deg) translateZ(-154px) translateY(45px) translateX(45px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* CABINETS FACE */}
              <div 
                className={`absolute inset-0 border border-white/5 p-2 flex justify-between gap-2.5 shadow-2xl transition-all duration-500 ${selectedCabinet.bgClass}`}
                style={{ transform: 'translateZ(30px)' }}
              >
                {/* Left Drawer Bay */}
                <div className="flex-1 border border-current/10 rounded flex flex-col justify-around p-1">
                  <div className="w-full h-4 border border-current/5 rounded flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-amber-400 rounded" />
                  </div>
                  <div className="w-full h-8 border border-current/5 rounded relative flex items-center justify-center">
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-amber-400 rounded-sm shadow-sm" />
                  </div>
                </div>

                {/* Right Luxury Oak Wine Rack Niche */}
                <div className="w-14 h-[84px] bg-neutral-950/95 border border-neutral-800 rounded-md p-1 flex flex-col justify-around shadow-inner relative overflow-hidden">
                  <span className="text-[5px] text-amber-500 font-bold uppercase tracking-wider text-center block leading-none mb-0.5">RESERVE</span>
                  {/* Wine rack wood grid overlays */}
                  <div className="grid grid-cols-2 grid-rows-3 gap-0.5 h-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border border-amber-900/30 bg-amber-900/10 rounded-sm flex items-center justify-center relative">
                        {/* Tiny wine bottle caps */}
                        <div className="w-1.5 h-1.5 rounded-full bg-red-900 shadow border border-amber-900/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Toe Kick shadow overlay */}
              <div 
                className="absolute bottom-[-10px] left-3 right-3 h-2 bg-neutral-950/50 rounded-full blur-[1.5px]"
                style={{ transform: 'translateZ(5px)' }}
              />
            </div>
            
          </div>
        </div>

        {/* Selected material details specs card footer */}
        <div className="border-t border-neutral-800 pt-5 z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider font-mono">Countertop Material</span>
              <p className="text-sm font-medium text-white">{selectedStone.name} ({selectedStone.category})</p>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700/60">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-neutral-300">Durability:</span>
              <span className="text-xs font-semibold text-white">{selectedStone.durability}/5</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed italic mb-3">
            "{selectedStone.description}"
          </p>
          <div className="grid grid-cols-3 gap-2 py-2.5 bg-neutral-850/50 border border-neutral-800 rounded-lg px-3 text-center">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-mono block">Cabinetry</span>
              <span className="text-xs text-zinc-300 font-medium truncate block">{selectedCabinet.name}</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-mono block">Edge Detail</span>
              <span className="text-xs text-zinc-300 font-medium truncate block">{selectedEdge.name}</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-mono block">Price Tier</span>
              <span className="text-xs text-amber-400 font-semibold uppercase block">{selectedStone.priceTier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="lg:col-span-5 flex flex-col gap-6" id="customizer-options">
        {/* Step 1: Choose Stone */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 font-mono text-xs flex items-center justify-center font-bold">1</span>
            <h4 className="font-display font-medium text-neutral-900 text-base">Select Premium Slab</h4>
          </div>
          <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {STONES.map((stone) => (
              <button
                key={stone.id}
                onClick={() => handleUpdate('stoneId', stone.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all relative ${
                  selection.stoneId === stone.id
                    ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg border shadow-sm flex-shrink-0 ${stone.bgStyle}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 truncate">{stone.name}</span>
                    <span className="text-[9px] font-mono font-medium uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      {stone.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 block truncate">{stone.priceTier} Price Tier • Origin: {stone.origin}</span>
                </div>
                {selection.stoneId === stone.id && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Choose Cabinetry */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 font-mono text-xs flex items-center justify-center font-bold">2</span>
            <h4 className="font-display font-medium text-neutral-900 text-base">Cabinet Colorway</h4>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CABINET_COLORS.map((cabinet) => (
              <button
                key={cabinet.id}
                onClick={() => handleUpdate('cabinetId', cabinet.id)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all gap-2 relative ${
                  selection.cabinetId === cabinet.id
                    ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className={`w-full h-6 rounded-md border ${cabinet.bgClass}`} />
                <span className="text-xs font-semibold text-neutral-900 block leading-tight">{cabinet.name}</span>
                {selection.cabinetId === cabinet.id && (
                  <div className="absolute right-2.5 bottom-2.5 bg-neutral-900 text-white rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Backsplash & Edge Profiles */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 font-mono text-xs flex items-center justify-center font-bold">3</span>
            <h4 className="font-display font-medium text-neutral-900 text-base">Details & Accents</h4>
          </div>
          
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider mb-2">Backsplash Style</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'full-slab', label: 'Full Slab' },
                { id: 'subway', label: 'Subway Tile' },
                { id: 'mosaic', label: 'Mosaic' },
                { id: 'none', label: 'No Splas.' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleUpdate('backsplash', b.id)}
                  className={`py-1.5 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                    selection.backsplash === b.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider mb-2">Countertop Edge Profile</label>
            <div className="grid grid-cols-2 gap-2">
              {EDGE_PROFILES.map((edge) => (
                <button
                  key={edge.id}
                  onClick={() => handleUpdate('edgeId', edge.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selection.edgeId === edge.id
                      ? 'border-neutral-900 bg-neutral-50/50 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-neutral-900 block">{edge.name}</span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">{edge.description.split('.')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 block uppercase tracking-wider mb-2">Sink Assembly Integration</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'undermount', label: 'Undermount' },
                { id: 'farmhouse', label: 'Farmhouse' },
                { id: 'none', label: 'No Sink' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleUpdate('sinkType', s.id)}
                  className={`py-1.5 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                    selection.sinkType === s.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onSaveSelection(selection)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" /> Save Design to Consultation Planner
          </button>
          
          <button
            onClick={() => onSendToAi(selection)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-neutral-950" /> Send Selection to AI Design Assistant
            <ChevronRight className="w-4 h-4 text-neutral-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
