@echo off
chcp 65001 >nul
echo 这会从 workspace.json / archive_manager.json 里摘掉会话日志已不存在的归档条目。
echo 请先完全退出 DSH（含托盘），否则运行中的进程会把内存里的旧列表写回去。
echo.
set /p ok=输入 y 继续:
if /i not "%ok%"=="y" exit /b 1
node "%~dp0prune-orphans.mjs" --apply
echo.
pause
