<template>
  <div>
    <template v-for="(ele, index) in this.preset_options" :key='index'>
      <q-item clickable :class="ele.data.is_default ? 'sticky-bookmark' : '' ">
        <q-item-section>
          <div class="preset-container">
            <div class="preset-list-left"  @click="onSelectPreset(ele)" v-close-popup :style="ele.data.is_default ? 'width: 100%' : '' ">
              <span class="select-label">{{ele.label}}</span>
              <div class="hover-container hover-preset" :class='external ? "hover-preset-external" : ""'>
                <FilteredBox :variantsFilter='ele.data.filters' :panels='convertPanel(ele.data.panels)' :fieldArray='[]' :show-all=true :allowRemove=false />
              </div>
            </div>
            <div class="preset-list-right" v-if='!ele.data.is_default'>
              <q-icon name="clear" class='preset-delete-btn' @click="onDeletePreset(ele)" v-close-popup/>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </template>
  </div>
</template>


<script>
import FilteredBox from '@/components/variants-table/filters/FilteredBox.vue'
import { convertPanelFromValueToName } from '@/utils/variants-table/filter/gene-panel-utils'

export default {
  name: 'PresetSelect',
  props: [
    'preset_options',
    'panelOptions',
    'external'
  ],
  components: {
    FilteredBox
  },
  emits: ["onSelectPreset","convertPanel","onDeletePreset"],
  data() {
    return{

    }
  },
  async created() {

  },
  methods: {
    async onSelectPreset(presetObj){
      this.$emit("onSelectPreset",presetObj)
    },
    async onDeletePreset(presetObj){
      this.$emit("onDeletePreset",presetObj)
    },
    convertPanel(panels){
      return convertPanelFromValueToName(panels, this.panelOptions)
    },
  }
}
</script>