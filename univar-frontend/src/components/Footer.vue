<template>
  <q-footer class="footer">
    <div class="footer-content">
      <span
        >This website is freely and publicly available regardless of commercial or non-commercial
        purposes <a href="mailto:jscheng@cuhk.edu.hk" class="contact-us">Contact Us</a></span
      >
      <span>Unified Variant Interpretation Platform - v1.0.2</span>
    </div>
  </q-footer>
</template>

<style>
@import '@/assets/styles/footer.scss';
</style>

<script>
import packageInfo from '../../package.json'

export default {
  name: 'AppFooter',
  data() {
    return {
      version: packageInfo.version
    }
  }
}
</script>
