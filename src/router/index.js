import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/retrospective',
      name: 'retrospective',
      component: () => import('@/views/RetrospectiveView.vue')
    },
    {
      path: '/callback/:service',
      name: 'callback',
      component: () => import('@/views/CallbackView.vue')
    }
  ]
})

export default router
