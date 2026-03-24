#!/bin/bash
#
# Script de Diagnóstico para problema de uploads no Beni Golf Club
# Execute este script no seu servidor de produção como root:
#   sudo bash diagnose_uploads.sh
#

echo "=========================================="
echo "  DIAGNÓSTICO DE UPLOADS - BENI GOLF CLUB"
echo "=========================================="
echo ""

# 1. Verificar diretório de uploads
echo "1. Verificando diretório de uploads..."
UPLOADS_DIR="/var/www/benigolfclub/backend/uploads"

if [ -d "$UPLOADS_DIR" ]; then
    echo "   ✓ Diretório existe: $UPLOADS_DIR"
    echo "   Permissões:"
    ls -la "$UPLOADS_DIR" | head -5
    echo ""
    echo "   Ficheiros no diretório:"
    ls -la "$UPLOADS_DIR" | tail -n +2 | head -10
    FILE_COUNT=$(ls -1 "$UPLOADS_DIR" 2>/dev/null | wc -l)
    echo "   Total de ficheiros: $FILE_COUNT"
else
    echo "   ✗ ERRO: Diretório NÃO existe!"
    echo "   Execute: sudo mkdir -p $UPLOADS_DIR"
fi
echo ""

# 2. Verificar permissões
echo "2. Verificando permissões..."
OWNER=$(stat -c '%U:%G' "$UPLOADS_DIR" 2>/dev/null || echo "N/A")
echo "   Dono atual: $OWNER"
if [ "$OWNER" != "www-data:www-data" ]; then
    echo "   ✗ AVISO: Dono deveria ser www-data:www-data"
    echo "   Execute: sudo chown -R www-data:www-data $UPLOADS_DIR"
fi
echo ""

# 3. Verificar configuração do Nginx
echo "3. Verificando configuração do Nginx..."
NGINX_CONF="/etc/nginx/sites-enabled/benigolfclub"
if [ -f "$NGINX_CONF" ]; then
    echo "   ✓ Ficheiro de configuração existe"
    echo ""
    echo "   Bloco /api/uploads/ na configuração:"
    grep -A 10 "location /api/uploads" "$NGINX_CONF" 2>/dev/null || echo "   ✗ ERRO: Bloco /api/uploads/ não encontrado!"
else
    echo "   ✗ ERRO: Ficheiro de configuração não encontrado!"
fi
echo ""

# 4. Testar Nginx
echo "4. Testando sintaxe do Nginx..."
nginx -t 2>&1
echo ""

# 5. Verificar se o backend está a correr
echo "5. Verificando backend FastAPI..."
if pgrep -f "uvicorn" > /dev/null; then
    echo "   ✓ Backend (uvicorn) está a correr"
    pgrep -f "uvicorn" -a | head -2
else
    echo "   ✗ ERRO: Backend não está a correr!"
fi
echo ""

# 6. Testar acesso direto ao ficheiro
echo "6. Testando acesso aos ficheiros..."
FIRST_FILE=$(ls -1 "$UPLOADS_DIR" 2>/dev/null | head -1)
if [ -n "$FIRST_FILE" ]; then
    echo "   Testando ficheiro: $FIRST_FILE"
    
    # Teste local (curl ao localhost)
    echo "   Via localhost:8001 (backend direto):"
    curl -s -o /dev/null -w "   HTTP: %{http_code}\n" "http://127.0.0.1:8001/api/uploads/$FIRST_FILE" 2>/dev/null || echo "   ✗ Falhou"
    
    # Teste via nginx
    echo "   Via Nginx (localhost:80):"
    curl -s -o /dev/null -w "   HTTP: %{http_code}\n" "http://localhost/api/uploads/$FIRST_FILE" 2>/dev/null || echo "   ✗ Falhou"
else
    echo "   ✗ Nenhum ficheiro no diretório para testar"
fi
echo ""

# 7. Verificar logs de erro
echo "7. Últimos erros do Nginx (se houver):"
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "   Não foi possível ler logs"
echo ""

echo "=========================================="
echo "  RECOMENDAÇÕES"
echo "=========================================="
echo ""
echo "Se o bloco /api/uploads/ não existir na configuração:"
echo "  1. Adicione o seguinte ANTES do bloco 'location /api/':"
echo ""
echo "    location /api/uploads/ {"
echo "        alias /var/www/benigolfclub/backend/uploads/;"
echo "        expires 30d;"
echo "        add_header Cache-Control \"public, immutable\";"
echo "    }"
echo ""
echo "  2. Execute: sudo nginx -t"
echo "  3. Execute: sudo systemctl reload nginx"
echo ""
echo "Se os ficheiros não existem no diretório:"
echo "  - Verifique se o backend está a guardar os ficheiros no caminho correto"
echo "  - O backend pode estar a usar um caminho diferente"
echo ""
echo "Para verificar onde o backend guarda os ficheiros, veja os logs:"
echo "  journalctl -u benigolfclub-backend -n 50"
echo ""
