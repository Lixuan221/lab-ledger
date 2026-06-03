# 免费部署方案：Render + Supabase

这个方案不用买服务器，也不需要给 Render 挂付费磁盘。

组合：

- Render 免费 Web Service：运行网页和 FastAPI 后端
- Supabase 免费 Postgres：保存台账数据

限制：

- Render 免费服务空闲后会休眠，第一次打开可能慢。
- Supabase 免费项目长期不用会暂停，重新打开 Supabase 后可以恢复。
- 免费额度适合实验室小规模台账，不适合高并发正式生产系统。

## 1. 创建 Supabase 免费数据库

1. 打开 [Supabase](https://supabase.com/)。
2. 注册/登录。
3. 创建 New Project。
4. 选择 Free plan。
5. 设置数据库密码。
6. 项目创建完成后，进入：

```text
Project Settings -> Database -> Connection string
```

复制连接字符串，格式类似：

```text
postgresql://postgres.xxxxxx:你的密码@aws-xxx.pooler.supabase.com:6543/postgres
```

把其中 `[YOUR-PASSWORD]` 替换成你创建项目时设置的数据库密码。

## 2. 在 Render 部署

1. 打开 [Render Blueprint 新建页面](https://dashboard.render.com/blueprints/new)。
2. 连接 GitHub。
3. 选择仓库：

```text
Lixuan221/lab-ledger
```

4. Render 会读取 `render.yaml`。
5. 填环境变量：

```text
LAB_DATABASE_URL=你从 Supabase 复制的连接字符串
LAB_ADMIN_PASSWORD=负责人 admin 的初始密码
```

`LAB_SECRET_KEY` 会自动生成。

## 3. 登录

部署完成后，Render 会给你一个公网网址，例如：

```text
https://lab-ledger.onrender.com
```

登录页面：

```text
https://lab-ledger.onrender.com/app/
```

负责人账号：

```text
admin
```

密码：

```text
你在 Render 里填写的 LAB_ADMIN_PASSWORD
```
