<template>
  <q-slider marker-labels
            v-model="thisModel"
            :min="sliderObject.min"
            :max="sliderObject.max"
            :step="sliderObject.step"
            @change="onChangeSlider(thisModel)">
    <template v-slot:marker-label-group="scope">
      <div v-if='((sliderObject.markerList).length > 5)'>
        <div
          v-for="marker in scope.markerList"
          :key="marker.index"
          :class="[ marker.classes ]"
          :style="marker.style"
        >
          <div v-if='(thisModel === sliderObject.markerList[marker.index].value && thisModel !== 1 && thisModel !== (sliderObject.markerList).length)'>
            {{sliderObject.markerList[marker.index].label}}
          </div>
          <div v-if="sliderObject.markerList[marker.index].label ==='0'">
            {{sliderObject.markerList[marker.index].label}}
          </div>
          <div v-if="sliderObject.markerList[marker.index].label ==='1'">
            {{sliderObject.markerList[marker.index].label}}
          </div>
        </div>
      </div>
      <div v-else>
        <div
          v-for="marker in scope.markerList"
          :key="marker.index"
          :class="[ marker.classes ]"
          :style="marker.style"
        >
            {{sliderObject.markerList[marker.index].label}}
        </div>
      </div>
    </template>
  </q-slider>
</template>


<script>
export default {
  name: 'FilterSlider',
  props: [
    'FilterModel',
    'type',
    'sliderObject'
  ],
  data() {
    return{
      thisModel : this.FilterModel
    }
  },
  async created() {
    //console.log(this.sliderObject)
  },
  methods: {
    async onChangeSlider(newValue){
      this.$emit("onChangeSlider", this.type, newValue, this.sliderObject);
    },
  }
}
</script>
