@echo off
echo Building TypeScript...
call node_modules\.bin\tsc
if %ERRORLEVEL% EQU 0 (
    echo TypeScript compilation successful!
    echo Starting server...
    python server.py
) else (
    echo TypeScript compilation failed!
    pause
)