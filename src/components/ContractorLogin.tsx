import { useState, FormEvent } from 'react';
import { Mail, Lock, ShieldCheck, UserPlus, AlertCircle, LogOut, CheckCircle2, Phone } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface ContractorLoginProps {
  currentUser: User | null;
  isApproved: boolean | null;
  onNavigateToShowroom: () => void;
  onNavigateToAdmin: () => void;
}

export default function ContractorLogin({ 
  currentUser, 
  isApproved, 
  onNavigateToShowroom,
  onNavigateToAdmin
}: ContractorLoginProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification('Successfully logged into Contractor Portal.', 'success');
        onNavigateToAdmin();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Automatically request contractor ledger permission in Firestore
        // Set approved = false by default to prevent privilege escalation.
        // xabdieldiaz2010@gmail.com or other verified admins must manual approve.
        await setDoc(doc(db, 'contractors', user.uid), {
          email: user.email || email,
          approved: user.email === 'xabdieldiaz2010@gmail.com', // Auto-approve the primary admin
          requestedAt: new Date().toISOString(),
          role: 'contractor'
        });

        showNotification('Access request submitted successfully.', 'success');
        onNavigateToAdmin();
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Authentication failed.';
      if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'firebase-auth-setup-required';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid contractor email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This contractor email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Security guidelines mandate passwords be at least 6 characters.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setAuthError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('Sign out completed.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Error signing out.', 'error');
    }
  };

  // 1. Authenticated but Pending Vetting Screen
  if (currentUser && !isApproved && currentUser.email !== 'xabdieldiaz2010@gmail.com') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in" id="pending-vetting-portal">
        <div className="bg-amber-500/10 border-b border-amber-200/50 px-6 py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-amber-700 animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-800 font-bold block mb-1">Status: Pending Verification</span>
          <h2 className="font-display text-xl font-medium text-neutral-900">Contractor Access Under Vetting</h2>
          <p className="text-xs text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Your registration request has been successfully saved to our master contractors database.
          </p>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-5 text-center">
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 flex flex-col gap-3 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-neutral-800">Database Entry Stored</h4>
                <p className="text-[11px] text-neutral-500">Profile saved under: <strong className="text-neutral-700">{currentUser.email}</strong></p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-t border-neutral-100 pt-3">
              <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-neutral-800">Permission Ledger Lock</h4>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Central Florida customer schedules and personal leads data are protected under zero-trust. Only verified administrators can approve credentials to grant view access.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-900 flex flex-col items-center gap-1.5 font-medium">
            <p>To expedite vetting, please contact our administrator:</p>
            <a 
              href="mailto:xabdieldiaz2010@gmail.com" 
              className="text-neutral-950 font-bold hover:underline font-mono text-[11px]"
            >
              xabdieldiaz2010@gmail.com
            </a>
          </div>

          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={onNavigateToShowroom}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to Showroom
            </button>
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated and Already Approved Screen
  if (currentUser && (isApproved || currentUser.email === 'xabdieldiaz2010@gmail.com')) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden text-center p-8 animate-fade-in" id="approved-portal">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-600 font-bold block mb-1">Authorized Session</span>
        <h2 className="font-display text-lg font-medium text-neutral-900">Contractor Connection Secured</h2>
        <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Logged in as <strong className="text-neutral-700">{currentUser.email}</strong>. Your contractor account has authorized active clearance.
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={onNavigateToAdmin}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Leads Ledger</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-neutral-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Main Login / Access Request Forms Screen
  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in" id="auth-portal">
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl text-xs flex items-center gap-2 border animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-neutral-950 text-white border-neutral-800' 
            : 'bg-red-50 text-red-950 border-red-200'
        }`}>
          {notification.type === 'success' ? <ShieldCheck className="w-4 h-4 text-amber-400" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="bg-neutral-900 px-6 py-8 text-center border-b border-neutral-800">
        <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500 font-bold block mb-1">Contractor Workspace</span>
        <h2 className="font-display text-lg font-medium text-white">
          {authMode === 'login' ? 'Contractor Sign In' : 'Contractor Access Registry'}
        </h2>
        <p className="text-[11px] text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
          {authMode === 'login' 
            ? 'Sign in with your approved credentials to coordinate Central Florida project leads.' 
            : 'Apply for project portal credentials. All requests undergo manual vetting. Standard public sign-ups are disabled.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="p-6 md:p-8 flex flex-col gap-4">
        {authError === 'firebase-auth-setup-required' ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-xl text-xs flex flex-col gap-2 shadow-sm text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-900">Firebase Auth Provider Disabled</strong>
                <span className="text-[11px] leading-normal text-neutral-700">
                  Email/Password sign-in is not yet enabled in your Firebase project. To enable it, please follow these steps:
                </span>
              </div>
            </div>
            
            <ol className="list-decimal pl-5 mt-1 text-[11px] text-neutral-800 flex flex-col gap-1 font-medium bg-white/60 p-2.5 rounded-lg border border-amber-100">
              <li>Open your <strong className="text-neutral-950">Firebase Console</strong>.</li>
              <li>Go to <strong className="text-neutral-950">Build &gt; Authentication</strong> in the left sidebar.</li>
              <li>Click the <strong className="text-neutral-950">Sign-in method</strong> tab.</li>
              <li>Under <strong className="text-neutral-950">Native providers</strong>, select <strong className="text-amber-900">Email/Password</strong>.</li>
              <li>Toggle <strong className="text-neutral-950">Enable</strong> (do not enable passwordless link) and click <strong className="text-neutral-950">Save</strong>.</li>
            </ol>
            
            <span className="text-[10px] text-amber-800 font-medium italic mt-1 text-center">
              * Once saved, refresh this browser tab and try registering or logging in again.
            </span>
          </div>
        ) : authError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Contractor Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="designer@innovationkb.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-neutral-900"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-neutral-900"
            />
          </div>
        </div>

        {authMode === 'signup' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-neutral-900"
              />
          </div>
            <p className="text-[10px] text-neutral-400 leading-normal mt-1 italic">
              * Note: Submission registers your contractor profile as "Pending Approval". Only verified emails like <strong>xabdieldiaz2010@gmail.com</strong> can change permissions to view leads.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
          ) : authMode === 'login' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verify & Unlock</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Apply For Credentials</span>
            </>
          )}
        </button>

        <div className="text-center mt-3 border-t border-neutral-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-4 cursor-pointer font-medium"
          >
            {authMode === 'login' 
              ? "Registering a new contractor profile?" 
              : "Already registered? Return to Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
