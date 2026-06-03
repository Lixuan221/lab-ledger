# 免费在线 App：GitHub Pages + Supabase

这是当前最推荐的免费方案：

- GitHub Pages：发布网页
- Supabase：登录、数据库、权限

最终网址类似：

```text
https://lixuan221.github.io/lab-ledger/
```

## 1. 在 Supabase 运行 SQL

进入 Supabase 项目：

```text
SQL Editor -> New query
```

复制并运行本项目里的：

```text
supabase/schema.sql
```

## 2. 获取 Supabase anon / publishable key

进入 Supabase：

```text
Project Settings -> API Keys
```

复制：

```text
anon key
```

或：

```text
publishable key
```

这是公开前端 key，可以放到网页里，不是数据库密码。

## 3. 填入网页配置

打开：

```text
docs/index.html
```

找到：

```javascript
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY_HERE";
```

把引号里的内容替换成你的 anon / publishable key。

## 4. 推送 GitHub

```bash
git add docs/index.html supabase/schema.sql
git commit -m "Add GitHub Pages Supabase app"
git push
```

## 5. 开启 GitHub Pages

打开 GitHub 仓库：

```text
https://github.com/Lixuan221/lab-ledger
```

进入：

```text
Settings -> Pages
```

选择：

```text
Source: Deploy from a branch
Branch: main
Folder: /docs
```

保存。

几分钟后访问：

```text
https://lixuan221.github.io/lab-ledger/
```

## 6. 创建负责人账号

打开网页后，用你的邮箱注册账号。

注册完成后，回到 Supabase：

```text
SQL Editor -> New query
```

运行：

```sql
update public.profiles
set role = 'owner', full_name = '实验室负责人'
where username = '你的邮箱';
```

之后重新登录网页，就能看到“用户管理”。

## 7. 成员注册

学生打开同一个网址，用邮箱和密码注册。

负责人进入“用户管理”，把学生角色改成：

- `member`：实验室成员，可入库、领用、登记设备
- `readonly`：只读成员，只能查看和导出

## 注意

- 不要把 Supabase 数据库密码放到 `docs/index.html`。
- 可以放到网页里的只有 anon / publishable key。
- 真实权限由 Supabase Row Level Security 控制。
