import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Sprout, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const roleOptions = [
    { value: 'tourist', label: 'Tourist / Traveler' },
    { value: 'farmer', label: 'Farmer / Producer' },
    { value: 'homestay_owner', label: 'Homestay Owner' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role
      });
      addToast('Registration successful! Please log in.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to register account';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute bottom-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary-600/10 blur-3xl" />

      <Card className="w-full max-w-md p-8 glass space-y-6" glassEffect>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl w-fit">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Join the RuralConnect AI community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••• (Min 6 chars)"
            required
          />
          <Select
            label="Account Type"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <Button
            type="submit"
            className="w-full gap-2 mt-2"
            isLoading={loading}
          >
            <UserPlus className="w-4 h-4" /> Sign Up
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold absolute">Or</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2"
          onClick={async () => {
            try {
              await loginWithGoogle();
            } catch (err: any) {
              addToast(err.message || 'Google Sign Up failed. Check Supabase configuration.', 'error');
            }
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
            Login Here
          </Link>
        </p>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default RegisterPage;
