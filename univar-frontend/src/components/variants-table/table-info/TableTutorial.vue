<template>
    <q-btn label="Short tutorial for case study" class="table-tutorial-btn" @click="alert = true" />
    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Short tutorial for case study</div>
        </q-card-section>
  
        <q-card-section class="q-pt-none">
          This is a case study of a proband with atypical ataxia-telangiectasia. The proband carries
          pathogenic compound heterozygous variants in ATM, they are a heterozygous nonsense
          pathogenic variant c.742C>T (p.Arg248Ter) inherited from the father and a heterozygous SV
          (exons 24-40 deletion in ATM) inherited from the mother.
        </q-card-section>
        <q-card-section class="q-pt-none">
          Please follow the below steps to guide you to identify these pathogenic variants.<br />
          Step 1: Within the list of <i>Select Preset</i> <img src="@/assets/img/tutorial-1.png" />,
          select <b>High risk (SNV/INDEL + SV)</b><br />
          Step 2: Within the list of <i>Select Exomiser</i> <img src="@/assets/img/tutorial-2.png" />,
          select <b>ataxia</b><br />
          Step 3: Press the column <i>Exomiser Gene Combined Score</i>
          <img src="@/assets/img/tutorial-3.png" /> to sort the values in
          <b>descending</b> order<br />
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export default {
    setup() {
      return {
        alert: ref(false),
        address: ref('')
      }
    }
  }
  </script>