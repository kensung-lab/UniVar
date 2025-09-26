<template>
  <div class="bg-white">
    <q-select class='database-select'
              input-debounce="0"
              behavior="menu" use-input outlined
              v-model="Main_database"
              :options="database_filter_options"
              label="Select Samples"
              @update:model-value="onChangeDatabase"
              @filter="filterDatabase" emit-value map-options
              @virtual-scroll="true"
              :popup-content-style="`height: 600px; word-break: break-all;`" style="word-break: break-all;"
    >
      <template v-slot:append>
        <div class="samples-status-in-selection">
          <div class="selection-gp">Total: <span class="badge badge-total">{{ variantsSamplesDetails.total }}</span> </div>
          <div class="selection-gp">Not affected: <span class="badge badge-not-affected">{{ variantsSamplesDetails.not_affected }}</span> </div>
          <div class="selection-gp">Affected: <span class="badge badge-affected">{{ variantsSamplesDetails.affected }}</span> </div>
        </div>
      </template>
    </q-select>
  </div>
</template>


<script>

export default {
  name: 'DatabaseSelect',
  components: {

  },
  props: [
    'database',
    'pipelineInfoData',
    'database_filter_options',
    'variantsSamplesDetails',
  ],
  emits: ["onChangeDatabase","filterDatabase","onSampleSelectionClick"],
  data() {
    return{
      Main_database : this.database,
      pipelineInfoDialog: false,
    }
  },
  watch: {
    'database' :{
      async handler() {
        if(this.database !== ""){
          this.Main_database = this.database
        }
      },
      immediate: true,
      deep: true
    }
  },
  async created() {

  },
  methods: {
    async onChangeDatabase(database){
      this.$emit("onChangeDatabase",database)
    },
    async onSampleSelectionClick(){
      this.$emit("onSampleSelectionClick")
    },
    filterDatabase(val, update){
      this.$emit("filterDatabase",val, update)
    },
  }
}
</script>