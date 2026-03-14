// src/types/router.d.ts
import "vue-router"

declare module "vue-router" {
  interface RouteMeta {
    title?: string
    sidebar?: {
      icon: string
      label: string
      order: number
    } | null
  }
}
