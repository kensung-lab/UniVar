<template>
  <div class='filter-component-container'>
    <div v-for="(item, index) in scenarioOptions" :key="index" class="radio-gp-vert">
      <div>
        <q-radio v-model="Main_filters.scenario" :val="item.value" :label="item.label" @click="onClickSamplesUpdate(item.value)"/>
        <q-icon name="help" class="desc-icon" v-if="item.desc">
          <q-tooltip anchor="bottom end" self="top end" :offset="[0,0]">
            {{ item.desc }}
          </q-tooltip>
        </q-icon>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'ScenarioFilter',
  props: [
    'scenarioOptions',
    'filters'
  ],
  emits: ["onClickSamplesUpdate"],
  data() {
    return{
      Main_filters : this.filters
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onClickSamplesUpdate(scenarioValue){
      this.$emit("onClickSamplesUpdate",scenarioValue)
    }
  }
}
</script>