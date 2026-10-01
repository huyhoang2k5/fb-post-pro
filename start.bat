@echo off
chcp 65001 >nul
title FB Post Pro - Quản Lý Đăng Bài Facebook
cd /d "%~dp0"

echo ========================================================
echo   Đang khởi động FB Post Pro...
echo   Trình duyệt sẽ tự động mở sau 2 giây!
echo ========================================================

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

npm run dev
