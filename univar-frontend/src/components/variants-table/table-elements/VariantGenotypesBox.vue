<template>
  <div class='variant-genotypes-container'>
    <div class="detail-header">
      <div>Details {{variantDetailObj.chrom}}:{{variantDetailObj.start}} </div>
      <div class="cut-text-container" style='width: 430px;'>
        {{variantDetailObj.ref}} → {{variantDetailObj.alt}}
      </div>
      <div>{{variantDetailObj.gene_symbol[0]}}</div>
    </div>
      <div class="row detail-subheader">
        <div class="col-5 text-left">
          Name
        </div>
        <div class="col-2 text-center">
          Genotype
        </div>
        <div class="col-5 text-center">
          Parents
        </div>
      </div>
      <template v-for="(item, index) in variantsSamples" :key="index">
        <div class="row detail-row" v-if='item.display'>
          <div class="col-5 text-left">
            <span v-if='item.sex === "F"'>
              <q-icon size="1rem" name="female" />
            </span>
            <span v-else>
              <q-icon size="1rem" name="male" />
            </span>
            {{item.name}}
          </div>
          <div class="col-2 text-center">
            <div v-html="item.displayHTML"></div>
          </div>
          <div class="col-5 text-center">
            <div v-if="(item.mother_id !== '-9' || item.father_id !== '-9')">
              <q-icon size="1rem" name="female" />{{item.mother_id}}<br>
              <q-icon size="1rem" name="male" />{{item.father_id}}<br>
            </div>
            <div v-else>
              <span v-if='item.name === father_id'>
                  Father
              </span>
              <span v-if='item.name === mother_id'>
                  Mother
              </span>
            </div>
          </div>
        </div>
      </template>
  </div>
</template>

<style>
  @import '@/assets/styles/variant-genotype-box.scss';
</style>

<script>
export default {
  name: 'VariantGenotypesBox',
  props: {
    variantDetailObj: Object,
    variantsSamples: Object,
    genotypesIndex : String
  },
  data() {
    return{
      father_id: "",
      mother_id: "",
      genotypeIndexArr: []
    }
  },
  async created() {

    this.genotypeIndexArr = this.genotypesIndex.split(",")

    this.variantsSamplesMassage(this.variantsSamples)
  },
  methods: {
    variantsSamplesMassage(variantsSamples){
      let index = 0;
      variantsSamples.forEach((el, key) => {
        if(el.father_id !== '-9'){
          this.father_id = el.father_id
        }
        if(el.mother_id !== '-9'){
          this.mother_id = el.mother_id
        }

        el.index = [this.genotypeIndexArr[index] , this.genotypeIndexArr[index + 1]]

        let displayHTML = '<div class="genotype-block">';
        const isAffected = (i) => el.group === 'affected' ? `genotypeM_affected` : `genotypeM_not_affected`;

        if(this.genotypeIndexArr[index] === ""){
          displayHTML += `<div class="dot"></div>`;
        } else {
          displayHTML += `<div class='genotypeM ${this.genotypeIndexArr[index] === "1" ? isAffected(index) : ''}'></div>`;
        }

        if(this.genotypeIndexArr[index + 1] === ""){
          displayHTML += `<div class="dot"></div>`;
        } else {
          displayHTML += `<div class='genotypeM ${this.genotypeIndexArr[index + 1] === "1" ? isAffected(index + 1) : ''}'></div>`;
        }
        displayHTML += '</div>';
        el.displayHTML = displayHTML;

        if(el.active) {
          if (this.genotypeIndexArr[index] === "1" || this.genotypeIndexArr[index + 1] === "1") {
            el.display = true
          } else {
            el.display = false
          }
        } else {
          el.display = false
        }

        index = index +2;
      })
    }
  }
}
</script>
