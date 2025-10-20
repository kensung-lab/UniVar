<template>
  <div class="col-md-10">
    <div class="remark-message">
      <q-icon name="info" />
      <span v-if="isOptional">Optional:</span> <span v-else>*</span> Choose a way to input
      <a href="https://hpo.jax.org/" target="_blank">HPO Terms</a> for Exomiser ( Version:
      {{ hpoVersion }} )
    </div>
    <div class="col-md-10 file-group">
      <q-card>
        <q-tabs
          v-model="hpo_tab"
          dense
          class="bg-grey-2 text-grey-7"
          active-color="primary"
          indicator-color="purple"
          align="justify"
        >
          <q-tab name="file" label="Upload File" @click="onSwitchTab" />
          <q-tab name="select_hpo" label="Select HPO terms" @click="onSwitchTab" />
          <q-tab name="input_hpo" label="Input HPO terms" @click="onSwitchTab" />
          <q-tab name="gene_panels" label="Select Gene Panels" @click="onSwitchTab" />
        </q-tabs>

        <q-separator />
        <q-tab-panels v-model="hpo_tab" animated>
          <q-tab-panel name="file">
            <q-file outlined bottom-slots counter v-model="HPO_file" label="HPO file">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="HPO_file = null" class="cursor-pointer" />
              </template>
              <template v-slot:after>
                <div class="example-file" @click="openExampleFile('hpo')">
                  <q-icon name="description" /><br />Example File
                </div>
              </template>
            </q-file>
          </q-tab-panel>
          <q-tab-panel name="select_hpo">
            <HpoTermsTree
              ref="HpoTermsTree"
              :hpo-version="hpoVersion"
              @updateTickedNode="updateTickedNode"
            >
            </HpoTermsTree>
          </q-tab-panel>
          <q-tab-panel name="input_hpo">
            <q-input
              filled
              outlined
              v-model="hpoInput"
              placeholder="Support comma, tab or space separated values"
            />
          </q-tab-panel>
          <q-tab-panel name="gene_panels">
            <div class="row">
              <div class="col-md-6">
                <GenePanel
                  :panel="panel"
                  :panelOptionsFilter="panelOptionsFilter"
                  :panelOptions="panelOptions"
                  @filterPanel="filterPanel"
                  @onNewPanelSelect="onNewPanelSelect"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
      <div class="hpo_message">
        <span>Choose a way to input HPO Terms</span>
      </div>
    </div>
    <div class="exomiser-text">
      # Please notice that the Exomiser result is based on the original ped file uploaded with the
      above HPO terms.
    </div>
    <div class="exomiser-text">* Each Exomiser run take about 20 minutes to process</div>
  </div>
</template>

<script>
import { ref } from 'vue'
import store from '@/store/store.js'
import HpoTermsTree from '@/components/common/HpoTermsTree.vue'
import GenePanel from '@/components/variants-table/filters/GenePanel.vue'
import { downloadFile } from '@/utils/common/common-utils.js'

export default {
  name: 'HpoTermsBox.vue',
  props: ['panelOptions', 'isOptional'],
  data() {
    return {
      hpo_tab: 'file',
      HPO_file: null,
      filterRef: ref(null),
      hpoVersion: '',
      panel: [],
      panelOptionsFilter: this.panelOptions,
      hpoInput: '',
      tickedNode: []
    }
  },
  async created() {
    await this.getHpoTermVersion()
  },
  watch: {},
  emits: ['updateTickedNode'],
  components: {
    HpoTermsTree,
    GenePanel
  },
  methods: {
    async onSwitchTab() {
      this.HPO_file = null
      this.panel = []
      this.hpoInput = ''
      //Remark : HPO tree will auto clear when re-rendering
    },
    async openExampleFile(type) {
      this.$q.loading.show()
      await downloadFile(type)
      this.$q.loading.hide()
    },
    async updateTickedNode(tickedNode) {
      this.$emit('updateTickedNode', tickedNode)
    },
    async getHpoTermVersion() {
      let hpoVersion = await store.getters.getApiService.getHpoTermVersion()
      if (hpoVersion.status === 200) {
        this.hpoVersion = hpoVersion.data.data[0]
      }
    },
    filterPanel(val, update) {
      if (val === '') {
        update(() => {
          this.panelOptionsFilter = this.panelOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.panelOptionsFilter = this.panelOptions.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    async onNewPanelSelect(Main_panel) {
      this.panel = Main_panel
    }
  }
}
</script>

<style scoped>
.exomiser-text {
  font-size: 14px;
  font-family: 'Mulish', sans-serif;
}
.remark-message {
  margin-top: 5px;
}
</style>
