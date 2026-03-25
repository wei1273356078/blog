# CI/CD 配置说明

本项目同时支持 **GitHub Actions** 和 **Gitee Go** 两种 CI/CD 流水线。

---

## GitHub Actions

### 部署流程

本项目配置了两个部署目标：

### 1. GitHub Pages（自动部署）
- **触发条件**: 推送到 `master` 分支时自动触发
- **部署目标**: `https://<username>.github.io/<repo>/`
- **无需配置**: 自动使用 GitHub 的 Pages 服务

### 2. 自己的服务器（手动部署）
- **触发条件**: 在 GitHub Actions 选项卡手动运行工作流，选择 "是否部署到自己的服务器" 为 `true`
- **部署目标**: 你的 Linux 服务器

## GitHub 配置步骤

### 第一步：在 GitHub 仓库添加 Secrets → Settings → Secrets and variables → Actions → New repository secret

需要添加以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SERVER_HOST` | 服务器 IP 地址或域名 | `123.456.789.0` 或 `your-domain.com` |
| `SERVER_USER` | SSH 登录用户名 | `root` 或 `ubuntu` |
| `SERVER_PASSWORD` | SSH 登录密码 | `your-password` |
| `SERVER_PORT` | SSH 端口（可选，默认 22） | `22` |
| `SERVER_DEPLOY_PATH` | 服务器上部署路径 | `/var/www/html/blog` 或 `/home/user/blog` |

**⚠️ 安全提示**：
- 建议使用专门用于部署的用户，而不是 root
- 密码会被加密存储，但建议后续改用 SSH 密钥对

### 第二步：配置服务器

1. **安装必要工具**（如果没有）：
```bash
sudo apt update
sudo apt install -y nginx
```

2. **创建部署目录并设置权限**：
```bash
# 以 root 用户执行
sudo mkdir -p /var/www/html/blog
sudo chown -R your-username:your-username /var/www/html/blog
chmod -R 755 /var/www/html/blog
```

3. **配置 Nginx**（可选）：
```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/blog

# 添加以下内容
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    root /var/www/html/blog;
    index index.html;

    # 支持 VitePress 的 base 路径（如 /blog/）
    location /blog/ {
        alias /var/www/html/blog/;
        try_files $uri $uri/ /blog/index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 第三步：手动部署

1. 进入 GitHub 仓库 → Actions 标签页
2. 选择 `Deploy` 工作流
3. 点击 `Run workflow`
4. 在 "是否部署到自己的服务器" 选项中选择 `true`
5. 点击 `Run workflow` 按钮

## 工作流程说明

### 推送到 master 分支（自动部署）
```
推送代码 → 触发 CI → 构建项目 → 部署到 GitHub Pages ✅
```

### 手动触发部署到服务器
```
手动运行工作流 → 选择部署到服务器 → 构建项目 → 上传到服务器 ✅
```

### 备份机制
服务器部署时：
- 自动备份现有文件为 `backup_YYYYMMDD_HHMMSS.tar.gz`
- 只保留最近 5 个备份，旧的会自动删除

## 高级配置（可选）

### 改用 SSH 密钥对（更安全）

1. **在本地生成密钥对**：
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy_key
```

2. **将公钥添加到服务器**：
```bash
ssh-copy-id -i ~/.ssh/github_deploy_key.pub user@your-server
# 或手动复制到服务器 ~/.ssh/authorized_keys
```

3. **在 GitHub Secrets 中添加**：
- `SERVER_SSH_KEY`: 私钥内容（~/.ssh/github_deploy_key 的内容）
- `SERVER_PASSWORD`: 删除这个 secret

4. **修改 workflow 中的 SSH 配置**：
```yaml
- name: Deploy to server via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SERVER_SSH_KEY }}
    port: ${{ secrets.SERVER_PORT || 22 }}
```

### 添加 HTTPS（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 故障排查

### 部署失败
1. 检查 GitHub Actions 日志
2. 确认所有 Secrets 已正确配置
3. 验证服务器 SSH 连接：`ssh user@server`

### 页面 404
1. 检查 `SERVER_DEPLOY_PATH` 是否正确
2. 确认 Nginx 配置的 root 路径正确
3. 重启 Nginx：`sudo systemctl restart nginx`

### 路径问题
如果你的网站部署在子路径（如 `https://domain.com/blog/`），确保：
1. VitePress 配置中 `base: '/blog/'` 已设置
2. Nginx 配置中 `location /blog/` 已正确配置

---

## Gitee Go

### 部署流程

推送代码到 `master` 分支时自动触发流水线，依次执行：

```
构建 → 部署到 Gitee Pages（自动） + 部署到服务器（手动）
```

- **配置文件**: `.gitee/pipelines/VitePress-Blog.yml`
- **触发条件**: 推送到 `master` 分支时自动触发
- **部署目标**: Gitee Pages

### 配置步骤

#### 第一步：开通 Gitee Go

1. 进入 Gitee 仓库 → 点击 **「流水线」** 标签页
2. 按照提示开通 Gitee Go 服务

#### 第二步：配置主机（用于服务器部署）

1. 进入 Gitee 仓库 → **「流水线」** → **「主机管理」**
2. 点击 **「添加主机」**，填入服务器信息：
   - 主机名称：自定义（如 `blog-server`）
   - 主机 IP：你的服务器 IP 或域名
   - 端口：SSH 端口（默认 22）
   - 认证方式：密码或 SSH 密钥
3. 创建后记录 **主机组 ID** 和 **主机 ID**，填入 `.gitee/pipelines/VitePress-Blog.yml` 中的 `hostGroupID` 和 `hostID` 字段

#### 第三步：配置环境变量

1. 进入 Gitee 仓库 → **「流水线」** → **「流水线设置」** → **「变量管理」**
2. 添加以下变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SERVER_DEPLOY_PATH` | 服务器上部署路径 | `/var/www/html/blog` |

> **注意**：服务器连接信息（IP、端口、密码）在添加主机时已配置，无需再作为环境变量。`SERVER_DEPLOY_PATH` 如未配置，默认使用 `/var/www/html/blog`。

#### 第四步：配置 Gitee Pages

1. 进入 Gitee 仓库 → **「服务」** → **「Gitee Pages」**
2. 部署目录选择 `/` 或根据提示配置
3. 确认 Pages 服务已开启

### 备份机制

服务器部署时：
- 自动备份现有文件为 `backup_YYYYMMDD_HHMMSS.tar.gz`
- 只保留最近 5 个备份，旧的会自动删除

### 故障排查

#### Gitee Go 构建失败
1. 检查流水线日志，查看构建阶段的错误输出
2. 确认 Node.js 版本为 22（流水线已配置）
3. 确认 `npm run docs:build` 可正常执行

#### 服务器部署失败
1. 检查主机管理中的连接信息是否正确
2. 确认 `SERVER_DEPLOY_PATH` 路径存在且有写入权限
3. 确认 `hostGroupID` 和 `hostID` 已正确填入 YAML 文件

#### Gitee Pages 未更新
1. 检查流水线是否成功完成
2. 进入 Gitee Pages 页面确认部署目录配置
3. Gitee Pages 可能需要几分钟后生效
