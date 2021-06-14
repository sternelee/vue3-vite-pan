import { createApp } from 'vue'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'
import store from './store'
import { stat } from './utils/stat'
import VueSee from './plugins/vue-see'

const app = createApp(App)

app.use(ElementPlus)
app.directive(VueSee.name, VueSee.directive)
app.use(router)
app.use(store)
app.mount('#app')

app.config.globalProperties.$stat = stat;