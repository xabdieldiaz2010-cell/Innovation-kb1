import { useState, useEffect } from 'react';
import { ConsultationRequest } from '../types';
import { Calendar, Clock, Phone, Mail, MapPin, CheckCircle2, AlertCircle, Trash2, ShieldCheck, Layers, RefreshCw, Database } from 'lucide-react';

export default function AdminPortal() {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Elegant notifications and two-step delete states for iframe security
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === msg ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/consultations');
        if (!res.ok) {
          throw new Error("Failed to load consultations from IKB backend database.");
        }
        const data = await res.json();
        setConsultations(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not retrieve records.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [refreshTrigger]);

  const updateStatus = async (id: string, newStatus: 'Pending' | 'Confirmed' | 'Completed') => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Lead status successfully updated to ${newStatus}.`, "success");
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification("Failed to update status.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Network error updating status.", "error");
    }
  };

  const deleteConsultation = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === id ? null : prev);
      }, 4000);
      return;
    }

    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification("Lead record deleted successfully.", "success");
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification("Failed to delete record.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Network error deleting lead.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="admin-portal-container">
      {/* Top Welcome Stats Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500 font-semibold block mb-1">IKB Contractor Terminal</span>
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" /> Remodeling Workspace & Lead Tracker
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            This workspace acts as IKB's designer-client ledger. Review custom templates, track homeowner material choices, and coordinate Central Florida field visits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4 text-neutral-300" />
          </button>
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
            <span className="text-xs text-neutral-400 block font-mono">Active Leads</span>
            <span className="text-lg font-bold text-white font-mono leading-none">{consultations.length}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all animate-fade-in ${
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`} id="admin-notification">
          <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
          <LoaderIcon />
          <p className="text-xs text-neutral-500 font-medium">Synchronizing design databases...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center text-red-800">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h4 className="font-semibold text-sm">Failed to connect to database</h4>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <p className="text-[10px] text-red-500 mt-4 italic">Verify your backend node server.ts is active.</p>
        </div>
      ) : consultations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {consultations.map((c) => (
            <div 
              key={c.id} 
              className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-neutral-900 text-base">{c.fullName}</h4>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">ID: {c.id}</span>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex gap-1.5">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      c.status === 'Confirmed' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : c.status === 'Completed'
                        ? 'bg-blue-50 text-blue-800 border border-blue-100'
                        : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Grid Info Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mb-4 py-3 border-y border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">Booked Date</span>
                      <span className="text-neutral-900 font-medium">{c.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">Time Slot</span>
                      <span className="text-neutral-900 font-medium truncate max-w-[140px] block">{c.timeSlot}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">Phone Number</span>
                      <a href={`tel:${c.phone}`} className="text-neutral-950 font-semibold hover:underline block">{c.phone}</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-mono">Email Contact</span>
                      <a href={`mailto:${c.email}`} className="text-neutral-950 font-semibold hover:underline truncate max-w-[140px] block">{c.email}</a>
                    </div>
                  </div>
                </div>

                {/* Project Specs */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] bg-neutral-100 text-neutral-800 font-semibold px-2.5 py-0.5 rounded capitalize">
                    {c.projectType} Project
                  </span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-800 font-semibold px-2.5 py-0.5 rounded">
                    Scope: {c.scope}
                  </span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-800 font-semibold px-2.5 py-0.5 rounded">
                    Material: {c.preferredMaterial}
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded border border-amber-100 font-mono">
                    Budget: {c.budgetRange}
                  </span>
                  <span className="text-[10px] bg-zinc-100 text-neutral-600 font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Zip: {c.zipCode}
                  </span>
                </div>

                {/* Client Message */}
                {c.message && (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 text-xs text-neutral-600 leading-normal mb-4">
                    <span className="text-[9px] uppercase font-mono text-neutral-400 font-semibold block mb-1">Inquiry details:</span>
                    "{c.message}"
                  </div>
                )}

                {/* Embedded Design Selection (if present) */}
                {c.savedSelection && (
                  <div className="bg-neutral-900 text-zinc-300 border border-neutral-850 rounded-xl p-4 mb-4 text-xs">
                    <span className="text-[9px] uppercase font-mono text-amber-500 font-semibold flex items-center gap-1 mb-2">
                      <Layers className="w-3.5 h-3.5" /> Embedded customizer selections
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      <div>Countertop: <span className="text-white capitalize">{c.savedSelection.stoneId.replace(/-/g, ' ')}</span></div>
                      <div>Cabinets: <span className="text-white capitalize">{c.savedSelection.cabinetId.replace(/-/g, ' ')}</span></div>
                      <div>Backsplash: <span className="text-white capitalize">{c.savedSelection.backsplash}</span></div>
                      <div>Edge: <span className="text-white capitalize">{c.savedSelection.edgeId}</span></div>
                    </div>
                  </div>
                )}

                {/* Attached Project Documents & Uploads */}
                {c.uploadedFiles && c.uploadedFiles.length > 0 && (
                  <div className="bg-stone-50 border border-neutral-200 rounded-xl p-4 mb-4 text-xs">
                    <span className="text-[9px] uppercase font-mono text-neutral-500 font-bold block mb-2.5">
                      Attached Project Documents ({c.uploadedFiles.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {c.uploadedFiles.map((file, idx) => {
                        const isImage = file.type?.startsWith('image/') || file.category === 'inspiration';
                        return (
                          <div key={idx} className="flex flex-col gap-2 bg-white border border-neutral-200 rounded-lg p-2.5 shadow-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
                                {file.category === 'inspiration' && <span className="text-sky-500 text-xs font-mono">📷</span>}
                                {file.category === 'floorplan' && <span className="text-emerald-500 text-xs font-mono">📐</span>}
                                {file.category === 'measurement' && <span className="text-amber-500 text-xs font-mono">📏</span>}
                                {file.category === 'other' && <span className="text-neutral-500 text-xs font-mono">📄</span>}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-semibold text-neutral-800 truncate text-[11px]" title={file.name}>{file.name}</p>
                                <p className="text-[8px] text-neutral-400 font-mono uppercase">{file.category}</p>
                              </div>
                            </div>
                            
                            {/* Render thumbnail if image is present */}
                            {isImage && file.dataUrl && (
                              <div className="w-full h-20 rounded overflow-hidden bg-zinc-50 border border-neutral-150 relative group">
                                <img 
                                  src={file.dataUrl} 
                                  alt={file.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <a 
                                  href={file.dataUrl} 
                                  download={file.name}
                                  className="absolute inset-0 bg-neutral-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold"
                                >
                                  Download Image
                                </a>
                              </div>
                            )}

                            {/* Download button for files */}
                            {(!isImage || !file.dataUrl) && file.dataUrl && (
                              <a 
                                href={file.dataUrl} 
                                download={file.name}
                                className="text-[9px] text-amber-600 hover:text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5"
                              >
                                📥 Download File
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Action controls */}
              <div className="border-t border-neutral-100 pt-4 mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => updateStatus(c.id, 'Confirmed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      c.status === 'Confirmed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Approve / Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(c.id, 'Completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      c.status === 'Completed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Complete Job
                  </button>
                </div>

                <button
                  onClick={() => deleteConsultation(c.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                    deleteConfirmId === c.id
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-sm'
                      : 'text-neutral-400 hover:text-red-600 hover:bg-red-50/50'
                  }`}
                  title={deleteConfirmId === c.id ? 'Click again to confirm delete' : 'Remove Lead'}
                  id={`delete-btn-${c.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteConfirmId === c.id && <span className="font-sans">Click to Confirm Delete</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h4 className="font-display font-medium text-neutral-900 text-lg">Lead ledger is empty</h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">No consultation requests have been received. Try planning a kitchen budget and submitting a consult schedule form!</p>
        </div>
      )}
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
