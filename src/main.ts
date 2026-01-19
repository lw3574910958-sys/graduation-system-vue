import { createApp } from 'vue'
import pinia from '@/stores'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import 'element-plus/dist/index.css'
import '@/assets/styles/element-variables.less'
import '@/assets/styles/global.less'
import '@/assets/styles/reset.less'
import '@/assets/styles/login.less'
import '@/assets/styles/style.less'
import router from './router'
import App from './App.vue'


import { permission } from '@/directives/permission'

const app = createApp(App)

// 使用插件
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(pinia)
app.use(router)

// 注册全局指令
app.directive('permission', permission)

app.mount('#app')
