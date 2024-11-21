<template>
  <div>
    <q-select input-debounce="0" behavior="menu"
              use-input outlined multiple use-chips stack-label
              v-model="Main_panel" :options="panelOptionsFilter"
              @virtual-scroll="true"
              @update:model-value="onNewPanelSelect()"
              @filter='filterPanel' emit-value map-options
              menu-anchor="center right"
              :popup-content-style="`height: 500px; word-break: break-all;`" style="word-break: break-all;"
    >
      <template v-slot:prepend>
        <span style='font-size: 12px'>Panels</span>
      </template>

      <template v-if="Main_panel !== null && Main_panel.length !== 0">
        <q-tooltip>
          <span v-for="(item, index) in convertPanel(Main_panel)" :key="index">- {{item.label}} <br> </span>
        </q-tooltip>
      </template>
      <template v-slot:selected v-if="Main_panel !== null && Main_panel.length > 4">
        <div class="gene-panel-label">
          Selected ({{Main_panel.length}})
          <span v-for="(item, index) in convertPanel(Main_panel)" :key="index">{{item.label}} </span>
        </div>
      </template>
      <template v-slot:append>
        <q-icon
          v-if="Main_panel !== null && Main_panel.length !== 0"
          class="cursor-pointer"
          name="clear"
          @click.stop.prevent="(Main_panel = null); onNewPanelSelect()"
        />
      </template>
    </q-select>
  </div>
</template>


<script>

import { convertPanelFromValueToName } from '@/utils/variants-table/filter/gene-panel-utils'

export default {
  name: 'GenePanel',
  props: [
    'panel',
    'panelOptionsFilter',
    'panelOptions'
  ],
  emits: ["onNewPanelSelect","filterPanel"],
  data() {
    return{
      Main_panel : this.panel
    }
  },
  watch: {
    'panel' :{
      async handler() {
        if(this.panel !== ""){
          this.Main_panel = this.panel
        }
      },
      immediate: true,
      deep: true
    }
  },
  async created() {

  },
  methods: {
    async onNewPanelSelect(){
      this.$emit("onNewPanelSelect",this.Main_panel)
    },
    convertPanel(panels){
      return convertPanelFromValueToName(panels, this.panelOptions)
    },
    filterPanel(val, update){
      this.$emit("filterPanel",val, update)
    }
  }
}
</script>