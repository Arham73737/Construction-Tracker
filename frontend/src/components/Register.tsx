import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';
import { useState } from 'react';
import { authAPI, UserRole } from '../services/api'; // ✅ Import the UserRole type from your api service

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    role: '' as UserRole | '', // ✅ Use the imported UserRole for the form state
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setMessage('');
    if (!formData.email || !formData.password || (!isLogin && (!formData.name || !formData.role))) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register({
          name: formData.name,
          role: formData.role as UserRole, // ✅ Use the correct UserRole type when calling the API
          email: formData.email,
          password: formData.password,
        });
      }

      setMessage(isLogin ? '✅ Login successful!' : '✅ Registration successful!');
      onAuthSuccess(response);
    } catch (err: any) {
      setMessage(`❌ ${err?.response?.data?.message || err.message || 'Authentication failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center text-blue-600 mb-2">
            <Building className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">{isLogin ? 'Login' : 'Register'}</CardTitle>
          <p className="text-sm text-gray-500">{isLogin ? 'Enter your credentials to login' : 'Enter your details to create an account'}</p>
        </CardHeader>

        <CardContent className="space-y-4 mt-2">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
                >
                  {/* ✅ Update the dropdown with the new, specific roles */}
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="builder">Builder</option>
                  <option value="painter">Painter</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="electrician">Electrician</option>
                </select>
              </div>
 select     </>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? (isLogin ? 'Logging in...' : 'Registering...') : isLogin ? 'Login' : 'Register'}
          </Button>

          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-sm text-gray-600 mt-2"
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </Button>

          {message && (
            <p className="text-sm text-center mt-2 font-medium text-gray-700">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;