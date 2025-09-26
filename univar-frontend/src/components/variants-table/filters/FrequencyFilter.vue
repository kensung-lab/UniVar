<template>
  <div class='filter-component-container'>
    <div v-for="(item, index) in frequencySliderItem" :key="index">
      <div class="row slider-group">
        <div class="col-sm-12 col-md-6">{{item.label}}</div>
        <div class="col-sm-12 col-md-5 slider-drag" v-if='(!Main_filters.slider[item.field].open)'>
          <FilterSlider
            v-if="renderComponent"
            :FilterModel="Main_filters[item.field]"
            :type="item.field"
            :sliderObject="item.sliderObject"
            @onChangeSlider="onChangeSlider"/>
        </div>
        <div class="col-sm-12 col-md-5" v-else>
          <q-input square filled
                   v-model="Main_filters.slider[item.field].custom_value"
                   v-on:keyup.enter="onSliderEdit(item.field, Main_filters.slider[item.field].custom_value, item.sliderObject)"
                   type="text"
                   class='slider-edit-input' />
        </div>
        <div class="col-sm-12 col-md-1 slider-input">
          <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                  class="slider-edit"
                  @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
          </q-icon>
        </div>
      </div><br>
    </div>

    <div class="add-frequency-filter">
      <div class="row">
        <div class='col-md-12'>
          <q-select
            filled
            v-model="Main_selectAddFrequency"
            :options="dynamicFrequencyOptionsDisplay"
            label="More filters..."
            color="teal"
            clearable
            use-input
            outline
            options-selected-class="text-deep-orange-8"
            @filter="filterFq"
          >
            <template v-slot:option="scope" v-if='!searchingDynamicFrequency'>
              <q-expansion-item
                group="frequency-group"
                expand-separator
                header-class="text-weight-bold"
                :label="scope.opt.label"
                style='max-height: 220px; overflow-y: scroll;'
              >
                <template v-for="child in scope.opt.children" :key="child.label">
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="Main_selectAddFrequency = child"
                    v-if='child.isShow'
                  >
                    <q-item-section>
                      <q-item-label v-html="child.label" class="q-ml-md" ></q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-expansion-item>
            </template>
          </q-select>
        </div>
        <!--                        <div class="col-md-1">-->
        <!--                          <q-icon name="add_circle" class='filter-frequency-icon' @click='addMoreFrequency'/>-->
        <!--                        </div>-->
      </div>
    </div>

    <template v-for="(item, index) in frequencyDynamicSliderItem" :key="index">
      <div v-if='item.isShow'>
        <div class="row slider-group">
          <div class="col-sm-12 col-md-6">{{item.label}}<br>
            <q-icon name="remove_circle" class='remove-filter-frequency-icon' @click='removeMoreFrequency(item.field)'/>
          </div>
          <div class="col-sm-12 col-md-5 slider-drag" v-if='(!Main_filters.slider[item.field].open)'>
            <FilterSlider
              v-if="renderComponent"
              :FilterModel="Main_filters[item.field]"
              :type="item.field"
              :sliderObject="item.sliderObject"
              @onChangeSlider="onChangeSlider"/>
          </div>
          <div class="col-sm-12 col-md-5" v-else>
            <q-input square filled
                     v-model="Main_filters.slider[item.field].custom_value"
                     v-on:keyup.enter="onSliderEdit(item.field, Main_filters.slider[item.field].custom_value, item.sliderObject)"
                     type="text"
                     class='slider-edit-input' />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                    class="slider-edit"
                    @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
            </q-icon>
          </div>
        </div><br>
      </div>
    </template>

  </div>
</template>


<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'
export default {
  name: 'FrequencyFilter',
  components: {
    FilterSlider
  },
  props: [
    'frequencySliderItem',
    'renderComponent',
    'filters',
    'selectAddFrequency',
    'dynamicFrequencyOptionsDisplay',
    'searchingDynamicFrequency',
    'frequencyDynamicSliderItem',
    'dynamicFrequencyOptions'
  ],
  emits: ["onChangeSlider","onSliderEdit","onSliderEditClick","filterFq","removeMoreFrequency","addMoreFrequency"],
  data() {
    return{
      Main_filters : this.filters,
      Main_selectAddFrequency: this.selectAddFrequency
    }
  },
  async created() {
    //start component
  },
  watch: {
    'Main_selectAddFrequency' :{
      async handler(newVal, oldVal) {
        //wait until popup close
        setTimeout(() => {
          this.addMoreFrequency()
        }, 100)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onChangeSlider(type, newValue, sliderObject){
      this.$emit("onChangeSlider",type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject){
      this.$emit("onSliderEdit",type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type){
      this.$emit("onSliderEditClick",object, type)
    },
    filterFq(val, update){
      this.$emit("filterFq",val, update)
    },
    async removeMoreFrequency(value){
      this.$emit("removeMoreFrequency",value)
    },
    async addMoreFrequency(){
      this.frequencyDynamicSliderItem.forEach((el, key) => {
        if(el.field === this.Main_selectAddFrequency.value ){
          el.isShow = true
        }
      })

      this.dynamicFrequencyOptions.forEach(el => {
        el.children.forEach(child => {
          if (child.value === this.Main_selectAddFrequency.value) {
            child.isShow = false
          }
        })
      })

      this.Main_selectAddFrequency = ""
    }
  }
}
</script>