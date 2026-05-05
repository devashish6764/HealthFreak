import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Double check this path matches your folder structure!
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, KeyRound, Clock, User, Ruler, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import emailjs from '@emailjs/browser';

const LoginPage = () => {
  // --- UI STATE ---
  const [activeView, setActiveView] = useState('login'); // 'login', 'create', or 'forgot'
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth(); // Grabs the login function from your Context
  
  // ... your existing useState hooks stay here

  // --- LOGIN STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- CREATE PROFILE STATES ---
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // --- FORGOT PASSWORD STATES ---
  const [resetStep, setResetStep] = useState(1); 
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [actualGeneratedCode, setActualGeneratedCode] = useState('');

  // ==========================================
  // 1. CREATE PROFILE LOGIC
  // ==========================================
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Use your Context's signup function!
    const response = await signup(newEmail, newPassword, newName);

    if (response.success) {
      // 2. Save the extra health stats (height/weight) separately
      localStorage.setItem('healthFreakMetrics', JSON.stringify({ height, weight }));
      
      alert("Profile created successfully! Redirecting to Dashboard...");
      navigate('/dashboard'); // It logs you in automatically!
    } else {
      setError(response.error || "Failed to create profile. Email might be taken.");
    }
  };

  // ==========================================
  // 2. STANDARD LOGIN LOGIC
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Use your Context's login function with exactly what it asks for: email & password
    const response = await login(email, password);
    
    if (response.success) {
      navigate('/dashboard');
    } else {
      // If it fails, it will display the exact error from your storage utils!
      setError(response.error || 'Invalid email or password. Please try again.');
    }
  };

  // ==========================================
  // 3. 24-HOUR DEMO LOGIC
  // ==========================================
   const handleDemoLogin = async () => {
    // Generate a unique dummy email so it never clashes
    const dummyEmail = `demo_${Date.now()}@healthfreak.com`;
    
    // Sign them up instantly and warp to dashboard
    await signup(dummyEmail, 'demo_password', 'Demo User');
    navigate('/dashboard');
  };

  // ==========================================
  // 4. FORGOT PASSWORD LOGIC (EMAILJS)
  // ==========================================
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setError('Please enter your email.');
    setError('');
    
     const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActualGeneratedCode(generatedCode); 

     try {
      await emailjs.send(
        'service_lou9xya',   // Replace with your Service ID
        'template_frw3eyb',  // Replace with your Template ID
        {
          to_email: resetEmail,
          verification_code: generatedCode, 
        },
        'HLeJQkXHIhKsqhB7u'    // Replace with your Public Key
      );

      alert(`Success! Verification code sent to ${resetEmail}`);
      setResetStep(2);
     } catch (err) {
      console.error("Failed to send email:", err);
      setError('Failed to send the email. Please try again later.');
    }
  };

  const handleVerifyCode = (e) => {
     e.preventDefault();
    if (resetCode === actualGeneratedCode) {
      setError('');
      setResetStep(3);
    } else {
      setError('Invalid code. Please check your email and try again.');
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    
    // Update the password in local storage
    const savedData = localStorage.getItem('healthFreakProfile');
    if (savedData) {
      const userProfile = JSON.parse(savedData);
      userProfile.password = newPassword;
      localStorage.setItem('healthFreakProfile', JSON.stringify(userProfile));
    }

    alert("Password successfully reset! You can now log in.");
    setActiveView('login');
    setResetStep(1);
    setPassword(''); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            HealthFreak
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {activeView === 'create' ? "Create your health profile" : 
             activeView === 'forgot' ? "Reset your password" : 
             "Your personal fitness companion"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: CREATE PROFILE                       */}
        {/* ========================================== */}
        {activeView === 'create' && (
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input type="text" placeholder="Full Name" className="pl-10 bg-slate-950 border-slate-700 text-white" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input type="email" placeholder="Email Address" className="pl-10 bg-slate-950 border-slate-700 text-white" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Ruler className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input type="number" placeholder="Height (cm)" className="pl-10 bg-slate-950 border-slate-700 text-white" value={height} onChange={(e) => setHeight(e.target.value)} required />
              </div>
              <div className="relative">
                <Scale className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input type="number" placeholder="Weight (kg)" className="pl-10 bg-slate-950 border-slate-700 text-white" value={weight} onChange={(e) => setWeight(e.target.value)} required />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input type="password" placeholder="Create Password" className="pl-10 bg-slate-950 border-slate-700 text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-6">
              Create Profile
            </Button>
            
            <button type="button" onClick={() => { setActiveView('login'); setError(''); }} className="w-full text-sm text-slate-400 hover:text-white mt-4 transition-colors">
              Already have a profile? Log in
            </button>
          </form>
        )}

        {/* ========================================== */}
        {/* VIEW: FORGOT PASSWORD                      */}
        {/* ========================================== */}
        {activeView === 'forgot' && (
          <div className="space-y-4">
             {resetStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <p className="text-sm text-slate-300">Enter your email to receive a 6-digit verification code.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input type="email" placeholder="Email Address" className="pl-10 bg-slate-950 border-slate-700 text-white" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">Send Code</Button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-sm text-slate-300">Enter the 6-digit code sent to your email.</p>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input type="text" placeholder="6-Digit Code" className="pl-10 bg-slate-950 border-slate-700 text-white" value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">Verify Code</Button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <p className="text-sm text-slate-300">Create a new secure password.</p>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input type="password" placeholder="New Password" className="pl-10 bg-slate-950 border-slate-700 text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">Save & Login</Button>
              </form>
            )}

            <button onClick={() => { setActiveView('login'); setResetStep(1); setError(''); }} className="w-full text-sm text-slate-400 hover:text-white mt-4 transition-colors">
              Back to Login
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: STANDARD LOGIN                       */}
        {/* ========================================== */}
        {activeView === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input type="email" placeholder="Email Address" className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input type="password" placeholder="Password" className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => { setActiveView('forgot'); setError(''); }} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20 transition-all gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="text-center mt-4">
              <button type="button" onClick={() => { setActiveView('create'); setError(''); }} className="text-sm text-slate-300 hover:text-white transition-colors">
                Don't have a profile? <span className="text-cyan-400 font-semibold">Create one</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
            </div>

            {/* DEMO ACCOUNT BUTTON */}
            <Button onClick={handleDemoLogin} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white py-6 gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Try 24-Hour Demo Account
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;