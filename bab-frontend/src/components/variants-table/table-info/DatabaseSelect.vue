<template>
  <div>
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
          <div class="selectionGp">Total: <span class="badge badge_total">{{ variantsSamplesDetails.total }}</span> </div>
          <div class="selectionGp">Not affected: <span class="badge badge_not_affected">{{ variantsSamplesDetails.not_affected }}</span> </div>
          <div class="selectionGp">Affected: <span class="badge badge_affected">{{ variantsSamplesDetails.affected }}</span> </div>
        </div>
      </template>
      <!-- <template v-slot:prepend>
        <div class="pipeline-details-btn" @click="showPipelineInfo()">
          <q-icon name="info">
            <q-tooltip>
              <PipelineInfo :pipeline-info-data=pipelineInfoData></PipelineInfo>
            </q-tooltip>
          </q-icon>
        </div>
      </template> -->
      <!--
      <template v-slot:after>
        <q-btn color="primary-hkgi" class="status-details-btn" icon-right="people" @click="onSampleSelectionClick">
          <q-tooltip anchor="top middle" self="center middle">Sample status</q-tooltip>
        </q-btn>
      </template>
      -->
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