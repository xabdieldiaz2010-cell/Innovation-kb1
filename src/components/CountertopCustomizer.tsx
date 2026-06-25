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
      
      // Keep vertical pitch comfortable but allow horizontal rotation (Yaw) to orbit a full 360 degrees freely
      newX = Math.max(-20, Math.min(60, newX));    // Pitch: -20deg to 60deg
      // newY rotates fully without restriction for a complete 360-degree interactive orbit
      
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
      
      // Keep vertical pitch comfortable but allow horizontal rotation (Yaw) to orbit a full 360 degrees freely
      newX = Math.max(-20, Math.min(60, newX));    // Pitch: -20deg to 60deg
      // newY rotates fully without restriction for a complete 360-degree interactive orbit
      
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
              Drag anywhere to orbit in 3D
            </span>
          </div>

          {/* Dimension guidelines helper */}
          <div className="absolute top-2 left-2 text-neutral-400 text-[9px] font-mono pointer-events-none flex flex-col gap-0.5 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/40 backdrop-blur-xs z-10">
            <div className="text-amber-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">📐 Specs Overview</div>
            <div>🔄 Pitch: {Math.round(rotateX)}° | Yaw: {Math.round(rotateY)}°</div>
            <div>📐 Layout: Modern Premium L-Shape</div>
            <div>🚰 Faucet: Gooseneck with Seamless Sink</div>
            <div>❄️ Appliance: French Door Refrigerator</div>
            <div>🪴 Decor: Floating Walnut Accent Shelf</div>
          </div>

          {/* Core Interactive 3D Room Container */}
          <div 
            className={`relative w-full max-w-[420px] h-[340px] flex items-center justify-center ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
            style={{ 
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg) scale(${zoomLevel})`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 1. ROOM ENVIRONMENT: Diagonal Tile Floor */}
            <div 
              className="absolute w-[460px] h-[320px] transition-all duration-500"
              style={{ 
                transform: 'rotateX(90deg) translateZ(-110px) translateY(20px)',
                transformStyle: 'preserve-3d',
                background: 'repeating-linear-gradient(45deg, #e4e4e7 0px, #e4e4e7 1px, transparent 1px, transparent 32px), repeating-linear-gradient(-45deg, #e4e4e7 0px, #e4e4e7 1px, #f4f4f5 1px, #f4f4f5 32px)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.15)'
              }}
            >
              <div className="absolute inset-0 border border-zinc-300 rounded-xl" />
            </div>

            {/* 2. ROOM ENVIRONMENT: Back Wall (Clean light plaster paint) */}
            <div 
              className="absolute w-[460px] h-[230px] bg-zinc-100 border border-zinc-200 shadow-sm rounded-t-lg transition-all duration-500"
              style={{ 
                transform: 'translateZ(-130px) translateY(-15px) translateX(0px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Ceiling Recessed Spotlights */}
              <div className="absolute top-2 inset-x-0 flex justify-around px-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-white border border-zinc-300 shadow-[0_0_12px_#ffffff] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. ROOM ENVIRONMENT: Left Wall (Clean light plaster) */}
            <div 
              className="absolute w-[320px] h-[230px] bg-zinc-100/95 border-r border-zinc-200 transition-all duration-500"
              style={{ 
                transform: 'rotateY(90deg) translateZ(-230px) translateY(-15px) translateX(115px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* DYNAMIC BACKSPLASH SYSTEM (Wraps around back and left walls of L-Shape) */}
            {/* Back Wall Backsplash */}
            {selection.backsplash !== 'none' && (
              <div 
                className="absolute w-[290px] h-[50px] border border-neutral-700/10 overflow-hidden shadow-sm transition-all duration-500"
                style={{ 
                  transform: 'translate3d(-85px, -27.5px, -128px)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {selection.backsplash === 'full-slab' && (
                  <div className={`absolute inset-0 ${selectedStone.bgStyle} opacity-95 transition-all duration-500`} />
                )}
                {selection.backsplash === 'subway' && (
                  <div className="absolute inset-0 bg-neutral-100 transition-all duration-500 flex flex-wrap gap-[1px] p-0.5 justify-center content-start">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="w-6 h-3 bg-white border border-neutral-200 rounded-[0.5px] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.05)]" />
                    ))}
                  </div>
                )}
                {selection.backsplash === 'mosaic' && (
                  <div className="absolute inset-0 bg-neutral-800 transition-all duration-500 grid grid-cols-12 gap-[0.5px] p-0.5">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i} className={`w-full h-1.5 rounded-[0.5px] ${i % 4 === 0 ? 'bg-amber-100/60' : i % 4 === 1 ? 'bg-stone-300' : 'bg-neutral-500'}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Left Wall Backsplash */}
            {selection.backsplash !== 'none' && (
              <div 
                className="absolute w-[220px] h-[50px] border border-neutral-700/10 overflow-hidden shadow-sm transition-all duration-500"
                style={{ 
                  transform: 'translate3d(-228px, -27.5px, -20px) rotateY(90deg)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {selection.backsplash === 'full-slab' && (
                  <div className={`absolute inset-0 ${selectedStone.bgStyle} opacity-95 transition-all duration-500`} />
                )}
                {selection.backsplash === 'subway' && (
                  <div className="absolute inset-0 bg-neutral-100 transition-all duration-500 flex flex-wrap gap-[1px] p-0.5 justify-center content-start">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="w-6 h-3 bg-white border border-neutral-200 rounded-[0.5px]" />
                    ))}
                  </div>
                )}
                {selection.backsplash === 'mosaic' && (
                  <div className="absolute inset-0 bg-neutral-800 transition-all duration-500 grid grid-cols-12 gap-[0.5px] p-0.5">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div key={i} className={`w-full h-1.5 rounded-[0.5px] ${i % 4 === 0 ? 'bg-amber-100/60' : i % 4 === 1 ? 'bg-stone-300' : 'bg-neutral-500'}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3A. PASSAGE DOOR & CASING */}
            <div 
              className="absolute w-[64px] h-[175px] bg-white border-2 border-zinc-300 shadow-md transition-all duration-500 rounded-sm"
              style={{ 
                transform: 'translate3d(-192px, 2.5px, -129px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Door frame / casing overlay */}
              <div className="absolute inset-1 bg-zinc-50 border border-zinc-200 p-2 flex flex-col justify-between h-[171px]">
                {/* 6 Elegant Panels */}
                <div className="grid grid-cols-2 gap-2 h-full">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-zinc-300/80 rounded-sm shadow-inner bg-zinc-100 flex items-center justify-center">
                      <div className="w-[80%] h-[80%] border border-zinc-200 bg-white" />
                    </div>
                  ))}
                </div>
                {/* Brass Door Knob */}
                <div 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-600 shadow-md flex items-center justify-center"
                  style={{ transform: 'translateZ(4px)' }}
                >
                  <div className="w-1 h-1 rounded-full bg-amber-200" />
                </div>
              </div>
            </div>

            {/* 3B. DOUBLE BIFOLD PANTRY DOORS */}
            <div 
              className="absolute w-[85px] h-[175px] bg-zinc-50 border-2 border-zinc-300 shadow-md transition-all duration-500 rounded-sm p-1.5 flex gap-1 justify-around"
              style={{ 
                transform: 'translate3d(-229px, 2.5px, -45px) rotateY(90deg)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Door 1 */}
              <div className="flex-1 border border-zinc-300 rounded flex flex-col justify-between p-1 bg-white">
                <div className="w-full h-1/2 border border-zinc-200 rounded-xs bg-zinc-50" />
                <div className="w-full h-[40%] border border-zinc-200 rounded-xs bg-zinc-50" />
                {/* Handle */}
                <div className="w-0.5 h-6 bg-zinc-400 rounded-xs self-end mt-2" />
              </div>
              {/* Door 2 */}
              <div className="flex-1 border border-zinc-300 rounded flex flex-col justify-between p-1 bg-white">
                <div className="w-full h-1/2 border border-zinc-200 rounded-xs bg-zinc-50" />
                <div className="w-full h-[40%] border border-zinc-200 rounded-xs bg-zinc-50" />
                {/* Handle */}
                <div className="w-0.5 h-6 bg-zinc-400 rounded-xs self-start mt-2" />
              </div>
            </div>

            {/* 4. BACK-LEFT COUNTER & BASE CABINETS */}
            <div 
              className="absolute w-[130px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(-95px, 42.5px, -100px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Cabinet Base */}
              <div 
                className={`absolute inset-0 border border-zinc-200/40 p-1 flex justify-around shadow-md ${selectedCabinet.bgClass} rounded-b-sm`}
                style={{ transform: 'translateZ(30px)', backfaceVisibility: 'hidden' }}
              >
                {/* Farmhouse sink front apron panel */}
                {selection.sinkType === 'farmhouse' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-white border-b-2 border-stone-200 shadow-sm flex items-center justify-center rounded-b-sm z-10">
                    <span className="text-[5px] text-zinc-400 font-mono tracking-widest uppercase">Fireclay Apron</span>
                  </div>
                )}
                {/* 2 Cabinet Doors */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex-1 border border-current/10 rounded relative p-1 flex flex-col justify-between m-0.5">
                    <div className="w-full h-1 border border-current/5" />
                    <div className="w-1.5 h-4 bg-zinc-400 rounded-xs self-end shadow" />
                  </div>
                ))}
              </div>

              {/* Countertop Slab */}
              <div 
                className={`absolute w-[130px] h-[60px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Edge Lip Highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 blur-[0.3px]" />
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />

                {/* Sink cutout / basin */}
                {selection.sinkType !== 'none' && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-24 h-11 bg-zinc-800 border-2 border-zinc-600 rounded-sm shadow-inner flex p-0.5 justify-between">
                    {/* Left Bowl */}
                    <div className="w-[44px] h-full bg-zinc-900 border border-zinc-700 rounded-xs flex flex-col justify-end items-center pb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="w-[2px] h-full bg-zinc-600 self-center" />
                    {/* Right Bowl */}
                    <div className="w-[44px] h-full bg-zinc-900 border border-zinc-700 rounded-xs flex flex-col justify-end items-center pb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Left Side (Blind Corner Connection to return) */}
              <div 
                className={`absolute w-[60px] h-[90px] ${selectedCabinet.bgClass} filter brightness-75`}
                style={{ transform: 'translateX(-65px) rotateY(90deg)' }}
              />
            </div>

            {/* 4B. LEFT UPPER CABINETS */}
            <div 
              className={`absolute w-[130px] h-[65px] border border-zinc-200/40 p-1 flex justify-around shadow-md ${selectedCabinet.bgClass}`}
              style={{ 
                transform: 'translate3d(-95px, -65px, -100px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Doors with glass pane inserts for elite kitchen vibe! */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-1 border border-current/10 rounded relative p-1 bg-current/5 flex flex-col justify-between m-0.5 shadow-sm">
                  <div className="absolute inset-1 bg-sky-900/10 border border-current/5 rounded-xs" />
                  <div className="w-1 h-3 bg-zinc-400 rounded-sm self-end z-10" />
                </div>
              ))}
            </div>

            {/* 4C. SLIDE-IN RANGE STOVE & OVEN */}
            <div 
              className="absolute w-[60px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(0px, 42.5px, -98px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Front Face of Oven */}
              <div 
                className="absolute inset-0 bg-zinc-800 border-2 border-zinc-700 shadow-lg flex flex-col justify-between p-1.5 rounded-sm"
                style={{ transform: 'translateZ(30px)', backfaceVisibility: 'hidden' }}
              >
                {/* Stove Controls panel */}
                <div className="w-full h-4 bg-zinc-900 border-b border-zinc-700 flex items-center justify-around px-1">
                  <div className="w-3 h-2 bg-zinc-950 rounded-[1px] border border-zinc-800 flex items-center justify-center">
                    <span className="text-[3px] text-amber-400 font-mono font-bold">350°</span>
                  </div>
                  {/* Dial knobs */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-600 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-zinc-900" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Glass Oven Window */}
                <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-sm mt-1 mb-1.5 p-1 flex items-center justify-center relative shadow-inner">
                  <div className="absolute top-1 bottom-1 left-2 right-2 bg-amber-500/10 border border-amber-600/20 rounded-xs flex items-center justify-center">
                    <span className="text-[3px] text-amber-500/40 font-mono">Bake Active</span>
                  </div>
                </div>
                {/* Stainless steel door handle */}
                <div className="w-10 h-1 bg-zinc-300 rounded shadow self-center" />
              </div>

              {/* Glass Cooktop slab */}
              <div 
                className="absolute w-[60px] h-[60px] bg-zinc-900 border border-zinc-700 flex flex-wrap gap-2 p-2 justify-center content-center"
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)' }}
              >
                {/* 4 Stove burner rings */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center ${i === 0 ? 'bg-red-500/20 border-red-500' : 'bg-black'}`}>
                    <div className={`w-2 h-2 rounded-full border border-zinc-800 ${i === 0 ? 'bg-red-500/40' : ''}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* 4D. OVER-THE-RANGE MICROWAVE & RANGE HOOD */}
            <div 
              className="absolute w-[60px] h-[40px] bg-zinc-800 border border-zinc-700 shadow-md transition-all duration-500 flex flex-col justify-between rounded-sm"
              style={{ 
                transform: 'translate3d(0px, -52.5px, -100px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Front Face with panel and door */}
              <div className="absolute inset-0 bg-zinc-900 border border-zinc-700 flex p-1 justify-between h-[38px]">
                {/* Microwave door glass */}
                <div className="w-[70%] h-full bg-zinc-950 border border-zinc-800 rounded-sm p-1 relative shadow-inner">
                  <div className="absolute top-1 bottom-1 left-1.5 right-1.5 bg-yellow-400/5 border border-yellow-500/10 rounded-xs" />
                </div>
                {/* Keypad & digital display */}
                <div className="w-[25%] h-full bg-zinc-950 border border-zinc-800 rounded-sm p-0.5 flex flex-col justify-between items-center font-mono">
                  <span className="text-[3px] text-emerald-400 font-bold leading-none">12:30</span>
                  <div className="grid grid-cols-2 gap-[1px] w-full mt-0.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-1 bg-zinc-800 rounded-[0.5px]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4E. BACK-RIGHT COUNTER & BASE CABINET */}
            <div 
              className="absolute w-[80px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(70px, 42.5px, -100px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Shaker cabinet base */}
              <div 
                className={`absolute inset-0 border border-zinc-200/40 p-1 flex justify-around shadow-md ${selectedCabinet.bgClass} rounded-b-sm`}
                style={{ transform: 'translateZ(30px)', backfaceVisibility: 'hidden' }}
              >
                {/* Shaker Door + Drawers */}
                <div className="flex-1 border border-current/10 rounded relative p-1 flex flex-col justify-between m-0.5">
                  <div className="w-full h-1 border border-current/5" />
                  <div className="w-1.5 h-4 bg-zinc-400 rounded-xs self-start shadow" />
                </div>
                <div className="flex-1 border border-current/10 rounded relative p-1 flex flex-col justify-between m-0.5">
                  <span className="text-[3px] font-mono opacity-40">DRAWERS</span>
                  <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                  <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                </div>
              </div>

              {/* Countertop slab */}
              <div 
                className={`absolute w-[80px] h-[60px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)' }}
              >
                {/* Edge Lip Highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 blur-[0.3px]" />
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
              </div>
            </div>

            {/* 4F. RIGHT UPPER CABINETS */}
            <div 
              className={`absolute w-[80px] h-[65px] border border-zinc-200/40 p-1 flex justify-around shadow-md ${selectedCabinet.bgClass}`}
              style={{ 
                transform: 'translate3d(70px, -65px, -100px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Shaker upper doors */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex-1 border border-current/10 rounded relative p-1 bg-current/5 flex flex-col justify-between m-0.5 shadow-sm">
                  <div className="absolute inset-1 bg-sky-900/5 border border-current/5 rounded-xs" />
                  <div className="w-1 h-3 bg-zinc-400 rounded-sm self-end z-10" />
                </div>
              ))}
            </div>

            {/* 5. L-SHAPE: Left Return Section (width = 60px, depth = 160px) */}
            <div 
              className="absolute w-[60px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(-200px, 42.5px, -50px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Top slab of Left Return */}
              <div 
                className={`absolute w-[60px] h-[160px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)' }}
              >
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
                
                {/* Edge Lip highlights on exposed front and right edges */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 blur-[0.3px]" />
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/20 blur-[0.3px]" />
              </div>

              {/* Cabinet Front Face (Facing right, inside the room) */}
              <div 
                className={`absolute w-[160px] h-[90px] border border-zinc-200/40 p-1.5 flex justify-around shadow-md ${selectedCabinet.bgClass}`}
                style={{ 
                  transform: 'translateX(30px) rotateY(90deg)', 
                  backfaceVisibility: 'hidden' 
                }}
              >
                {/* Return drawer stacks & shaker door */}
                <div className="flex-1 border border-current/10 rounded relative p-1 flex flex-col justify-between m-0.5">
                  <span className="text-[3px] font-mono opacity-40">DRAWERS</span>
                  <div className="w-6 h-0.5 bg-zinc-400 rounded self-center" />
                  <div className="w-6 h-0.5 bg-zinc-400 rounded self-center" />
                </div>
                <div className="flex-1 border border-current/10 rounded relative p-1 flex flex-col justify-between m-0.5">
                  <div className="w-full h-1 border border-current/5" />
                  <div className="w-1 h-3.5 bg-zinc-400 rounded-sm self-start" />
                </div>
              </div>

              {/* Front vertical end face (facing the viewer at Z = +80px) */}
              <div 
                className={`absolute inset-x-0 bottom-0 h-[90px] border border-zinc-200/40 p-1 ${selectedCabinet.bgClass} filter brightness-95`}
                style={{ 
                  transform: 'translateZ(80px)', 
                  backfaceVisibility: 'hidden' 
                }}
              >
                <div className="w-full h-full border border-current/10 rounded flex items-center justify-center p-1">
                  <span className="text-[4px] font-mono tracking-wider opacity-30 text-center uppercase">Innovation Slabs</span>
                </div>
              </div>
            </div>

            {/* 3D Gooseneck Faucet */}
            {selection.sinkType !== 'none' && (
              <div 
                className="absolute w-[30px] h-[30px] z-40"
                style={{ 
                  transform: 'translate3d(-95px, -2.5px, -100px) rotateX(-90deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Chrome Faucet Plane 1 */}
                <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(0deg)' }}>
                  <svg className="w-6 h-10 text-zinc-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M 12 34 L 12 16" strokeWidth="2.5" stroke="currentColor" />
                    <path d="M 12 16 Q 12 4 17 4 Q 22 4 22 10" fill="none" stroke="currentColor" />
                    <path d="M 10 32 L 14 32" strokeWidth="2" stroke="currentColor" />
                  </svg>
                </div>
                {/* Chrome Faucet Plane 2 */}
                <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(90deg)' }}>
                  <svg className="w-6 h-10 text-zinc-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M 12 34 L 12 16" strokeWidth="2.5" stroke="currentColor" />
                    <path d="M 12 16 Q 12 4 17 4 Q 22 4 22 10" fill="none" stroke="currentColor" />
                    <path d="M 10 32 L 14 32" strokeWidth="2" stroke="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            {/* 5C. TALL FRENCH-DOOR REFRIGERATOR & UPPER CABINET */}
            <div 
              className="absolute w-[80px] h-[155px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(150px, 10px, -95px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Refrigerator Front Face */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-950 border border-neutral-900 shadow-2xl rounded-t flex flex-col justify-between p-2"
                style={{ 
                  transform: 'translateZ(35px)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-neutral-700/50" />
                <div className="absolute right-[42px] top-16 w-0.5 h-12 bg-zinc-300 rounded-xs shadow" />
                <div className="absolute left-[42px] top-16 w-0.5 h-12 bg-zinc-300 rounded-xs shadow" />
                <div className="absolute left-3 top-10 w-[20px] h-8 bg-neutral-950 border border-neutral-800 rounded p-0.5 shadow-inner flex flex-col justify-between items-center">
                  <div className="w-full h-1.5 bg-sky-900/40 rounded-[0.5px]" />
                  <div className="w-3 h-3 bg-neutral-900 rounded-[1px] flex items-center justify-center">
                    <div className="w-[1px] h-1.5 bg-zinc-500 rounded-full" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 border-t border-neutral-850 bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-start justify-center pt-2">
                  <div className="w-12 h-0.5 bg-zinc-300 rounded-xs shadow" />
                </div>
              </div>

              {/* Side Faces for 3D Refrigerator Volume */}
              <div 
                className="absolute top-0 bottom-0 w-[70px] bg-neutral-900 border border-neutral-950 filter brightness-75"
                style={{ left: '50%', marginLeft: '-35px', transform: 'translateX(-40px) rotateY(-90deg)', backfaceVisibility: 'hidden' }}
              />
              <div 
                className="absolute top-0 bottom-0 w-[70px] bg-neutral-900 border border-neutral-950 filter brightness-90"
                style={{ left: '50%', marginLeft: '-35px', transform: 'translateX(40px) rotateY(90deg)', backfaceVisibility: 'hidden' }}
              />
              <div 
                className="absolute left-0 right-0 h-[70px] bg-neutral-900 border border-neutral-950"
                style={{ top: '50%', marginTop: '-35px', transform: 'translateY(-77.5px) rotateX(90deg)', backfaceVisibility: 'hidden' }}
              />

              {/* 5D. SHAKER CABINETS ON TOP OF THE FRIDGE */}
              <div 
                className={`absolute w-[80px] h-[22px] border border-zinc-200/40 p-0.5 flex justify-around shadow-sm ${selectedCabinet.bgClass}`}
                style={{ 
                  transform: 'translate3d(0, -88px, 0)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex-1 border border-current/10 rounded relative flex flex-col justify-end p-0.5 m-0.5">
                    <div className="w-2.5 h-0.5 bg-zinc-400 rounded-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* 6. DOUBLE ISLAND SYSTEM WITH BOOKMATCHED WATERFALL EDGES */}
            {/* Segment 1: Main Prep Island with Drawers and Dual Waterfall Slabs */}
            <div 
              className="absolute w-[120px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(-40px, 42.5px, 35px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Cabinet Base Block */}
              <div 
                className={`absolute inset-x-2 inset-y-0 border border-zinc-200/40 p-1 flex shadow-md ${selectedCabinet.bgClass} rounded-sm`}
                style={{ transform: 'translateZ(30px)', backfaceVisibility: 'hidden' }}
              >
                {/* Shaker panels and luxury brass pulls */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex-1 border border-current/10 rounded relative p-1.5 flex flex-col justify-between m-0.5">
                    <span className="text-[3px] font-mono opacity-30">DRAWER</span>
                    <div className="w-8 h-1 bg-amber-600 rounded-sm self-center shadow" />
                  </div>
                ))}
              </div>

              {/* Top Countertop Slab */}
              <div 
                className={`absolute w-[120px] h-[70px] ${selectedStone.bgStyle} border border-white/15`}
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Edge Highlights */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 blur-[0.2px]" />
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
              </div>

              {/* Left Bookmatched Waterfall Slab (Goes to Floor) */}
              <div 
                className={`absolute w-[70px] h-[90px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ 
                  transform: 'translateX(-60px) rotateY(-90deg)', 
                  transformStyle: 'preserve-3d', 
                  backfaceVisibility: 'hidden' 
                }}
              >
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 blur-[0.2px]" />
              </div>

              {/* Right Bookmatched Waterfall Slab (Goes to Floor) */}
              <div 
                className={`absolute w-[70px] h-[90px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ 
                  transform: 'translateX(60px) rotateY(90deg)', 
                  transformStyle: 'preserve-3d', 
                  backfaceVisibility: 'hidden' 
                }}
              >
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 blur-[0.2px]" />
              </div>
            </div>

            {/* Segment 2: Angled Breakfast Bar overhang with Waterfall end & Bar Stools */}
            <div 
              className="absolute w-[100px] h-[90px] transition-all duration-500"
              style={{ 
                transform: 'translate3d(70px, 42.5px, 45px) rotateY(-15deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Top Overhang Stone Slab (Thin cantilevered slice) */}
              <div 
                className={`absolute w-[100px] h-[70px] ${selectedStone.bgStyle} border border-white/15`}
                style={{ transform: 'translate3d(0, -45px, 0) rotateX(90deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Edge highlights */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 blur-[0.2px]" />
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
              </div>

              {/* Right Waterfall end slab (Goes to Floor) */}
              <div 
                className={`absolute w-[70px] h-[90px] ${selectedStone.bgStyle} border border-white/10`}
                style={{ 
                  transform: 'translateX(50px) rotateY(90deg)', 
                  transformStyle: 'preserve-3d', 
                  backfaceVisibility: 'hidden' 
                }}
              >
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/30 blur-[0.2px]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 blur-[0.2px]" />
              </div>

              {/* Support pillars underneath cantilever */}
              <div className="absolute left-2 bottom-0 w-3 h-[90px] bg-neutral-800 border border-neutral-700 rounded-sm" />
              
              {/* Minimalist 3D Bar Stools */}
              <div 
                className="absolute w-[24px] h-[52px] transition-all duration-500"
                style={{ transform: 'translate3d(-20px, 38px, 15px) rotateY(15deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Wooden Seat */}
                <div className="absolute top-0 w-[24px] h-[24px] bg-amber-800 rounded-md border border-amber-900 shadow flex items-center justify-center" style={{ transform: 'rotateX(90deg)' }}>
                  <div className="w-[18px] h-[18px] border border-amber-700/40 rounded-xs" />
                </div>
                {/* Metal legs */}
                <div className="absolute top-1 bottom-0 left-1 w-0.5 bg-neutral-700" />
                <div className="absolute top-1 bottom-0 right-1 w-0.5 bg-neutral-700" />
                <div className="absolute top-1 bottom-0 left-1 w-0.5 bg-neutral-700" style={{ transform: 'translateZ(18px)' }} />
                <div className="absolute top-1 bottom-0 right-1 w-0.5 bg-neutral-700" style={{ transform: 'translateZ(18px)' }} />
              </div>

              <div 
                className="absolute w-[24px] h-[52px] transition-all duration-500"
                style={{ transform: 'translate3d(15px, 38px, 15px) rotateY(15deg)', transformStyle: 'preserve-3d' }}
              >
                {/* Wooden Seat */}
                <div className="absolute top-0 w-[24px] h-[24px] bg-amber-800 rounded-md border border-amber-900 shadow flex items-center justify-center" style={{ transform: 'rotateX(90deg)' }}>
                  <div className="w-[18px] h-[18px] border border-amber-700/40 rounded-xs" />
                </div>
                {/* Metal legs */}
                <div className="absolute top-1 bottom-0 left-1 w-0.5 bg-neutral-700" />
                <div className="absolute top-1 bottom-0 right-1 w-0.5 bg-neutral-700" />
                <div className="absolute top-1 bottom-0 left-1 w-0.5 bg-neutral-700" style={{ transform: 'translateZ(18px)' }} />
                <div className="absolute top-1 bottom-0 right-1 w-0.5 bg-neutral-700" style={{ transform: 'translateZ(18px)' }} />
              </div>
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
