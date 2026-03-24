# Beni Golf Club - Guia Completo de Instalação

## Informações do Projeto
- **Domínio:** benigolfclub.com
- **Sistema:** Ubuntu 24.04 LTS
- **Stack:** React (Frontend) + FastAPI (Backend) + MongoDB

---

## Requisitos do Servidor

### Mínimos Recomendados
- **CPU:** 2 vCPUs
- **RAM:** 4GB
- **Disco:** 20GB SSD
- **Sistema:** Ubuntu 24.04 LTS (64-bit)
- **Acesso:** Root ou sudo

### Portas Necessárias
| Porta | Serviço | Descrição |
|-------|---------|-----------|
| 22 | SSH | Acesso remoto |
| 80 | HTTP | Validação SSL |
| 443 | HTTPS | Tráfego web |
| 27017 | MongoDB | Banco de dados (apenas local) |
| 8001 | Backend | API (apenas local) |

---

## Instalação Automática (Recomendado)

### Passo 1: Preparar o Servidor

```bash
# Conectar ao servidor via SSH
ssh root@SEU_IP_DO_SERVIDOR

# Criar diretório para o projeto
mkdir -p /tmp/benigolf && cd /tmp/benigolf
```

### Passo 2: Transferir o Projeto

**Opção A - Via SCP (do seu computador):**
```bash
# Execute no seu computador local
scp beni-golf-hotel-site.zip root@SEU_IP:/tmp/benigolf/
```

**Opção B - Via SFTP/FileZilla:**
- Conecte ao servidor
- Faça upload do arquivo .zip para `/tmp/benigolf/`

### Passo 3: Extrair e Instalar

```bash
# No servidor
cd /tmp/benigolf

# Instalar unzip se necessário
apt update && apt install -y unzip

# Extrair o projeto
unzip beni-golf-hotel-site.zip

# Entrar no diretório extraído (ajuste o nome se necessário)
cd beni-golf-hotel-site

# Dar permissão de execução ao script
chmod +x scripts/install.sh

# Executar instalação
sudo ./scripts/install.sh
```

### Passo 4: Configurar DNS

No painel do seu provedor de domínio (ex: Cloudflare, GoDaddy, Namecheap):

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | SEU_IP_IPV4 | Auto |
| A | www | SEU_IP_IPV4 | Auto |
| AAAA | @ | SEU_IP_IPV6 (opcional) | Auto |

**Verificar propagação:**
```bash
dig benigolfclub.com +short
# Deve retornar o IP do servidor
```

### Passo 5: Configurar SSL (após DNS propagado)

```bash
sudo certbot --nginx -d benigolfclub.com -d www.benigolfclub.com

# Seguir as instruções e fornecer um email válido
# Aceitar os termos de serviço
```

**Renovação automática (já configurada):**
```bash
# Testar renovação
sudo certbot renew --dry-run
```

---

## Instalação Manual

Se preferir instalar passo a passo, siga estas instruções:

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20 LTS
```bash
# Adicionar repositório NodeSource
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt update
apt install -y nodejs
npm install -g yarn
```

### 3. Instalar Python 3
```bash
sudo apt install -y python3 python3-pip python3-venv python3-dev
```

### 4. Instalar MongoDB 7.0
```bash
# Adicionar chave GPG
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Adicionar repositório (Ubuntu 24.04 usa jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar
apt update
apt install -y mongodb-org

# Iniciar e habilitar
systemctl start mongod
systemctl enable mongod
```

### 5. Instalar Nginx
```bash
apt install -y nginx
systemctl enable nginx
```

### 6. Configurar Backend
```bash
# Criar diretório
mkdir -p /var/www/benigolfclub/backend
cp -r backend/* /var/www/benigolfclub/backend/

# Criar ambiente virtual
cd /var/www/benigolfclub/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Criar .env
cat > /var/www/benigolfclub/backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=benigolfclub
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGINS=https://benigolfclub.com,https://www.benigolfclub.com
UPLOAD_DIR=/var/www/benigolfclub/uploads
EOF
```

### 7. Configurar Frontend
```bash
mkdir -p /var/www/benigolfclub/frontend
cp -r frontend/* /var/www/benigolfclub/frontend/

# Criar .env
cat > /var/www/benigolfclub/frontend/.env << EOF
REACT_APP_BACKEND_URL=https://benigolfclub.com
GENERATE_SOURCEMAP=false
EOF

# Build
cd /var/www/benigolfclub/frontend
yarn install
yarn build
```

### 8. Criar Serviço Systemd
```bash
cat > /etc/systemd/system/benigolf-backend.service << 'EOF'
[Unit]
Description=Beni Golf Club Backend API
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/benigolfclub/backend
Environment="PATH=/var/www/benigolfclub/backend/venv/bin:/usr/local/bin:/usr/bin"
EnvironmentFile=/var/www/benigolfclub/backend/.env
ExecStart=/var/www/benigolfclub/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable benigolf-backend
systemctl start benigolf-backend
```

### 9. Configurar Nginx
```bash
cat > /etc/nginx/sites-available/benigolfclub << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name benigolfclub.com www.benigolfclub.com;

    root /var/www/benigolfclub/frontend/build;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    location /uploads {
        alias /var/www/benigolfclub/uploads;
        expires 30d;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/benigolfclub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 10. Configurar Permissões
```bash
mkdir -p /var/www/benigolfclub/uploads
mkdir -p /var/www/benigolfclub/logs
chown -R www-data:www-data /var/www/benigolfclub
chmod -R 755 /var/www/benigolfclub
chmod -R 775 /var/www/benigolfclub/uploads
```

### 11. Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 12. SSL com Certbot
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d benigolfclub.com -d www.benigolfclub.com
```

---

## Acesso ao Sistema

### Site Público
- **URL:** https://benigolfclub.com

### Painel Administrativo
- **URL:** https://benigolfclub.com/admin/login
- **Email:** admin@benigolfhotel.lu
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha do admin imediatamente após o primeiro acesso!

---

## Comandos Úteis

### Status dos Serviços
```bash
# Verificar todos os serviços
sudo systemctl status benigolf-backend nginx mongod

# Verificar apenas o backend
sudo systemctl status benigolf-backend
```

### Logs
```bash
# Logs do backend em tempo real
sudo journalctl -u benigolf-backend -f

# Logs do arquivo
sudo tail -f /var/www/benigolfclub/logs/backend.log

# Logs do Nginx
sudo tail -f /var/www/benigolfclub/logs/nginx_error.log
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar Serviços
```bash
# Reiniciar backend
sudo systemctl restart benigolf-backend

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Verificar Portas
```bash
sudo netstat -tlnp | grep -E '(8001|80|443|27017)'
# ou
sudo ss -tlnp | grep -E '(8001|80|443|27017)'
```

### Backup Manual
```bash
# Executar script de backup
sudo /var/www/benigolfclub/../scripts/backup.sh

# Ou manualmente
mongodump --db benigolfclub --out /backup/$(date +%Y%m%d)
```

---

## Solução de Problemas

### Backend não inicia
```bash
# Verificar logs
sudo journalctl -u benigolf-backend -n 50

# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Testar manualmente
cd /var/www/benigolfclub/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Erro 502 Bad Gateway
```bash
# Backend pode estar offline
sudo systemctl restart benigolf-backend

# Verificar se porta está ativa
curl http://localhost:8001/api/health
```

### Permissões de Upload
```bash
sudo chown -R www-data:www-data /var/www/benigolfclub/uploads
sudo chmod -R 775 /var/www/benigolfclub/uploads
```

### Renovar Certificado SSL
```bash
# Renovação automática (via cron)
sudo certbot renew

# Forçar renovação
sudo certbot renew --force-renewal
```

---

## Estrutura de Arquivos

```
/var/www/benigolfclub/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── .env               # Configurações do backend
│   ├── venv/              # Ambiente virtual Python
│   └── requirements.txt
├── frontend/
│   ├── build/             # Arquivos compilados (produção)
│   ├── src/               # Código fonte React
│   ├── .env               # Configurações do frontend
│   └── package.json
├── uploads/               # Arquivos enviados pelos usuários
└── logs/
    ├── backend.log
    ├── backend_error.log
    ├── nginx_access.log
    └── nginx_error.log
```

---

## Suporte

Em caso de problemas:
1. Verifique os logs conforme instruções acima
2. Confirme que todos os serviços estão ativos
3. Verifique conectividade de rede e DNS
4. Confirme que as portas estão abertas no firewall
