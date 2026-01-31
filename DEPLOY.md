# 🚀 배포 가이드 (FINAL: Production Verified)

**StartGen AI**를 인터넷에 올려서 친구들에게 링크를 공유하는 방법입니다.
가장 쉽고 강력한 **Vercel**을 사용하는 방법을 추천합니다.

## 1단계: GitHub에 코드 올리기

1.  **GitHub 가입/로그인**: [github.com](https://github.com)
2.  **새 리포지토리(Repository) 생성**:
    - 우측 상단 `+` 버튼 -> **New repository**
    - 이름 입력 (예: `startgen-ai`) -> **Create repository**
3.  **코드 업로드 (터미널)**:
    이 프로젝트가 있는 폴더에서 아래 명령어를 차례대로 실행하세요:
    ```bash
    git remote add origin [https://github.com/Heedongbot/tartGen-AI]
    git add .
    git commit -m "Initial deploy"
    git push -u origin main
    ```

## 2단계: Vercel에 배포하기

1.  **Vercel 가입/로그인**: [vercel.com](https://vercel.com) (GitHub 아이디로 로그인 추천)
2.  **새 프로젝트 추가**:
    - **Add New...** -> **Project** 클릭
    - 방금 올린 `startgen-ai` 리포지토리 옆의 **Import** 버튼 클릭
3.  **환경 변수(Environment Variables) 설정 (중요! ⭐)**:
    - **Environment Variables** 섹션을 펼치세요.
    - 아래 두 가지를 꼭 넣어야 합니다:
      
      | Key (이름) | Value (값) |
      | :--- | :--- |
      | `GOOGLE_API_KEY` | `AIza...` (당신의 Gemini API 키) |
      | `DATABASE_URL` | `postgresql://...` (Supabase 연결 주소) |

4.  **Deploy 클릭**:
    - 버튼을 누르고 1~2분만 기다리면 끝!
    - 폭죽이 터지면 **Visit** 버튼을 눌러보세요.

## 🎉 완료!

이제 주소창에 있는 링크(예: `startgen-ai.vercel.app`)를 복사해서 친구들에게 카톡으로 보내보세요!
공유하기 기능과 PDF 저장도 완벽하게 작동합니다.
