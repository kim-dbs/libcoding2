import React, { useState, useEffect } from 'react';
import { MatchRequest } from '../types';
import { matchRequestAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      let data: MatchRequest[];
      if (user.role === 'mentor') {
        data = await matchRequestAPI.getIncomingRequests();
      } else {
        data = await matchRequestAPI.getOutgoingRequests();
      }
      setRequests(data);
    } catch (error) {
      console.error('요청 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await matchRequestAPI.acceptRequest(requestId);
      await loadRequests(); // 목록 새로고침
      alert('요청을 수락했습니다!');
    } catch (error: any) {
      alert(error.response?.data?.detail || '요청 수락에 실패했습니다.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await matchRequestAPI.rejectRequest(requestId);
      await loadRequests(); // 목록 새로고침
      alert('요청을 거절했습니다.');
    } catch (error: any) {
      alert(error.response?.data?.detail || '요청 거절에 실패했습니다.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCancel = async (requestId: number) => {
    if (!window.confirm('정말로 요청을 취소하시겠습니까?')) return;
    
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await matchRequestAPI.cancelRequest(requestId);
      await loadRequests(); // 목록 새로고침
      alert('요청을 취소했습니다.');
    } catch (error: any) {
      alert(error.response?.data?.detail || '요청 취소에 실패했습니다.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, color: 'bg-yellow-500', text: '대기중' },
      accepted: { variant: 'default' as const, color: 'bg-green-500', text: '수락됨' },
      rejected: { variant: 'destructive' as const, color: 'bg-red-500', text: '거절됨' },
      cancelled: { variant: 'secondary' as const, color: 'bg-gray-500', text: '취소됨' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;
    
    return (
      <Badge variant={config.variant} className={`${config.color} text-white hover:opacity-80`}>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">요청 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {user?.role === 'mentor' ? '받은 매칭 요청' : '보낸 매칭 요청'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {user?.role === 'mentor' 
              ? '멘티들로부터 받은 멘토링 요청을 관리하세요' 
              : '멘토에게 보낸 요청의 현황을 확인하세요'}
          </p>
        </div>

        {requests.length === 0 ? (
          <Card className="text-center py-16 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="text-6xl mb-6">
                {user?.role === 'mentor' ? '📬' : '📤'}
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                {user?.role === 'mentor' 
                  ? '아직 받은 매칭 요청이 없습니다' 
                  : '아직 보낸 매칭 요청이 없습니다'}
              </h3>
              <p className="text-muted-foreground text-lg">
                {user?.role === 'mentor'
                  ? '멘티들이 요청을 보내면 여기에 표시됩니다.'
                  : '멘토 목록에서 원하는 멘토에게 요청을 보내보세요.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
                      <span className="text-sm text-muted-foreground font-medium">
                        요청 #{request.id}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">멘토 ID:</span> {request.mentorId} • <span className="font-medium">멘티 ID:</span> {request.menteeId}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        요청 메시지
                      </h4>
                      <div 
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500" 
                        data-mentee={request.menteeId.toString()}
                      >
                        <p className="text-gray-700 leading-relaxed">{request.message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {user?.role === 'mentor' && request.status === 'pending' && (
                      <>
                        <Separator />
                        <div className="flex gap-3 pt-2">
                          <Button
                            id="accept"
                            onClick={() => handleAccept(request.id)}
                            disabled={actionLoading[request.id]}
                            className="flex-1 h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg transition-all duration-300"
                          >
                            {actionLoading[request.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                수락
                              </>
                            )}
                          </Button>
                          <Button
                            id="reject"
                            onClick={() => handleReject(request.id)}
                            disabled={actionLoading[request.id]}
                            variant="destructive"
                            className="flex-1 h-11 font-medium shadow-lg transition-all duration-300"
                          >
                            {actionLoading[request.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                거절
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}

                    {user?.role === 'mentee' && request.status === 'pending' && (
                      <>
                        <Separator />
                        <div className="pt-2">
                          <Button
                            onClick={() => handleCancel(request.id)}
                            disabled={actionLoading[request.id]}
                            variant="secondary"
                            className="w-full h-11 font-medium shadow-lg transition-all duration-300"
                          >
                            {actionLoading[request.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                요청 취소
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
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

export default Requests;
