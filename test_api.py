#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8080/api"

def test_login():
    """로그인 테스트"""
    print("=== 로그인 테스트 ===")
    response = requests.post(f"{BASE_URL}/login", json={
        "email": "test_mentor@example.com",
        "password": "testpass123"
    })
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        return response.json()["token"]
    return None

def test_profile_update(token):
    """프로필 업데이트 테스트"""
    print("\n=== 프로필 업데이트 테스트 ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    profile_data = {
        "name": "김멘토",
        "bio": "5년 경력 백엔드 개발자입니다. Python, Java 전문",
        "skills": ["Python", "Java", "Spring", "FastAPI", "Docker"]
    }
    
    response = requests.put(f"{BASE_URL}/profile", json=profile_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_get_me(token):
    """내 정보 조회 테스트"""
    print("\n=== 내 정보 조회 테스트 ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_mentee_operations():
    """멘티 계정으로 기능 테스트"""
    print("\n=== 멘티 로그인 ===")
    response = requests.post(f"{BASE_URL}/login", json={
        "email": "test_mentee@example.com", 
        "password": "testpass123"
    })
    
    if response.status_code != 200:
        print(f"멘티 로그인 실패: {response.text}")
        return
        
    token = response.json()["token"]
    print(f"멘티 로그인 성공")
    
    # 멘티 프로필 업데이트
    print("\n=== 멘티 프로필 업데이트 ===")
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "name": "박멘티",
        "bio": "프론트엔드 개발을 배우고 싶은 초보 개발자입니다.",
        "skills": ["JavaScript", "HTML", "CSS"]
    }
    
    response = requests.put(f"{BASE_URL}/profile", json=profile_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # 멘토 목록 조회
    print("\n=== 멘토 목록 조회 ===")
    response = requests.get(f"{BASE_URL}/mentors", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # 매칭 요청 생성
    if response.status_code == 200:
        mentors = response.json()
        if mentors:
            mentor_id = mentors[0]["id"]
            print(f"\n=== 매칭 요청 생성 (멘토 ID: {mentor_id}) ===")
            request_data = {
                "mentorId": mentor_id,
                "message": "안녕하세요! React와 Node.js를 배우고 싶습니다. 멘토링 부탁드립니다."
            }
            
            response = requests.post(f"{BASE_URL}/match-requests", json=request_data, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")

if __name__ == "__main__":
    # 멘토 테스트
    token = test_login()
    if token:
        print(f"토큰 획득: {token[:50]}...")
        test_profile_update(token)
        test_get_me(token)
    
    # 멘티 테스트
    test_mentee_operations()
