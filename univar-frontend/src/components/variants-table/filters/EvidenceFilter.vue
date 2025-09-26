<template>
  <div class="filter-component-container no-padding">
    <q-card class="filter-card filter-card-padding">
      <div class="row filter-row">
        <div class="col-md-12">
          <span>ClinGen HI</span>
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{ filterTooltip.evidence.clingen_hi }}</q-tooltip>
          </q-icon>
        </div>
        <div class="col-md-12 col-sm-12">
          <q-select
            multiple
            outlined
            clearable
            v-model="mainFilters.clingen_hi"
            :options="impactSVClinGenHIOptions"
            @update:model-value="onChangeSelectBox('clingen_hi', mainFilters.clingen_hi)"
            emit-value
            map-options
          >
            <template v-slot:selected>
              <div class="gene-panel-label">
                <span v-for="(item, index) in mainFilters.clingen_hi" :key="index"
                  >{{ item }}
                </span>
              </div>
            </template>
          </q-select>
        </div>
      </div>
      <div class="row filter-row">
        <div class="col-md-12">
          <span>ClinGen TS</span>
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{ filterTooltip.evidence.clingen_ts }}</q-tooltip>
          </q-icon>
        </div>
        <div class="col-md-12 col-sm-12">
          <q-select
            multiple
            outlined
            clearable
            v-model="mainFilters.clingen_ts"
            :options="impactSVClinGenTSOptions"
            @update:model-value="onChangeSelectBox('clingen_ts', mainFilters.clingen_ts)"
            emit-value
            map-options
          >
            <template v-slot:selected>
              <div class="gene-panel-label">
                <span v-for="(item, index) in mainFilters.clingen_ts" :key="index"
                  >{{ item }}
                </span>
              </div>
            </template>
          </q-select>
        </div>
      </div>
      <div class="row filter-row">
        <div class="col-md-12">ClinVar Classification</div>
        <div class="col-md-12 col-sm-12">
          <q-select
            outlined
            multiple
            use-chips
            stack-label
            v-model="mainFilters.clnsig"
            :options="clinVarClinsigOptions"
            @update:model-value="onChangeSelectBox('clnsig', mainFilters.clnsig)"
          >
            <template v-slot:append>
              <q-icon
                v-if="mainFilters.clnsig !== null"
                class="cursor-pointer"
                name="clear"
                @click.stop.prevent="onChangeSelectBox('clnsig', mainFilters.clnsig, true)"
              />
            </template>
          </q-select>
        </div>
      </div>
    </q-card>
  </div>
</template>
<script>
export default {
  name: 'EvidenceFilter',
  props: [
    'renderComponent',
    'filters',
    'filterTooltip',
    'clinVarClinsigOptions',
    'impactSVClinGenHIOptions',
    'impactSVClinGenTSOptions'
  ],
  emits: ['onChangeSelectBox'],
  data() {
    return {
      mainFilters: this.filters
    }
  },
  methods: {
    async onChangeSelectBox(type, selectedValue, isNull = false) {
      if (isNull) {
        this.mainFilters[type] = null
      }

      this.$emit('onChangeSelectBox', type, selectedValue)
    }
  }
}
</script>
