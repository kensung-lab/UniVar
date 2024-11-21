<script>
import AppHeader from './components/Header.vue'
import AppFooter from './components/Footer.vue'
import store from './store/store'
import keycloak from './services/keycloak'

export default {
  name: 'Unified Variant Interpretation Platform',
  components: {
    AppHeader,
    AppFooter,
  },
  async mounted() {
    if(localStorage.getItem("force-logout")) {
      localStorage.removeItem("force-logout");
      await keycloak.logout();
    }


    await store.getters.getApiService.login();
    // keep frontend login, only logout when the user no activity for a time
  },
  data() {
    return {

    }
  },
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

