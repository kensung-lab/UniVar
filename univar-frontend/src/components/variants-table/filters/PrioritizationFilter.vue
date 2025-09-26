<template>
  <div class="filter-component-container">
    <div class="exomiser-notice" v-if="!selectedExomiser.run">Please select Exomiser.</div>

    <div class="exomiser-filter" :class="!selectedExomiser.run ? 'exomiser-filter-disable' : ''">
      <div v-for="(item, index) in exomSliderItem.exomiser" :key="index">
        <div class="row slider-group">
          <div class="col-sm-12 col-md-12 slider-label">{{ item.label }}</div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(item.sliderObject.conditions)" class="filter-symbol" />
          </div>
          <div class="col-sm-12 col-md-10 slider-drag" v-if="!main_filters.slider[item.field].open">
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="main_filters[item.field]"
              :type="item.field"
              :sliderObject="item.sliderObject"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-10" v-else>
            <q-input
              square
              filled
              v-model="main_filters.slider[item.field].custom_value"
              v-on:keyup.enter="
                onSliderEditReserve(
                  item.field,
                  main_filters.slider[item.field].custom_value,
                  item.sliderObject
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="main_filters.slider[item.field]['open'] ? 'tune' : 'edit_note'"
              class="slider-edit"
              @click="onSliderEditClick(main_filters.slider[item.field], item.field)"
            >
            </q-icon>
          </div>
        </div>
        <br />
      </div>
    </div>
  </div>
</template>

<script>
import FilterSliderAutoStep from '@/components/variants-table/filters/FilterSliderAutoStep.vue'
import { getImageSrc } from '@/utils/variants-table/filter/slider-utils'
export default {
  name: 'PrioritizationFilter',
  components: {
    FilterSliderAutoStep
  },
  props: [
    'exomSliderItem',
    'renderComponent',
    'filters',
    'userInfo',
    'selectedExomiser',
    'gte',
    'lte'
  ],
  emits: ['onChangeSlider', 'onSliderEditReserve', 'onSliderEditClick'],
  data() {
    return {
      main_filters: this.filters
    }
  },
  methods: {
    async onChangeSlider(type, newValue, sliderObject) {
      this.$emit('onChangeSlider', type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type) {
      this.$emit('onSliderEditClick', object, type)
    },
    async onSliderEditReserve(type, newValue, sliderObject) {
      this.$emit('onSliderEditReserve', type, newValue, sliderObject)
    },
    getSrc(conditions) {
      return getImageSrc(conditions, this.gte, this.lte)
    }
  }
}
</script>
