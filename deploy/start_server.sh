#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "正在安装 Docker..."
  sudo apt update
  sudo apt install -y ca-certificates curl
  curl -fsSL https://get.docker.com | sudo sh
fi

if [ ! -f .env ]; then
  read -r -p "请输入你的域名，例如 lab.example.com；如果暂时没有域名，输入服务器公网IP: " DOMAIN
  read -r -s -p "请设置负责人 admin 的初始密码: " ADMIN_PASSWORD
  echo
  SECRET_KEY="$(openssl rand -hex 32)"
  cat > .env <<EOF
DOMAIN=${DOMAIN}
LAB_SECRET_KEY=${SECRET_KEY}
LAB_ADMIN_PASSWORD=${ADMIN_PASSWORD}
LAB_DATA_DIR=/app/data
EOF
fi

mkdir -p data
docker compose up -d --build

echo
echo "启动完成。"
echo "如果你填的是域名，请打开: https://$(grep '^DOMAIN=' .env | cut -d= -f2)/app/"
echo "如果你填的是服务器公网IP，请先用: http://$(grep '^DOMAIN=' .env | cut -d= -f2):8000/app/"
echo "负责人账号: admin"
