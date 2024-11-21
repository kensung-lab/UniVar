import { createApp } from 'vue'
import keycloak from './services/keycloak';
import App from './App.vue'
import { Quasar, Notify, Loading, Dark } from 'quasar'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import router from '../src/router/index'
import store from '../src/store/store';
import IdleJs from 'idle-js'
import { onIdle, onActive } from './utils/timeout/timeout'
import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
import 'vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css';

// Import Quasar css
import 'quasar/src/css/index.sass'

const VueApp = createApp(App)

VueApp.use(Quasar, {
  plugins: {
    Notify,
    Loading,
    Dark
  }, // import Quasar plugins and add here
})

VueApp.use(router)
VueApp.component('vue-cookie-accept-decline', VueCookieAcceptDecline);

//Setup Keycloak
keycloak.init({
  // onLoad: 'login-required',
  promiseType: 'native'
}).then(async (authenticated) => {
  if (authenticated) {

    const userProfile = await keycloak.loadUserProfile();
    const userInfo = await keycloak.loadUserInfo();

    localStorage.setItem("sso-token", keycloak.token);
    VueApp.config.globalProperties.$keycloak = keycloak;
    VueApp.config.globalProperties.ssoToken = keycloak.token
    VueApp.config.globalProperties.userProfile = userProfile
    VueApp.config.globalProperties.userInfo = userInfo
    store.commit('updateSSOToken', keycloak.token);
    VueApp.use(store);

    console.log('authenticated.')
    VueApp.mount('#app')
  } else {
    console.log('no authenticate logic')
    const token = localStorage.getItem("sso-token") ? localStorage.getItem("sso-token") : 'anyone';
    const userInfo = {
      username: 'anyone',
      groups: [],
      roles: [],
    }
    localStorage.setItem("sso-token", token);
    VueApp.config.globalProperties.$keycloak = undefined;
    VueApp.config.globalProperties.ssoToken = token
    VueApp.config.globalProperties.userProfile = userInfo
    VueApp.config.globalProperties.userInfo = userInfo
    store.commit('updateSSOToken', token);
    VueApp.use(store);

    VueApp.mount('#app')
  }
}).catch((error) => {
  console.error('Keycloak initialization failed', error);
});

// config idle timeout?
// const idle = new IdleJs({
//   idle: import.meta.env.VITE_SESSION_EXPIRE_TIME, // idle time in ms
//   onIdle: onIdle, // callback function to be executed after idle time
//   onActive: onActive,
//   startAtIdle: true // set it to true if you want to start in the idle state
// });
// idle.start();

export default VueApp;

