<template>
  <q-slider
    v-model="thisModel"
    :min="sliderObject.min"
    :max="sliderObject.max"
    :step="sliderObject.step"
    markers
    :marker-labels="sliderObject.custom_maker"
    color="primary"
    label
    snap
    :inner-track-color="sliderObject.conditions == '$gte' ? 'primary' : 'transparent'"
    :selection-color="sliderObject.conditions == '$gte' ? 'grey' : 'primary'"
    @change="onChangeSlider(thisModel)"
  >
    <template v-slot:marker-label-group="scope" v-if="sliderObject.markerList">
      <div v-if="sliderObject.markerList && sliderObject.markerList.length > 5">
        <div
          v-for="marker in scope.markerList"
          :key="marker.index"
          :class="[marker.classes]"
          :style="marker.style"
        >
          <div
            v-if="
              thisModel === sliderObject.markerList[marker.index].value &&
              thisModel !== 1 &&
              thisModel !== sliderObject.markerList.length
            "
          >
            {{ sliderObject.markerList[marker.index].label }}
          </div>
          <div v-if="sliderObject.markerList[marker.index].label === '0'">
            {{ sliderObject.markerList[marker.index].label }}
          </div>
          <div v-if="sliderObject.markerList[marker.index].label === '1'">
            {{ sliderObject.markerList[marker.index].label }}
          </div>
        </div>
      </div>
      <div v-else>
        <div
          v-for="marker in scope.markerList"
          :key="marker.index"
          :class="[marker.classes]"
          :style="marker.style"
        >
          {{ sliderObject.markerList[marker.index].label }}
        </div>
      </div>
    </template>
  </q-slider>
</template>

<script>
export default {
  name: 'FilterSliderAutoStep',
  props: ['filterModel', 'type', 'sliderObject'],
  data() {
    return {
      thisModel: this.filterModel
    }
  },
  methods: {
    async onChangeSlider(newValue) {
      this.$emit('onChangeSlider', this.type, newValue, this.sliderObject)
    }
  }
}
</script>
