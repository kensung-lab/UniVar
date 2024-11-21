<template>
  <div class='filter-component-container'>
    <div class="row radio-group">
      <div class="col-sm-12 col-md-3 radioGpLabel">Read</div>
      <div class="col-sm-12 col-md-9"><div v-for="(item, index) in readStatusOptions" :key="index" class="radioGpHori">
        <q-radio v-model="Main_filters.is_read" :val="item.value" :label="item.label" @click="onClickRadioEvent('is_read',item.value)"/>
      </div></div>
    </div>
    <div class="row radio-group">
      <div class="col-sm-12 col-md-3 radioGpLabel">Note</div>
      <div class="col-sm-12 col-md-9"><div v-for="(item, index) in noteStatusOptions" :key="index" class="radioGpHori">
        <q-radio v-model="Main_filters.note" :val="item.value"  @click="onClickRadioEvent('note',item.value)">
          <template v-slot:default>
            <span>{{item.label}}</span>
          </template>
        </q-radio>
      </div></div>
    </div>
    <div class="row radio-group">
      <div class="col-sm-12 col-md-3 radioGpLabel">Variant type</div>
      <div class="col-sm-12 col-md-9"><div v-for="(item, index) in varTypeOptions" :key="index" class="radioGpHori">
        <q-radio v-model="Main_filters.variant_type" :val="item.value" :label="item.label" @click="onClickRadioEvent('variant_type',item.value); onClickChangeVariantType()"/>
      </div></div>
    </div>
    <div class="row">
      <div class="col-sm-12 col-md-3 text-center">Caller</div>
      <div class="col-sm-12 col-md-8">
        <q-select outlined v-model="Main_filters.caller" :options="callerOptions" @update:model-value="onChangeSelectBox('caller',Main_filters.caller)" emit-value map-options clearable/>
      </div>
    </div>
    <div class="row slider-group">
      <div class="col-sm-12 col-md-3 radioGpLabel">SV length</div>
      <div class="col-sm-12 col-md-8 slider-drag">
        <FilterSlider v-if="renderComponent" :FilterModel="Main_filters.len" :type="'len'" :sliderObject="sliderSVLength" @onChangeSlider="onChangeSlider"/>
      </div>
    </div>
  </div>
</template>


<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'
export default {
  name: 'OthersFilter',
  components: {
    FilterSlider
  },
  props: [
    'renderComponent',
    'filters',
    'readStatusOptions',
    'noteStatusOptions',
    'varTypeOptions',
    'callerOptions',
    'userInfo',
    'sliderSVLength'
  ],
  emits: ["onClickRadioEvent","onClickChangeVariantType","onChangeSlider","onSliderEditClick","onChangeSelectBox"],
  data() {
    return{
      Main_filters : this.filters
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onChangeSlider(type, newValue, sliderObject){
      this.$emit("onChangeSlider",type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type){
      this.$emit("onSliderEditClick",object, type)
    },
    async onClickRadioEvent(type, clickValue){
      this.$emit("onClickRadioEvent",type, clickValue)
    },
    async onClickChangeVariantType(){
      this.$emit("onClickChangeVariantType")
    },
    async onChangeSelectBox(type, selectedValue){
      this.$emit("onChangeSelectBox",type,selectedValue)
    },
  }
}
</script>