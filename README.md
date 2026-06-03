# 实验室资产与耗材共享台账系统

技术栈：React + FastAPI + SQLite。

## 功能

- 账号密码登录
- 角色权限：实验室负责人、实验室成员、只读成员
- 首页统一搜索
- 耗材库存管理
- 设备台账管理
- 耗材入库、领用
- 历史记录
- Excel 导出
- 用户管理

## 默认账号

- 账号：`admin`
- 密码：`admin123`
- 角色：实验室负责人

首次启动后端时会自动创建该账号。

## 后端启动

```bash
cd /Users/woshiyishuguang/Documents/实验室共享平台系统
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

SQLite 数据库文件会生成在项目根目录：`lab_ledger.db`。

## 前端启动

```bash
cd /Users/woshiyishuguang/Documents/实验室共享平台系统
npm install
npm run dev
```

浏览器打开 Vite 输出的地址，通常是 `http://localhost:5173`。

## 权限说明

- 实验室负责人：可管理耗材、设备、入库、领用、用户、导出 Excel。
- 实验室成员：可管理耗材、设备、入库、领用、导出 Excel。
- 只读成员：可查看首页、库存、设备、历史记录，可导出 Excel，不能写入。

## API 文档

后端启动后访问：

- `http://localhost:8000/docs`

## 公网部署

如果需要“只要联网即可访问”的固定网址，请看 `DEPLOY.md`。

如果不想看复杂说明，请看 `SIMPLE_DEPLOY.md`。

如果想通过 GitHub + Render 托管平台发布公网网址，请看 `RENDER_DEPLOY.md`。

如果想尽量不缴费，请看 `FREE_DEPLOY.md`。

如果 Render 要求绑卡，请改用 `VERCEL_DEPLOY.md`。
*** Add File: .gitignore
.venv/
node_modules/
dist/
__pycache__/
*.pyc
lab_ledger.db
.DS_Store
