<template>
    <q-toolbar class='header-toolbar' >
      <q-toolbar-title>
        <div class="row app_header">
            <div class="app_title">
              <router-link to="/">
                <div class="logo">Uni<span>Var</span></div>
              </router-link>
            </div>
        </div>
      </q-toolbar-title>
      <div class='login' @click='login' v-if="userProfile.username == 'anyone'">
        <q-btn flat dense icon="login"><q-tooltip>Login for personalize data management</q-tooltip> Enterprise Login</q-btn>
      </div>
      <!-- <div class='user_manual bg-secondary' @click='openUserMenu'>
        <q-btn flat dense icon="menu_book"><q-tooltip>Download user manual</q-tooltip>User Manual</q-btn>
      </div> -->
      <div class='dark_mode' v-if='userInfo.roles && userInfo.roles.includes("ROLE_DARK_MODE")' @click='toggleDarkMode'>
        <q-btn flat dense icon="dark_mode" v-if='!darkMode'><q-tooltip>Switch to Dark Mode</q-tooltip></q-btn>
        <q-btn flat dense icon="light_mode" v-else><q-tooltip>Switch to Light Mode</q-tooltip></q-btn>
      </div>
      <div class='header_account' v-if="userProfile.username !== 'anyone'">
        <q-btn flat dense :icon="(userProfile.username === 'anyone' ) ? 'menu' : 'account_circle' " class='header_account_btn'>
          <span class='header-username' v-if="userProfile.username !== 'anyone'">
            {{userProfile.username}}
          </span>
          <q-menu>
            <q-list dense class='header_list'>
              <span class='header_menuItem'>
                <router-link to="/upload">
                  <q-item clickable v-close-popup>
                   Upload
                  </q-item>
                </router-link>
              </span>
              <span class='header_menuItem'>
                <router-link to="/dashboard">
                  <q-item clickable v-close-popup>
                   DashBoard
                  </q-item>
                </router-link>
              </span>
              <span class='header_menuItem'>
                <router-link to="/variant-table">
                  <q-item clickable v-close-popup>
                   Variants Table
                  </q-item>
                </router-link>
              </span>
              <q-item clickable v-close-popup @click='logout' class='logout-btn' >
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
</template>

<style>
@import '@/assets/styles/header.scss';
@import "@fontsource/montserrat/700.css";
</style>

<script>
import store from '../store/store'

export default {
  name: 'AppHeader',
  data() {
    return {
      userProfile : this.userProfile,
      userInfo : this.userInfo,
      darkMode : localStorage.getItem('dark-mode'),
    }
  },
  async created() {
    const currentDarkMode = this.darkMode
    if( JSON.parse(currentDarkMode) ) {
      this.$q.dark.set(true)
    }
  },
  methods: {
    async logout(){
      await store.getters.getApiService.logout();
      await this.$keycloak.logout();
      router.push({ name: 'Home' });
    },
    toggleDarkMode(){
      this.$q.dark.toggle()
      this.darkMode = this.$q.dark.mode
      console.log("mode is : "+ this.darkMode )
      localStorage.setItem('dark-mode', this.darkMode);
    },
    async openUserMenu(){
      await store.getters.getApiService.getFile("menu");
    },
    async login() {
      await this.$keycloak.login();
    },
  }
}
</script>
