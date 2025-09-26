<template>
  <div class='error-msg'>
    <q-icon name="report"/>
    Access denied for this page, please contact admin.
  </div>
</template>


<style>
  @import '@/assets/styles/access-denied.css';
</style>

<script>
export default {
  name: 'AccessDenied',
  data() {
    return {}
  },

  async created() {
    console.log('AccessDenied')
  },

  methods: {}
}
</script>
