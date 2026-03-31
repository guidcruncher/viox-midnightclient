import type { RouteLocationNormalized } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AuthService from '../services/authService'
import AboutView from '../views/AboutView.vue'
import AuthCallback from '../views/AuthCallback.vue'
import DashboardView from '../views/Dashboard.vue'
import LocalView from '../views/LocalView.vue'
import MusicView from '../views/MusicView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import PodcastsView from '../views/PodcastsView.vue'
import PodcastView from '../views/PodcastView.vue'
import QueueView from '../views/QueueView.vue'
import RadioView from '../views/RadioView.vue'
import SoundSettings from '../views/SoundSettings.vue'
import SystemSettings from '../views/SystemSettings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: {
          title: 'Home',
          sidebar: {
            icon: 'Heart',
            label: 'Home',
            order: 1,
          },
        },
      },
      {
        path: 'music',
        name: 'music',
        component: MusicView,
        meta: {
          title: 'Music',
          sidebar: {
            icon: 'Disc',
            label: 'Music',
            order: 2,
          },
        },
      },
      {
        path: 'podcast',
        name: 'podcast',
        component: PodcastView,
        meta: { title: 'Podcast' },
      },
      {
        path: 'playlist',
        name: 'playlist',
        component: PlaylistView,
        meta: { title: 'Playlist' },
      },
      {
        path: 'radio',
        name: 'radio',
        component: RadioView,
        meta: {
          title: 'Radio',
          sidebar: {
            icon: 'Radio',
            label: 'Radio',
            order: 4,
          },
        },
      },
      {
        path: 'queue',
        name: 'queue',
        component: QueueView,
        meta: {
          title: 'Queue',
          sidebar: {
            icon: 'List',
            label: 'Queue',
            order: 3,
          },
        },
      },
      {
        path: 'local',
        name: 'local',
        component: LocalView,
        meta: {
          title: 'Server',
          sidebar: {
            icon: 'HardDrive',
            label: 'Server',
            order: 5,
          },
        },
      },
      {
        path: 'podcasts',
        name: 'podcasts',
        component: PodcastsView,
        meta: {
          title: 'Podcasts',
          sidebar: {
            icon: 'Podcast',
            label: 'Podcasts',
            order: 6,
          },
        },
      },
      {
        path: 'sound',
        name: 'sound',
        component: SoundSettings,
        meta: { title: 'Sound Desk' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: SystemSettings,
        meta: { title: 'Configuration' },
      },
      {
        path: 'about',
        name: 'about',
        component: AboutView,
        meta: { title: 'About' },
      },
    ],
  },
  {
    path: '/callback',
    name: 'callback',
    component: AuthCallback,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to: RouteLocationNormalized, _from, next) => {
  const isAuthenticated = AuthService.isLoggedIn()

  if (to.meta.requiresAuth && !isAuthenticated) {
    window.location.href = AuthService.getLoginUrl()
    return
  }

  next()
})

export default router
