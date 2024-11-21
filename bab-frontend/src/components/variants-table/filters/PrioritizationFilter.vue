<template>
  <div class='filter-component-container'>

    <div class='exomiser_notice' v-if='!selectedExomiser.run'>Please select Exomiser.</div>

    <div class='exomiser_filter' :class='!selectedExomiser.run ? "exomiser_filter_disable" : "" '>
      <div v-for="(item, index) in exomSliderItem.exomiser" :key="index" >
        <div class="row slider-group">
          <div class="col-sm-12 col-md-5 slider-label">{{item.label}}</div>
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
                     v-on:keyup.enter="onSliderEditReserve(item.field,Main_filters.slider[item.field].custom_value, item.sliderObject)"
                     type="text"
                     class='sliderEditInput' />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                    class="sliderEdit"
                    @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
            </q-icon>
          </div>
        </div><br>
      </div>
    </div>

<!--
    <q-card>
      <q-tabs
        v-model="Main_priori_tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="combined" @click='changeTab("combined")' >
          <span class='priori_tab'> Exomiser Combined <br>Scores </span>
        </q-tab>
        <q-tab name="phenotype" @click='changeTab("phenotype")' >
          <span class='priori_tab'> Exomiser Phenotype <br>Scores </span>
        </q-tab>
      </q-tabs>

      <q-separator />
      <q-tab-panels v-model="Main_priori_tab" animated>
        <q-tab-panel name="combined">
          <div class='priori_slider'>
            <div v-for="(item, index) in exomSliderItem.combined" :key="index" >
              <div class="row slider-group">
                <div class="col-sm-12 col-md-5 slider-label">{{item.label}}</div>
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
                           v-on:keyup.enter="onSliderEditReserve(item.field,Main_filters.slider[item.field].custom_value, item.sliderObject)"
                           type="text"
                           class='sliderEditInput' />
                </div>
                <div class="col-sm-12 col-md-1 slider-input">
                  <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                          class="sliderEdit"
                          @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
                  </q-icon>
                </div>
              </div><br>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="phenotype">
          <div class='priori_slider'>
            <div v-for="(item, index) in exomSliderItem.phenotype" :key="index">
              <div class="row slider-group">
                <div class="col-sm-12 col-md-5 slider-label">{{item.label}}</div>
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
                           v-on:keyup.enter="onSliderEditReserve(item.field,Main_filters.slider[item.field].custom_value, item.sliderObject)"
                           type="text"
                           class='sliderEditInput' />
                </div>
                <div class="col-sm-12 col-md-1 slider-input">
                  <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                          class="sliderEdit"
                          @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
                  </q-icon>
                </div>
              </div><br>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    -->

  </div>
</template>

<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'
export default {
  name: 'PrioritizationFilter',
  components: {
    FilterSlider
  },
  props: [
    'priori_tab',
    'exomSliderItem',
    'renderComponent',
    'filters',
    'userInfo',
    'selectedExomiser'
  ],
  emits: ["onChangeSlider","onSliderEditReserve","onSliderEditClick","changePrioriTab"],
  data() {
    return{
      Main_filters : this.filters,
      Main_priori_tab : this.priori_tab
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
    async onSliderEditReserve(type, newValue, sliderObject){
      this.$emit("onSliderEditReserve",type, newValue, sliderObject)
    },
    async changeTab(tab){
      this.$emit("changePrioriTab", tab)
    }
  }
}
</script>