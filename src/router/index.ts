import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/public/MarketingHomeView.vue'),
  },
  {
    path: '/captacion',
    name: 'capture',
    component: () => import('@/views/public/CaptureLandingView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/invitations/:token',
    name: 'invitation',
    component: () => import('@/views/auth/InvitationView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'team',
        name: 'team',
        component: () => import('@/views/team/TeamView.vue'),
        meta: { leaderOnly: true, planFeature: 'team' },
      },
      {
        path: 'team/:id',
        name: 'team-member',
        component: () => import('@/views/team/TeamMemberView.vue'),
        meta: { leaderOnly: true, planFeature: 'team' },
      },
      {
        path: 'invitations',
        name: 'invitations',
        component: () => import('@/views/invitations/InvitationsView.vue'),
        meta: { leaderOnly: true, planFeature: 'team' },
      },
      {
        path: 'store',
        name: 'store',
        component: () => import('@/views/store/StoreView.vue'),
        meta: { leaderOnly: true, planFeature: 'store' },
      },
      {
        path: 'landing',
        name: 'landing',
        component: () => import('@/views/landing/LandingView.vue'),
        meta: { leaderOnly: true, planFeature: 'landing' },
      },
      {
        path: 'become-leader',
        name: 'become-leader',
        component: () => import('@/views/dashboard/BecomeLeaderView.vue'),
        meta: { billing: true },
      },
      {
        path: 'ventas',
        name: 'partner-sales',
        component: () => import('@/views/store/PartnerSalesView.vue'),
        meta: { sellGrantOnly: true },
      },
      {
        path: 'tools',
        name: 'tools',
        component: () => import('@/views/tools/ToolsView.vue'),
        meta: { planFeature: 'tools' },
      },
      {
        path: 'tools/wellness',
        name: 'tools-wellness',
        component: () => import('@/views/tools/WellnessView.vue'),
      },
      {
        path: 'tools/imc',
        name: 'tools-imc',
        component: () => import('@/views/tools/ImcCalculatorView.vue'),
      },
      {
        path: 'tools/wellness/consulta',
        name: 'tools-wellness-consult',
        component: () => import('@/views/tools/WellnessConsultView.vue'),
      },
      {
        path: 'tools/whatsapp-finder',
        name: 'tools-whatsapp-finder',
        component: () => import('@/views/tools/WhatsAppFinderView.vue'),
      },
      {
        path: 'tools/:kind(flyers|pdfs|videos|audios)',
        name: 'tools-media',
        component: () => import('@/views/tools/MediaLibraryView.vue'),
      },
      {
        path: 'commissions',
        name: 'commissions',
        component: () => import('@/views/dashboard/CommissionsView.vue'),
        meta: { leaderOnly: true },
      },
      {
        path: 'cierre',
        name: 'monthly-closing',
        component: () => import('@/views/reports/MonthlyClosingView.vue'),
        meta: { leaderOnly: true, planFeature: 'closing' },
      },
      {
        path: 'reports',
        redirect: { name: 'monthly-closing' },
      },
      {
        path: 'soporte',
        name: 'support',
        component: () => import('@/views/support/TicketsView.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
      },
    ],
  },
  {
    path: '/l/:slug',
    name: 'public-landing',
    component: () => import('@/views/public/PublicLandingView.vue'),
  },
  {
    path: '/s/:slug',
    component: () => import('@/layouts/ShopLayout.vue'),
    children: [
      {
        path: '',
        name: 'public-store',
        component: () => import('@/views/public/PublicStoreView.vue'),
      },
      {
        path: 'p/:productSlug',
        name: 'public-product',
        component: () => import('@/views/public/PublicProductView.vue'),
      },
      {
        path: 'checkout',
        name: 'public-checkout',
        component: () => import('@/views/public/PublicCheckoutView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/app',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, top: 0, behavior: 'smooth' }
    }

    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.booted) {
    await auth.hydrate()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.leaderOnly && !auth.isLeader && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  if (to.meta.billing) {
    const canPay = auth.isPartnerOnly || (auth.isLeader && !auth.hasPaidAccess) || auth.isAdmin
    if (!canPay) {
      return { name: 'dashboard' }
    }
  }

  if (to.meta.partnerOnly && !auth.isPartnerOnly) {
    return { name: 'dashboard' }
  }

  if (to.meta.sellGrantOnly && !auth.canSellLeaderInventory) {
    return { name: 'dashboard' }
  }

  if (String(to.path).startsWith('/app/tools')) {
    const flags = auth.entitlements
    if (flags && flags.tools === false) {
      return { name: auth.hasPaidAccess ? 'dashboard' : 'become-leader' }
    }
  }

  const feature = to.meta.planFeature
  if (typeof feature === 'string') {
    const flags = auth.entitlements
    if (flags && flags[feature as keyof typeof flags] === false) {
      return { name: auth.hasPaidAccess ? 'dashboard' : 'become-leader' }
    }
  }

  return true
})
