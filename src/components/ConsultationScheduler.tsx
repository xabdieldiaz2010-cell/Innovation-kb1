import { useState, FormEvent, DragEvent, ChangeEvent } from 'react';
import { ConsultationRequest, EstimatorInputs, EstimateBreakdown, UploadedFile } from '../types';
import { Calendar, Clock, MapPin, Sparkles, Send, CheckCircle, Info, Hammer, PhoneCall, Upload, X, FileText, Image as ImageIcon, Ruler, Folder } from 'lucide-react';

interface ConsultationSchedulerProps {
  appliedInputs?: EstimatorInputs;
  appliedBreakdown?: EstimateBreakdown;
  onSubmitSuccess: () => void;
}

export default function ConsultationScheduler({ appliedInputs, appliedBreakdown, onSubmitSuccess }: ConsultationSchedulerProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    zipCode: '',
    projectType: 'Kitchen' as any,
    scope: 'Complete Transformation' as any,
    preferredMaterial: appliedInputs ? `${appliedInputs.materialTier} Slabs` : 'Undecided',
    message: '',
    date: '',
    timeSlot: '09:00 AM - 11:00 AM',
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'inspiration' | 'floorplan' | 'measurement' | 'other'>('inspiration');
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM'
  ];

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          category: selectedCategory,
          dataUrl: reader.result as string
        };
        setUploadedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMessage("Please fill in your name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const budgetString = appliedBreakdown 
      ? `$${appliedBreakdown.totalMin.toLocaleString()} - $${appliedBreakdown.totalMax.toLocaleString()}`
      : "Planning Stage";

    const payload = {
      ...formData,
      budgetRange: budgetString,
      timeline: "1-3 Months", // default
      savedSelection: undefined, // customizer selection passes if loaded
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to register consultation. Please check your network connection.");
      }

      setIsSuccess(true);
      onSubmitSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 md:p-12 text-center shadow-sm max-w-xl mx-auto flex flex-col items-center gap-5" id="schedule-success">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-neutral-900 text-2xl">Consultation Request Received!</h3>
          <p className="text-sm text-neutral-500 leading-relaxed mt-2.5">
            Thank you, <strong className="text-neutral-900">{formData.fullName}</strong>. Your design consultation has been successfully booked for <strong className="text-neutral-900">{formData.date}</strong> at <strong className="text-neutral-900">{formData.timeSlot}</strong>.
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            An IKB project manager will call you at <strong>{formData.phone}</strong> to confirm the address details and coordinate our digital 3D mapping laser layout.
          </p>
        </div>

        {appliedBreakdown && (
          <div className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 mt-2">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold block mb-1">Attached Cost Estimate</span>
            <span className="text-sm font-semibold text-neutral-900">${appliedBreakdown.totalMin.toLocaleString()} - ${appliedBreakdown.totalMax.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">{appliedInputs?.countertopLinearFeet} LF Countertops | {appliedInputs?.cabinetLinearFeet} LF Cabinets</span>
          </div>
        )}

        <div className="flex gap-3 mt-4 w-full">
          <button 
            onClick={() => {
              setIsSuccess(false);
              setUploadedFiles([]);
            }}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer"
          >
            Schedule Another Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12" id="consultation-form">
      {/* Information Panel (Central Florida info) */}
      <div className="md:col-span-5 bg-neutral-950 p-6 md:p-8 text-neutral-300 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500 font-semibold block mb-1">IKB Service Standards</span>
          <h3 className="font-display text-lg text-white font-semibold mb-4">Precision 3D Digital Consultation</h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-5">
            Since 2011, Innovation Kitchen and Bath has brought absolute accuracy to kitchen, bath, and commercial stone design. Our local in-home mapping uses laser metrics to ensure 0.1mm installation precision.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-white block">Central Florida Service Area</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Orlando, Winter Park, Windermere, Lake Nona, Dr. Phillips, Winter Garden</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Hammer className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-white block">Flawless Quality Handled In-House</span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">We control material sourcing, robotic waterjet CNC fabrication, and installation ourselves.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost attachment indication */}
        {appliedBreakdown ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase font-mono text-amber-500 font-bold tracking-wider">Estimate Attached</span>
              <span className="text-[9px] bg-emerald-500 text-neutral-950 px-1.5 py-0.5 rounded-full font-bold">LOCKED IN</span>
            </div>
            <p className="text-xs text-white font-medium">Project Range: ${appliedBreakdown.totalMin.toLocaleString()} - ${appliedBreakdown.totalMax.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-400 mt-1 leading-normal">Selected {appliedInputs?.materialTier} materials and {appliedInputs?.cabinetGrade} cabinetry grade attached to your design blueprint.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-4 mt-6 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-neutral-400 leading-normal">
              <strong>Tip:</strong> You can use our Cost Planner calculator tab to estimate your remodel budget, and then apply it here to pre-load details for IKB estimators.
            </p>
          </div>
        )}
      </div>

      {/* Booking Form Panel */}
      <form onSubmit={handleSubmit} className="md:col-span-7 p-6 md:p-8 flex flex-col gap-4">
        <h4 className="font-display font-medium text-neutral-900 text-base mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-amber-500" /> Book Consultation & Digital Mapping
        </h4>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 text-xs px-3.5 py-2.5 rounded-xl border border-red-100 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Zip Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. 32801"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. (407) 555-0199"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Project Type</label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              <option value="Kitchen">Kitchen Remodeling</option>
              <option value="Bathroom">Bathroom Remodeling</option>
              <option value="Full House">Full Residential</option>
              <option value="Commercial">Commercial Stone/Fabrication</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Renovation Scope</label>
            <select
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              <option value="Complete Transformation">Complete Transformation</option>
              <option value="Countertops Only">Countertops Only</option>
              <option value="Cabinets Only">Cabinets Only</option>
              <option value="Custom Remodeling">Custom Work</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Preferred Consultation Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" /> Preferred Hours Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              {timeSlots.map((ts) => (
                <option key={ts} value={ts}>{ts}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Additional Project Details & Ideas</label>
          <textarea
            rows={3}
            placeholder="Tell us about your kitchen, bathroom layout, favorite stones, cabinet desires, or scheduling details..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
          />
        </div>

        {/* Document Upload Widget */}
        <div className="bg-stone-50 border border-neutral-200 rounded-2xl p-4 md:p-5 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Project Documents & Assets</span>
              <p className="text-[10px] text-neutral-400">Upload inspiration photos, floor plans, drawings, or measurements.</p>
            </div>
            
            {/* Category Selector dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-neutral-400">Category:</span>
              <select
                type="button"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-[10px] text-neutral-700 font-semibold focus:outline-none"
              >
                <option value="inspiration">Inspiration Photo</option>
                <option value="floorplan">Floor Plan / CAD</option>
                <option value="measurement">Measurements / Info</option>
                <option value="other">Other Document</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative ${
              dragActive 
                ? 'border-amber-500 bg-amber-500/5' 
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                <Upload className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-neutral-800">Click to upload</span> or drag & drop files here
              </div>
              <p className="text-[10px] text-neutral-400">Supports PNG, JPG, PDF, or TXT up to 10MB</p>
            </div>
          </div>

          {/* Uploaded Files list */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Uploaded Files ({uploadedFiles.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-2.5 shadow-sm text-xs">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-500">
                        {file.category === 'inspiration' && <ImageIcon className="w-4 h-4 text-sky-500" />}
                        {file.category === 'floorplan' && <Folder className="w-4 h-4 text-emerald-500" />}
                        {file.category === 'measurement' && <Ruler className="w-4 h-4 text-amber-500" />}
                        {file.category === 'other' && <FileText className="w-4 h-4 text-neutral-500" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-neutral-800 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[9px] font-mono text-neutral-400 uppercase">
                          {file.category} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-semibold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <LoaderIcon />
          ) : (
            <>
              <Send className="w-4 h-4 text-amber-400" /> Submit Precision Mapping Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
