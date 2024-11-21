<template>
    <q-btn :loading="isExporting" color="primary-hkgi" class="export-btn export-loading" v-if='isExporting'>
      <template v-slot:loading>
        <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
        Loading...
      </template>
    </q-btn>

    <q-btn-dropdown color="primary-hkgi" label="Export" class="geneTableBtn export-dropdown" icon="file_download" v-else>
      <q-list padding class="export-list">
        <q-item clickable v-close-popup>
          <q-item-section>
            <div class="preset-container">
              <div class="export-list-left export-tsv"  @click="onExportFile('tsv')" v-close-popup>Excel (.tsv)</div>
            </div>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup>
          <q-item-section>
            <div class="preset-container">
              <div class="export-list-left export-vcf"  @click="onExportFile('vcf')" v-close-popup>VCF</div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
</template>


<script>
export default {
  name: 'ExportButton',
  props: [
    'isExporting'
  ],
  emits: ["onExportFile"],
  data() {
    return{

    }
  },
  async created() {

  },
  methods: {
    async onExportFile(type){
      this.$emit("onExportFile",type)
    }
  }
}
</script>