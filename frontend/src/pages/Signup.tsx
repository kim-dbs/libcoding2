import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee'>('mentee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.signup({ email, password, name, role });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            회원가입
          </CardTitle>
          <p className="text-muted-foreground">새로운 계정을 만들어 멘토링을 시작하세요</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">역할 선택</Label>
              <div className="flex gap-3">
                <div 
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    role === 'mentee' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRole('mentee')}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mentee"
                      name="role"
                      value="mentee"
                      checked={role === 'mentee'}
                      onChange={(e) => setRole(e.target.value as 'mentor' | 'mentee')}
                      className="text-green-500 focus:ring-green-500"
                    />
                    <Label htmlFor="mentee" className="font-medium cursor-pointer">멘티</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">멘토에게 배우고 싶어요</p>
                </div>
                
                <div 
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    role === 'mentor' 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRole('mentor')}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="mentor"
                      name="role"
                      value="mentor"
                      checked={role === 'mentor'}
                      onChange={(e) => setRole(e.target.value as 'mentor' | 'mentee')}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                    <Label htmlFor="mentor" className="font-medium cursor-pointer">멘토</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">경험을 나누고 싶어요</p>
                </div>
              </div>
            </div>
            
            <Button 
              id="signup" 
              type="submit" 
              disabled={loading} 
              className="w-full h-11 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  가입 중...
                </>
              ) : '회원가입'}
            </Button>
          </form>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link 
                to="/login" 
                className="text-green-600 hover:text-green-800 font-medium transition-colors underline underline-offset-4"
              >
                로그인
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
