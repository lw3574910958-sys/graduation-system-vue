# 高校毕业设计管理系统 - 前端

<div align="center">

[![Vue](https://img.shields.io/badge/Vue-3.5.25-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-purple.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.12.0-409eff.svg)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

基于 Vue 3 + TypeScript + Vite 的高校毕业设计管理系统前端应用

</div>

## 📖 项目简介

高校毕业设计管理系统前端应用，采用 Vue 3 Composition API + TypeScript 严格模式开发，Element Plus UI 组件库，实现题目浏览、选题申请、文档上传、成绩查询等功能。系统支持 4 种角色（系统管理员、院系管理员、教师、学生），提供完整的毕业设计流程管理界面。

### ✨ 核心特性

- 🎨 **现代化 UI**: Element Plus 组件库，响应式布局，适配多端
- 🔧 **工程化**: TypeScript 严格模式 + Vite 构建 + ESLint + Prettier
-  **高性能**: 路由懒加载、组件按需引入、虚拟滚动、大数字精度处理
-  **组件复用**: BaseList/BaseAddOrUpdate 通用组件，配置化开发效率提升 60%+
- 🔐 **安全可靠**: JWT Token 自动管理、路由守卫权限控制、XSS 防护
- 📄 **文件处理**: PDF/Word/Excel 在线预览、拖拽上传、进度显示
- 📊 **数据可视化**: ECharts 图表展示，仪表盘数据统计

## 🛠️ 技术栈

### 核心框架
- **Vue**: 3.5.25 (Composition API)
- **TypeScript**: 5.9.0 (严格模式)
- **Vite**: 7.2.4 (构建工具)

### UI 组件
- **Element Plus**: 2.12.0 (UI 组件库)
- **@element-plus/icons-vue**: 2.3.2 (图标库)

### 状态管理 & 路由
- **Pinia**: 3.0.4 (Vue 3 官方推荐状态管理)
- **Vue Router**: 4.6.3 (路由管理)

### HTTP 通信
- **Axios**: 1.13.2 (HTTP 客户端)
  - 自定义拦截器
  - Token 自动注入和刷新
  - 大数字精度处理

### 文件处理
- **pdfjs-dist**: 5.3.4 (PDF 渲染)
- **mammoth**: 1.9.1 (Word 文档解析)
- **DOMPurify**: 3.3.1 (XSS 防护)

### 数据可视化
- **ECharts**: 6.0.0 (图表库)

### 工具库
- **Lodash-es**: 4.17.22 (工具函数)
- **Day.js**: 1.11.19 (日期处理)
- **@stomp/stompjs**: 7.3.0 (WebSocket 客户端)

### 样式
- **Less**: 4.4.2 (CSS 预处理器)
- **Sass Embedded**: 1.98.0

### 开发工具
- **Prettier**: 3.6.2 (代码格式化)
- **ESLint**: 代码检查
- **vue-tsc**: 3.1.5 (TypeScript 类型检查)
- **Happy DOM**: 20.5.0 (测试环境)

## 📁 项目结构

```
graduation-system-vue/
├── public/                    # 静态资源
├── src/
│   ├── api/                   # API 接口定义
│   │   ├── auth/              # 认证相关接口
│   │   ├── user/              # 用户管理接口
│   │   ├── topic/             # 题目管理接口
│   │   ├── selection/         # 选题管理接口
│   │   ├── document/          # 文档管理接口
│   │   ├── grade/             # 成绩管理接口
│   │   └── notice/            # 公告管理接口
│   ├── assets/                # 资源文件 (图片、样式等)
│   ├── components/            # 通用组件
│   │   ├── layout/            # 布局组件 (Header/Sidebar/Main)
│   │   ├── BaseList.vue       # 通用列表组件
│   │   ├── BaseAddOrUpdate.vue # 通用表单组件
│   │   ├── FileUpload.vue     # 文件上传组件
│   │   ├── FilePreview.vue    # 文件预览组件
│   │   ├── StatusTag.vue      # 状态标签组件
│   │   └── EllipsisText.vue   # 文本省略组件
│   ├── enums/                 # 枚举定义 (与后端同步)
│   ├── router/                # 路由配置
│   ├── stores/                # Pinia 状态管理
│   │   ├── modules/           # 模块状态 (auth/user/topic 等)
│   │   └── index.ts           # Store 入口
│   ├── types/                 # TypeScript 类型定义
│   │   └── api/               # API 类型定义
│   ├── utils/                 # 工具函数
│   │   ├── request.ts         # Axios 封装
│   │   ├── storage.ts         # 存储工具
│   │   ├── tokenManager.ts    # Token 管理器
│   │   ├── formValidator.ts   # 表单验证器
│   │   ├── dataValidator.ts   # 数据验证器
│   │   └── webSocketService.ts # WebSocket 服务
│   ├── views/                 # 页面视图
│   │   ├── auth/              # 登录/注册页面
│   │   ├── dashboard/         # 仪表盘
│   │   ├── user/              # 用户管理
│   │   ├── topic/             # 题目管理
│   │   ├── selection/         # 选题管理
│   │   ├── document/          # 文档管理
│   │   └── grade/             # 成绩管理
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── .env.development           # 开发环境配置
├── .env.production            # 生产环境配置
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目依赖
```

## 🚀 快速开始

### 环境要求

- **Node.js**: ^20.19.0 或 >=22.12.0
- **pnpm**: 8+ (推荐使用 pnpm)

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/lw3574910958-sys/graduation-system-vue.git
cd graduation-system-vue
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 配置环境变量

编辑 `.env.development`:

```env
NODE_ENV=development
VITE_APP_TITLE='高校毕业设计管理系统 (dev)'
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_WS_BASE_URL=ws://127.0.0.1:8080
```

生产环境编辑 `.env.production`:

```env
NODE_ENV=production
VITE_APP_TITLE='高校毕业设计管理系统'
VITE_API_BASE_URL=https://api.graduation-system.edu.cn
```

#### 4. 启动开发服务器

```bash
pnpm dev
```

访问: http://localhost:5173

#### 5. 构建生产版本

```bash
# 类型检查 + 构建
pnpm build

# 仅构建
pnpm build-only

# 预览生产版本
pnpm preview
```

构建产物位于 `dist/` 目录

## 🔧 开发指南

### 代码规范

- TypeScript 严格模式 (strict: true)
- ESLint + Prettier 自动格式化
- 组件命名: PascalCase (BaseList.vue)
- 文件命名: camelCase (request.ts)
- 变量命名: camelCase

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/` 配置路由
3. 在 `src/api/` 定义接口
4. 在 `src/types/api/` 定义类型

示例:

```typescript
// src/router/index.ts
{
  path: '/example',
  name: 'Example',
  component: () => import('@/views/example/Index.vue'),
  meta: { title: '示例页面', roles: ['admin'] }
}
```

### 使用通用组件

#### BaseList 列表组件

```vue
<template>
  <BaseList
    :getListApi="getTopicList"
    :searchFields="searchFields"
    :tableColumns="tableColumns"
    showAddButton
    @add="handleAdd"
  />
</template>

<script setup lang="ts">
import BaseList from '@/components/BaseList.vue'
import { getTopicList } from '@/api/topic'

const searchFields = [
  { prop: 'title', label: '题目名称', type: 'input' },
  { prop: 'status', label: '状态', type: 'select', options: [...] }
]

const tableColumns = [
  { prop: 'title', label: '题目名称', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100, render: (row) => h(StatusTag, { status: row.status }) }
]
</script>
```

#### BaseAddOrUpdate 表单组件

```vue
<template>
  <BaseAddOrUpdate
    ref="formRef"
    :formFields="formFields"
    :formRules="formRules"
    :getDetailApi="getTopicDetail"
    :createApi="createTopic"
    :updateApi="updateTopic"
    @success="handleSuccess"
  />
</template>
```

### HTTP 请求

```typescript
import http from '@/utils/request'

// GET 请求
const getData = (id: number) => {
  return http.get(`/api/topics/${id}`)
}

// POST 请求
const createData = (data: TopicDTO) => {
  return http.post('/api/topics', data)
}

// 带超时请求
const getDataWithTimeout = (id: number) => {
  return httpWithTimeout({
    url: `/api/topics/${id}`,
    timeout: 10000
  })
}
```

### 状态管理 (Pinia)

```typescript
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/modules/auth'

export const useTopicStore = defineStore('topic', {
  state: () => ({
    topicList: [] as TopicVO[],
    currentTopic: null as TopicVO | null
  }),
  
  getters: {
    topicCount: (state) => state.topicList.length
  },
  
  actions: {
    async fetchTopics() {
      const { data } = await getTopicList()
      this.topicList = data
    }
  }
})
```

### 权限控制

#### 路由级别

```typescript
// src/router/index.ts
{
  path: '/admin',
  component: Layout,
  meta: { roles: ['system_admin', 'department_admin'] },
  children: [...]
}
```

#### 按钮级别

```vue
<template>
  <el-button v-permission="'topic:delete'" @click="handleDelete">删除</el-button>
</template>
```

### 文件上传

```vue
<template>
  <FileUpload
    v-model="fileList"
    :max-size="50"
    :allowed-types="['pdf', 'doc', 'docx']"
    :action="uploadUrl"
    @success="handleUploadSuccess"
  />
</template>
```

### 文件预览

```vue
<template>
  <FilePreview
    :fileUrl="currentFileUrl"
    :fileType="currentFileType"
  />
</template>
```

## 🎯 核心功能实现

### 1. Token 管理

```typescript
// utils/tokenManager.ts
class TokenManager {
  // 设置 token
  setToken(tokenInfo: TokenInfo) { ... }
  
  // 获取 token
  getToken(): TokenInfo | null { ... }
  
  // 检查即将过期 (30 分钟内)
  isTokenExpiringSoon(): boolean { ... }
  
  // 刷新 token
  async refreshToken(): Promise<void> { ... }
  
  // 检查并刷新
  async checkAndRefreshToken(): Promise<void> { ... }
}
```

### 2. Axios 封装

```typescript
// utils/request.ts
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器 - 自动注入 Token
http.interceptors.request.use(config => {
  const token = tokenManager.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token.accessToken}`
  }
  return config
})

// 响应拦截器 - 统一错误处理
http.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 过期，自动刷新
      tokenManager.refreshToken()
    }
    return Promise.reject(error)
  }
)
```

### 3. 大数字精度处理

```typescript
// utils/request.ts - 自定义 JSON 解析器
const customParse = (text: string): any => {
  return JSON.parse(text, (key, value) => {
    // Long 类型转字符串，防止精度丢失
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
      return String(value)
    }
    return value
  })
}

axios.defaults.transformResponse = [(text) => customParse(text)]
```

### 4. 路由守卫

```typescript
// router/index.ts
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查登录状态
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    next('/login')
    return
  }
  
  // 检查权限
  if (to.meta.roles && !authStore.hasRole(to.meta.roles)) {
    next('/403')
    return
  }
  
  next()
})
```

## 📦 环境变量

| 变量名 | 说明 | 开发环境 | 生产环境 |
|-------|------|---------|---------|
| VITE_APP_TITLE | 应用标题 | 高校毕业设计管理系统 (dev) | 高校毕业设计管理系统 |
| VITE_API_BASE_URL | API 地址 | http://127.0.0.1:8080 | https://api.graduation-system.edu.cn |
| VITE_WS_BASE_URL | WebSocket 地址 | ws://127.0.0.1:8080 | - |

## 🧪 测试

### 单元测试

```bash
pnpm test
```

### 类型检查

```bash
pnpm type-check
```

### 代码格式化

```bash
pnpm format
```

## 📊 性能优化

### 已实现优化

1. **路由懒加载**: 按页面分割代码包
2. **组件按需引入**: Element Plus 按需加载
3. **虚拟滚动**: 大数据列表优化
4. **防抖节流**: 搜索框、按钮点击优化
5. **缓存策略**: localStorage 缓存用户信息
6. **大数字处理**: Long 类型转 String 防止精度丢失
7. **图片懒加载**: 延迟加载图片资源

### 打包优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'vendor': ['vue', 'vue-router', 'pinia', 'axios']
        }
      }
    }
  }
})
```

## 🚀 部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/graduation-system-vue/dist;
    index index.html;
    
    # 路由 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署 (可选)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔗 相关链接

- [后端项目](https://github.com/lw3574910958-sys/graduation-system-boot)
- [业务逻辑与流程文档](../doc/业务逻辑与流程文档.md)
- [数据库设计文档](../doc/数据库设计文档.md)
- [项目介绍与技术架构](../doc/项目介绍与技术架构.md)

## 📝 开发注意事项

1. **TypeScript 严格模式**: 所有变量必须声明类型，避免使用 `any`
2. **组件命名**: 组件文件名使用 PascalCase (BaseList.vue)
3. **API 调用**: 使用 http 工具函数，不要直接使用 axios
4. **Token 管理**: 使用 tokenManager，不要直接操作 localStorage
5. **路由权限**: 所有页面必须配置 meta.roles
6. **错误处理**: 使用 ElMessage 统一提示，不要使用 alert/confirm

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 Apache License 2.0 协议，详见 [LICENSE](LICENSE) 文件。

## 👨‍ 作者

- **lw** - [GitHub](https://github.com/lw3574910958-sys)
- 邮箱：lw3574910958@gmail.com

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [ECharts](https://echarts.apache.org/)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

</div>
