<template>
  <div class='filter-component-container no-padding'>
    <q-card>
      <q-tabs
        v-model="Main_tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="small_v" label="Small Variant" @click='changeTab("small_v")'/>
        <q-tab name="sv" label="SV" @click='changeTab("sv")'/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="Main_tab" animated>
        <q-tab-panel name="small_v" class='patho-snp-tab'>
          <q-checkbox  v-model="Main_filters.PolyphenPredClick" label="Polyphen pred" @click="onPolyphenPredClick"/>
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{ filterTooltip.pathogenicity.polyphen_pred }}</q-tooltip>
          </q-icon>
          <div class="checkbox-group">
            <div v-for="(item, index) in PolyphenPredOptions" :key="index" class="checkbox-gp-vertical">
              <q-checkbox v-model="Main_filters.polyphen_pred" :val="item.value" :label="item.label" @click="onPolyphenPredItemsClick" />
            </div>
          </div>

          <q-checkbox  v-model="Main_filters.siftPredClick" label="Sift pred"  @click="onSiftPredClick" />
          <q-icon name="help" class="desc-icon">
            <q-tooltip>{{ filterTooltip.pathogenicity.sift_pred }}</q-tooltip>
          </q-icon>
          <div class="checkbox-group">
            <div v-for="(item, index) in siftPredOptions" :key="index" class="checkbox-gp-vertical">
              <q-checkbox v-model="Main_filters.sift_pred" :val="item.value" :label="item.label"  @click="onSiftPredItemsClick"/>
            </div>
          </div>

          <div class='score-bar'>
            <div class="row slider-group">
              <div class="col-sm-12 col-md-5">Revel</div>
              <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.revel.open)'>
                <FilterSlider v-if="renderComponent" :FilterModel="Main_filters.revel" :type="'revel'" :sliderObject="sliderRevel" @onChangeSlider="onChangeSlider"/>
              </div>
              <div class="col-sm-12 col-md-6" v-else>
                <q-input square filled
                         v-model="Main_filters.slider.revel.custom_value"
                         v-on:keyup.enter="onSliderEdit('revel',Main_filters.slider.revel.custom_value, sliderRevel)"
                         type="text"
                         class='slider-edit-input' />
              </div>
              <div class="col-sm-12 col-md-1 slider-input">
                <q-icon :name='Main_filters.slider["revel"]["open"] ? "tune" : "edit_note"' class="slider-edit" @click='onSliderEditClick(Main_filters.slider.revel,"revel")'></q-icon>
              </div>
            </div><br>
            <div class="row slider-group">
              <div class="col-sm-12 col-md-5">CADD Scores</div>
              <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.cadd_phred.open)'>
                <FilterSlider v-if="renderComponent" :FilterModel="Main_filters.cadd_phred" :type="'cadd_phred'" :sliderObject="sliderCADD" @onChangeSlider="onChangeSlider"/>
              </div>
              <div class="col-sm-12 col-md-6" v-else>
                <q-input square filled
                         v-model="Main_filters.slider.cadd_phred.custom_value"
                         v-on:keyup.enter="onSliderEditReserve('cadd_phred',Main_filters.slider.cadd_phred.custom_value, sliderCADD)"
                         type="text"
                         class='slider-edit-input' />
              </div>
              <div class="col-sm-12 col-md-1 slider-input">
                <q-icon :name='Main_filters.slider["cadd_phred"]["open"] ? "tune" : "edit_note"' class="slider-edit" @click='onSliderEditClick(Main_filters.slider.cadd_phred,"cadd_phred")'></q-icon>
              </div>
            </div><br>
            <div class="row slider-group">
              <div class="col-sm-12 col-md-5">
                Polyphen score
                <q-icon name="help" class="desc-icon">
                  <q-tooltip>{{ filterTooltip.pathogenicity.polyphen_score }}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.polyphen_score.open)'>
                <FilterSlider
                  v-if="renderComponent"
                  :FilterModel="Main_filters.polyphen_score"
                  :type="'polyphen_score'"
                  :sliderObject="sliderObject"
                  @onChangeSlider="onChangeSlider"/>
              </div>
              <div class="col-sm-12 col-md-6" v-else>
                <q-input square filled
                         v-model="Main_filters.slider.polyphen_score.custom_value"
                         v-on:keyup.enter="onSliderEdit('polyphen_score',Main_filters.slider.polyphen_score.custom_value, sliderObject)"
                         type="text"
                         class='slider-edit-input' />
              </div>
              <div class="col-sm-12 col-md-1 slider-input">
                <q-icon :name='Main_filters.slider["polyphen_score"]["open"] ? "tune" : "edit_note"'
                        class="slider-edit"
                        @click='onSliderEditClick(Main_filters.slider.polyphen_score,"polyphen_score")'>
                </q-icon>
              </div>
            </div>
          </div>
          <div class='score-bar'>
            <div class="row slider-group">
              <div class="col-sm-12 col-md-5">
                Sift score
                <q-icon name="help" class="desc-icon">
                  <q-tooltip>{{ filterTooltip.pathogenicity.sift_score }}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.sift_score.open)'>
                <FilterSlider
                  v-if="renderComponent"
                  :FilterModel="Main_filters.sift_score"
                  :type="'sift_score'"
                  :sliderObject="sliderObject"
                  @onChangeSlider="onChangeSlider"/>
              </div>
              <div class="col-sm-12 col-md-6" v-else>
                <q-input square filled
                         v-model="Main_filters.slider.sift_score.custom_value"
                         v-on:keyup.enter="onSliderEdit('sift_score', Main_filters.slider.sift_score.custom_value, sliderObject)"
                         type="text"
                         class='slider-edit-input' />
              </div>
              <div class="col-sm-12 col-md-1 slider-input">
                <q-icon :name='Main_filters.slider["sift_score"]["open"] ? "tune" : "edit_note"'
                        class="slider-edit"
                        @click='onSliderEditClick(Main_filters.slider.sift_score,"sift_score")'>
                </q-icon>
              </div>

            </div>
          </div><br>

          <div class="row select-group">
            <div class="col-md-12">
              ClinVar Classification
            </div>
            <div class="col-md-12 col-sm-12">
              <q-select outlined multiple use-chips stack-label v-model="Main_filters.clnsig" :options="clinVarClinsigOptions" @update:model-value="onChangeSelectBox('clnsig',Main_filters.clnsig)" >
                <template v-slot:append>
                  <q-icon
                    v-if="Main_filters.clnsig !== null"
                    class="cursor-pointer"
                    name="clear"
                    @click.stop.prevent="(Main_filters.clnsig = null); onChangeSelectBox('clnsig',Main_filters.clnsig)"
                  />
                </template>
              </q-select>
            </div>
          </div><br>
          <div class="row impact-sub-group">
            <div class='sub-group-title'>
              <q-icon name="category" class='category-icon'/>
              SpliceAI
            </div>
            <div class="spliceAI_group">
              <div v-for="(item, index) in spliceAIItem" :key="index">
                <div class="row slider-group">
                  <div class="col-sm-12 col-md-5">{{item.label}}</div>
                  <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider[item.field].open)'>
                    <FilterSlider
                      v-if="renderComponent"
                      :FilterModel="Main_filters[item.field]"
                      :type="item.field"
                      :sliderObject="item.sliderObject"
                      @onChangeSlider="onChangeSlider"/>
                  </div>
                  <div class="col-sm-12 col-md-6" v-else>
                    <q-input square filled
                             v-model="Main_filters.slider[item.field].custom_value"
                             v-on:keyup.enter="onSliderEdit(item.field, Main_filters.slider[item.field].custom_value, item.sliderObject)"
                             type="text"
                             class='slider-edit-input' />
                  </div>
                  <div class="col-sm-12 col-md-1 slider-input">
                    <q-icon :name='Main_filters.slider[item.field]["open"] ? "tune" : "edit_note"'
                            class="sliderEdit slider-edit-splice"
                            @click='onSliderEditClick(Main_filters.slider[item.field], item.field)'>
                    </q-icon>
                  </div>
                </div><br>
              </div>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="sv">
          <div class="row select-group">
            <div class="col-sm-12 col-md-12">Reported SV hit
              <q-icon name="help" class="desc-icon">
                <q-tooltip>{{filterTooltip.pathogenicity.clinical_interpretation}}</q-tooltip>
              </q-icon></div>
            <div class="col-sm-12 col-md-12">
              <q-select outlined v-model="Main_filters.is_pathogenic" :options="pathogenicityOptions" @update:model-value="onChangeSelectBox('is_pathogenic',Main_filters.is_pathogenic)" emit-value map-options/>
            </div>
          </div><br>
        </q-tab-panel>
      </q-tab-panels>

      <div class="pathogenicity-both">
        <div class="both-tabs">Small Variant & SV</div>

        <div class="row patho-container select-group-both">
          <div class="col-md-12">
            ClinGen HI
            <q-icon name="help" class="desc-icon">
              <q-tooltip>{{filterTooltip.evidence.clingen_hi}}</q-tooltip>
            </q-icon>
          </div>
          <div class="col-md-12 col-sm-12">
            <q-select multiple outlined clearable v-model="Main_filters.clingen_hi" :options="impactSVClinGenHIOptions" @update:model-value="onChangeSelectBox('clingen_hi',Main_filters.clingen_hi)" emit-value map-options>
              <template v-slot:selected>
                <div class="gene-panel-label">
                  <span v-for="(item, index) in Main_filters.clingen_hi" :key="index">{{item}} </span>
                </div>
              </template>
            </q-select>
          </div>
        </div><br>
        <div class="row patho-container select-group-both">
          <div class="col-md-12">
            ClinGen TS
            <q-icon name="help" class="desc-icon">
              <q-tooltip>{{filterTooltip.evidence.clingen_ts}}</q-tooltip>
            </q-icon>
          </div>
          <div class="col-md-12 col-sm-12">
            <q-select multiple outlined clearable v-model="Main_filters.clingen_ts" :options="impactSVClinGenTSOptions" @update:model-value="onChangeSelectBox('clingen_ts',Main_filters.clingen_ts)" emit-value map-options>
              <template v-slot:selected>
                <div class="gene-panel-label">
                  <span v-for="(item, index) in Main_filters.clingen_ts" :key="index">{{item}} </span>
                </div>
              </template>
            </q-select>
          </div>
        </div><br>

        <div class='patho-container'>
          <!--                        <div class='sub-group-title'>-->
          <!--                          <q-icon name="category" class='category-icon'/>-->
          <!--                          Gene Constraint-->
          <!--                        </div>-->

          <div class="row slider-group-both">
            <div class="col-sm-12 col-md-5">gnomADv2 O/E LoF upper</div>
            <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.constraint_v2_oe_lof_upper.open)'>
              <FilterSlider
                v-if="renderComponent"
                :FilterModel="Main_filters.constraint_v2_oe_lof_upper"
                :type="'constraint_v2_oe_lof_upper'"
                :sliderObject="sliderLoFUpper"
                @onChangeSlider="onChangeSlider"/>
            </div>
            <div class="col-sm-12 col-md-6" v-else>
              <q-input square filled
                       v-model="Main_filters.slider.constraint_v2_oe_lof_upper.custom_value"
                       v-on:keyup.enter="onSliderEdit('constraint_v2_oe_lof_upper',Main_filters.slider.constraint_v2_oe_lof_upper.custom_value, sliderLoFUpper)"
                       type="text"
                       class='slider-edit-input' />
            </div>
            <div class="col-sm-12 col-md-1 slider-input">
              <q-icon :name='Main_filters.slider["constraint_v2_oe_lof_upper"]["open"] ? "tune" : "edit_note"'
                      class="slider-edit"
                      @click='onSliderEditClick(Main_filters.slider.constraint_v2_oe_lof_upper,"constraint_v2_oe_lof_upper")'>
              </q-icon>
            </div>
          </div><br>
          <div class="row slider-group">
            <div class="col-sm-12 col-md-5">gnomADv2 Z-score syn</div>
            <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.constraint_v2_syn_z.open)'>
              <FilterSlider
                v-if="renderComponent"
                :FilterModel="Main_filters.constraint_v2_syn_z"
                :type="'constraint_v2_syn_z'"
                :sliderObject="sliderZscore"
                @onChangeSlider="onChangeSlider"/>
            </div>
            <div class="col-sm-12 col-md-6" v-else>
              <q-input square filled
                       v-model="Main_filters.slider.constraint_v2_syn_z.custom_value"
                       v-on:keyup.enter="onSliderEdit('constraint_v2_syn_z', Main_filters.slider.constraint_v2_syn_z.custom_value, sliderZscore)"
                       type="text"
                       class='slider-edit-input' />
            </div>
            <div class="col-sm-12 col-md-1 slider-input">
              <q-icon :name='Main_filters.slider["constraint_v2_syn_z"]["open"] ? "tune" : "edit_note"'
                      class="slider-edit"
                      @click='onSliderEditClick(Main_filters.slider.constraint_v2_syn_z,"constraint_v2_syn_z")'>
              </q-icon>
            </div>
          </div><br>
          <div class="row slider-group">
            <div class="col-sm-12 col-md-5">gnomADv2 O/E mis upper</div>
            <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.constraint_v2_oe_mis_upper.open)'>
              <FilterSlider
                v-if="renderComponent"
                :FilterModel="Main_filters.constraint_v2_oe_mis_upper"
                :type="'constraint_v2_oe_mis_upper'"
                :sliderObject="sliderMisUpper"
                @onChangeSlider="onChangeSlider"/>
            </div>
            <div class="col-sm-12 col-md-6" v-else>
              <q-input square filled
                       v-model="Main_filters.slider.constraint_v2_oe_mis_upper.custom_value"
                       v-on:keyup.enter="onSliderEdit('constraint_v2_oe_mis_upper',Main_filters.slider.constraint_v2_oe_mis_upper.custom_value, sliderMisUpper)"
                       type="text"
                       class='slider-edit-input' />
            </div>
            <div class="col-sm-12 col-md-1 slider-input">
              <q-icon :name='Main_filters.slider["constraint_v2_oe_mis_upper"]["open"] ? "tune" : "edit_note"'
                      class="slider-edit"
                      @click='onSliderEditClick(Main_filters.slider.constraint_v2_oe_mis_upper,"constraint_v2_oe_mis_upper")'>
              </q-icon>
            </div>
          </div><br>
          <div class="row slider-group">
            <div class="col-sm-12 col-md-5">gnomADv2 Z-score mis</div>
            <div class="col-sm-12 col-md-6 slider-drag" v-if='(!Main_filters.slider.constraint_v2_mis_z.open)'>
              <FilterSlider
                v-if="renderComponent"
                :FilterModel="Main_filters.constraint_v2_mis_z"
                :type="'constraint_v2_mis_z'"
                :sliderObject="sliderZscore"
                @onChangeSlider="onChangeSlider"/>
            </div>
            <div class="col-sm-12 col-md-6" v-else>
              <q-input square filled
                       v-model="Main_filters.slider.constraint_v2_mis_z.custom_value"
                       v-on:keyup.enter="onSliderEdit('constraint_v2_mis_z', Main_filters.slider.constraint_v2_mis_z.custom_value, sliderZscore)"
                       type="text"
                       class='slider-edit-input' />
            </div>
            <div class="col-sm-12 col-md-1 slider-input">
              <q-icon :name='Main_filters.slider["constraint_v2_mis_z"]["open"] ? "tune" : "edit_note"'
                      class="slider-edit"
                      @click='onSliderEditClick(Main_filters.slider.constraint_v2_mis_z,"constraint_v2_mis_z")'>
              </q-icon>
            </div>
          </div><br>
        </div>
      </div>
    </q-card>
  </div>
</template>


<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'

export default {
  name: 'PathogenicityFilter.vue',
  components: {
    FilterSlider
  },
  props: [
    'renderComponent',
    'filters',
    'tab',
    'filterTooltip',
    'PolyphenPredOptions',
    'siftPredOptions',
    'sliderObject',
    'sliderRevel',
    'sliderCADD',
    'sliderObject: sliderFiveStep',
    'sliderZscore',
    'sliderMisUpper',
    'clinVarClinsigOptions',
    'pathogenicityOptions',
    'impactSVClinGenHIOptions',
    'impactSVClinGenTSOptions',
    'sliderLoFUpper',
    'spliceAIItem',
  ],
  emits: ["onPolyphenPredClick","onPolyphenPredItemsClick","onSiftPredClick","onSiftPredItemsClick","onSliderEditReserve","onChangeSelectBox","onCheckBoxAllClick","onCheckBoxItemsClick","onChangeSlider","onSliderEdit","onSliderEditClick","changeTab"],
  data() {
    return{
      Main_filters : this.filters,
      Main_tab : this.tab
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onPolyphenPredClick(){
      this.$emit("onPolyphenPredClick")
    },
    async onPolyphenPredItemsClick(){
      this.$emit("onPolyphenPredItemsClick")
    },
    async onSiftPredClick(){
      this.$emit("onSiftPredClick")
    },
    async onSiftPredItemsClick(){
      this.$emit("onSiftPredItemsClick")
    },
    async onSliderEditReserve(type, newValue, sliderObject){
      this.$emit("onSliderEditReserve",type, newValue, sliderObject)
    },
    async onChangeSelectBox(type, selectedValue){
      this.$emit("onChangeSelectBox",type,selectedValue)
    },
    async onCheckBoxAllClick(type){
      this.$emit("onCheckBoxAllClick",type)
    },
    async onCheckBoxItemsClick(type){
      this.$emit("onCheckBoxItemsClick",type)
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
    async changeTab(tab){
      this.$emit("changeTab", tab)
    }
  }
}
</script>