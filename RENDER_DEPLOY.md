# GitHub + Render 部署说明

这个方案不需要你自己买服务器。

流程是：

```text
上传到 GitHub 私有仓库 -> Render 连接 GitHub -> 自动生成公网网址
```

## 1. 创建 GitHub 私有仓库

打开 GitHub，创建一个 Private 仓库，例如：

```text
lab-ledger
```

不要勾选自动生成 README。

## 2. 上传代码

在本项目目录执行：

```bash
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

如果当前分支不是 `main`：

```bash
git branch -M main
git push -u origin main
```

## 3. 在 Render 部署

打开 Render，选择：

```text
New -> Blueprint
```

连接你的 GitHub 仓库。

Render 会读取项目里的 `render.yaml`，自动创建服务。

## 4. 设置管理员密码

Render 部署时会要求填写：

```text
LAB_ADMIN_PASSWORD
```

这个就是负责人账号 `admin` 的初始密码。

## 5. 登录

部署完成后，Render 会给你一个网址，例如：

```text
https://lab-ledger.onrender.com
```

登录页面是：

```text
https://lab-ledger.onrender.com/app/
```

账号：

```text
admin
```

密码：

```text
你在 Render 里设置的 LAB_ADMIN_PASSWORD
```

## 注意

- Render 的持久磁盘需要付费服务，免费服务不适合保存 SQLite 数据。
- 如果不用持久磁盘，重启或重新部署后数据可能丢失。
