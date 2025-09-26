import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/VariantsMain.vue'
import Dashboard from '@/views/Dashboard.vue'
import AccessDenied from '@/views/AccessDenied.vue'
import upload from '@/views/Upload.vue'
import Landing from '@/views/Landing.vue'
import Publications from '@/views/Publications.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Landing
  },
  {
    path: '/upload',
    name: 'upload',
    component: upload
  },
  {
    path: '/dashboard',
    name: 'DashBoard',
    component: Dashboard
  },
  {
    path: '/variant-table',
    name: 'VariantTable',
    component: Home
  },
  {
    path: '/publications',
    name: 'Publications',
    component: Publications
  },
  {
    path: '/denied',
    name: 'AccessDenied',
    component: AccessDenied
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
//
// router.beforeEach((to, from, next) => {
//   if (to.hash.includes('session_state') && to.hash.includes('code')) {
//     history.replaceState({}, document.title, to.path) // Remove session_state and code from URL
//     next()
//   } else {
//     next()
//   }
// })

export default router
