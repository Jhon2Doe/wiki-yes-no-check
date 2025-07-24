import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-brutal-xl transform-brutal-2">
        <CardHeader className="text-center border-b-brutal border-border">
          <CardTitle className="text-3xl font-bold transform-brutal">WELCOME BACK</CardTitle>
          <CardDescription className="text-lg font-bold">
            SIGN IN TO ACCESS THE PLATFORM
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-bold">EMAIL ADDRESS</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transform-brutal"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-bold">PASSWORD</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transform-brutal-2"
              />
            </div>
            <Button type="submit" className="w-full text-lg" disabled={isLoading} size="lg">
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
            <div className="text-center pt-4 border-t-brutal border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/register')}
                className="text-base font-bold"
              >
                DON'T HAVE AN ACCOUNT? SIGN UP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}