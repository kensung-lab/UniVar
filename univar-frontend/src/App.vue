<script>
import AppHeader from './components/Header.vue'
import AppFooter from './components/Footer.vue'
import store from './store/store'
import keycloak from './services/keycloak'

export default {
  name: 'Unified Variant Interpretation Platform',
  components: {
    AppHeader,
    AppFooter
  },
  async mounted() {
    if (localStorage.getItem('force-logout')) {
      localStorage.removeItem('force-logout')
      await keycloak.logout()
    }

    if (
      this.userInfo &&
      (this.userInfo.username != 'anyone' &&
        !(
          this.userInfo.username.split('-').length == 2 &&
          this.userInfo.username.split('-')[0].length == 13 &&
          this.userInfo.username.split('-')[1].length == 12
        ))
    ) {
      await store.getters.getApiService.login()
    } else if(localStorage.getItem("sso-token").length > 30) {
      store.commit('updateSSOToken', 'anyone')
      localStorage.setItem('sso-token', 'anyone')
    }
    // keep frontend login, only logout when the user no activity for a time
  },
  data() {
    return {
      userInfo: this.userInfo
    }
  }
}
</script>

<template>
  <q-layout>
    <q-header>
      <AppHeader />
    </q-header>
    <q-page-container>
      <router-view></router-view>
    </q-page-container>
    <AppFooter />
  </q-layout>
</template>
