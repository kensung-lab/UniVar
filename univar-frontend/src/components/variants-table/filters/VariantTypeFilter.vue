<template>
  <div class="filter-component-container no-padding variant-type-filter-container">
    <q-card class="filter-card filter-card-padding">
      <div class="row filter-row radio-group">
        <div class="col-sm-12 col-md-3 radio-gp-label">Variant type</div>
        <div class="col-sm-12 col-md-9">
          <div v-for="(item, index) in varTypeOptions" :key="index" class="radio-gp-hori">
            <q-radio
              v-model="mainFilters.variant_type"
              :val="item.value"
              :label="item.label"
              @click="onVariantTypeChangeVariantType('variant_type', item.value)"
            />
          </div>
        </div>
      </div>
      <div class="row filter-row radio-group">
        <div class="col-md-3 radio-gp-label">SNV Type</div>
        <div class="col-md-9">
          <div v-for="(item, index) in impactSmallVTypeOptions" :key="index" class="radio-gp-hori">
            <q-radio
              v-model="mainFilters.snv_type"
              :val="item.value"
              :label="item.label"
              @click="onClickRadioEvent('snv_type', item.value)"
            />
          </div>
        </div>
      </div>
      <div class="row filter-row radio-group">
        <div class="col-md-3 radio-gp-label">
          SV Type
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{ filterTooltip.impact.sv.type }}</q-tooltip>
          </q-icon>
        </div>
        <div class="col-md-9">
          <div v-for="(item, index) in impactSVTypeOptions" :key="index" class="radio-gp-hori">
            <q-radio
              v-model="mainFilters.sv_type"
              :val="item.value"
              :label="item.label"
              @click="onClickRadioEvent('sv_type', item.value)"
            />
          </div>
        </div>
      </div>
      <div class="row select-group filter-row">
        <div class="col-md-12">
          <span>SV Caller</span>
        </div>
        <div class="col-md-12">
          <q-select
            outlined
            v-model="mainFilters.caller"
            :options="callerOptions"
            @update:model-value="onChangeSelectBox('caller', mainFilters.caller)"
            emit-value
            map-options
            clearable
          />
        </div>
      </div>
      <div class="filter-row row">
        <div class="col-sm-12 col-md-3 filter-label">
          <span>SV length</span>
          <!-- <q-tooltip>Observed/Expected Upper Bound</q-tooltip> -->
        </div>
        <div class="col-sm-12 col-md-1 filter-symbol-col">
          <img :src="getSrc(sliderSVLength.conditions)" class="filter-symbol" />
        </div>
        <div
          class="col-sm-12 col-md-7 slider-drag filter-control"
          v-if="!mainFilters.slider.len.open"
        >
          <FilterSlider
            v-if="renderComponent"
            :FilterModel="mainFilters.len"
            :type="'len'"
            :sliderObject="sliderSVLength"
            @onChangeSlider="onChangeSlider"
          />
        </div>
        <div class="col-sm-12 col-md-7" v-else>
          <q-input
            square
            filled
            v-model="mainFilters.slider.len.custom_value"
            v-on:keyup.enter="
              onSliderEdit('len', mainFilters.slider.len.custom_value, sliderSVLength)
            "
            type="text"
            class="slider-edit-input"
          />
        </div>
        <div class="col-sm-12 col-md-1 slider-input">
          <q-icon
            :name="mainFilters.slider['len']['open'] ? 'tune' : 'edit_note'"
            class="filter-icon"
            @click="onSliderEditClick(mainFilters.slider.len, 'len')"
          >
          </q-icon>
        </div>
      </div>
    </q-card>
  </div>
</template>
<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'
import { getImageSrc } from '@/utils/variants-table/filter/slider-utils'
export default {
  name: 'VariantTypeFilter',
  components: {
    FilterSlider
  },
  props: [
    'renderComponent',
    'filters',
    'filterTooltip',
    'varTypeOptions',
    'impactSmallVTypeOptions',
    'impactSVTypeOptions',
    'sliderSVLength',
    'callerOptions',
    'gte',
    'lte'
  ],
  emits: [
    'onChangeSelectBox',
    'onClickRadioEvent',
    'onClickChangeVariantType',
    'onChangeSlider',
    'onSliderEdit',
    'onSliderEditClick'
  ],
  data() {
    return {
      mainFilters: this.filters
    }
  },
  methods: {
    async onChangeSelectBox(type, selectedValue) {
      this.$emit('onChangeSelectBox', type, selectedValue)
    },
    async onVariantTypeChangeVariantType(type, clickValue) {
      this.$emit('onClickRadioEvent', type, clickValue)
      this.$emit('onClickChangeVariantType')
    },
    async onClickRadioEvent(type, value) {
      this.$emit('onClickRadioEvent', type, value)
    },
    async onChangeSlider(type, newValue, sliderObject) {
      this.$emit('onChangeSlider', type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject) {
      this.$emit('onSliderEdit', type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type) {
      this.$emit('onSliderEditClick', object, type)
    },
    getSrc(conditions) {
      return getImageSrc(conditions, this.gte, this.lte)
    }
  }
}
</script>
