<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <div>
      <q-input v-model="display_name" label="Display Name *" :rules="[val => !!val || 'Display name is required']"/>
      <HpoTermsBox
        ref="HpoTermsBox"
        :panelOptions='panelOptions'
        @updateTickedNode='updateTickedNode'
      >
      </HpoTermsBox>
    </div>
    <q-card-actions align="right" class="text-teal">
      <q-btn :loading=uploadLoading label="Run Exomiser" type="submit" color="primary"  class='upload-btn' />
      <q-btn color="negative" label="Close" v-close-popup />
    </q-card-actions>
  </q-form>
</template>


<script>
import store from '@/store/store.js'
import HpoTermsBox from '@/components/common/HpoTermsBox.vue'

export default {
  name: 'ExomiserBox',
  props: [
    'selected_database',
    'panelOptions'
  ],
  emits: ["onRunExomiserSuccess"],
  components: {
    HpoTermsBox
  },
  data() {
    return{
      uploadLoading: false,
      display_name : ""
    }
  },
  async created() {

  },
  methods: {
    async updateTickedNode(tickedNode){
      this.tickedNode = tickedNode;
    },
    async onSubmit(evt){
      if(evt['key'] === "Enter") {
        evt.preventDefault()
        return false
      }

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

      console.log(this.display_name)
      console.log("hpos:",hpos)
      console.log("hpo file : ", this.$refs.HpoTermsBox.HPO_file)
      console.log("panel : ", this.$refs.HpoTermsBox.panel)

      //return false;

      //Trigger upload API then redirect
      this.uploadLoading = true;


      if(!this.$refs.HpoTermsBox.HPO_file && hpos === "" && this.$refs.HpoTermsBox.panel?.length === 0){
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Please provide HPO terms information',
          type: 'negative'
        })
        this.uploadLoading = false;
        return false;
      }

      //return false;

      let uploadResult;
      try {
        uploadResult = await store.getters.getApiService.runExomiser(
          this.selected_database,
          this.display_name,
          hpos,
          this.$refs.HpoTermsBox.HPO_file,
          this.$refs.HpoTermsBox.panel.join(',')
        );
      } catch (error) {
        this.uploadLoading = false;
      }

      if(uploadResult.status === 201){
        this.$q.notify({
          group: true,
          icon: 'done',
          type: 'positive',
          spinner: false,
          message: 'Successfully run exomiser!',
          timeout: 1000
        });
        this.uploadLoading = false;
        this.$emit("onRunExomiserSuccess")
      }

    }
  }
}
</script>