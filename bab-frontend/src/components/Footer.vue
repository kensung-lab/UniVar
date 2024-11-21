<template>
  <div></div>
  <div class="app_footer">
    <span class="license-message">This website is freely and publicly available regardless of commercial or non-commercial purposes
      <a href = "mailto: dpdevops@genomics.org.hk">Contact us</a>
    </span>
    Unified Variant Interpretation Platform - v{{version}}
  </div>
</template>

<style>
@import '@/assets/styles/footer.css';
</style>

<script>
import packageInfo from '../../package.json';

export default {
  name: 'AppFooter',
  data() {
    return {
      version : packageInfo.version
    }
  }
}
</script>
