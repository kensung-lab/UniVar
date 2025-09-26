<template>
  <div>
    <div v-if="panels && panels.length > 0" :class="!viewOnly ? 'filtered-box': 'filtered-box-view-only' " >
      <div class='filtered-box-field filtered-panels'>
        <q-icon name="radio_button_checked" class="filtered-box-icon"></q-icon>
        &nbsp;Panels({{panels.length}}) :
        <span :class="allowRemove ? 'remove-panels' : 'hidden' "  @click="(allowRemove) ? onClickRemoveFiltered('panels') : null">
          Clear <q-icon name="clear" class='delete_icon' v-if='(allowRemove)'></q-icon>
          <q-tooltip>Clear all panels</q-tooltip>
        </span>
        <span class='filtered-ele'>
          <div v-for="(panel, index) in panels" :key="index"
               :class="(allowRemove) ? 'panel-element' : '' "
               @click="(allowRemove) ? removeSelectedPanel(panel.value) : null"
          >
            - {{ panel.label }}
          </div>
        </span>
      </div>
    </div>
    <div v-for="(item, index) in variantsFilter" :key="index">
      <div v-if='(fieldArray.includes(index) || showAll)'>
        <div :class="!viewOnly ? 'filtered-box': 'filtered-box-view-only' "
             v-if="(Object.keys(variantsFilter).length > 0)">
          <div class='filtered-box-field' @click="(allowRemove) ? onClickRemoveFiltered(index) : null">
            <q-icon name="radio_button_checked" class="filtered-box-icon"></q-icon>
            <span class='filtered-ele' v-html="formatFiltered(index, item)"></span>
            <q-icon name="clear" class='delete_icon' v-if='(allowRemove)'></q-icon>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style>
@import '@/assets/styles/filtered-box.scss';
</style>


<script>
import scenarioOptions from '../../../models/variants-table/filter/scenario/scenarioOptions.json'
import default_search_fields from '@/models/variants-table/filter/common/default_search_fields.json'

export default {
  name: 'FilteredBox',
  props: [
    'variantsFilter',   //main object of filters
    'panels',           //panels from bookmark table
    'fieldArray',       //specific fields to display based on category of filters(impact,quality...)
    'showAll',          //If showAll , display all filters
    'allowRemove',      //control visibility of delete button
    'viewOnly'          //control style of view only filters
  ],
  data() {
    return{
        booleanFields : []
    }
  },
  async created() {
    //console.log(this.columns)
    //console.log(this.allowRemove)
    //console.log(this.viewOnly)
    //console.log(this.panels)
    let tempBooleanArr = []
    default_search_fields.forEach((el) => {
      if(el.type === 'boolean'){
        tempBooleanArr.push(el.field)
      }
    });
    this.booleanFields = tempBooleanArr
  },
  methods: {
    onClickRemoveFiltered (field){
      this.$emit("onClickRemoveFiltered", field);
    },
    formatFiltered (key, value){
      let html = '';

      let field = key.replace(/_/g, " ");
      let displayValue = ''

      if(field === 'scenario'){
        if(value === 'any'){
          return 'scenario : any scenario'
        }
        const scenario = value.charAt(0);
        let label = scenarioOptions.find(option => option.value === scenario)?.label;
        html = 'scenario : ' + label
        return html
      }

      if(field === 'impact'){
        html = 'impact (' + value.length + ') : <br>'
        html = html + value.join(" / ") + '<br>'
        return html
      }

      if(Array.isArray(value)){
        let tempValue = []
        value.forEach(el => {
          if(el === null){
            tempValue.push('null')
          } else if (el === '') {
            tempValue.push('no')
          } else {
            tempValue.push(el)
          }
        })
        displayValue = tempValue.join(", ")
      } else {
        let symbol = Object.keys(value)[0];

        switch (symbol){
          case "$lte":
            symbol = " ≤ "
            break;
          case "$gte" :
            symbol = " ≥ "
            break;
          case "$eq" :
            symbol = " = "
            break;
          default:
            symbol = ''
        }

        let newValue = Object.values(value)
        displayValue = symbol + newValue
      }

      //boolean (yes/no)
      if(typeof(value) === 'number'){
        if(this.booleanFields.includes(key) ) {
          if (value) {
            displayValue = 'TRUE'
          } else {
            displayValue = 'FALSE'
          }
        } else {
          displayValue = value
        }
      }

      //string (radio)
      if(typeof(value) === 'string'){
        displayValue = value
      }

      if(field === "variant type" && value === "structural"){
        displayValue = "structural variation"
      }

      html = field + " : " + displayValue;

      return html
    },
    removeSelectedPanel(panel_value){
      this.$emit("removeSelectedPanel", panel_value);
    }
  }
}
</script>
