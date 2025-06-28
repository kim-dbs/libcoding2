import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.profile.name || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [skills, setSkills] = useState(user?.profile.skills?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage('이미지 크기는 1MB 이하여야 합니다.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setMessage('JPG 또는 PNG 파일만 업로드 가능합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // Base64에서 데이터 URL 부분 제거
        const base64Data = base64.split(',')[1];
        handleSubmit(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Always fetch latest user data after update
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
      }
    } catch {}
  };

  const handleSubmit = async (imageData?: string) => {
    setLoading(true);
    setMessage('');
    try {
      const updateData = {
        name,
        bio,
        skills: user?.role === 'mentor' ? skills.split(',').map(s => s.trim()).filter(s => s) : undefined,
        image: imageData,
      };
      const updatedUser = await profileAPI.updateProfile(updateData);
      updateUser(updatedUser); // update context
      await refreshUser(); // ensure latest data
      setMessage('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || '프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            프로필 관리
          </h1>
          <p className="text-xl text-muted-foreground">개인정보와 전문 분야를 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 mx-auto shadow-2xl border-4 border-white bg-gradient-to-br from-orange-100 to-amber-100">
                    <AvatarImage src={user?.profile.imageUrl || '/default-profile.svg'} alt="프로필 이미지" />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-3xl font-bold">
                      {user?.profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    id="profile"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 mt-4">
                  {user?.profile.name || '사용자'}
                </CardTitle>
                <Badge 
                  className={`mt-2 px-4 py-1 text-sm font-semibold ${
                    user?.role === 'mentor' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  {user?.role === 'mentor' ? '멘토' : '멘티'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">이메일</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{user?.email}</p>
                  </div>
                  {user?.profile.bio && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">소개</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">{user.profile.bio}</p>
                    </div>
                  )}
                  {user?.role === 'mentor' && user?.profile.skills && user.profile.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">기술 스택</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.profile.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  프로필 편집
                </CardTitle>
                <p className="text-muted-foreground">정보를 수정하여 더 나은 매칭을 경험하세요</p>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className={`mb-6 ${message.includes('성공') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription className={message.includes('성공') ? 'text-green-700' : 'text-red-700'}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">이름 *</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                      placeholder="이름을 입력하세요" 
                      required 
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-base font-semibold text-gray-700">소개</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)} 
                      rows={4} 
                      placeholder="자신을 소개해주세요..."
                      className="text-base resize-none"
                    />
                    <p className="text-sm text-muted-foreground">다른 사용자들에게 보여질 소개글입니다.</p>
                  </div>
                  
                  {user?.role === 'mentor' && (
                    <div className="space-y-2">
                      <Label htmlFor="skillsets" className="text-base font-semibold text-gray-700">
                        기술 스택 <span className="text-sm text-orange-500">(쉼표로 구분)</span>
                      </Label>
                      <Input 
                        id="skillsets" 
                        value={skills} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)} 
                        placeholder="React, Node.js, TypeScript, Python..."
                        className="h-12 text-base"
                      />
                      <p className="text-sm text-muted-foreground">멘티들이 검색할 때 사용되는 기술 스택을 입력하세요.</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end pt-4">
                    <Button 
                      id="save" 
                      type="submit" 
                      disabled={loading} 
                      className="px-8 py-3 h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          프로필 저장
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
