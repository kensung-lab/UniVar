<template>
  <q-btn
    :loading="isExporting"
    class="export-btn export-loading gray-btn univar-icon-btn"
    v-if="isExporting"
  >
    <template v-slot:loading>
      <q-spinner-hourglass class="on-left"></q-spinner-hourglass>
      Loading...
    </template>
  </q-btn>

  <span>
    <q-tooltip anchor="top middle" self="center middle" class="export-result-tooltip">Export result to file</q-tooltip>
    <q-btn-dropdown
      class="gene-table-btn gray-btn export-file-btn univar-icon-btn"
      icon="file_download"
      v-if="!isExporting"
    >
      <q-list padding class="export-list">
        <q-item clickable v-close-popup>
          <q-item-section>
            <div class="preset-container">
              <div class="export-list-left export-tsv" @click="onExportFile('tsv')" v-close-popup>
                Excel (.tsv)
              </div>
            </div>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup>
          <q-item-section>
            <div class="preset-container">
              <div class="export-list-left export-vcf" @click="onExportFile('vcf')" v-close-popup>
                VCF
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </span>
</template>

<script>
export default {
  name: 'ExportButton',
  props: ['isExporting'],
  emits: ['onExportFile'],
  data() {
    return {}
  },
  async created() {},
  methods: {
    async onExportFile(type) {
      this.$emit('onExportFile', type)
    }
  }
}
</script>
