import HomePage from '@/pages/home-page.vue'
import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  Home = 'Home',
  Calculator = 'Calculator',
  Profile = 'Profile',
  Settings = 'Settings'
}

const CalculatorPage = () => import('@/pages/calculator-page.vue')
const ProfilePage = () => import('@/pages/profile-page.vue')
const SettingsPage = () => import('@/pages/settings-page.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.Home,
      component: HomePage
    },
    {
      path: '/calculator',
      name: RouteName.Calculator,
      component: CalculatorPage
    },
    {
      path: '/profile',
      name: RouteName.Profile,
      component: ProfilePage
    },
    {
      path: '/settings',
      name: RouteName.Settings,
      component: SettingsPage
    }
  ]
})

export default router
