<template>
  <div class='upload-container'>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class='row'>
        <div class='col-md-10 required-group'>
          <div class='remark-message'>
            <q-icon name="info"/>*Required :
          </div>
          <div class='col-md-10 file-group'>

            <q-input v-model="proband_id" bg-color="#e0e0e0" outlined filled label="*Proband ID" :rules="[val => !!val || 'Proband ID is required', val => val.length <= 50 || 'Please use maximum 50 characters']"/> <br>

            <q-card>
              <q-tabs
                v-model="ped_tab"
                dense
                class="bg-grey-2 text-grey-7"
                active-color="primary"
                indicator-color="purple"
                align="justify"
              >
                <q-tab name="file" label="Upload File" />
                <q-tab name="sample" label="Add sample" />
              </q-tabs>

              <q-separator />
              <q-tab-panels v-model="ped_tab" animated>
                <q-tab-panel name="file">
                  <q-file
                    outlined bottom-slots counter
                    v-model="PED_file"
                    label="PED file"
                    accept=".ped"
                  >
                    <template v-slot:prepend>
                      <q-icon name="cloud_upload" @click.stop.prevent />
                    </template>
                    <template v-slot:append>
                      <q-icon name="close" @click.stop.prevent="PED_file = null" class="cursor-pointer" />
                    </template>
                    <template v-slot:hint>
                      * Only accept .ped format
                    </template>
                    <template v-slot:after>
                      <div class='example-file' @click='openExampleFile("ped")'>
                        <q-icon name="description"/><br>Example File
                      </div>
                    </template>
                  </q-file>
                </q-tab-panel>
                <q-tab-panel name="sample">
                  <div class='ped_group_container'>
                    <q-btn :loading='getPEDInfoLoading' square push color="primary" label="Get PED information from VCFs" @click='getPEDInfoFromVCF()'/>
                    <div class='row each_ped_group' v-for="(row, index) in ped_group" :key="index">
                      <div class='col-md-3'> <q-input  v-model="row.sample_id" label="Sample ID" /> </div>
                      <div class='col-md-2'> <q-select  v-model="row.sex" :options="gender_options" label="Gender" /> </div>
                      <div class='col-md-2'> <q-select  v-model="row.affected" :options="affected_options" label="Affect status" /> </div>
                      <div class='col-md-2'> <q-input  v-model="row.mother_id" label="Mother" /> </div>
                      <div class='col-md-2'> <q-input  v-model="row.father_id" label="Father" /> </div>
                      <q-btn square color="negative" icon="cancel" @click='deletePedGroup(index)'/>
                    </div>
                    <q-btn square push color="primary" class="add_ped_btn" label="Add sample" @click='addPedGroup'/>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>

          </div>
        </div>
        <div class='col-md-10 optional-group'>
          <div class='remark-message'>
            <q-icon name="info"/>Upload at least one of them :
          </div>
          <div class='col-md-10 file-group'>
            <q-file outlined bottom-slots v-model="SNP_file" label="SNP file" counter accept=".vcf.gz">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="SNP_file = null" class="cursor-pointer" />
              </template>
              <template v-slot:after>
                <div class='example-file' @click='openExampleFile("snp")'>
                  <q-icon name="description"/><br>Example File
                </div>
              </template>
            </q-file>
            <div class='format-message'>
              <div class='file-format'>Only accept: .vcf.gz format</div>
            </div>
          </div>
          <div class='col-md-10 file-group'>
            <q-file bottom-slots v-model="SV_files" label="SV files" counter multiple outlined use-chips append accept=".vcf.gz">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="SV_files = null" class="cursor-pointer" />
              </template>
              <template v-slot:after>
                <div class='example-file' @click='openExampleFile("sv")'>
                  <q-icon name="description"/><br>Example File
                </div>
              </template>
            </q-file>

            <template v-if='svCallers && svCallers.length > 0'>
              <div class='row'  v-for="(row, index) in svCallers" :key="index">
                <div class='col-md-3'>
                  File Name : {{row.filename}}
                </div>
                <div class='col-md-4'>
                  <q-input v-model="row.caller" bg-color="#e0e0e0" outlined filled label="Caller" :rules="[val => !!val || 'Caller required', val => val.length <= 50 || 'Please use maximum 50 characters']"/> <br>
                </div>
              </div>
            </template>

            <div class='format-message'>
              <div class='file-format'>[Multiple files] Only accept .vfc.gz format</div>
            </div>
          </div>
        </div>
        <div class='col-md-10 select-hpo'>
          <HpoTermsBox
            ref="HpoTermsBox"
            :panelOptions='panelOptions'
            :isOptional='true'
            @updateTickedNode='updateTickedNode'
          >
          </HpoTermsBox>
        </div>
      </div>
      <div class='row'>
        <div class='col-md-6'>
          <q-btn class="pipeline-version-btn" @click="displayPipelineInfo()">
            <img src="@/assets/img/database-info-icon.svg" class="database-info-icon">
          </q-btn>
          <q-btn :loading=uploadLoading label="Upload" type="submit" color="primary" icon='upload' class='upload-btn'>
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Uploading...
            </template>
          </q-btn>
        </div>
      </div>
    </q-form>
  </div>
  <q-dialog v-model="pipelineInfoDialog">
    <div class='pipeline-info-card'>
      <q-card >
        <PipelineInfo :pipeline-info-data=pipelineInfoData></PipelineInfo>
      </q-card>
    </div>
  </q-dialog>
</template>


<style>
@import '@/assets/styles/upload.css';
</style>

<script>

import router from '@/router/index.js'
import store from '@/store/store.js'
import PipelineInfo from '@/components/variants-table/table-info/PipelineInfo.vue'
import { ref } from 'vue'
import {downloadFile} from '@/utils/common/common-utils'
import HpoTermsBox from '@/components/common/HpoTermsBox.vue'

export default {
  name: 'UploadFile',
  components: {
    PipelineInfo,
    HpoTermsBox
  },
  data() {
    return {
      PED_file : null,
      SNP_file : null,
      SV_files : null,
      svCallers: [],
      proband_id: "",
      uploadLoading : false,
      getPEDInfoLoading : false,
      pipelineInfoData: {},
      pipelineInfoDialog : false,
      ped_tab : 'file',
      ticked: [],
      tickedNode: [],
      tickStrategy: 'strict',
      filterRef : ref(null),
      filter : ref(''),
      filteredNodes:[],
      disableSearch : true,
      isSearching : false,
      gender_options : [
        {
          label : "Male",
          value: 1
        },
        {
          label : "Female",
          value: 2
        }
      ],
      affected_options : [
        {
          label : "Affected",
          value: 2
        },
        {
          label : "Not affected",
          value: 1
        }
      ],
      ped_group : [
        {
          sample_id : "",
          sex: "",
          affected : "",
          mother_id: "",
          father_id: ""
        }
      ],
      temp_users: [],
      hpoVersion : "",
      panelOptions : []
    }
  },
  watch: {
    'filter': async function(newVal) {
        await this.customFilter(newVal)
    },
    'SV_files' : function(newVal) {
      if(!this.svCallers) {
        this.svCallers = newVal.map((file) => {
          return {
            filename: file.name,
            caller: '',
          };
        });
      } else {
        // remove deleted
        if(newVal === null){
          this.svCallers = []
        } else {
          this.svCallers = this.svCallers.filter((callers) => newVal.some((file) => callers.filename === file.name));
          newVal.forEach((file) => {
            if (!this.svCallers.some((callers) => file.name === callers.filename)) {
              this.svCallers.push({
                filename: file.name,
                caller: file?.name.replace(/\.vcf\.gz$/, "")
              });
            }
          });
        }
      }
    },
  },
  async mounted(){

  },
  async created() {
    await this.showPipelineInfo();
    await this.getHpoTermVersion();
    this.panelOptions = await this.getGenePanelList()
  },
  methods:{
    async getGenePanelList(){
      return await store.getters.getApiService.getGenePanelList();
    },
    async updateTickedNode(tickedNode){
      this.tickedNode = tickedNode;
    },
    async getHpoTermVersion(){
      let hpoVersion = await store.getters.getApiService.getHpoTermVersion();
      if(hpoVersion.status === 200){
        this.hpoVersion = hpoVersion.data.data[0]
      }
    },
    async showPipelineInfo(){
      let pipelineInfo = await store.getters.getApiService.getPipelineStandaloneInfo();
      if (pipelineInfo.status === 200) {
        this.pipelineInfoData = pipelineInfo.data.data;
      }
    },
    displayPipelineInfo() {
      this.pipelineInfoDialog = true;
    },
    async onSubmit(evt){
      if(evt['key'] === "Enter") {
        evt.preventDefault()
        return false
      }

      let hasCustPed = false;
      let countPed = 0
      this.ped_group.forEach(el => {
        if(el.sample_id !== "" && el.sex !== "" && el.affected !== ""){
          hasCustPed = true
          countPed++
        } else {
          if(el.sample_id === "" && el.sex === "" && el.affected === ""){
            console.log("ignore all null ped")
          } else {
            hasCustPed = false
          }
        }
      })
      console.log('this.ped_group: ', this.ped_group);
      if(countPed === 0){
        hasCustPed = false
      }

      if(!this.PED_file && !hasCustPed){
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Please provide PED data.',
          type: 'negative'
        })
        return false
      }

      if(this.SNP_file === null){
        if(this.SV_files === null || (this.SV_files && (this.SV_files).length === 0) ) {
          this.$q.notify({
            group: true,
            timeout: 1000,
            icon: 'warning',
            message: 'Upload at least one of them : SNP file / SV files',
            type: 'negative'
          })
          return false
        }
      }


      //Trigger upload API then redirect
      this.uploadLoading = true;


      let hpos = "";
      let tickedHpo = this.$refs.HpoTermsBox.$refs.HpoTermsTree?.tickedNode

      if(tickedHpo?.length > 0){
        let tempArr = [];
        tickedHpo.forEach((each) => {
          //console.log("EACH",each)
          tempArr.push(each.value)
        })
        hpos = tempArr.join(',')
      } else if(this.$refs.HpoTermsBox.hpoInput){
        hpos = this.$refs.HpoTermsBox.hpoInput
      }


      console.log("hpo file : ", this.$refs.HpoTermsBox.HPO_file)
      console.log("hpos:",hpos)
      console.log("panel : ", this.$refs.HpoTermsBox.panel)
      //return false

      let uploadResult;
      try {
        uploadResult = await store.getters.getApiService.uploadPipelineFile(
          this.PED_file,
          this.SNP_file,
          this.SV_files,
          this.proband_id,
          this.ped_group.filter((ped) => ped.sample_id !== '' && ped.sex !== '' && ped.affected !== '').map((ped) => {
            return {
              sample_id: ped.sample_id,
              sex: ped.sex.value,
              affected: ped.affected.value,
              paternalID: ped.father_id === '' ? '-9' : ped.father_id,
              maternalID: ped.mother_id === '' ? '-9' : ped.mother_id,
            }
          }),
          this.svCallers,
          this.$refs.HpoTermsBox?.HPO_file,
          hpos,
          this.$refs.HpoTermsBox?.panel
        );
      } catch (error) {
        this.uploadLoading = false;
      }

      if(uploadResult.status === 201){
        const token = uploadResult.data.data.job_id;
        const userInfo = {
          username: uploadResult.data.data.job_id,
          groups: [],
          roles: [],
        }
        localStorage.setItem("sso-token", token);
        this.ssoToken = token
        this.userProfile = userInfo
        this.userInfo = userInfo
        store.commit('updateSSOToken', token);
        router.push({ name: 'DashBoard', query: { job_id: uploadResult.data.data.job_id } })
      }

    },
    async openExampleFile(type){
      this.$q.loading.show()
      await downloadFile(type)
      this.$q.loading.hide()
    },
    addPedGroup(){
      this.ped_group.push({
        sample_id : "",
        sex: "",
        affected : "",
        mother_id: "",
        father_id: ""
      });
    },
    deletePedGroup(index){
      if(this.ped_group.length === 1 && index === 0){
        this.ped_group[0] = {
          sample_id : "",
          sex: "",
          affected : "",
          mother_id: "",
          father_id: ""
        }
      } else {
        this.ped_group.splice(index, 1);
      }
    },
    async getPEDInfoFromVCF(){

      if(!this.SNP_file && (!this.SV_files || this.SV_files?.length === 0)){
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Upload at least one of them : SNP file / SV files to get PED info',
          type: 'negative'
        })
      } else {
        this.getPEDInfoLoading = true;
        let uploadResult;

        try {
          uploadResult = await store.getters.getApiService.uploadPipelineFileGetPEDInfo(
            this.SNP_file,
            this.SV_files,
          );
        } catch (error) {
          this.getPEDInfoLoading = false;
        }

        if(uploadResult.status === 201) {
          this.ped_group = uploadResult.data.data
        }
        this.getPEDInfoLoading = false
      }
    }
  }

}
</script>
