#!/usr/bin/env python3
"""
JWT 토큰 인증 수정사항 테스트
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from auth import create_access_token, verify_token

def test_jwt_token():
    print("=== JWT 토큰 생성 및 검증 테스트 ===")
    
    # 1. 토큰 생성 테스트
    test_data = {
        "sub": "test@example.com",
        "user_id": 1,
        "role": "mentor"
    }
    
    print("1. 토큰 생성 중...")
    token = create_access_token(test_data)
    print(f"✓ 토큰 생성 성공: {token[:50]}...")
    
    # 2. 토큰 검증 테스트
    print("\n2. 토큰 검증 중...")
    payload = verify_token(token)
    
    if payload:
        print("✓ 토큰 검증 성공!")
        print(f"  - Subject: {payload.get('sub')}")
        print(f"  - User ID: {payload.get('user_id')}")
        print(f"  - Role: {payload.get('role')}")
        print(f"  - Issuer: {payload.get('iss')}")
        print(f"  - Audience: {payload.get('aud')}")
        print(f"  - Expires: {payload.get('exp')}")
    else:
        print("✗ 토큰 검증 실패!")
        return False
    
    # 3. 잘못된 토큰 테스트
    print("\n3. 잘못된 토큰 검증 테스트...")
    invalid_token = "invalid.token.here"
    invalid_payload = verify_token(invalid_token)
    
    if invalid_payload is None:
        print("✓ 잘못된 토큰 정상적으로 거부됨")
    else:
        print("✗ 잘못된 토큰이 허용됨 - 문제 있음!")
        return False
    
    print("\n=== 모든 JWT 테스트 통과! ===")
    return True

if __name__ == "__main__":
    test_jwt_token()
