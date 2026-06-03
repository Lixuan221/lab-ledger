# 免费部署方案：PythonAnywhere

这个方案不需要你买服务器，也通常不需要绑信用卡。

公网地址会类似：

```text
https://你的用户名.pythonanywhere.com/app/
```

注意：

- 免费账号适合小规模实验室台账。
- 免费账号空间有限。
- 免费 Web App 可能需要定期续期/保持使用。
- 数据默认保存在 PythonAnywhere 文件系统里的 SQLite 数据库。

## 1. 注册 PythonAnywhere

打开：

```text
https://www.pythonanywhere.com/
```

注册免费账号。

## 2. 打开 Bash 控制台

登录后进入：

```text
Consoles -> Bash
```

## 3. 下载项目代码

在 Bash 里执行：

```bash
git clone https://github.com/Lixuan221/lab-ledger.git
cd lab-ledger
```

## 4. 创建虚拟环境

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

如果 `python3.12` 不存在，用：

```bash
python3 -m venv .venv
```

## 5. 设置环境变量

在 Bash 里执行：

```bash
cat > .env.pythonanywhere <<'EOF'
export LAB_SECRET_KEY="请改成一串很长的随机字符"
export LAB_ADMIN_PASSWORD="请改成负责人admin密码"
export LAB_DATA_DIR="/home/你的PythonAnywhere用户名/lab-ledger/data"
EOF
```

把 `你的PythonAnywhere用户名` 换成你的真实用户名。

## 6. 创建 ASGI Web App

PythonAnywhere 的 ASGI 页面目前是实验功能。如果页面上找不到 ASGI 创建入口，可以在账号页面用反馈入口申请开启。

ASGI 启动命令填写类似：

```bash
/home/你的PythonAnywhere用户名/lab-ledger/.venv/bin/uvicorn --app-dir /home/你的PythonAnywhere用户名/lab-ledger --uds ${DOMAIN_SOCKET} backend.main:app
```

环境变量需要在启动命令前加载，可以写成：

```bash
bash -lc 'source /home/你的PythonAnywhere用户名/lab-ledger/.env.pythonanywhere && /home/你的PythonAnywhere用户名/lab-ledger/.venv/bin/uvicorn --app-dir /home/你的PythonAnywhere用户名/lab-ledger --uds ${DOMAIN_SOCKET} backend.main:app'
```

## 7. 访问

部署完成后打开：

```text
https://你的PythonAnywhere用户名.pythonanywhere.com/app/
```

负责人账号：

```text
admin
```

密码：

```text
你在 LAB_ADMIN_PASSWORD 里设置的密码
```

## 8. 数据位置

SQLite 数据库会在：

```text
/home/你的PythonAnywhere用户名/lab-ledger/data/lab_ledger.db
```

建议定期下载这个文件备份。
