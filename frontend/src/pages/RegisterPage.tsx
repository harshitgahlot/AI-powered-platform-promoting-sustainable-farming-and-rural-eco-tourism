import React, { useState } from 'react';
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
  const { register } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist');
  const [loading, setLoading] = useState(false);

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
