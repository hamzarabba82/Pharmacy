import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setRouter } from './services/navigation.service'
import './styles/main.scss'

setRouter(router)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
