<template xmlns='http://www.w3.org/1999/html'>
  <div class='filter-component-container'>
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="Main_tab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="small_v" label="Small Variant" @click='changeTab("small_v")' />
          <q-tab name="sv" label="SV" @click='changeTab("sv")' />
        </q-tabs>

        <q-separator />
        <q-tab-panels v-model="Main_tab" animated>
          <q-tab-panel name="small_v">
            <div class="row radio-group">
              <div class="col-md-3 radioGpLabel">Type</div>
              <div class="col-md-9"><div v-for="(item, index) in impactSmallVTypeOptions" :key="index" class="radioGpHori">
                <q-radio v-model="Main_filters.snv_type" :val="item.value" :label="item.label" @click="onClickRadioEvent('snv_type',item.value)"/>
              </div></div>
            </div>
            <div class="row radio-group">
              <div class="col-md-3 radioGpLabel">Coding
                <q-icon name="help" class="descIcon">
                  <q-tooltip>{{filterTooltip.impact.snv.is_coding}}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-md-9"><div v-for="(item, index) in impactSmallVCodeOptions" :key="index" class="radioGpHori">
                <q-radio v-model="Main_filters.is_coding" :val="item.value" :label="item.label" @click="onClickRadioEvent('is_coding',item.value)"/>
              </div></div>
            </div>
            <div class="row radio-group">
              <div class="col-md-3 radioGpLabel">Exonic
                <q-icon name="help" class="descIcon">
                  <q-tooltip>{{filterTooltip.impact.snv.is_exonic}}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-md-9">
                <div v-for="(item, index) in impactSmallVExonicOptions" :key="index" class="radioGpHori">
                  <q-radio v-model="Main_filters.is_exonic" :val="item.value" :label="item.label" @click="onClickRadioEvent('is_exonic',item.value)"/>
                </div>
              </div>
            </div><br>
            <div class="row select-group">
              <div class="col-sm-12 col-md-12">High SNP impact
                <q-icon name="help" class="descIcon">
                  <q-tooltip>
                    <div v-for="(item, index) in filterTooltip.impact.hkgi_high_impact" :key="index">
                      {{item}}
                    </div>
                  </q-tooltip>
                </q-icon></div>
              <div class="col-sm-12 col-md-12">
                <q-select outlined v-model="Main_filters.hkgi_high_impact" :options="impactHighImpactOptions" @update:model-value="onChangeSelectBox('hkgi_high_impact',Main_filters.hkgi_high_impact)" emit-value map-options/>
              </div>
            </div><br>
            <div>
              <q-checkbox  v-model="Main_filters.impactHighClick" label="HIGH" @click="onCheckBoxAllClick('impactHigh')" color="red" />
              <q-icon name="help" class="descIcon">
                <q-tooltip>{{filterTooltip.impact.snv.snv_high}}</q-tooltip>
              </q-icon>
              <div v-for="(item, index) in impactHighOptions" :key="index" class="checkboxGpVertical">
                <q-checkbox v-model="Main_filters.impactHighSelected" :val="item.value" :label="item.label" @click="onCheckBoxItemsClick('impactHigh')" color="red"/>
              </div>
            </div>
            <div>
              <q-checkbox  v-model="Main_filters.impactMedClick" label="MODERATE" @click="onCheckBoxAllClick('impactMed')" color="orange" />
              <q-icon name="help" class="descIcon">
                <q-tooltip>{{filterTooltip.impact.snv.snv_med}}</q-tooltip>
              </q-icon>
              <div v-for="(item, index) in impactMedOptions" :key="index" class="checkboxGpVertical">
                <q-checkbox v-model="Main_filters.impactMedSelected" :val="item.value" :label="item.label" @click="onCheckBoxItemsClick('impactMed')" color="orange"/>
              </div>
            </div>
            <div>
              <q-checkbox  v-model="Main_filters.impactLowClick" label="LOW" @click="onCheckBoxAllClick('impactLow')" color="green" />
              <q-icon name="help" class="descIcon">
                <q-tooltip>{{filterTooltip.impact.snv.snv_low}}</q-tooltip>
              </q-icon>
              <div v-for="(item, index) in impactLowOptions" :key="index" class="checkboxGpVertical">
                <q-checkbox v-model="Main_filters.impactLowSelected" :val="item.value" :label="item.label" @click="onCheckBoxItemsClick('impactLow')" color="green"/>
              </div>
            </div>
            <div>
              <q-checkbox  v-model="Main_filters.impactModifierClick" label="MODIFIER" @click="onCheckBoxAllClick('impactModifier')" color="blue" />
              <q-icon name="help" class="descIcon">
                <q-tooltip>{{filterTooltip.impact.snv.snv_modifier}}</q-tooltip>
              </q-icon>
              <div v-for="(item, index) in impactModifierOptions" :key="index" class="checkboxGpVertical">
                <q-checkbox v-model="Main_filters.impactModifierSelected" :val="item.value" :label="item.label" @click="onCheckBoxItemsClick('impactModifier')" color="blue"/>
              </div>
            </div>
            <br/><br/>
          </q-tab-panel>
          <q-tab-panel name="sv">
            <div class="row radio-group">
              <div class="col-md-3 radioGpLabel">Type
                <q-icon name="help" class="descIcon">
                  <q-tooltip>{{filterTooltip.impact.sv.type}}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-md-9">
                <div v-for="(item, index) in impactSVTypeOptions" :key="index" class="radioGpHori">
                  <q-radio v-model="Main_filters.sv_type" :val="item.value" :label="item.label" @click="onClickRadioEvent('sv_type',item.value)"/>
                </div>
              </div>
            </div>
            <div class="row select-group">
              <div class="col-md-3">
                pLof
              </div>
              <div class="col-md-9 col-sm-12">
                <q-select outlined multiple use-chips stack-label v-model="Main_filters.p_lof" :options="impactSVpLofOptions" @update:model-value="onChangeSelectBox('p_lof',Main_filters.p_lof)" >
                  <template v-slot:append>
                    <q-icon
                      v-if="Main_filters.p_lof !== null"
                      class="cursor-pointer"
                      name="clear"
                      @click.stop.prevent="(Main_filters.p_lof = null); onChangeSelectBox('p_lof',Main_filters.p_lof)"
                    />
                  </template>
                </q-select>
              </div>
            </div><br>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>


<script>

export default {
  name: 'ImpactFilter',
  components: {

  },
  props: [
    'renderComponent',
    'filters',
    'tab',
    'filterTooltip',
    'impactSmallVTypeOptions',
    'impactSmallVCodeOptions',
    'impactSmallVExonicOptions',
    'impactHighImpactOptions',
    'impactHighOptions',
    'impactMedOptions',
    'impactLowOptions',
    'impactModifierOptions',
    'impactSVTypeOptions',
    'impactSVpLofOptions'
  ],
  emits: ["onClickRadioEvent","onChangeSelectBox","onCheckBoxAllClick","onCheckBoxItemsClick","changeTab"],
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
    async onClickRadioEvent(type,value){
      this.$emit("onClickRadioEvent",type,value)
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
    async changeTab(tab){
      this.$emit("changeTab", tab)
    }
  }
}
</script>