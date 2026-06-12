import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue') },
  { path: '/onboarding', component: () => import('@/views/OnboardingView.vue') },
  { path: '/', component: () => import('@/views/DashboardView.vue') },
  { path: '/import', component: () => import('@/views/ImportView.vue') },
  { path: '/transactions', component: () => import('@/views/TransactionsView.vue') },
  { path: '/settings', component: () => import('@/views/SettingsView.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  // Everything except /login requires a token.
  if (to.path !== '/login' && !auth.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // Already logged in? Skip the login screen.
  if (to.path === '/login' && auth.token) {
    return '/'
  }
})

export default router
