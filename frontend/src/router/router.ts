import HomePage from '@/pages/home-page.vue'

import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  Home = 'Home',
  Calculator = 'Calculator',
  Compare = 'Compare',
  Profile = 'Profile',
  Settings = 'Settings',
  NotFound = 'NotFound'
}

const CalculatorPage = () => import('@/pages/calculator-page.vue')
const ComparisonPage = () => import('@/pages/compare/comparison-page.vue')
const ProfilePage = () => import('@/pages/profile-page.vue')
const SettingsPage = () => import('@/pages/settings-page.vue')
const NotFoundPage = () => import('@/pages/not-found/not-found-page.vue')

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
      path: '/compare',
      name: RouteName.Compare,
      component: ComparisonPage
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
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: NotFoundPage
    }
  ]
})

export default router
