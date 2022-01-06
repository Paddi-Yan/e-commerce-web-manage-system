import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由守卫
router.beforeEach((
  to, // to将要访问的路径
  from, // from从哪个路径跳转而来
  next// next是一个函数 表示放行
) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  // next('/login')强制返回登录页面
  if (!token) {
    return next('/login')
  }
  // next()放行
  next()
})

export default router
