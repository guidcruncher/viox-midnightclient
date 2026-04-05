import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { registerEventBus } from './plugins/vioxEventBus'
import './style.css'

async function bootstrap() {
  const app = createApp(App)
  app.use(router)
  registerEventBus()
  app.mount('#app')
}

await bootstrap()
