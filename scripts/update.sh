#!/bin/bash

#############################################
# Beni Golf Club - Script de Atualização
# Uso: sudo ./update.sh [diretorio_com_novos_arquivos]
#############################################

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/benigolfclub"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${1:-$(dirname "$SCRIPT_DIR")}"

print_msg() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_info() { echo -e "${BLUE}[i]${NC} $1"; }

# Verificar root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor, execute como root (sudo)"
    exit 1
fi

echo ""
echo "==================================="
echo "   Beni Golf Club - Atualização"
echo "==================================="
echo ""

# Verificar fonte
if [ ! -d "$SOURCE_DIR/backend" ] && [ ! -d "$SOURCE_DIR/frontend" ]; then
    print_error "Diretório de origem não encontrado: $SOURCE_DIR"
    print_info "Uso: sudo ./update.sh /caminho/para/novos/arquivos"
    exit 1
fi

print_info "Origem: $SOURCE_DIR"
print_info "Destino: $APP_DIR"
echo ""

# 1. Fazer backup antes de atualizar
print_info "Fazendo backup de segurança..."
$SCRIPT_DIR/backup.sh >/dev/null 2>&1 || true
print_msg "Backup criado"

# 2. Parar backend
print_info "Parando backend..."
systemctl stop benigolf-backend
print_msg "Backend parado"

# 3. Atualizar backend
if [ -d "$SOURCE_DIR/backend" ]; then
    print_info "Atualizando backend..."
    
    # Preservar .env e venv
    if [ -f "$APP_DIR/backend/.env" ]; then
        cp $APP_DIR/backend/.env /tmp/backend.env.bak
    fi
    
    # Copiar novos arquivos (exceto .env e venv)
    rsync -av --exclude='.env' --exclude='venv' --exclude='__pycache__' \
        "$SOURCE_DIR/backend/" "$APP_DIR/backend/"
    
    # Restaurar .env
    if [ -f "/tmp/backend.env.bak" ]; then
        mv /tmp/backend.env.bak $APP_DIR/backend/.env
    fi
    
    # Atualizar dependências se requirements.txt mudou
    if [ -f "$APP_DIR/backend/requirements.txt" ]; then
        cd $APP_DIR/backend
        source venv/bin/activate
        pip install --quiet --upgrade pip
        grep -v "emergentintegrations" requirements.txt > requirements_clean.txt 2>/dev/null || cp requirements.txt requirements_clean.txt
        pip install --quiet -r requirements_clean.txt 2>/dev/null || true
        rm -f requirements_clean.txt
        deactivate
    fi
    
    print_msg "Backend atualizado"
fi

# 4. Atualizar frontend
if [ -d "$SOURCE_DIR/frontend" ]; then
    print_info "Atualizando frontend..."
    
    # Preservar .env
    if [ -f "$APP_DIR/frontend/.env" ]; then
        cp $APP_DIR/frontend/.env /tmp/frontend.env.bak
    fi
    
    # Copiar novos arquivos (exceto .env, node_modules e build)
    rsync -av --exclude='.env' --exclude='node_modules' --exclude='build' \
        "$SOURCE_DIR/frontend/" "$APP_DIR/frontend/"
    
    # Restaurar .env
    if [ -f "/tmp/frontend.env.bak" ]; then
        mv /tmp/frontend.env.bak $APP_DIR/frontend/.env
    fi
    
    # Verificar se package.json mudou (comparar com backup anterior)
    cd $APP_DIR/frontend
    
    print_info "Instalando dependências..."
    yarn install --network-timeout 600000 --silent
    
    print_info "Criando build de produção..."
    yarn build
    
    if [ -d "build" ]; then
        print_msg "Frontend atualizado e build criado"
    else
        print_error "Erro ao criar build"
        exit 1
    fi
fi

# 5. Ajustar permissões
print_info "Ajustando permissões..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/uploads 2>/dev/null || true
chmod -R 775 $APP_DIR/logs 2>/dev/null || true
print_msg "Permissões ajustadas"

# 6. Reiniciar serviços
print_info "Reiniciando serviços..."
systemctl start benigolf-backend
systemctl reload nginx

# Verificar se iniciou
sleep 3
if systemctl is-active --quiet benigolf-backend; then
    print_msg "Backend reiniciado com sucesso"
else
    print_error "Erro ao reiniciar backend"
    journalctl -u benigolf-backend --no-pager -n 10
fi

echo ""
echo "==================================="
echo "   Atualização concluída!"
echo "==================================="
echo ""

# Status final
print_info "Status dos serviços:"
systemctl is-active --quiet mongod && echo -e "  ${GREEN}●${NC} MongoDB: Ativo" || echo -e "  ${RED}●${NC} MongoDB: Inativo"
systemctl is-active --quiet benigolf-backend && echo -e "  ${GREEN}●${NC} Backend: Ativo" || echo -e "  ${RED}●${NC} Backend: Inativo"
systemctl is-active --quiet nginx && echo -e "  ${GREEN}●${NC} Nginx: Ativo" || echo -e "  ${RED}●${NC} Nginx: Inativo"
echo ""
