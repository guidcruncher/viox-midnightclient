import { createApp } from 'vue'

import App from './App.vue'
import { registerEventBus } from './plugins/vioxEventBus'
import router from './router'

import './style.css'

async function bootstrap() {
  const app = createApp(App)
  app.use(router)
  registerEventBus()
  app.mount('#app')
}

await bootstrap()
