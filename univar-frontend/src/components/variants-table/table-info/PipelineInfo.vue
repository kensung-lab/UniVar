<template>
  <div class="pipeline-info-container row">
    <table class='pipeline-info-table'>
      <thead>
        <tr>
          <th class="title">
            <span>Annotation Pipeline Version: </span>
            <span>{{pipelineInfoData.version}}</span>
          </th>
        </tr>
      </thead>
    </table>
    <q-tabs
      v-model="tab"
      class="text-grey pipeline-info-tabs"
      active-color="primary"
      indicator-color="primary"
      align="justify"
    >
      <q-tab name="small_v" label="Small Variant" />
      <q-tab name="sv" label="SV" />
      <q-tab name="gene" label="Gene Database" />
    </q-tabs>

    <br>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="small_v">
        <table class='pipeline-info-table'>
          <thead>
            <tr>
              <th class="title">
                <span>SNP Pipeline Version: </span>
                <span>{{snv_data.version}}</span>
              </th>
            </tr>
          </thead>
        </table>
        <div v-for="(groupObject, index) in group" :key="index">
            <table class='pipeline-info-table'>
              <thead>
              <tr>
                <th colspan="2">
                  <q-icon name="category" class='category-icon'/>
                  {{ groupObject.label }}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in snv_data[groupObject.value]" :key="item">
                <td>{{ formatString(index) }}</td>
                <td>{{ item }}</td>
              </tr>
              </tbody>
            </table>
        </div>
      </q-tab-panel>
      <q-tab-panel name="sv">
        <table class='pipeline-info-table'>
          <thead>
            <tr>
              <th class="title">
                <span>SV Pipeline Version: </span>
                <span>{{sv_data.version}}</span>
              </th>
            </tr>
          </thead>
        </table>
        <div v-for="(groupObject, index) in group" :key="index">
          <table class='pipeline-info-table'>
            <thead>
            <tr>
              <th colspan="2">
                <q-icon name="category" class='category-icon'/>
                {{ groupObject.label }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in sv_data[groupObject.value]" :key="item">
              <td>{{ formatString(index) }}</td>
              <td>{{ item }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </q-tab-panel>
      <q-tab-panel name="gene">
        <table class='pipeline-info-table'>
          <thead>
            <tr>
              <th colspan="2" class="title">
                <span>Gene Database Version: </span>
                <span>{{sv_data.version}}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in gene_data['details']" :key="item">
              <td>{{ formatString(index) }}</td>
              <td>{{ item }}</td>
            </tr>
            </tbody>
        </table>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
export default {
  name: 'PipelineInfo',
  props: [
    'pipelineInfoData'
  ],
  data() {
    return{
      tab: "small_v",
      snv_data: {},
      sv_data: {},
      gene_data: {},
      group:[
        {
          "label": "Tools",
          "value": "tools"
        },
        {
          "label": "Database",
          "value": "dbs"
        }
      ]
    }
  },
  async created() {
    this.snv_data.tools = this.flattenObject(this.pipelineInfoData.small_variant.tools)
    this.snv_data.dbs = this.flattenObject(this.pipelineInfoData.small_variant.dbs)
    this.snv_data.version = this.pipelineInfoData.small_variant.version
    this.sv_data.tools = this.flattenObject(this.pipelineInfoData.structural_variant.tools)
    this.sv_data.dbs = this.flattenObject(this.pipelineInfoData.structural_variant.dbs)
    this.sv_data.version = this.pipelineInfoData.structural_variant.version
    this.gene_data.details = this.flattenObject(this.pipelineInfoData.univar_gene_version.detail)
    this.gene_data.version = this.pipelineInfoData.univar_gene_version.version
    
  },
  methods: {
    flattenObject(obj, prefix = '', result = {}) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object') {
          this.flattenObject(value, fullKey, result);
        } else {
          result[fullKey] = value;
        }
      }
      return result;
    },
    formatString(str) {
      const formatted = str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return formatted.replace('.', ' - ');
    }
  }
}
</script>
<style>
@import '@/assets/styles/pipeline-info.css';
</style>