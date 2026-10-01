@echo off
chcp 65001 >nul
title Deploy FB Post Pro len Vercel
cls
echo ======================================================================
echo          TRIỂN KHAI FB POST PRO LÊN VERCEL CLOUD (MIỄN PHÍ)
echo ======================================================================
echo.
echo  Đang kết nối Vercel CLI...
echo.
cd /d "C:\Users\lnhho\.gemini\antigravity\scratch\fb-post-pro"

echo  Nếu là lần đầu tiên, Vercel sẽ mở trình duyệt để bạn Đăng nhập.
echo  Sau đó, bạn chỉ cần bấm ENTER qua các câu hỏi mặc định:
echo    - Set up and deploy? [Y] -> Bấm Enter
echo    - Which scope? -> Bấm Enter
echo    - Link to existing project? [N] -> Bấm Enter
echo    - Project name? [fb-post-pro] -> Bấm Enter
echo    - Directory? [./] -> Bấm Enter
echo.
echo ======================================================================
echo.

npx vercel --prod

echo.
echo ======================================================================
echo  Hoàn tất! Kiểm tra link Vercel hiển thị ở trên.
echo ======================================================================
pause
