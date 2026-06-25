import { useState, useEffect } from 'react';
import { ConsultationRequest } from '../types';
import { 
  Calendar, Clock, Phone, Mail, MapPin, AlertCircle, Trash2, ShieldCheck, 
  Layers, RefreshCw, Database, LogOut, Users, CheckCircle2, XCircle
} from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPortal() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active sub-tab for Admin
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'contractors'>('leads');

  // Consultation Leads data state
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Contractors Directory state (Admin view only)
  const [contractors, setContractors] = useState<any[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);

  // Notifications and delete-confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === msg ? null : prev));
    }, 4500);
  };

  // Auth synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Consultation fetching directly from Firestore with Express API fallback
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    // Subscribe to consultations collection in real-time
    const unsubscribe = onSnapshot(
      collection(db, 'consultations'),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as ConsultationRequest[];
        
        // Sort by createdAt descending
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setConsultations(list);
        setLoading(false);
      },
      async (err) => {
        console.warn("Direct Firestore sub failed (e.g. security rules). Trying API fallback:", err);
        // Fallback to Express API if Firestore fails
        try {
          const res = await fetch('/api/consultations');
          if (res.ok) {
            const data = await res.json();
            setConsultations(data);
          } else {
            setError("Could not retrieve leads from either Firestore or API.");
          }
        } catch (apiErr) {
          setError("Database connection error. Please verify authorization.");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [refreshTrigger, user]);

  // Real-time Contractor Directory (Only for xabdieldiaz2010@gmail.com)
  useEffect(() => {
    if (!user || user.email !== 'xabdieldiaz2010@gmail.com') return;

    setLoadingContractors(true);
    const unsubscribe = onSnapshot(
      collection(db, 'contractors'),
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by requestedAt descending
        list.sort((a: any, b: any) => {
          return new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime();
        });
        setContractors(list);
        setLoadingContractors(false);
      },
      (err) => {
        console.error("Error subscribing to contractors:", err);
        setLoadingContractors(false);
        showNotification("Security rules denied reading contractor lists.", "error");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update lead status (Try Firestore direct, fallback to API)
  const updateStatus = async (id: string, newStatus: 'Pending' | 'Confirmed' | 'Completed') => {
    try {
      try {
        const docRef = doc(db, 'consultations', id);
        await updateDoc(docRef, { status: newStatus });
        showNotification(`Lead status updated to ${newStatus}.`, "success");
        return;
      } catch (firestoreErr) {
        console.warn("Direct Firestore update failed. Trying Express backend API:", firestoreErr);
      }

      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Lead status updated to ${newStatus}.`, "success");
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification("Failed to update status.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Network error updating status.", "error");
    }
  };

  // Delete lead (Try Firestore direct, fallback to API)
  const deleteConsultation = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId(prev => prev === id ? null : prev);
      }, 4000);
      return;
    }

    try {
      try {
        const docRef = doc(db, 'consultations', id);
        await deleteDoc(docRef);
        showNotification("Lead record deleted successfully.", "success");
        setDeleteConfirmId(null);
        return;
      } catch (firestoreErr) {
        console.warn("Direct Firestore delete failed. Trying Express backend API:", firestoreErr);
      }

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

  // Toggle Contractor Access (Only available to xabdieldiaz2010@gmail.com)
  const toggleContractorApproval = async (contractorId: string, currentApproved: boolean) => {
    if (!user || user.email !== 'xabdieldiaz2010@gmail.com') {
      showNotification("Unauthorized action. Admin clearance required.", "error");
      return;
    }

    try {
      const contractorRef = doc(db, 'contractors', contractorId);
      await updateDoc(contractorRef, {
        approved: !currentApproved,
        approvedAt: new Date().toISOString(),
        approvedBy: user.email
      });
      showNotification(
        `Permissions for contractor updated successfully to ${!currentApproved ? 'Approved' : 'Pending'}.`,
        "success"
      );
    } catch (err: any) {
      console.error("Error setting contractor status:", err);
      showNotification(`Failed to modify permissions: ${err.message}`, "error");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('Successfully logged out.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Error logging out.', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3 min-h-[400px]">
        <LoaderIcon />
        <p className="text-xs text-neutral-500 font-medium">Securing connection to accounts ledger...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4 max-w-md mx-auto my-8">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h4 className="font-display font-medium text-neutral-900 text-lg">Administrative Lockout</h4>
        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
          Please log in through the Contractor workspace to secure a workspace session.
        </p>
      </div>
    );
  }

  const isAdminUser = user.email === 'xabdieldiaz2010@gmail.com';

  return (
    <div className="flex flex-col gap-6" id="admin-portal-container">
      {/* Top Welcome Stats Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500 font-semibold block mb-1">
            {isAdminUser ? 'Central Florida Admin Panel' : 'IKB Contractor Terminal'}
          </span>
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" /> 
            {isAdminUser ? 'Lead Ledger & Contractor Registry' : 'Leads & Remodeling Workspace'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            {isAdminUser 
              ? 'Vetting panel to evaluate incoming kitchen and bath inquiries, review custom project specifications, and manage contractor credentials.'
              : 'This workspace acts as your designer-client ledger. Review custom templates, track homeowner material choices, and coordinate field visits.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col text-left md:text-right mr-2">
            <span className="text-[9px] text-neutral-500 font-mono">
              {isAdminUser ? 'ADMIN ACCOUNT' : 'AUTHORIZED SESSION'}
            </span>
            <span className="text-xs text-amber-500 font-semibold max-w-[150px] truncate" title={user.email || ""}>
              {user.email}
            </span>
          </div>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
            title="Refresh Leads Ledger"
          >
            <RefreshCw className="w-4 h-4 text-neutral-300" />
          </button>
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
            <span className="text-xs text-neutral-400 block font-mono">Total Leads</span>
            <span className="text-lg font-bold text-white font-mono leading-none">{consultations.length}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:text-red-400 text-neutral-300 border border-neutral-700 transition-colors flex items-center justify-center cursor-pointer gap-2"
            title="Sign Out Session"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold sm:inline hidden">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs Toggle (Only visible to verified admin email) */}
      {isAdminUser && (
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveSubTab('leads')}
            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'leads'
                ? 'border-neutral-900 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>Client Project Leads ({consultations.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('contractors')}
            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'contractors'
                ? 'border-neutral-900 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Contractor Access Ledger ({contractors.length})</span>
          </button>
        </div>
      )}

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

      {/* SECTION 1: CLIENT LEADS VIEW */}
      {activeSubTab === 'leads' && (
        <>
          {loading ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <LoaderIcon />
              <p className="text-xs text-neutral-500 font-medium">Synchronizing design databases...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center text-red-800">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h4 className="font-semibold text-sm">Failed to connect to lead database</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
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

                    {c.message && (
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 text-xs text-neutral-600 leading-normal mb-4">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 font-semibold block mb-1">Inquiry details:</span>
                        "{c.message}"
                      </div>
                    )}

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
                        Confirm Booking
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
                      {deleteConfirmId === c.id && <span className="font-sans">Confirm Delete</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h4 className="font-display font-medium text-neutral-900 text-lg">Lead ledger is empty</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No consultation requests have been received. Try planning a kitchen budget and submitting a consult schedule form!
              </p>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: CONTRACTOR ACCESS MANAGEMENT VIEW (ADMIN ONLY) */}
      {activeSubTab === 'contractors' && isAdminUser && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
            <div>
              <h4 className="font-display font-semibold text-neutral-900 text-sm">Contractor Registrations Ledger</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Toggle Approved permissions to grant/revoke leads database access.</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-amber-600 font-bold bg-amber-500/10 px-2.5 py-1 rounded">
              ADMIN CONTROL
            </span>
          </div>

          {loadingContractors ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <LoaderIcon />
              <p className="text-xs text-neutral-500 font-medium">Synchronizing contractor accounts...</p>
            </div>
          ) : contractors.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {contractors.map((contractor) => {
                const isSelf = contractor.email === 'xabdieldiaz2010@gmail.com';
                return (
                  <div key={contractor.id} className="p-5 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        contractor.approved 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-neutral-950 text-xs sm:text-sm font-mono">{contractor.email}</span>
                          {isSelf && (
                            <span className="text-[8px] bg-neutral-900 text-white font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">
                              PRIMARY ADMIN
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-400">
                          <span>Requested: <strong className="text-neutral-500">{contractor.requestedAt ? new Date(contractor.requestedAt).toLocaleDateString() : 'N/A'}</strong></span>
                          {contractor.approvedAt && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-neutral-200" />
                              <span>Approved At: <strong className="text-neutral-500">{new Date(contractor.approvedAt).toLocaleDateString()}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono ${
                        contractor.approved 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-amber-500/10 text-amber-700 border border-amber-200/50'
                      }`}>
                        {contractor.approved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved Access</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" />
                            <span>Pending Vetting</span>
                          </>
                        )}
                      </span>

                      {!isSelf && (
                        <button
                          onClick={() => toggleContractorApproval(contractor.id, contractor.approved)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            contractor.approved
                              ? 'bg-red-50 hover:bg-red-100/80 text-red-700 border-red-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm'
                          }`}
                        >
                          {contractor.approved ? 'Revoke Access' : 'Approve Contractor'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-400">
              <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-xs">No contractor access requests registered in database.</p>
            </div>
          )}
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
