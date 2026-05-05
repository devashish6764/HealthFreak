import React, { useState } from 'react';
// Assuming you are using an AuthContext, import it here:
// import { useAuth } from '../context/AuthContext'; 
import { Mail, Lock, ArrowRight, KeyRound, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import emailjs from '@emailjs/browser';

const LoginPage = () => {
  // const { login } = useAuth(); // Uncomment if using AuthContext

  // --- STANDARD LOGIN STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- FORGOT PASSWORD STATE ---
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- 1. THE STANDARD LOGIN FIX ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Replace this with your actual auth logic or Context call
    if (email === 'user@healthfreak.com' && password === 'password123') {
      alert("Login Successful! Redirecting to Dashboard...");
      // login({ email, id: '123' });
      // window.location.href = '/dashboard';
    } else {
      // This is likely where your old code was failing. Ensure the data types match exactly!
      setError('Invalid email or password. Please try again.');
    }
  };

  // --- 2. THE 24-HOUR DEMO ACCOUNT ---
  const handleDemoLogin = () => {
    // We create a token that expires exactly 24 hours from right now
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); 
    
    const demoUser = {
      id: 'demo-999',
      name: 'Demo User',
      email: 'demo@healthfreak.com',
      isDemo: true,
      expiresAt: expiryTime
    };

    localStorage.setItem('healthFreakUser', JSON.stringify(demoUser));
    alert("Demo Account activated! Valid for 24 hours.");
    // login(demoUser);
    // window.location.href = '/dashboard';
  };

  // --- 3. THE FORGOT PASSWORD FLOW ---
  // We need a new state to remember the code we actually sent!
  const [actualGeneratedCode, setActualGeneratedCode] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setError('Please enter your email.');
    setError('');
    
    // 1. Generate a random 6-digit code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActualGeneratedCode(generatedCode); // Save it to check later

    try {
      // 2. Send the actual email via EmailJS
      await emailjs.send(
        'service_lou9xya',   // Replace with your EmailJS Service ID
        'template_frw3eyb',  // Replace with your EmailJS Template ID
        {
          to_email: resetEmail,
          verification_code: generatedCode, // This matches the {{verification_code}} in your template
        },
        'HLeJQkXHIhKsqhB7u'    // Replace with your EmailJS Public Key
      );

      alert(`Success! A real verification code was sent to ${resetEmail}`);
      setResetStep(2);

    } catch (err) {
      console.error("Failed to send email:", err);
      setError('Failed to send the email. Please try again later.');
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    
    // 3. Compare what the user typed against the code we generated
    if (resetCode === actualGeneratedCode) {
      setError('');
      setResetStep(3); // Move to the "Create New Password" step
    } else {
      setError('Invalid code. Please check your email and try again.');
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    alert("Password successfully reset! You can now log in.");
    setIsResetting(false);
    setResetStep(1);
    setPassword(''); // Clear old password from input
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            HealthFreak
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isResetting ? "Reset your password" : "Your personal fitness companion"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {/* ============================== */}
        {/* VIEW A: FORGOT PASSWORD FLOW   */}
        {/* ============================== */}
        {isResetting ? (
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

            <button onClick={() => { setIsResetting(false); setResetStep(1); setError(''); }} className="w-full text-sm text-slate-400 hover:text-white mt-4 transition-colors">
              Back to Login
            </button>
          </div>
        ) : (
        
        /* ============================== */
        /* VIEW B: STANDARD LOGIN PAGE    */
        /* ============================== */
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
                <button type="button" onClick={() => { setIsResetting(true); setError(''); }} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20 transition-all gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

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