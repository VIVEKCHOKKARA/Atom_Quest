import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/Store';
import { 
  Target, Lock, User, AlertCircle, Mail, CheckCircle2, 
  ArrowLeft, Sparkles, Clock, Inbox, Copy, Check, 
  Eye, EyeOff, ExternalLink, ShieldAlert, Award, ChevronRight,
  Send, ShieldCheck
} from 'lucide-react';

export default function Login() {
  const { users, setCurrentUser, registerUser, verifyUser } = useStore();
  
  // View mode: 'signin' | 'signup' | 'verify' | 'success'
  const [mode, setMode] = useState('signin');
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Sign Up states
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('Employee'); // 'Employee' | 'Manager'
  const [signupManagerId, setSignupManagerId] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Verification states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [timer, setTimer] = useState(60);
  const [verifyError, setVerifyError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  
  // Mobile UI toggle for email simulated client
  const [showMobileInbox, setShowMobileInbox] = useState(false);

  const inputRefs = [
    useRef(null), useRef(null), useRef(null), 
    useRef(null), useRef(null), useRef(null)
  ];

  // Fetch managers dynamically
  const managers = users.filter(u => u.role === 'Manager');

  // Sync first manager as default selected on load / toggle
  useEffect(() => {
    if (managers.length > 0 && !signupManagerId) {
      setSignupManagerId(managers[0].id);
    }
  }, [users, signupRole]);

  // Timer countdown for resending verification code
  useEffect(() => {
    let interval = null;
    if (mode === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  // Handle standard credentials-based login
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      if (user.isVerified === false) {
        // Handle unverified logins: resume verification seamlessly!
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPendingUser(user);
        setTimer(60);
        setVerifyError('Your email has not been verified yet. A new verification code has been simulated.');
        setMode('verify');
        triggerNotificationPulse();
      } else {
        setCurrentUser(user);
      }
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  // Populate testing credentials
  const autofill = (role) => {
    if (role === 'admin') { setUsername('admin'); setPassword('password123'); }
    if (role === 'manager') { setUsername('manager'); setPassword('password123'); }
    if (role === 'employee') { setUsername('employee1'); setPassword('password123'); }
  };

  // Trigger floating email toast notification on creation/resend
  const triggerNotificationPulse = () => {
    setShowEmailAlert(true);
    setTimeout(() => {
      setShowEmailAlert(false);
    }, 4500);
  };

  // Handle sign up submission
  const handleSignUp = (e) => {
    e.preventDefault();
    setSignupError('');

    // Field validation
    if (!signupName.trim() || !signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setSignupError('Invalid email');
      return;
    }

    // Check if username already exists
    const exists = users.find(u => u.username.toLowerCase() === signupUsername.toLowerCase());
    if (exists) {
      setSignupError('Username is already taken.');
      return;
    }

    // Generate simulated 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(60);

    const newUser = {
      id: 'u_' + Date.now(),
      username: signupUsername,
      password: signupPassword,
      name: signupName,
      email: signupEmail,
      role: signupRole,
      manager_id: signupRole === 'Employee' ? signupManagerId : null,
      isVerified: false
    };

    // Save user as unverified in the store immediately so it persists
    registerUser(newUser);
    setPendingUser(newUser);
    
    // Switch to verification UI
    setOtp(['', '', '', '', '', '']);
    setMode('verify');
    triggerNotificationPulse();
  };

  // OTP inputs key controls and change handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }

    // If fully entered, check verification automatically
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1].current.focus();
    }
  };

  // Clipboard paste support for OTP fields
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs[5].current.focus();
      handleVerifyCode(pastedData);
    }
  };

  // Verify the submitted OTP code
  const handleVerifyCode = (codeToVerify) => {
    const code = typeof codeToVerify === 'string' ? codeToVerify : otp.join('');
    if (code.length !== 6) {
      setVerifyError('Please enter the complete 6-digit code.');
      return;
    }

    if (code === generatedOtp) {
      executeVerification();
    } else {
      setVerifyError('Incorrect verification code. Please check your simulated inbox.');
    }
  };

  // Confirm verification, log audit, trigger success and auto login
  const executeVerification = () => {
    if (!pendingUser) return;
    
    verifyUser(pendingUser.id);
    setVerifyError('');
    setMode('success');

    // Smooth logged in state transition
    setTimeout(() => {
      // Find full verified user object from store
      setCurrentUser({ ...pendingUser, isVerified: true });
    }, 2500);
  };

  // Copy simulated OTP helper
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOtp);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Re-generate and resend OTP
  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setVerifyError('');
    if (inputRefs[0].current) inputRefs[0].current.focus();
    triggerNotificationPulse();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[128px] absolute -top-40 -left-40 pointer-events-none animate-pulse duration-10000" />
      <div className="w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[128px] absolute -bottom-40 -right-40 pointer-events-none animate-pulse duration-10000" />

      {/* Real-time floating Notification Toast representing email receipt */}
      {showEmailAlert && pendingUser && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900/90 border border-teal-500/30 text-white rounded-2xl shadow-2xl backdrop-blur-md p-4 flex gap-3 items-start animate-bounce select-none">
          <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-100 flex justify-between items-center">
              Simulated Mail Server
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              New email sent to <strong className="text-teal-400">{pendingUser.email}</strong> with verification credentials.
            </p>
            <button 
              onClick={() => { setShowMobileInbox(true); setShowEmailAlert(false); }}
              className="mt-2 text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition-colors"
            >
              Open Inbox Simulator <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Grid */}
      <div className={`w-full transition-all duration-500 grid gap-6 ${mode === 'verify' ? 'max-w-5xl md:grid-cols-2' : 'max-w-md'}`}>
        
        {/* Verification Card / Auth Portal Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col h-full min-h-[500px] transition-all duration-300">
          
          {/* Header */}
          <div className="bg-slate-950/80 p-8 text-center text-white border-b border-slate-800/80 relative">
            <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-teal-500/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-teal-200 to-white bg-clip-text text-transparent">AtomQuest</h1>
            <p className="text-slate-400 mt-1 text-xs uppercase tracking-wider font-semibold">Goal Setting & Tracking Compliance</p>
            
            {/* Subtle verification step breadcrumb */}
            {mode === 'verify' && (
              <span className="absolute top-4 right-4 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Step 2: Verify
              </span>
            )}
          </div>

          {/* Form Content / View State Controller */}
          <div className="p-8 flex-1 flex flex-col justify-center">

            {/* STATE 1: SIGN IN */}
            {mode === 'signin' && (
              <div className="space-y-6">
                <div className="text-center md:text-left mb-2">
                  <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                  <p className="text-xs text-slate-400">Sign in to your goals dashboard portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      {loginError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="Enter password"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5 text-sm">
                    Sign In
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setMode('signup')}
                      className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline decoration-teal-500/30"
                    >
                      Sign Up Now
                    </button>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <p className="text-[10px] text-center text-slate-500 mb-2.5 font-bold uppercase tracking-wider">Quick Testing Credentials</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => autofill('admin')} className="py-2 px-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold rounded-lg transition-all">Admin</button>
                    <button onClick={() => autofill('manager')} className="py-2 px-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold rounded-lg transition-all">Manager</button>
                    <button onClick={() => autofill('employee')} className="py-2 px-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold rounded-lg transition-all">Employee</button>
                  </div>
                </div>
              </div>
            )}


            {/* STATE 2: SIGN UP */}
            {mode === 'signup' && (
              <div className="space-y-5">
                <div className="text-center md:text-left mb-1">
                  <h2 className="text-xl font-bold text-white">Create Account</h2>
                  <p className="text-xs text-slate-400">Register corporate goal tracking profile</p>
                </div>

                {signupError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="Charlie Employee"
                        required
                      />
                    </div>
                  </div>

                  {/* Username field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value.replace(/\s+/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="charlie3"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field for simulated verification */}
                   <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          if (signupError === 'Invalid email') {
                            setSignupError('');
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border ${signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail) ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-teal-500'} rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 ${signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail) ? 'focus:ring-rose-500' : 'focus:ring-teal-500'} transition-all`}
                        placeholder="charlie@atomquest.com"
                        required
                      />
                    </div>
                    {signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail) && (
                      <p className="text-[10px] text-rose-400 mt-1.5 font-bold flex items-center gap-1 pl-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Invalid email
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showSignupPassword ? 'text' : 'password'} 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="Create password"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role and Manager Assignment details */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role</label>
                      <select 
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>

                    {signupRole === 'Employee' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Manager</label>
                        <select 
                          value={signupManagerId}
                          onChange={(e) => setSignupManagerId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                          {managers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {signupRole === 'Manager' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Reports To</label>
                        <div className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-500 font-semibold flex items-center justify-between">
                          Alice Admin
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-1 text-sm mt-2">
                    Create Account & Send Mail
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setMode('signin')}
                      className="text-teal-400 hover:text-teal-300 font-bold transition-colors underline decoration-teal-500/30"
                    >
                      Sign In Here
                    </button>
                  </p>
                </div>
              </div>
            )}


            {/* STATE 3: OTP EMAIL VERIFICATION */}
            {mode === 'verify' && pendingUser && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <button 
                    onClick={() => setMode('signup')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-3 font-semibold group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> Back to Signup
                  </button>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Verify Your Account
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    We've simulated sending a security code to:
                  </p>
                  <p className="text-xs font-bold text-teal-400 mt-0.5 bg-teal-500/5 border border-teal-500/15 rounded-lg px-2.5 py-1.5 inline-block select-all">
                    {pendingUser.email}
                  </p>
                </div>

                {verifyError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 rounded-xl">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 animate-shake" />
                    {verifyError}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 text-center md:text-left">Enter 6-Digit Code</label>
                    
                    {/* 6 Digit Individual Inputs */}
                    <div className="flex justify-between gap-2 max-w-sm mx-auto md:mx-0">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={inputRefs[idx]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 bg-slate-950/80 border border-slate-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all select-all shadow-inner"
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleVerifyCode()}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm"
                  >
                    Confirm Verification
                  </button>

                  <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-850 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {timer > 0 ? (
                        <span>Resend code in <strong className="text-slate-300 font-semibold">{timer}s</strong></span>
                      ) : (
                        <button 
                          onClick={handleResendCode}
                          className="text-teal-400 hover:text-teal-300 font-bold underline transition-colors"
                        >
                          Resend Verification Code
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setShowMobileInbox(!showMobileInbox)}
                      className="md:hidden text-teal-400 hover:text-teal-300 font-bold transition-all flex items-center gap-1"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      {showMobileInbox ? "Hide Inbox Sim" : "Show Inbox Sim (1)"}
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* STATE 4: SUCCESS */}
            {mode === 'success' && pendingUser && (
              <div className="text-center py-6 space-y-6 flex flex-col items-center justify-center">
                {/* Stunning animated circular checkmark */}
                <div className="relative">
                  <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center animate-ping absolute scale-95 opacity-50" />
                  <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center relative scale-110 shadow-2xl shadow-emerald-500/10 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <Sparkles className="w-6 h-6 text-teal-400 absolute -top-1 -right-1 animate-spin duration-3000" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white">Email Verified!</h2>
                  <p className="text-sm text-slate-400">Welcome to AtomQuest, <strong className="text-teal-300 font-bold">{pendingUser.name}</strong>!</p>
                </div>

                <div className="max-w-xs mx-auto space-y-3 w-full bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-left">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Relational DB Insertion:</span>
                    <span className="text-emerald-400 font-bold">SUCCESS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Audit Trail Logged:</span>
                    <span className="text-emerald-400 font-bold">SUCCESS</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Goal Sheet Status:</span>
                    <span className="text-emerald-400 font-bold">DRAFT CREATED</span>
                  </div>
                  
                  {/* Glowing custom horizontal loader progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full animate-loader width-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic animate-pulse">Initializing compliance dashboard workspace...</p>
              </div>
            )}

          </div>
        </div>

        {/* MOCK EMAIL CLIENT PANEL - Side-by-side or mobile overlay */}
        {mode === 'verify' && pendingUser && (
          <div className={`transition-all duration-300 ${showMobileInbox ? 'fixed inset-0 z-40 bg-slate-950/95 flex p-4' : 'hidden md:flex'} flex-col bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden min-h-[500px] h-full`}>
            
            {/* Mail client toolbar */}
            <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-extrabold text-slate-200">Simulated Outlook Webmail Client</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mail Server Online</span>
              </div>
              {showMobileInbox && (
                <button 
                  onClick={() => setShowMobileInbox(false)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>

            {/* Simulated inbox layout */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/40">
              
              {/* Mail Header / Envelope Details */}
              <div className="bg-slate-950/20 px-6 py-4 border-b border-slate-850 space-y-2 select-none">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-1">
                  <div className="text-slate-400">
                    From: <strong className="text-slate-200 font-semibold">AtomQuest Security</strong> &lt;<span className="text-teal-400">security@atomquest.com</span>&gt;
                  </div>
                  <div className="text-slate-500 font-medium">Just now</div>
                </div>
                <div className="text-slate-400 text-xs">
                  To: <strong className="text-slate-200 font-semibold">{pendingUser.name}</strong> &lt;<span className="text-teal-400">{pendingUser.email}</span>&gt;
                </div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 pt-1">
                  🔑 Action Required: Verify your AtomQuest Account
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1 text-[9px] font-black uppercase">High Priority</span>
                </h4>
              </div>

              {/* Email Content Frame - Rich styled container */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-5 text-slate-300 text-sm max-w-lg mx-auto">
                  
                  {/* Corporate Branding banner in mail */}
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white">AtomQuest Portal</span>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Goal Compliance Verification</p>
                    </div>
                  </div>

                  <p>Hello <strong className="text-white font-semibold">{pendingUser.name}</strong>,</p>
                  
                  <p className="leading-relaxed text-slate-400 text-xs">
                    Welcome to the AtomQuest In-House Goal Setting & Tracking Portal. To finalize your corporate user registration and establish your secure 2026-H1 goal cycle tracking sheets, please verify your email address.
                  </p>

                  {/* Verification Box - Show OTP Code */}
                  <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-xl text-center space-y-3 relative group">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Your Simulated Verification Code</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-white tracking-widest select-all bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg shadow-inner font-mono">
                        {generatedOtp}
                      </span>
                      <button 
                        onClick={copyToClipboard}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center relative"
                        title="Copy to Clipboard"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">Code is valid for 10 minutes</p>
                  </div>

                  {/* Instant Click-to-Verify Magic CTA Button */}
                  <div className="pt-2 text-center">
                    <button 
                      onClick={executeVerification}
                      className="inline-flex items-center gap-1.5 px-6 py-3 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                      Verify Account Instantly
                    </button>
                    <p className="text-[9px] text-slate-500 mt-2">
                      Tip: Clicking this button mimics clicking the link in your email to automatically verify and sign you in!
                    </p>
                  </div>

                  <hr className="border-slate-800" />

                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p>If you did not request this registration, please contact your systems administrator.</p>
                    <p className="font-bold">&copy; 2026 AtomQuest, Inc. All rights reserved.</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
