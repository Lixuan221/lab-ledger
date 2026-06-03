# 公网云服务器部署说明

目标：让实验室成员只要联网，就能通过固定网址登录系统。

## 1. 准备云服务器

建议配置：

- Ubuntu 22.04 或 24.04
- 1 核 1G 以上
- 开放安全组端口：`80`、`443`
- 如果临时调试，也可以开放 `8000`，正式使用不需要开放 `8000`

## 2. 准备域名

在域名 DNS 里新增一条 A 记录：

- 主机名：例如 `lab`
- 记录值：云服务器公网 IP

最终访问地址类似：

```text
https://lab.example.com
```

## 3. 安装 Docker

在服务器执行：

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

退出 SSH 后重新登录，让 Docker 用户组生效。

## 4. 上传项目

推荐用 Git，也可以用 `scp` 上传整个项目目录。

如果用 Git：

```bash
git clone <你的仓库地址> lab-ledger
cd lab-ledger
```

如果用 `scp`，上传后进入项目目录即可。

## 5. 创建环境变量

```bash
cp .env.example .env
nano .env
```

修改为真实值：

```text
DOMAIN=lab.example.com
LAB_SECRET_KEY=一串很长的随机字符串
LAB_ADMIN_PASSWORD=负责人初始强密码
LAB_DATA_DIR=/app/data
```

可以用下面命令生成密钥：

```bash
openssl rand -hex 32
```

## 6. 启动

```bash
docker compose up -d --build
```

查看状态：

```bash
docker compose ps
docker compose logs -f
```

Caddy 会自动申请 HTTPS 证书。域名解析生效后，打开：

```text
https://lab.example.com/app/
```

负责人账号：

- 账号：`admin`
- 密码：`.env` 里的 `LAB_ADMIN_PASSWORD`

## 7. 日常维护

停止：

```bash
docker compose down
```

重启：

```bash
docker compose restart
```

更新代码后重新构建：

```bash
docker compose up -d --build
```

## 8. 数据库备份

SQLite 数据库在：

```text
data/lab_ledger.db
```

备份：

```bash
mkdir -p backups
cp data/lab_ledger.db backups/lab_ledger_$(date +%Y%m%d_%H%M%S).db
```

建议定期把 `backups/` 下载到本地或同步到对象存储。

## 9. 重置负责人密码

```bash
docker compose exec app python deploy/reset_admin_password.py
```

如果容器里没有 `deploy/` 目录，使用下面命令：

```bash
docker compose exec app python -c "from backend.database import SessionLocal; from backend.models import User; from backend.auth import get_password_hash; db=SessionLocal(); u=db.query(User).filter(User.username=='admin').first(); u.hashed_password=get_password_hash('新密码'); db.commit(); db.close()"
```

## 10. 安全建议

- 不要使用默认密码。
- 负责人账号只给管理员使用。
- 学生账号在“用户管理”中创建。
- 离职或毕业成员应及时停用账号。
- 服务器安全组只开放 `80` 和 `443`。
- 定期备份 `data/lab_ledger.db`。
