import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { LogIn, Sprout } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all  fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      // Briefly wait to let toast display before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary-600/10 blur-3xl" />
      
      <Card className="w-full max-w-md p-8 glass space-y-6" glassEffect>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl w-fit">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your RuralConnect account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            className="w-full gap-2 mt-2"
            isLoading={loading}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
            Register Here
          </Link>
        </p>
      </Card>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default LoginPage;
