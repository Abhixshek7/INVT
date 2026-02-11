@echo off
echo ================================================
echo INVT Database Setup Script
echo ================================================
echo.
echo This will create the INVT database with all tables
echo Database: INVT
echo User: postgres
echo Password: root
echo.
echo ================================================
echo.

echo Running PostgreSQL setup...
psql -U postgres -f setup_local_db.sql

echo.
echo ================================================
echo Setup complete!
echo ================================================
echo.
echo Next steps:
echo 1. Start the backend: npm run dev
echo 2. Train the ML model: curl -X POST http://localhost:5000/api/forecast/train
echo.
pause
