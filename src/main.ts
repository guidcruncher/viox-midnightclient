import { createApp } from 'vue'

import App from './App.vue'
import EventBusPlugin from './plugins/eventBus'
import router from './router'

import './style.css'

async function bootstrap() {
  const app = createApp(App)
  app.use(EventBusPlugin)
  app.use(router)
  app.mount('#app')
}

await bootstrap()
