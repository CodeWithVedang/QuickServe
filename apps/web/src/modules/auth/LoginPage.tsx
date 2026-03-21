import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Utensils } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await checkAuth(); // Will set user and role
    const { data: userRecord, error: fetchError } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    
    if (fetchError) {
      setError(`Schema Error: ${fetchError.message} | ${fetchError.details} | Try running: NOTIFY pgrst, 'reload schema'; in your SQL editor.`);
      setLoading(false);
      return;
    }

    if (userRecord) {
      if (userRecord.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/${userRecord.role}`);
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 flex items-center justify-center rounded-full shadow-inner">
            <Utensils className="h-8 w-8 text-[#FF9933]" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">Access QuickServe</h2>
          <p className="mt-2 text-sm text-gray-600">Restaurant Order Management System</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={loading} size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              disabled={loading} 
              size="lg"
              onClick={async () => {
                setLoading(true);
                setError('');
                // Defaulting new registrations to Admin for test purposes
                const { error: signUpError } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      name: email.split('@')[0],
                      role: 'admin' // Force role to admin for easy testing via registration
                    }
                  }
                });
                if (signUpError) {
                  setError(signUpError.message);
                } else {
                  alert("Registered successfully! Click Sign in immediately.");
                }
                setLoading(false);
              }}
            >
              Register (Admin)
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-xs text-gray-400">
          Enter an email/password and click Register first!
        </div>
      </div>
    </div>
  );
}
