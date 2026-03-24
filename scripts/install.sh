#!/bin/bash

#############################################
# Beni Golf Club - Script de Instalação
# Domínio: benigolfclub.com
# Sistema: Ubuntu 24.04 LTS
# Banco de Dados: MongoDB
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DOMAIN="benigolfclub.com"
APP_DIR="/var/www/benigolfclub"
BACKEND_PORT=8001
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Função para imprimir mensagens
print_msg() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor, execute como root (sudo)"
    exit 1
fi

# Detectar versão do Ubuntu
UBUNTU_VERSION=$(lsb_release -rs 2>/dev/null || echo "24.04")
UBUNTU_CODENAME=$(lsb_release -cs 2>/dev/null || echo "noble")

echo ""
echo "=============================================="
echo "   Beni Golf Club - Instalação Automatizada"
echo "   Domínio: $DOMAIN"
echo "   Ubuntu: $UBUNTU_VERSION ($UBUNTU_CODENAME)"
echo "=============================================="
echo ""

#############################################
# 1. ATUALIZAÇÃO DO SISTEMA
#############################################
print_info "Atualizando o sistema..."
apt update && apt upgrade -y
print_msg "Sistema atualizado"

#############################################
# 2. INSTALAÇÃO DE DEPENDÊNCIAS BÁSICAS
#############################################
print_info "Instalando dependências básicas..."
apt install -y curl wget git build-essential software-properties-common gnupg ca-certificates lsb-release unzip
print_msg "Dependências básicas instaladas"

#############################################
# 3. INSTALAÇÃO DO NODE.JS 20 LTS
#############################################
print_info "Instalando Node.js 20 LTS..."
# Remover versões antigas do NodeSource se existirem
rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
rm -f /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true

# Instalação via NodeSource (método atualizado para Ubuntu 24.04)
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt update
apt install -y nodejs
npm install -g yarn
print_msg "Node.js $(node -v) instalado"
print_msg "Yarn $(yarn -v) instalado"

#############################################
# 4. INSTALAÇÃO DO PYTHON 3.12 (Ubuntu 24.04)
#############################################
print_info "Instalando Python 3..."
apt install -y python3 python3-pip python3-venv python3-dev
print_msg "Python $(python3 --version) instalado"

#############################################
# 5. INSTALAÇÃO DO MONGODB 7.0
#############################################
print_info "Instalando MongoDB 7.0..."

# Remover instalações anteriores se existirem
rm -f /etc/apt/sources.list.d/mongodb*.list 2>/dev/null || true

# Para Ubuntu 24.04 (Noble), usar os pacotes do Jammy (compatível)
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Ubuntu 24.04 usa repositório do jammy (22.04) pois ainda não há pacote oficial para noble
if [ "$UBUNTU_CODENAME" = "noble" ]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
       tee /etc/apt/sources.list.d/mongodb-org-7.0.list
else
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $UBUNTU_CODENAME/mongodb-org/7.0 multiverse" | \
       tee /etc/apt/sources.list.d/mongodb-org-7.0.list
fi

apt update
apt install -y mongodb-org

# Criar diretório de dados se não existir
mkdir -p /var/lib/mongodb
mkdir -p /var/log/mongodb
chown -R mongodb:mongodb /var/lib/mongodb
chown -R mongodb:mongodb /var/log/mongodb

systemctl start mongod
systemctl enable mongod

# Verificar se MongoDB iniciou corretamente
sleep 3
if systemctl is-active --quiet mongod; then
    print_msg "MongoDB instalado e iniciado"
else
    print_warn "MongoDB instalado, mas pode precisar de reinício manual"
    print_info "Execute: sudo systemctl start mongod"
fi

#############################################
# 6. INSTALAÇÃO DO NGINX
#############################################
print_info "Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_msg "Nginx instalado"

#############################################
# 7. INSTALAÇÃO DO CERTBOT (SSL)
#############################################
print_info "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx
print_msg "Certbot instalado"

#############################################
# 8. CRIAÇÃO DA ESTRUTURA DE DIRETÓRIOS
#############################################
print_info "Criando estrutura de diretórios..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/backend
mkdir -p $APP_DIR/frontend
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/uploads
print_msg "Diretórios criados em $APP_DIR"

#############################################
# 9. CÓPIA DOS ARQUIVOS
#############################################
print_info "Copiando arquivos do projeto..."

# Verificar se estamos no diretório do projeto ou se foi especificado
if [ -d "$PROJECT_DIR/backend" ] && [ -d "$PROJECT_DIR/frontend" ]; then
    cp -r "$PROJECT_DIR/backend/"* $APP_DIR/backend/
    cp -r "$PROJECT_DIR/frontend/"* $APP_DIR/frontend/
    print_msg "Arquivos copiados do diretório do projeto"
elif [ -d "./backend" ] && [ -d "./frontend" ]; then
    cp -r ./backend/* $APP_DIR/backend/
    cp -r ./frontend/* $APP_DIR/frontend/
    print_msg "Arquivos copiados do diretório atual"
else
    print_warn "Diretórios backend/frontend não encontrados"
    print_info "Certifique-se de que o script está dentro da pasta do projeto extraído"
    print_info "Estrutura esperada:"
    print_info "  projeto/"
    print_info "    ├── backend/"
    print_info "    ├── frontend/"
    print_info "    └── scripts/"
    print_info "           └── install.sh (este script)"
    exit 1
fi

#############################################
# 10. CONFIGURAÇÃO DO BACKEND
#############################################
print_info "Configurando Backend..."

cd $APP_DIR/backend

# Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências do requirements.txt se existir
if [ -f "requirements.txt" ]; then
    print_info "Instalando dependências do requirements.txt..."
    # Filtrar pacotes problemáticos para instalação limpa
    grep -v "emergentintegrations" requirements.txt > requirements_clean.txt || cp requirements.txt requirements_clean.txt
    pip install -r requirements_clean.txt
    rm -f requirements_clean.txt
fi

# Garantir pacotes essenciais
pip install fastapi uvicorn motor python-dotenv pydantic email-validator python-multipart bcrypt PyJWT aiofiles

# Gerar JWT_SECRET seguro
JWT_SECRET_KEY=$(openssl rand -hex 32)

# Criar arquivo .env do backend
cat > $APP_DIR/backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=benigolfclub
JWT_SECRET=$JWT_SECRET_KEY
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,http://localhost:3000
UPLOAD_DIR=$APP_DIR/uploads
EOF

print_msg "Backend configurado"

#############################################
# 11. CONFIGURAÇÃO DO FRONTEND
#############################################
print_info "Configurando Frontend..."

cd $APP_DIR/frontend

# Criar arquivo .env do frontend
cat > $APP_DIR/frontend/.env << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
GENERATE_SOURCEMAP=false
EOF

# Instalar dependências e fazer build
print_info "Instalando dependências do frontend (pode demorar alguns minutos)..."
yarn install --network-timeout 600000

print_info "Criando build de produção..."
yarn build

if [ -d "build" ]; then
    print_msg "Frontend configurado e build criado"
else
    print_error "Falha ao criar build do frontend"
    exit 1
fi

#############################################
# 12. CRIAR SERVIÇO SYSTEMD PARA BACKEND
#############################################
print_info "Criando serviço do Backend..."

cat > /etc/systemd/system/benigolf-backend.service << EOF
[Unit]
Description=Beni Golf Club Backend API
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin:/usr/local/bin:/usr/bin"
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=$APP_DIR/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port $BACKEND_PORT --workers 2
Restart=always
RestartSec=10
StandardOutput=append:$APP_DIR/logs/backend.log
StandardError=append:$APP_DIR/logs/backend_error.log

[Install]
WantedBy=multi-user.target
EOF

# Criar arquivo de log
touch $APP_DIR/logs/backend.log $APP_DIR/logs/backend_error.log

systemctl daemon-reload
systemctl enable benigolf-backend
systemctl start benigolf-backend

# Verificar se iniciou
sleep 3
if systemctl is-active --quiet benigolf-backend; then
    print_msg "Serviço do Backend criado e iniciado"
else
    print_warn "Backend instalado, verificando logs..."
    journalctl -u benigolf-backend --no-pager -n 20
fi

#############################################
# 13. CONFIGURAÇÃO DO NGINX
#############################################
print_info "Configurando Nginx..."

# Configuração inicial sem SSL (para validação do Certbot)
cat > /etc/nginx/sites-available/benigolfclub << EOF
# Configuração para validação SSL - Certbot irá modificar após obter certificado

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Para validação do Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Logs
    access_log $APP_DIR/logs/nginx_access.log;
    error_log $APP_DIR/logs/nginx_error.log;

    # Frontend (arquivos estáticos)
    root $APP_DIR/frontend/build;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
        client_max_body_size 50M;
    }

    # Uploads
    location /uploads {
        alias $APP_DIR/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend SPA - todas as rotas vão para index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/benigolfclub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Criar arquivos de log do Nginx
touch $APP_DIR/logs/nginx_access.log $APP_DIR/logs/nginx_error.log

# Testar configuração
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    print_msg "Nginx configurado"
else
    print_error "Erro na configuração do Nginx"
    exit 1
fi

#############################################
# 14. PERMISSÕES
#############################################
print_info "Configurando permissões..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/uploads
chmod -R 775 $APP_DIR/logs
print_msg "Permissões configuradas"

#############################################
# 15. CONFIGURAÇÃO DO FIREWALL
#############################################
print_info "Configurando Firewall..."

# Verificar se ufw está instalado
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Só habilitar se não estiver ativo
    if ! ufw status | grep -q "Status: active"; then
        ufw --force enable
    fi
    print_msg "Firewall configurado"
else
    print_warn "UFW não instalado, pulando configuração do firewall"
fi

#############################################
# 16. CRIAR USUÁRIO ADMIN INICIAL
#############################################
print_info "Criando usuário admin inicial..."
sleep 5  # Aguardar backend iniciar completamente

# Verificar se backend está respondendo
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    print_info "Aguardando backend iniciar... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 3
done

# Tentar inicializar dados
if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    # Inicializar/seed se endpoint existir
    curl -s -X POST http://localhost:$BACKEND_PORT/api/seed > /dev/null 2>&1 || true
    curl -s -X POST http://localhost:$BACKEND_PORT/api/admin/init > /dev/null 2>&1 || true
    print_msg "Dados inicializados"
else
    print_warn "Backend não respondeu. Verifique os logs após a instalação."
fi

#############################################
# INSTRUÇÕES FINAIS
#############################################
echo ""
echo "=============================================="
echo "         INSTALAÇÃO CONCLUÍDA!"
echo "=============================================="
echo ""
print_info "Status dos serviços:"
echo ""
systemctl is-active --quiet mongod && echo -e "  ${GREEN}●${NC} MongoDB: Ativo" || echo -e "  ${RED}●${NC} MongoDB: Inativo"
systemctl is-active --quiet benigolf-backend && echo -e "  ${GREEN}●${NC} Backend: Ativo" || echo -e "  ${RED}●${NC} Backend: Inativo"
systemctl is-active --quiet nginx && echo -e "  ${GREEN}●${NC} Nginx: Ativo" || echo -e "  ${RED}●${NC} Nginx: Inativo"
echo ""
print_info "Próximos passos:"
echo ""
echo "1. ${YELLOW}Configure o DNS do domínio $DOMAIN${NC}"
echo "   Aponte os registros A e AAAA para o IP deste servidor:"
echo "   - Tipo A: $DOMAIN -> SEU_IP_IPV4"
echo "   - Tipo A: www.$DOMAIN -> SEU_IP_IPV4"
echo ""
echo "2. ${YELLOW}Aguarde a propagação do DNS (pode levar até 24h)${NC}"
echo "   Teste com: dig $DOMAIN +short"
echo ""
echo "3. ${YELLOW}Após DNS propagado, configure SSL com Certbot:${NC}"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "4. ${YELLOW}Acesse o painel admin:${NC}"
echo "   URL: https://$DOMAIN/admin/login"
echo "   Email: admin@benigolfhotel.lu"
echo "   Senha: admin123"
echo ""
echo "${RED}⚠️  IMPORTANTE: Altere a senha do admin após primeiro acesso!${NC}"
echo ""
print_info "Comandos úteis:"
echo ""
echo "  # Verificar status dos serviços"
echo "  sudo systemctl status benigolf-backend"
echo "  sudo systemctl status nginx"
echo "  sudo systemctl status mongod"
echo ""
echo "  # Ver logs do backend"
echo "  sudo tail -f $APP_DIR/logs/backend.log"
echo "  sudo journalctl -u benigolf-backend -f"
echo ""
echo "  # Ver logs do Nginx"
echo "  sudo tail -f $APP_DIR/logs/nginx_error.log"
echo ""
echo "  # Reiniciar serviços"
echo "  sudo systemctl restart benigolf-backend"
echo "  sudo systemctl restart nginx"
echo ""
echo "  # Fazer backup"
echo "  sudo $APP_DIR/../scripts/backup.sh"
echo ""
echo "=============================================="
echo "  Arquivos instalados em: $APP_DIR"
echo "  Logs em: $APP_DIR/logs/"
echo "=============================================="
echo ""
