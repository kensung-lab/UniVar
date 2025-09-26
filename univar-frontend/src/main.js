import { createApp } from 'vue'
import keycloak from './services/keycloak'
import App from './App.vue'
import { Quasar, Notify, Loading, Dark } from 'quasar'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import router from '../src/router/index'
import store from '../src/store/store'
// import { Idle } from 'idlejs'
// import { onIdle } from './utils/timeout/timeout'
import VueCookieAcceptDecline from 'vue-cookie-accept-decline'
import 'vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css'
import Vue3Tour from 'vue3-tour'
import 'vue3-tour/dist/vue3-tour.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const VueApp = createApp(App)

VueApp.use(Quasar, {
  plugins: {
    Notify,
    Loading,
    Dark
  } // import Quasar plugins and add here
})

VueApp.use(router)
VueApp.component('vue-cookie-accept-decline', VueCookieAcceptDecline)
VueApp.use(Vue3Tour)

//Setup Keycloak
keycloak
  .init({
    onLoad: 'check-sso',
    promiseType: 'native'
  })
  .then(async (authenticated) => {
    if (authenticated) {
      const userProfile = await keycloak.loadUserProfile()
      const userInfo = await keycloak.loadUserInfo()
      userInfo.username = userInfo.preferred_username

      // localStorage.setItem("sso-token", keycloak.token);
      VueApp.config.globalProperties.$keycloak = keycloak
      VueApp.config.globalProperties.ssoToken = keycloak.token
      VueApp.config.globalProperties.userProfile = userProfile
      VueApp.config.globalProperties.userInfo = userInfo
      store.commit('updateSSOToken', keycloak.token)
      VueApp.use(store)

      console.log('authenticated.')
      VueApp.mount('#app')
    } else {
      const token = localStorage.getItem('sso-token') ? localStorage.getItem('sso-token') : 'anyone'
      const userInfo = {
        username: 'anyone',
        groups: [],
        roles: []
      }
      localStorage.setItem('sso-token', token)
      VueApp.config.globalProperties.$keycloak = keycloak
      VueApp.config.globalProperties.ssoToken = token
      VueApp.config.globalProperties.userProfile = userInfo
      VueApp.config.globalProperties.userInfo = userInfo
      store.commit('updateSSOToken', token)
      VueApp.use(store)

      VueApp.mount('#app')
    }
  })
  .catch((error) => {
    console.error('Keycloak initialization failed', error)
  })

// logout user when idle
// const idle = new Idle()
//   .whenNotInteractive()
//   .within(import.meta.env.VITE_SESSION_EXPIRE_TIME, 1)
//   .do(() => onIdle())
//   .start()

export default VueApp
