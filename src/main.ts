import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import router from "./router"
import EventBusPlugin from "./plugins/eventBus"

async function bootstrap() {
  const app = createApp(App)
  app.use(EventBusPlugin)
  app.use(router)
  app.mount("#app")
}

await bootstrap()
