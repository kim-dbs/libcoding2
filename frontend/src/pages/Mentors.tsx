import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mentorAPI, matchRequestAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

const Mentors: React.FC = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestMessages, setRequestMessages] = useState<{[key: number]: string}>({});
  const [requestLoading, setRequestLoading] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    loadMentors();
  }, []);

  useEffect(() => {
    filterAndSortMentors();
  }, [mentors, searchSkill, sortBy]);

  const loadMentors = async () => {
    try {
      const data = await mentorAPI.getMentors();
      setMentors(data);
    } catch (error) {
      console.error('멘토 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMentors = () => {
    let filtered = [...mentors];

    // 스킬 필터링
    if (searchSkill.trim()) {
      filtered = filtered.filter(mentor =>
        mentor.profile.skills?.some(skill =>
          skill.toLowerCase().includes(searchSkill.toLowerCase())
        )
      );
    }

    // 정렬
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
    } else if (sortBy === 'skill') {
      filtered.sort((a, b) => {
        const aSkills = a.profile.skills?.join(', ') || '';
        const bSkills = b.profile.skills?.join(', ') || '';
        return aSkills.localeCompare(bSkills);
      });
    }

    setFilteredMentors(filtered);
  };

  const handleSendRequest = async (mentorId: number) => {
    const message = requestMessages[mentorId];
    if (!message?.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    setRequestLoading(prev => ({ ...prev, [mentorId]: true }));

    try {
      await matchRequestAPI.createRequest(mentorId, message);
      alert('매칭 요청을 보냈습니다!');
      setRequestMessages(prev => ({ ...prev, [mentorId]: '' }));
    } catch (error: any) {
      alert(error.response?.data?.detail || '요청 전송에 실패했습니다.');
    } finally {
      setRequestLoading(prev => ({ ...prev, [mentorId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">멘토 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            멘토 목록
          </h1>
          <p className="text-xl text-muted-foreground">당신의 성장을 도와줄 최고의 멘토들을 만나보세요</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              멘토 검색 및 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">기술 스택으로 검색</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="React, Node.js, Python..."
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">정렬 기준</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      id="name"
                      type="radio"
                      name="sort"
                      value="name"
                      checked={sortBy === 'name'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">이름순</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      id="skill"
                      type="radio"
                      name="sort"
                      value="skill"
                      checked={sortBy === 'skill'}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">스킬순</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">검색 조건에 맞는 멘토가 없습니다. 다른 키워드로 검색해보세요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-4 shadow-lg border-4 border-white">
                    <AvatarImage src={mentor.profile.imageUrl} alt={mentor.profile.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold">
                      {mentor.profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl font-bold">{mentor.profile.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">{mentor.profile.bio}</p>
                </CardHeader>
                
                <CardContent>
                  {mentor.profile.skills && mentor.profile.skills.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-3 block">기술 스택</Label>
                      <div className="flex flex-wrap gap-2">
                        {mentor.profile.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`message-${mentor.id}`} className="text-sm font-medium mb-2 block">
                        멘토링 요청 메시지
                      </Label>
                      <Textarea
                        id={`message-${mentor.id}`}
                        data-mentor-id={mentor.id}
                        data-testid={`message-${mentor.id}`}
                        placeholder="멘토링 요청 메시지를 작성해주세요..."
                        value={requestMessages[mentor.id] || ''}
                        onChange={(e) => setRequestMessages(prev => ({
                          ...prev,
                          [mentor.id]: e.target.value
                        }))}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                    
                    <Button
                      id="request"
                      onClick={() => handleSendRequest(mentor.id)}
                      disabled={requestLoading[mentor.id]}
                      className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg transition-all duration-300"
                    >
                      {requestLoading[mentor.id] ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          요청 중...
                        </>
                      ) : '매칭 요청'}
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = `/messages?user=${mentor.id}`}
                      variant="outline"
                      className="w-full h-11 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-medium transition-all duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      메시지 보내기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
