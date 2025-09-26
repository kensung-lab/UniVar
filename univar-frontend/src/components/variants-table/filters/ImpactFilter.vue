<template xmlns="http://www.w3.org/1999/html">
  <div class="filter-component-container no-padding">
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="Main_tab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="small_v" label="Small Variant" @click="changeTab('small_v')" />
          <q-tab name="sv" label="SV" @click="changeTab('sv')" />
        </q-tabs>

        <q-separator />
        <q-tab-panels v-model="Main_tab" animated>
          <q-tab-panel name="small_v">
            <div class="row radio-group">
              <div class="col-md-3 radio-gp-label">
                Coding
                <q-icon name="help" class="desc-icon">
                  <q-tooltip>{{ filterTooltip.impact.snv.is_coding }}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-md-9">
                <div
                  v-for="(item, index) in impactSmallVCodeOptions"
                  :key="index"
                  class="radio-gp-hori"
                >
                  <q-radio
                    v-model="mainFilters.is_coding"
                    :val="item.value"
                    :label="item.label"
                    @click="onClickRadioEvent('is_coding', item.value)"
                  />
                </div>
              </div>
            </div>
            <div class="row radio-group">
              <div class="col-md-3 radio-gp-label">
                Exonic
                <q-icon name="help" class="desc-icon">
                  <q-tooltip>{{ filterTooltip.impact.snv.is_exonic }}</q-tooltip>
                </q-icon>
              </div>
              <div class="col-md-9">
                <div
                  v-for="(item, index) in impactSmallVExonicOptions"
                  :key="index"
                  class="radio-gp-hori"
                >
                  <q-radio
                    v-model="mainFilters.is_exonic"
                    :val="item.value"
                    :label="item.label"
                    @click="onClickRadioEvent('is_exonic', item.value)"
                  />
                </div>
              </div>
            </div>
            <br />
            <div class="row select-group">
              <div class="col-sm-12 col-md-12">
                High SNP impact
                <q-icon name="help" class="desc-icon">
                  <q-tooltip>
                    <div
                      v-for="(item, index) in filterTooltip.impact.univar_high_impact"
                      :key="index"
                    >
                      {{ item }}
                    </div>
                  </q-tooltip>
                </q-icon>
              </div>
              <div class="col-sm-12 col-md-12">
                <q-select
                  outlined
                  v-model="mainFilters.univar_high_impact"
                  :options="impactHighImpactOptions"
                  @update:model-value="
                    onChangeSelectBox('univar_high_impact', mainFilters.univar_high_impact)
                  "
                  emit-value
                  map-options
                />
              </div>
            </div>
            <br />
            <div>
              <q-checkbox
                v-model="mainFilters.impactHighClick"
                label="HIGH"
                @click="onCheckBoxAllClick('impactHigh')"
                color="red"
              />
              <q-icon name="help" class="desc-icon">
                <q-tooltip>{{ filterTooltip.impact.snv.snv_high }}</q-tooltip>
              </q-icon>
              <div
                v-for="(item, index) in impactHighOptions"
                :key="index"
                class="checkbox-gp-vertical"
              >
                <q-checkbox
                  v-model="mainFilters.impactHighSelected"
                  :val="item.value"
                  :label="item.label"
                  @click="onCheckBoxItemsClick('impactHigh')"
                  color="red"
                />
              </div>
            </div>
            <div>
              <q-checkbox
                v-model="mainFilters.impactMedClick"
                label="MODERATE"
                @click="onCheckBoxAllClick('impactMed')"
                color="orange"
              />
              <q-icon name="help" class="desc-icon">
                <q-tooltip>{{ filterTooltip.impact.snv.snv_med }}</q-tooltip>
              </q-icon>
              <div
                v-for="(item, index) in impactMedOptions"
                :key="index"
                class="checkbox-gp-vertical"
              >
                <q-checkbox
                  v-model="mainFilters.impactMedSelected"
                  :val="item.value"
                  :label="item.label"
                  @click="onCheckBoxItemsClick('impactMed')"
                  color="orange"
                />
              </div>
            </div>
            <div>
              <q-checkbox
                v-model="mainFilters.impactLowClick"
                label="LOW"
                @click="onCheckBoxAllClick('impactLow')"
                color="green"
              />
              <q-icon name="help" class="desc-icon">
                <q-tooltip>{{ filterTooltip.impact.snv.snv_low }}</q-tooltip>
              </q-icon>
              <div
                v-for="(item, index) in impactLowOptions"
                :key="index"
                class="checkbox-gp-vertical"
              >
                <q-checkbox
                  v-model="mainFilters.impactLowSelected"
                  :val="item.value"
                  :label="item.label"
                  @click="onCheckBoxItemsClick('impactLow')"
                  color="green"
                />
              </div>
            </div>
            <div>
              <q-checkbox
                v-model="mainFilters.impactModifierClick"
                label="MODIFIER"
                @click="onCheckBoxAllClick('impactModifier')"
                color="blue"
              />
              <q-icon name="help" class="desc-icon">
                <q-tooltip>{{ filterTooltip.impact.snv.snv_modifier }}</q-tooltip>
              </q-icon>
              <div
                v-for="(item, index) in impactModifierOptions"
                :key="index"
                class="checkbox-gp-vertical"
              >
                <q-checkbox
                  v-model="mainFilters.impactModifierSelected"
                  :val="item.value"
                  :label="item.label"
                  @click="onCheckBoxItemsClick('impactModifier')"
                  color="blue"
                />
              </div>
            </div>
            <br /><br />
          </q-tab-panel>
          <q-tab-panel name="sv">
            <div class="row select-group filter-row">
              <div class="col-md-12">
                <span>pLof</span>
              </div>
              <div class="col-md-12">
                <q-select
                  outlined
                  multiple
                  use-chips
                  stack-label
                  v-model="mainFilters.p_lof"
                  :options="impactSVpLofOptions"
                  @update:model-value="onChangeSelectBox('p_lof', mainFilters.p_lof)"
                >
                  <template v-slot:append>
                    <q-icon
                      v-if="mainFilters.p_lof !== null"
                      class="cursor-pointer"
                      name="clear"
                      @click.stop.prevent="onChangeSelectBox('p_lof', mainFilters.p_lof, true)"
                    />
                  </template>
                </q-select>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script>
import FilterSlider from '@/components/variants-table/filters/FilterSlider.vue'
import { getImageSrc } from '@/utils/variants-table/filter/slider-utils'
export default {
  name: 'ImpactFilter',
  components: {
    FilterSlider
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
    'impactSVpLofOptions',
    'gte',
    'lte'
  ],
  emits: [
    'onClickRadioEvent',
    'onChangeSelectBox',
    'onCheckBoxAllClick',
    'onCheckBoxItemsClick',
    'changeTab',
    'onChangeSlider',
    'onSliderEdit',
    'onSliderEditClick',
  ],
  data() {
    return {
      mainFilters: this.filters,
      Main_tab: this.tab
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onClickRadioEvent(type, value) {
      this.$emit('onClickRadioEvent', type, value)
    },
    async onChangeSelectBox(type, selectedValue, isNull = false) {
      if (isNull) {
        this.mainFilters[type] = null
      }

      this.$emit('onChangeSelectBox', type, selectedValue)
    },
    async onCheckBoxAllClick(type) {
      this.$emit('onCheckBoxAllClick', type)
    },
    async onCheckBoxItemsClick(type) {
      this.$emit('onCheckBoxItemsClick', type)
    },
    async changeTab(tab) {
      this.$emit('changeTab', tab)
    },
    async onChangeSlider(type, newValue, sliderObject) {
      this.$emit('onChangeSlider', type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject) {
      this.$emit('onSliderEdit', type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type) {
      this.$emit('onSliderEditClick', object, type)
    },
    getSrc(conditions) {
      return getImageSrc(conditions, this.gte, this.lte)
    }
  }
}
</script>
