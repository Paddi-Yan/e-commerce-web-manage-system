import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './plugins/element.js'
import './css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器全局样式表
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 时间格式化过滤器
Vue.filter('dataFormat', function (originValue) {
  const datetime = new Date(originValue)
  const year = datetime.getFullYear()
  const month = (datetime.getMonth() + 1 + '').padStart(2, '0')
  const day = (datetime.getDate() + '').padStart(2, '0')
  const hour = (datetime.getHours() + '').padStart(2, '0')
  const minutes = (datetime.getMinutes() + '').padStart(2, '0')
  const seconds = (datetime.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
})

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
