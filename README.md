# 🌱 Eco Self-Control

一个支持用户注册登录的个人任务管理网站，帮助提升自控力并为山区儿童捐赠图书。

## 🌐 在线访问

### GitHub Pages 部署
网站已部署在GitHub Pages上，可直接访问：
- **网站地址**: `https://你的用户名.github.io/你的仓库名/`
- **主要页面**:
  - 首页: `/index.html`
  - 关于: `/about.html`
  - 登录: `/login.html`
  - 任务管理: `/calendar.html`

## 🛠️ 本地运行

### 方法1: 使用Python服务器
```bash
# 在项目目录下运行
python3 -m http.server 8000

# 访问 http://localhost:8000
```

### 方法2: 使用Node.js服务器
```bash
# 安装依赖
npm install

# 运行服务器
npm start

# 访问 http://localhost:3000
```

## 🎯 功能特性

- ✅ **用户系统**: 注册、登录、数据隔离
- ✅ **任务管理**: 个人todo list
- ✅ **进度跟踪**: 连续完成天数统计
- ✅ **公益目标**: 完成任务为山区儿童捐赠图书
- ✅ **响应式设计**: 支持各种设备

## 📱 使用说明

1. **注册账户**: 首次使用需要注册
2. **登录系统**: 使用邮箱和密码登录
3. **管理任务**: 添加和完成每日任务
4. **查看进度**: 跟踪完成情况和捐赠图书数量

## 🔧 GitHub Codespaces

如果需要在线开发和调试：
1. 点击仓库页面的 "Code" 按钮
2. 选择 "Create codespace on main"
3. 等待环境加载完成
4. 在终端运行 `python3 -m http.server 8000`
5. 点击弹出的端口转发链接预览网站

## 🚀 部署说明

项目已配置自动部署到GitHub Pages：
- 推送到main分支会自动触发部署
- 图片和资源文件会正确加载
- 支持自定义域名

## 📄 项目结构

```
├── index.html          # 首页
├── about.html          # 关于页面
├── login.html          # 登录/注册页面
├── calendar.html       # 任务管理页面
├── images/             # 图片资源
├── css/                # 样式文件
├── js/                 # JavaScript文件
├── .gitattributes      # Git属性配置
├── .gitignore          # Git忽略规则
└── README.md           # 项目说明
``` 