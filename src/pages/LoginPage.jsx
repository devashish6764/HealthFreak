import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Sparkles } from 'lucide-react';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const {
    login,
    signup
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleSubmit = async e => {
    e.preventDefault();
    if (isSignup) {
      if (!email || !password || !username) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      const result = await signup(email, password, username);
      if (result.success) {
        toast({
          title: "Account created! 🎉",
          description: "Welcome to your health journey!"
        });
        window.location.href = '/dashboard';
      } else {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } else {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Welcome back! 👋",
          description: "Successfully logged in"
        });
        window.location.href = '/dashboard';
      } else {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  };
  return <>
      <Helmet>
        <title>{isSignup ? 'Sign Up' : 'Login'} - Health Freak</title>
        <meta name="description" content="Track your health, medications, and wellness journey" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 mb-4">
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Health Freak</h1>
            <p className="text-gray-400 mt-2">Your personal wellness companion</p>
          </div>

          <Card className="border-slate-700 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignup ? 'Start your health journey today' : 'Log in to continue your wellness journey'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold transition-all transform hover:scale-105">
                  {isSignup ? 'Sign Up' : 'Log In'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => setIsSignup(!isSignup)} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>;
};
export default LoginPage;