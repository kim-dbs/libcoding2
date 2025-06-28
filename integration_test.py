#!/usr/bin/env python3
"""
멘토-멘티 매칭 앱 통합 테스트
"""
import time
import requests
import json

class MentorMenteeAppTester:
    def __init__(self):
        self.base_url = "http://localhost:8080/api"
        self.frontend_url = "http://localhost:3000"
        self.mentor_token = None
        self.mentee_token = None
        self.mentor_id = None
        self.mentee_id = None
        
    def print_step(self, step):
        print(f"\n{'='*50}")
        print(f"🧪 {step}")
        print('='*50)
        
    def test_signup_and_login(self):
        """회원가입 및 로그인 테스트"""
        self.print_step("회원가입 및 로그인 테스트")
        
        # 1. 멘토 회원가입
        print("📝 멘토 회원가입...")
        mentor_data = {
            "email": "mentor@test.com",
            "password": "test123",
            "name": "김멘토",
            "role": "mentor"
        }
        response = requests.post(f"{self.base_url}/signup", json=mentor_data)
        if response.status_code == 201:
            print("✅ 멘토 회원가입 성공")
        else:
            print(f"❌ 멘토 회원가입 실패: {response.text}")
            return False
            
        # 2. 멘티 회원가입
        print("📝 멘티 회원가입...")
        mentee_data = {
            "email": "mentee@test.com", 
            "password": "test123",
            "name": "박멘티",
            "role": "mentee"
        }
        response = requests.post(f"{self.base_url}/signup", json=mentee_data)
        if response.status_code == 201:
            print("✅ 멘티 회원가입 성공")
        else:
            print(f"❌ 멘티 회원가입 실패: {response.text}")
            return False
            
        # 3. 멘토 로그인
        print("🔐 멘토 로그인...")
        login_data = {"email": "mentor@test.com", "password": "test123"}
        response = requests.post(f"{self.base_url}/login", json=login_data)
        if response.status_code == 200:
            self.mentor_token = response.json()["token"]
            print("✅ 멘토 로그인 성공")
        else:
            print(f"❌ 멘토 로그인 실패: {response.text}")
            return False
            
        # 4. 멘티 로그인  
        print("🔐 멘티 로그인...")
        login_data = {"email": "mentee@test.com", "password": "test123"}
        response = requests.post(f"{self.base_url}/login", json=login_data)
        if response.status_code == 200:
            self.mentee_token = response.json()["token"]
            print("✅ 멘티 로그인 성공")
        else:
            print(f"❌ 멘티 로그인 실패: {response.text}")
            return False
            
        return True
        
    def test_profile_management(self):
        """프로필 관리 테스트"""
        self.print_step("프로필 관리 테스트")
        
        # 1. 멘토 프로필 업데이트
        print("👤 멘토 프로필 업데이트...")
        headers = {"Authorization": f"Bearer {self.mentor_token}"}
        profile_data = {
            "name": "김멘토",
            "bio": "5년차 백엔드 개발자입니다. Python, Java 전문가",
            "skills": ["Python", "Java", "Spring", "FastAPI", "Docker"]
        }
        response = requests.put(f"{self.base_url}/profile", json=profile_data, headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            self.mentor_id = user_data["id"]
            print("✅ 멘토 프로필 업데이트 성공")
            print(f"   멘토 ID: {self.mentor_id}")
            print(f"   스킬: {user_data['profile']['skills']}")
        else:
            print(f"❌ 멘토 프로필 업데이트 실패: {response.text}")
            return False
            
        # 2. 멘티 프로필 업데이트
        print("👤 멘티 프로필 업데이트...")
        headers = {"Authorization": f"Bearer {self.mentee_token}"}
        profile_data = {
            "name": "박멘티",
            "bio": "프론트엔드 개발을 배우고 싶은 신입 개발자입니다.",
            "skills": ["JavaScript", "HTML", "CSS"]
        }
        response = requests.put(f"{self.base_url}/profile", json=profile_data, headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            self.mentee_id = user_data["id"]
            print("✅ 멘티 프로필 업데이트 성공")
            print(f"   멘티 ID: {self.mentee_id}")
        else:
            print(f"❌ 멘티 프로필 업데이트 실패: {response.text}")
            return False
            
        return True
        
    def test_mentor_listing(self):
        """멘토 목록 조회 테스트"""
        self.print_step("멘토 목록 조회 테스트")
        
        print("📋 멘티가 멘토 목록 조회...")
        headers = {"Authorization": f"Bearer {self.mentee_token}"}
        response = requests.get(f"{self.base_url}/mentors", headers=headers)
        
        if response.status_code == 200:
            mentors = response.json()
            print(f"✅ 멘토 목록 조회 성공 ({len(mentors)}명)")
            for mentor in mentors:
                print(f"   - {mentor['profile']['name']}: {mentor['profile']['skills']}")
            return True
        else:
            print(f"❌ 멘토 목록 조회 실패: {response.text}")
            return False
            
    def test_matching_request(self):
        """매칭 요청 테스트"""
        self.print_step("매칭 요청 테스트")
        
        # 1. 매칭 요청 생성
        print("💌 멘티가 멘토에게 매칭 요청...")
        headers = {"Authorization": f"Bearer {self.mentee_token}"}
        request_data = {
            "mentorId": self.mentor_id,
            "message": "안녕하세요! React와 Node.js를 배우고 싶습니다. 멘토링 부탁드립니다."
        }
        response = requests.post(f"{self.base_url}/match-requests", json=request_data, headers=headers)
        
        if response.status_code == 200:
            request_info = response.json()
            request_id = request_info["id"]
            print(f"✅ 매칭 요청 생성 성공 (요청 ID: {request_id})")
            print(f"   상태: {request_info['status']}")
        else:
            print(f"❌ 매칭 요청 생성 실패: {response.text}")
            return False
            
        # 2. 멘토가 받은 요청 조회
        print("📨 멘토가 받은 요청 조회...")
        headers = {"Authorization": f"Bearer {self.mentor_token}"}
        response = requests.get(f"{self.base_url}/match-requests/incoming", headers=headers)
        
        if response.status_code == 200:
            incoming_requests = response.json()
            print(f"✅ 받은 요청 조회 성공 ({len(incoming_requests)}개)")
            for req in incoming_requests:
                print(f"   요청 #{req['id']}: {req['status']} - {req['message'][:30]}...")
        else:
            print(f"❌ 받은 요청 조회 실패: {response.text}")
            return False
            
        # 3. 멘토가 요청 수락
        print("✅ 멘토가 요청 수락...")
        response = requests.put(f"{self.base_url}/match-requests/{request_id}/accept", headers=headers)
        
        if response.status_code == 200:
            accepted_request = response.json()
            print(f"✅ 요청 수락 성공")
            print(f"   상태: {accepted_request['status']}")
        else:
            print(f"❌ 요청 수락 실패: {response.text}")
            return False
            
        # 4. 멘티가 보낸 요청 상태 확인
        print("📋 멘티가 보낸 요청 상태 확인...")
        headers = {"Authorization": f"Bearer {self.mentee_token}"}
        response = requests.get(f"{self.base_url}/match-requests/outgoing", headers=headers)
        
        if response.status_code == 200:
            outgoing_requests = response.json()
            print(f"✅ 보낸 요청 조회 성공 ({len(outgoing_requests)}개)")
            for req in outgoing_requests:
                print(f"   요청 #{req['id']}: {req['status']}")
        else:
            print(f"❌ 보낸 요청 조회 실패: {response.text}")
            return False
            
        return True
        
    def test_server_availability(self):
        """서버 가용성 테스트"""
        self.print_step("서버 가용성 테스트")
        
        try:
            # 백엔드 서버 확인
            response = requests.get(f"{self.base_url.replace('/api', '')}", timeout=5)
            if response.status_code == 200:
                print("✅ 백엔드 서버 응답 확인")
            else:
                print(f"❌ 백엔드 서버 응답 오류: {response.status_code}")
                return False
                
            # 프론트엔드 서버 확인
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                print("✅ 프론트엔드 서버 응답 확인")
            else:
                print(f"❌ 프론트엔드 서버 응답 오류: {response.status_code}")
                return False
                
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"❌ 서버 연결 실패: {e}")
            return False
            
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🚀 멘토-멘티 매칭 앱 통합 테스트 시작")
        print(f"⏰ 테스트 시작 시간: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        tests = [
            ("서버 가용성", self.test_server_availability),
            ("회원가입 및 로그인", self.test_signup_and_login),
            ("프로필 관리", self.test_profile_management),
            ("멘토 목록 조회", self.test_mentor_listing),
            ("매칭 요청", self.test_matching_request),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} 테스트 통과")
                else:
                    failed += 1
                    print(f"❌ {test_name} 테스트 실패")
            except Exception as e:
                failed += 1
                print(f"❌ {test_name} 테스트 예외 발생: {e}")
                
        # 최종 결과
        self.print_step("테스트 결과 요약")
        print(f"✅ 통과: {passed}개")
        print(f"❌ 실패: {failed}개")
        print(f"📊 성공률: {passed/(passed+failed)*100:.1f}%")
        
        if failed == 0:
            print("🎉 모든 테스트가 성공적으로 완료되었습니다!")
        else:
            print("⚠️  일부 테스트가 실패했습니다. 로그를 확인해주세요.")

if __name__ == "__main__":
    tester = MentorMenteeAppTester()
    tester.run_all_tests()
