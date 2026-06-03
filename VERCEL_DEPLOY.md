# 免费部署方案：Vercel + Supabase

这个方案通常不需要绑信用卡。

组合：

- Vercel：免费托管在线 App
- Supabase：免费 Postgres 数据库

## 1. 确认 Supabase 数据库连接字符串

你已经拿到了类似这样的字符串：

```text
postgresql://postgres:你的数据库密码@db.ashhlhsileqqaardojqu.supabase.co:5432/postgres?sslmode=require
```

注意最后要加：

```text
?sslmode=require
```

## 2. 打开 Vercel

访问：

```text
https://vercel.com/new
```

用 GitHub 登录。

## 3. 导入 GitHub 仓库

选择：

```text
Lixuan221/lab-ledger
```

## 4. 填环境变量

在 Environment Variables 填：

```text
LAB_DATABASE_URL=postgresql://postgres:你的数据库密码@db.ashhlhsileqqaardojqu.supabase.co:5432/postgres?sslmode=require
LAB_ADMIN_PASSWORD=负责人 admin 的初始密码
LAB_SECRET_KEY=一串很长的随机字符串
```

`LAB_SECRET_KEY` 可以用任意长随机字符串，例如 32 位以上。

## 5. 部署

点击 Deploy。

部署完成后，Vercel 会给你一个网址，例如：

```text
https://lab-ledger.vercel.app
```

登录页面：

```text
https://lab-ledger.vercel.app/app/
```

负责人账号：

```text
admin
```

密码：

```text
你设置的 LAB_ADMIN_PASSWORD
```
