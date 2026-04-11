import type { RouteLocationNormalized } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AuthService from '../services/authService'
import AlbumView from '../views/AlbumView.vue'
import AuthCallback from '../views/AuthCallback.vue'
import CatalogView from '../views/CatalogView.vue'
import DashboardView from '../views/Dashboard.vue'
import LibraryView from '../views/LibraryView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import PodcastView from '../views/PodcastView.vue'
import QueueView from '../views/QueueView.vue'
import SoundSettings from '../views/SoundSettings.vue'

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
        path: 'library',
        name: 'library',
        component: LibraryView,
        meta: {
          title: 'Library',
          sidebar: {
            icon: 'Disc',
            label: 'Library',
            order: 2,
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
        path: 'catalog',
        name: 'catalog',
        component: CatalogView,
        meta: {
          title: 'Catalog',
          sidebar: {
            icon: 'Catalog',
            label: 'Catalog',
            order: 4,
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
        path: 'album',
        name: 'album',
        component: AlbumView,
        meta: { title: 'Album' },
      },
      {
        path: 'playlist',
        name: 'playlist',
        component: PlaylistView,
        meta: { title: 'Playlist' },
      },
      {
        path: 'sound',
        name: 'sound',
        component: SoundSettings,
        meta: { title: 'Sound Desk' },
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
