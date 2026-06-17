import Vue from 'vue'
import App from './App.vue'
import { Statement } from 'showplan-vue'
import 'showplan-vue/dist/showplan-vue.css'

Vue.component('showplan-statement', Statement)

new Vue({
  render: h => h(App)
}).$mount('#app')
