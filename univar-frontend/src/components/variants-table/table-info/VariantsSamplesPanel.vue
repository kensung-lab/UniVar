<template>
  <div class="q-pa-md">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="name"
      flat bordered
      hide-pagination
      binary-state-sort
      :filter="filter"
      selection="multiple"
      v-model:selected="selected"
    >

      <template v-slot:top-left>
        <div class='topEle samplesTitle'> Samples selection: </div>
        <div class='topEle'>
          <q-btn class='topEleBtn' @click='onClickTotalBtn'>
            Total: <span class="badge badge-total">{{variantsSamplesDetails.total}}</span>
          </q-btn>
        </div>
        <div class='topEle'>
          <q-btn class='topEleBtn' @click='onClickAffectedBtn("not_affected")'>
            Not affected: <span class="badge badge-not-affected">{{variantsSamplesDetails.not_affected}}</span>
          </q-btn>
        </div>
        <div class='topEle'>
          <q-btn class='topEleBtn' @click='onClickAffectedBtn("affected")'>
            Affected: <span class="badge badge-affected">{{variantsSamplesDetails.affected}}</span>
          </q-btn>
        </div>
        <div class='topEle' v-if='selectionOnTop'>
          <q-btn class='topEleBtn' @click='bringSelectedSampleOnTop'>
            Bring highlighted on top
          </q-btn>
        </div>
        <div class='topEle'>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="search" ></q-icon>
              </template>
            </q-input>
        </div>

      </template>
      <template v-slot:top-right>
        <q-btn color="primary" label="Restore" class="gene-table-btn" @click='onRestoreVariantsSamples' v-close-popup></q-btn>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th>
              <q-checkbox v-model="props.selected" />
          </q-th>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div @click="onColumnSort(col.sort_name)" class='samplesHeader'>
              {{ col.label }}
              <span v-if="(col.sort_name === sortingField)">
                <span v-if="(sortingAction === 'desc')">↓</span>
                <span v-else>↑</span>
              </span>
            </div>
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class='samplesSelect'>
            <q-checkbox v-model="props.selected" v-if='props.row.active'/>
          </q-td>
          <q-td key="family_id" :props="props">
            <q-checkbox v-model="selectedFamily[props.row.family_id]" @click='clickFamily(props.row.family_id)'/>
            {{ props.row.family_id }}
          </q-td>
          <q-td key="Name" :props="props">
            <q-checkbox v-model="props.row.active" @click='updateSamplesDetails(props.row.family_id)'/>
            {{ props.row.name }}
          </q-td>
          <q-td key="Affected" :props="props">
            <div class="q-gutter-sm">
              <q-radio v-model="props.row.group" val="not_affected" label="No" :color="props.row.active ? 'blue' : 'grey' " @click='onClickActiveSample(props.row)'/>
              <q-radio v-model="props.row.group" val="affected" label="Yes" :color="props.row.active ? 'red' : 'grey' " @click='onClickActiveSample(props.row)'/>
            </div>
          </q-td>
          <q-td key="Sex" :props="props">
            <div v-if='( props.row.sex === "F" )'>
              <q-icon size="2rem" name="female" />
            </div>
            <div v-else>
              <q-icon size="2rem" name="male" />
            </div>
          </q-td>
          <q-td key="Mother" :props="props">
            {{ props.row.mother_id && props.row.mother_id != -9 ? props.row.mother_id : '' }}
          </q-td>
          <q-td key="Father" :props="props">
            {{ props.row.father_id && props.row.father_id != -9 ? props.row.father_id : '' }}
          </q-td>
          <q-td key="cram" :props="props" class='cram_file' v-if='IsStandalone'>
            <q-file outlined bottom-slots v-model="props.row.cram" label="Cram file" accept=".cram">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="props.row.cram = null" class="cursor-pointer" />
              </template>
            </q-file>
          </q-td>
          <q-td key="cram" :props="props" class='cram_file' v-if='IsStandalone'>
            <q-file outlined bottom-slots v-model="props.row.cram_idx" label="Cram index file" accept=".crai">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="props.row.cram_idx = null" class="cursor-pointer" />
              </template>
            </q-file>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
<!--  Selected: {{ JSON.stringify(selected) }}-->
</template>
<style>
  @import '@/assets/styles/variants-samples-panel.css';
</style>

<script>
import { ref } from 'vue'

export default {
  name: 'VariantsSamplesPanel',
  props: [
    'IsStandalone',
    'variantsSamples',
    'variantsSamplesDetails',
  ],
  emits: ["updateSamplesDetails","onRestoreVariantsSamples","onClickSamplesUpdate","bringSelectedSampleOnTop"],
  data() {
    return{
      filter: '',
      selected: ref([]),
      sortingAction: 'asc',
      sortingField: '',
      selectTotal: true,
      variantsSamplesDetailsNew:  this.variantsSamplesDetails,
      isSelectedFamily: false,
      selectedFamily: {},
      selectionOnTop: false,
      columns: [
        {
          name: 'family_id',
          required: true,
          label: 'Family',
          align: 'center',
          field: 'family_id',
          format: val => `${val}`,
          sort_name : "family_id",
          sortable: false,
          isShow: true,
        },
        {
          name: 'Name',
          required: true,
          label: 'Sample',
          align: 'left',
          field: 'name',
          format: val => `${val}`,
          sort_name : "name",
          sortable: false,
          isShow: true,
        },
        {
          name: 'Affected',
          required: true,
          label: 'Affected',
          align: 'center',
          field: 'Affected',
          format: val => `${val}`,
          sort_name : "group",
          sortable: false,
          isShow: true,
        },
        {
          name: 'Sex',
          required: true,
          label: 'Sex',
          align: 'center',
          field: 'Sex',
          format: val => `${val}`,
          sort_name : "sex",
          sortable: false,
          isShow: true,
        },
        {
          name: 'Mother',
          required: true,
          label: 'Mother',
          align: 'center',
          field: row => row.mother_id && row.mother_id != -9 ? row.mother_id : '',
          format: val => `${val}`,
          sort_name : "mother_id",
          sortable: false,
          isShow: true,
        },
        {
          name: 'Father',
          required: true,
          label: 'Father',
          align: 'center',
          field: 'Father',
          format: val => `${val}`,
          sort_name : "father_id",
          sortable: false,
          isShow: true,
        }
      ],
      cram_columns : [
        {
          name: 'cram',
          required: true,
          label: 'Cram File',
          align: 'center',
          field: 'cram',
          format: val => `${val}`,
          sort_name : "cram",
          sortable: false,
          isShow: true,
        },
        {
          name: 'cram_idx',
          required: true,
          label: 'Cram Index',
          align: 'center',
          field: 'cram_idx',
          format: val => `${val}`,
          sort_name : "cram_idx",
          sortable: false,
          isShow: true,
        }
      ],
      rows : this.variantsSamples
    }
  },
  async created() {
    //console.log(this.variantsSamples)
    //console.log(this.variantsSamplesDetails)
    //console.log('IsStandalone:' , this.IsStandalone)
    if(this.IsStandalone){
      this.columns = (this.columns).concat(this.cram_columns)
    }

    await this.updateFamilyStatus();
  },
  watch: {
    selected(){
      this.selectionOnTop = this.selected.length > 0;
    }
  },
  methods: {
    async bringSelectedSampleOnTop(){
      this.$emit("bringSelectedSampleOnTop", this.selected);
    },
    async clickFamily(family_id){
      (this.variantsSamples).forEach(el => {
        if(el.family_id === family_id){
          if(this.selectedFamily[el.family_id]) {
            el.active = true;
          } else {
            el.active = false
          }
        }
      });
      await this.updateSamplesDetails()
      await this.onClickSamplesUpdate()
    },
    async onClickTotalBtn(){
      //console.log(this.variantsSamples)
      this.selectTotal = !(this.selectTotal);
      (this.variantsSamples).forEach(el => {
        el.active = this.selectTotal;
        this.selectedFamily[el.family_id] = this.selectTotal
      })
      await this.updateFamilyStatus();
      await this.updateSamplesDetails()
    },
    async onClickAffectedBtn(type){
       (this.variantsSamples).forEach(el => {
         if(el.active){
           if(type === 'not_affected'){
             if(el.group === 'not_affected'){
               el.active = true
             } else {
               el.active = false
             }
           } else {
             if(el.group === 'affected'){
               el.active = true
             } else {
               el.active = false
             }
           }
         }
       })
      await this.updateFamilyStatus();
      await this.updateSamplesDetails()
    },
    async onClickActiveSample(row){
      row.active = true
      this.selectedFamily[row.family_id] = true
      await this.updateFamilyStatus();
      await this.updateSamplesDetails()
      //await this.onClickSamplesUpdate()
    },
    async updateSamplesDetails(family_id = null){

      let num_not_affected = 0;
      let num_affected = 0;
      (this.variantsSamples).forEach(el => {
        if(el.active){
          if(el.group === 'not_affected'){
            num_not_affected++
          } else {
            num_affected++
          }
        }
      });

      this.variantsSamplesDetailsNew.affected = num_affected;
      this.variantsSamplesDetailsNew.not_affected = num_not_affected;
      this.variantsSamplesDetailsNew.total = num_affected + num_not_affected;

      (this.variantsSamples).forEach(el => {
        if(el.active){
          this.selectedFamily[el.family_id] = true
          return false;
        }
      });

      let count = 0;
      (this.variantsSamples).forEach(el => {
        if(family_id === el.family_id){
          if(el.active){
            count ++
          }
        }
      });
      if(count === 0){
        this.selectedFamily[family_id] = false
      }

      this.$emit("updateSamplesDetails", this.variantsSamplesDetailsNew);
      await this.onClickSamplesUpdate()
    },
    async updateFamilyStatus(){
      (this.variantsSamples).forEach(el => {
        if(el.active){
          this.selectedFamily[el.family_id] = true
        } else {
          this.selectedFamily[el.family_id] = false
        }
      });
    },
    async onRestoreVariantsSamples(){
      this.$emit("onRestoreVariantsSamples");
    },
    async onClickSamplesUpdate(){
      this.$emit("onClickSamplesUpdate","",'samples_panel');
    },
    async onColumnSort(field){

      this.sortingField = field;

      if (this.sortingAction === 'asc') {
        this.sortingAction = 'desc'
        this.rows.sort((a, b) => {
          if (a[field] < b[field]) {
            return -1;
          }
          if (a[field] > b[field]) {
            return 1;
          }
          return 0;
        });
      } else {
        this.sortingAction = 'asc'
        this.rows.sort((a, b) => {
          if (a[field] > b[field]) {
            return -1;
          }
          if (a[field] < b[field]) {
            return 1;
          }
          return 0;
        });
      }


    }
  }
}
</script>
