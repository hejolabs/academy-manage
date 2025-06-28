# Study Room Management System - Backend

FastAPI + Python 3.12 기반 공부방 관리 시스템 백엔드

## 설치 및 실행

### 1. Python 환경 설정
```bash
# 프로젝트 디렉토리로 이동
cd study-room-system/backend

# Python 3.12로 설정
pyenv local 3.12.0
```

### 2. 가상환경 생성 및 의존성 설치
```bash
# uv로 가상환경 생성
uv venv

# 가상환경 활성화
source .venv/bin/activate

# 패키지 설치
uv pip install -r requirements.txt
```

### 3. 서버 실행
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API 접근

- **API 서버**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **건강 체크**: http://localhost:8000/health

## 다음 번 실행

```bash
source .venv/bin/activate
uvicorn app.main:app --reload
```