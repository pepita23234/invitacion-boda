@echo off
echo Copiando imagenes decorativas...
copy "Grupo01_a.webp" "nextjs-app\public\Grupo01_a.webp"
copy "Grupo01_b.webp" "nextjs-app\public\Grupo01_b.webp"
copy "Grupo01_c.webp" "nextjs-app\public\Grupo01_c.webp"
echo.
echo Imagenes copiadas exitosamente!
echo.
echo Iniciando servidor de desarrollo...
cd nextjs-app
call npm run dev
