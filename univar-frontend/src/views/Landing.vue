<template>
  <div class="landing-container">
    <h1>Unified Variant Interpretation <span>Platform</span></h1>
    <p>A comprehensive workflow for rare disease variant discovery</p>
    <div class="run-job" v-if="!checkLogin()">
      <router-link to="/upload" class="cta"> Run Job Now </router-link>
    </div>
  </div>
  <section class="actions">
    <div class="row">
      <div class="col card job-card" v-if="!checkLogin()">
        <router-link to="/upload" class="card-remove-a">
          <i class="material-icons">settings</i>
          <h3>Run Job</h3>
          <p>Start your variant analysis now</p>
        </router-link>
      </div>
      <div class="col card" @click="onClickExample" v-if="!checkLogin()">
        <i class="material-icons">search</i>
        <h3>Example</h3>
        <p>See UniVar in action</p>
      </div>
      <div class="col card" @click="onClickDashboard" v-if="checkLogin()">
        <i class="material-icons">dashboard</i>
        <h3>Dashboard</h3>
        <p>View Sample in UniVar</p>
      </div>
      <div class="col card" @click="openFile('tutorial')">
        <i class="material-icons">info</i>
        <h3>Tutorial</h3>
        <p>Learn the workflow</p>
      </div>
      <div class="col card" @click="openFile('menu')">
        <i class="material-icons">menu_book</i>
        <h3>User Manual</h3>
        <p>Full documentation</p>
      </div>
      <div class="col card">
        <router-link to="/publications" class="card-remove-a">
          <i class="material-icons">article</i>
          <h3>Cite Publication</h3>
          <p>Reference our research</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style>
@import '@fontsource/open-sans';
@import '@/assets/styles/landing.css';
</style>

<script>
import store from '@/store/store.js'

export default {
  name: 'LandingPage',
  data() {
    return {
      userInfo: this.userInfo
    }
  },
  methods: {
    async openFile(type) {
      await store.getters.getApiService.getFile(type)
    },
    onClickExample() {
      if(!this.checkLogin()) {
        store.commit('updateSSOToken', 'anyone')
        localStorage.setItem('sso-token', 'anyone')
        localStorage.removeItem('db')
        localStorage.removeItem('samples')
      }
      this.$router.push('/variant-table')
    },
    onClickDashboard() {
      this.$router.push('/dashboard')
    },
    checkLogin() {
      return this.userInfo &&
        this.userInfo.username != 'anyone' &&
        !(
          this.userInfo.username.split('-').length == 2 &&
          this.userInfo.username.split('-')[0].length == 13 &&
          this.userInfo.username.split('-')[1].length == 12
        )
    }
  }
}
</script>
