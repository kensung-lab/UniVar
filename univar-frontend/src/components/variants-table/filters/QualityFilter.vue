<template>
  <div class='filter-component-container'>
    <b>Quality filter</b>
    <q-icon name="help" class="desc-icon">
      <q-tooltip>{{filterTooltip.quality.pass_filter}}</q-tooltip>
    </q-icon>
    <div>
      <div v-for="(item, index) in QualityOptions" :key="index">
        <q-checkbox v-model="Main_filters.pass_filter" :val="item.value" :label="item.label"  @click="onQualityFilterClick()"/>
      </div>
    </div>
    <div class='score-bar'>
      <div class="row">
        <div class="col-md-6">
          Quality score
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{filterTooltip.quality.qualityScore}}</q-tooltip>
          </q-icon>
        </div>
        <div class="col-sm-12 col-md-5 slider-drag" v-if='(!Main_filters.slider.quality.open)'>
          <q-slider
            v-model="Main_filters.quality"
            :min="qualityScore.min"
            :max="qualityScore.max"
            :step="qualityScore.step" snap label
            @change="onChangeSlider('quality',Main_filters.quality,Main_filters.quality)"/>
        </div>
        <div class="col-sm-12 col-md-5 slider-edit-col" v-else>
          <q-input square filled
                   v-model="Main_filters.slider.quality.custom_value"
                   v-on:keyup.enter="onSliderEdit('quality',Main_filters.slider.quality.custom_value, null)"
                   type="text"
                   class='slider-edit-input' />
        </div>
        <div class="col-sm-12 col-md-1 slider-input">
          <q-icon :name='Main_filters.slider["quality"]["open"] ? "tune" : "edit_note"'
                  class="slider-edit"
                  @click='onSliderEditClick(Main_filters.slider.quality,"quality")'>
          </q-icon>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'QualityFilter',
  props: [
    'renderComponent',
    'filters',
    'filterTooltip',
    'QualityOptions',
    'qualityScore'
  ],
  emits: ["onQualityFilterClick","onChangeSlider","onSliderEdit","onSliderEditClick"],
  data() {
    return{
      Main_filters : this.filters
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onQualityFilterClick(){
      this.$emit("onQualityFilterClick")
    },
    async onChangeSlider(type, newValue, sliderObject){
      this.$emit("onChangeSlider",type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject){
      this.$emit("onSliderEdit",type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type){
      this.$emit("onSliderEditClick",object, type)
    },
  }
}
</script>