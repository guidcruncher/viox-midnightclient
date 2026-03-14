import type { RouteLocationNormalized } from "vue-router"
import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import AuthService from "../services/authService"

import AppLayout from "../layouts/AppLayout.vue"
import MobileLayout from "../layouts/MobileLayout.vue"

import AuthCallback from "../views/AuthCallback.vue"

import DashboardView from "../views/Dashboard.vue"
import SpotifyView from "../views/SpotifyView.vue"
import RadioView from "../views/RadioView.vue"
import LocalView from "../views/LocalView.vue"
import PodcastsView from "../views/PodcastsView.vue"
import CatalogView from "../views/CatalogView.vue"
import SearchView from "../views/SearchView.vue"
import ShowsView from "../views/ShowsView.vue"
import EpisodesView from "../views/EpisodesView.vue"
import ArtistView from "../views/ArtistView.vue"
import SoundSettings from "../views/SoundSettings.vue"
import SystemSettings from "../views/SystemSettings.vue"
import AboutView from "../views/AboutView.vue"
import MobileView from "../views/MobileView.vue"
import ClockView from "../views/ClockView.vue"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: DashboardView,
        meta: {
          title: "Presets",
          sidebar: {
            icon: "Heart",
            label: "Presets",
            order: 1,
          },
        },
      },
      {
        path: "spotify",
        name: "spotify",
        component: SpotifyView,
        meta: {
          title: "Spotify",
          sidebar: {
            icon: "Disc",
            label: "Spotify",
            order: 2,
          },
        },
      },
      {
        path: "radio",
        name: "radio",
        component: RadioView,
        meta: {
          title: "Radio",
          sidebar: {
            icon: "Radio",
            label: "Radio",
            order: 3,
          },
        },
      },
      {
        path: "local",
        name: "local",
        component: LocalView,
        meta: {
          title: "Server",
          sidebar: {
            icon: "HardDrive",
            label: "Server",
            order: 4,
          },
        },
      },
      {
        path: "podcasts/:id?",
        name: "podcasts",
        component: PodcastsView,
        meta: {
          title: "Podcasts",
          sidebar: {
            icon: "Podcast",
            label: "Podcasts",
            order: 5,
          },
        },
      },
      {
        path: "catalog",
        name: "catalog",
        component: CatalogView,
        meta: {
          title: "Catalog",
          sidebar: {
            icon: "Library",
            label: "Catalog",
            order: 6,
          },
        },
      },
      {
        path: "episodes/:id?",
        name: "episodes",
        component: EpisodesView,
        meta: { title: "Podcast" },
      },
      {
        path: "shows/:id?",
        name: "shows",
        component: ShowsView,
        meta: { title: "Shows" },
      },
      {
        path: "artist/:id?",
        name: "artist",
        component: ArtistView,
        meta: { title: "Artist" },
      },
      {
        path: "search",
        name: "search",
        component: SearchView,
        meta: { title: "Search" },
      },
      {
        path: "sound",
        name: "sound",
        component: SoundSettings,
        meta: { title: "Sound Desk" },
      },
      {
        path: "settings",
        name: "settings",
        component: SystemSettings,
        meta: { title: "Configuration" },
      },
      {
        path: "about",
        name: "about",
        component: AboutView,
        meta: { title: "About" },
      },
      {
        path: "clock",
        name: "clock",
        component: ClockView,
        meta: { title: "Clock" },
      },
    ],
  },
  {
    path: "/mobile",
    component: MobileLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/",
        name: "mobile",
        component: MobileView,
      },
    ],
  },
  {
    path: "/callback",
    name: "callback",
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
