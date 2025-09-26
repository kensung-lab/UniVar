<template>
  <div class="filter-component-container">
    <div class="row radio-group">
      <div class="col-sm-12 col-md-3 radio-gp-label">Read</div>
      <div class="col-sm-12 col-md-9">
        <div v-for="(item, index) in readStatusOptions" :key="index" class="radio-gp-hori">
          <q-radio
            v-model="mainFilters.is_read"
            :val="item.value"
            :label="item.label"
            @click="onClickRadioEvent('is_read', item.value)"
          />
        </div>
      </div>
    </div>
    <div class="row radio-group">
      <div class="col-sm-12 col-md-3 radio-gp-label">Note</div>
      <div class="col-sm-12 col-md-9">
        <div v-for="(item, index) in noteStatusOptions" :key="index" class="radio-gp-hori">
          <q-radio
            v-model="mainFilters.note"
            :val="item.value"
            @click="onClickRadioEvent('note', item.value)"
          >
            <template v-slot:default>
              <span>{{ item.label }}</span>
            </template>
          </q-radio>
        </div>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-row row">
        <div class="col-sm-12 col-md-3 filter-label">
          <span>Local Frequency</span>
          <q-tooltip>Filters variants present in >= this number of samples</q-tooltip>
        </div>
        <div class="col-sm-12 col-md-2 slider-input">
          <img :src="getSrc(sliderSUPP.conditions)" class="filter-symbol" />
        </div>
        <div
          class="col-sm-12 col-md-6 slider-drag filter-control"
          v-if="!mainFilters.slider.supp.open"
        >
          <FilterSliderAutoStep
            v-if="renderComponent"
            :filterModel="mainFilters.supp"
            :type="'supp'"
            :sliderObject="sliderSUPP"
            @onChangeSlider="onChangeSlider"
          />
        </div>
        <div class="col-sm-12 col-md-6" v-else>
          <q-input
            square
            filled
            v-model="mainFilters.slider.supp.custom_value"
            v-on:keyup.enter="
              onSliderEdit('supp', mainFilters.slider.supp.custom_value, sliderSUPP)
            "
            type="text"
            class="slider-edit-input"
          />
        </div>
        <div class="col-sm-12 col-md-1 slider-input">
          <q-icon
            :name="mainFilters.slider['supp']['open'] ? 'tune' : 'edit_note'"
            class="filter-icon"
            @click="onSliderEditClick(mainFilters.slider.supp, 'supp')"
          >
          </q-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FilterSliderAutoStep from '@/components/variants-table/filters/FilterSliderAutoStep.vue'
import { getImageSrc } from '@/utils/variants-table/filter/slider-utils'

export default {
  name: 'OthersFilter',
  components: {
    FilterSliderAutoStep
  },
  props: [
    'renderComponent',
    'sliderSUPP',
    'filters',
    'readStatusOptions',
    'noteStatusOptions',
    'userInfo',
    'gte',
    'lte'
  ],
  emits: [
    'onClickRadioEvent',
    'onChangeSlider',
    'onSliderEdit',
    'onSliderEditClick',
    ,
    'onChangeSelectBox'
  ],
  data() {
    return {
      mainFilters: this.filters
    }
  },
  created() {
    console.log('filters: ', this.filters)
    console.log('sliderSUPP: ', this.sliderSUPP)
    console.log('userInfo: ', this.userInfo)
  },
  methods: {
    async onChangeSlider(type, newValue, sliderObject) {
      this.$emit('onChangeSlider', type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject) {
      this.$emit('onSliderEdit', type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type) {
      this.$emit('onSliderEditClick', object, type)
    },
    async onClickRadioEvent(type, clickValue) {
      this.$emit('onClickRadioEvent', type, clickValue)
    },
    async onChangeSelectBox(type, selectedValue) {
      this.$emit('onChangeSelectBox', type, selectedValue)
    },
    getSrc(conditions) {
      return getImageSrc(conditions, this.gte, this.lte)
    }
  }
}
</script>
