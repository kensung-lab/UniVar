<template>
  <div class='landing-container'>
    <div class='landing-title'>Unified Variant Interpretation Platform (UniVar)</div>
    <div class='landing-desc'>
      A comprehensive workflow for disease-causing variant identification in rare diseases
    </div>
    <div class='landing-buttons'>
      <div class='row'>
        <div class='col-md-3 landing-action'>
          <router-link to="/upload">
            <div class='landing-inner'>
              <q-icon name="settings"></q-icon><br>
              Run Job
            </div>
          </router-link>
        </div>
        <div class='col-md-3 landing-action' @click='onClickExample'>
            <div class='landing-inner'>
              <q-icon name="search"></q-icon><br>
              Example
            </div>
        </div>
        <div class='col-md-3 landing-action'>
            <div class='landing-inner'  @click='openFile("tutorial")'>
              <q-icon name="info"></q-icon><br>
              Tutorial
            </div>
        </div>
        <div class='col-md-3 landing-action'>
          <div class='landing-inner' @click='openFile("menu")'>
            <q-icon name="menu_book"></q-icon><br>
            User manual
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
@import '@/assets/styles/landing.css';
</style>

<script>
import store from '@/store/store.js'

export default {
  name: 'LandingPage',
  data() {
    return {}
  },

  async created() {

  },
  methods: {
    async openFile(type){
      await store.getters.getApiService.getFile(type);
    },
    onClickExample(){
      store.commit('updateSSOToken', "anyone");
      localStorage.setItem("sso-token", "anyone")
      localStorage.removeItem("db")
      localStorage.removeItem("samples")
      this.$router.push('/variant-table');
    }
  }
}
</script>
