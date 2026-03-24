#!/bin/bash

#############################################
# Beni Golf Club - Script de Backup
# Uso: sudo ./backup.sh [diretorio_destino]
#############################################

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configurações
APP_DIR="/var/www/benigolfclub"
BACKUP_DIR="${1:-/backup/benigolfclub}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
DB_NAME="benigolfclub"

print_msg() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "==================================="
echo "   Beni Golf Club - Backup"
echo "   Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==================================="
echo ""

# Criar diretório de backup
mkdir -p $BACKUP_DIR
TEMP_DIR="$BACKUP_DIR/temp_$DATE"
mkdir -p $TEMP_DIR

# 1. Backup do MongoDB
echo "Fazendo backup do MongoDB..."
if command -v mongodump &> /dev/null; then
    mongodump --db $DB_NAME --out $TEMP_DIR/db 2>/dev/null
    if [ $? -eq 0 ]; then
        print_msg "Banco de dados exportado"
    else
        print_warn "Erro ao exportar banco de dados"
    fi
else
    print_warn "mongodump não encontrado - pulando backup do DB"
fi

# 2. Backup das configurações
echo "Fazendo backup das configurações..."
mkdir -p $TEMP_DIR/config

if [ -f "$APP_DIR/backend/.env" ]; then
    cp $APP_DIR/backend/.env $TEMP_DIR/config/backend.env
fi

if [ -f "$APP_DIR/frontend/.env" ]; then
    cp $APP_DIR/frontend/.env $TEMP_DIR/config/frontend.env
fi

if [ -f "/etc/nginx/sites-available/benigolfclub" ]; then
    cp /etc/nginx/sites-available/benigolfclub $TEMP_DIR/config/nginx.conf
fi

if [ -f "/etc/systemd/system/benigolf-backend.service" ]; then
    cp /etc/systemd/system/benigolf-backend.service $TEMP_DIR/config/
fi

print_msg "Configurações salvas"

# 3. Backup dos uploads (se existir)
if [ -d "$APP_DIR/uploads" ] && [ "$(ls -A $APP_DIR/uploads 2>/dev/null)" ]; then
    echo "Fazendo backup dos uploads..."
    cp -r $APP_DIR/uploads $TEMP_DIR/
    print_msg "Uploads salvos"
fi

# 4. Compactar
echo "Compactando backup..."
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"
cd $BACKUP_DIR
tar -czf $BACKUP_FILE -C $TEMP_DIR .
rm -rf $TEMP_DIR

# Calcular tamanho
SIZE=$(du -h $BACKUP_FILE | cut -f1)
print_msg "Backup criado: $BACKUP_FILE ($SIZE)"

# 5. Limpar backups antigos
echo "Verificando backups antigos..."
OLD_COUNT=$(find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS | wc -l)
if [ $OLD_COUNT -gt 0 ]; then
    find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    print_msg "Removidos $OLD_COUNT backups antigos (>${RETENTION_DAYS} dias)"
fi

# 6. Listar backups existentes
echo ""
echo "Backups disponíveis:"
ls -lh $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "==================================="
echo "   Backup concluído!"
echo "==================================="
echo ""
echo "Para restaurar:"
echo "  tar -xzf $BACKUP_FILE -C /tmp/restore"
echo "  mongorestore --db $DB_NAME /tmp/restore/db/$DB_NAME"
echo ""
