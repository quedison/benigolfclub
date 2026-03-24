#!/bin/bash

#############################################
# Beni Golf Club - Alterar Senha do Admin
# Uso: sudo ./change_password.sh
#############################################

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_msg() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "========================================"
echo "  Beni Golf Club - Alterar Senha Admin"
echo "========================================"
echo ""

# Solicitar email do admin
read -p "Email do admin [admin@benigolfhotel.lu]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@benigolfhotel.lu}

# Solicitar nova senha
while true; do
    read -s -p "Nova senha (mínimo 6 caracteres): " NEW_PASSWORD
    echo ""
    
    if [ ${#NEW_PASSWORD} -lt 6 ]; then
        print_error "Senha deve ter no mínimo 6 caracteres"
        continue
    fi
    
    read -s -p "Confirme a nova senha: " CONFIRM_PASSWORD
    echo ""
    
    if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
        print_error "As senhas não coincidem"
        continue
    fi
    
    break
done

# Criar script Python para gerar hash e atualizar
python3 << EOF
import bcrypt
from pymongo import MongoClient

# Configurações
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "benigolfclub"
ADMIN_EMAIL = "$ADMIN_EMAIL"
NEW_PASSWORD = "$NEW_PASSWORD"

# Conectar ao MongoDB
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Verificar se usuário existe
user = db.users.find_one({"email": ADMIN_EMAIL})
if not user:
    print(f"ERRO: Usuário {ADMIN_EMAIL} não encontrado")
    exit(1)

# Gerar hash da nova senha
password_hash = bcrypt.hashpw(NEW_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Atualizar senha
result = db.users.update_one(
    {"email": ADMIN_EMAIL},
    {"\$set": {"password": password_hash}}
)

if result.modified_count > 0:
    print(f"OK: Senha alterada com sucesso para {ADMIN_EMAIL}")
else:
    print("AVISO: Nenhuma alteração feita")

client.close()
EOF

if [ $? -eq 0 ]; then
    echo ""
    print_msg "Senha alterada com sucesso!"
    echo ""
    echo "Acesse o admin com:"
    echo "  Email: $ADMIN_EMAIL"
    echo "  Senha: (a nova senha que você definiu)"
    echo ""
else
    print_error "Erro ao alterar senha"
fi
