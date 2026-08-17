import HomePage from '@/pages/home-page.vue'

import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  Home = 'Home',

  Calculator = 'Calculator',
  Compare = 'Compare',
  Recipes = 'Recipes',

  // Settings
  Settings = 'Settings',
  // tabs
  SettingsGame = 'Game Settings',
  SettingsAccount = 'Account Settings',
  SettingsSite = 'Site Settings',

  Profile = 'Profile',
  // Friends = 'Friends',

  Credits = 'Credits',
  About = 'About',

  Admin = 'Admin',

  Discord = 'Discord',
  Patreon = 'Patreon',
  Google = 'Google',

  NotFound = 'NotFound'
}

const CalculatorPage = () => import('@/pages/calculator-page.vue')
const ComparisonPage = () => import('@/pages/compare/comparison-page.vue')
const RecipesPage = () => import('@/pages/recipe/recipes-page.vue')
const DishInfographicPage = () => import('@/pages/dish-infographic/dish-infographic-page.vue')

// User
const SettingsPage = () => import('@/pages/settings/settings-page.vue')
const ProfilePage = () => import('@/pages/profile-page.vue')
// const FriendsPage = () => import('@/pages/friends/friends-page.vue')
const CreditsPage = () => import('@/pages/credits/credits-page.vue')
const AboutPage = () => import('@/pages/about/about-page.vue')

// Admin
const AdminPage = () => import('@/pages/admin/admin.vue')

// Auth pages
const PatreonPage = () => import('@/pages/login/patreon-page.vue')
const DiscordPage = () => import('@/pages/login/discord-page.vue')
const GooglePage = () => import('@/pages/login/google-page.vue')

// 404
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
      path: '/recipes',
      name: RouteName.Recipes,
      component: RecipesPage
    },
    {
      path: '/dish-infographic',
      name: 'DishInfographic',
      component: DishInfographicPage
    },
    {
      path: '/settings',
      name: RouteName.Settings,
      component: SettingsPage,
      redirect: { name: RouteName.SettingsGame },
      children: [
        {
          path: 'game',
          name: RouteName.SettingsGame,
          component: SettingsPage
        },
        {
          path: 'account',
          name: RouteName.SettingsAccount,
          component: SettingsPage
        },
        {
          path: 'site',
          name: RouteName.SettingsSite,
          component: SettingsPage
        }
      ]
    },
    {
      path: '/profile',
      name: RouteName.Profile,
      component: ProfilePage
    },
    // {
    //   path: '/friends',
    //   name: RouteName.Friends,
    //   component: FriendsPage
    // },
    {
      path: '/credits',
      name: RouteName.Credits,
      component: CreditsPage
    },
    {
      path: '/about',
      name: RouteName.About,
      component: AboutPage
    },
    {
      path: '/admin',
      name: RouteName.Admin,
      component: AdminPage,
      meta: { requiresAdmin: true }
    },
    {
      path: '/discord',
      name: RouteName.Discord,
      component: DiscordPage,
      props: (route) => ({
        originalRoute: route.query.state || route.redirectedFrom?.fullPath || '/'
      })
    },
    {
      path: '/patreon',
      name: RouteName.Patreon,
      component: PatreonPage,
      props: (route) => ({
        originalRoute: route.query.state || route.redirectedFrom?.fullPath || '/'
      })
    },
    {
      path: '/google',
      name: RouteName.Google,
      component: GooglePage,
      props: (route) => ({
        originalRoute: route.query.state || route.redirectedFrom?.fullPath || '/'
      })
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteName.NotFound,
      component: NotFoundPage
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith('/guides')) {
    window.location.assign(to.fullPath)
    return next(false)
  }
  if (to.meta.requiresAdmin) {
    const { AdminService } = await import('@/services/admin/admin-service')
    const { useUserStore } = await import('@/stores/user-store')
    const { Roles } = await import('sleepapi-common')

    const userStore = useUserStore()
    if (userStore.role !== Roles.Admin) {
      next({ name: RouteName.Home })
    } else {
      await AdminService.verifyAdmin()
      next()
    }
  } else {
    next()
  }
})

export default router
