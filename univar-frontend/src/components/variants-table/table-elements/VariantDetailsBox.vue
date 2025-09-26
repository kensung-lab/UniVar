<template>

  <q-popup-proxy>
    <q-banner class="variant-details-box">
      <div class="detail-header">
        <div>Details {{variantDetailObj.chrom}}:{{variantDetailObj.start}} </div>
        <div class="cut-text-container">
          {{variantDetailObj.ref}} → {{variantDetailObj.alt}}
        </div>
      </div>
      <div v-if='(type ==="gene")'>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              Symbol:
            </div>
            <div class="col-6">
              {{variantDetailObj.gene_symbol}}
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              Ensembl:
            </div>
            <div class="col-6">
              <a :href="'https://www.ensembl.org/id/'+ variantDetailObj.ensembl_gene_id" target="_blank">{{variantDetailObj.ensembl_gene_id}}</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              Entrez:
            </div>
            <div class="col-6">
              <a :href="'https://www.ncbi.nlm.nih.gov/gene/'+ variantDetailObj.entrez_gene_id" target="_blank">{{variantDetailObj.entrez_gene_id}}</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              OMIM:
            </div>
            <div class="col-6">
              <a :href="'https://www.omim.org/search?index=entry&sort=score+desc%2C+prefix_sort+desc&start=1&limit=10&search=' + variantDetailObj.gene_symbol" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              ClinGen:
            </div>
            <div class="col-6">
              <a :href="'https://search.clinicalgenome.org/kb/genes?page=1&size=50&search='+ variantDetailObj.gene_symbol" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              GeneReview:
            </div>
            <div class="col-6">
              <a :href="'https://www.ncbi.nlm.nih.gov/books/NBK1116/?term='+ variantDetailObj.gene_symbol" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              UK PanelApp:
            </div>
            <div class="col-6">
              <a :href="'https://panelapp.genomicsengland.co.uk/panels/entities/'+ variantDetailObj.gene_symbol" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              AU PanelApp:
            </div>
            <div class="col-6">
              <a :href="'https://panelapp.agha.umccr.org/panels/entities/'+ variantDetailObj.gene_symbol" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div v-if="variantDetailObj.hgvsc" class="detail-row">
          <div class="row">
            <div class="col-6">
              ClinVar:
            </div>
            <div class="col-6">
              <a :href="`https://www.ncbi.nlm.nih.gov/clinvar/?term=${variantDetailObj.gene_symbol}+${encodeURIComponent(displayFormatHGVS(variantDetailObj.hgvsc))}`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              MASTERMIND:
            </div>
            <div class="col-6">
              <a :href="`https://mastermind.genomenon.com/detail?gene=${variantDetailObj.gene_symbol}&boolean=true&gene_op=and&mutation_op=and&cnv_op=and&disease_op=and&hpo_op=and&unii_op=and&keyword_op=and`" target="_blank">Search by gene...</a>
            </div>
          </div>
        </div>
        <div v-if="variantDetailObj.variant_type === 'small'" class="detail-row">
          <div class="row">
            <div class="col-6">
              MASTERMIND:
            </div>
            <div class="col-6">
              <a :href="`https://mastermind.genomenon.com/detail?gene=${variantDetailObj.gene_symbol}&mutation=${variantDetailObj.gene_symbol}:${encodeURIComponent(displayFormatHGVS(variantDetailObj.hgvsc))}&boolean=true&gene_op=and&mutation_op=and&cnv_op=and&disease_op=or&hpo_op=or&unii_op=or&keyword_op=and`" target="_blank">Search by variant...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              VarSome:
            </div>
            <div class="col-6">
              <a :href="`https://varsome.com/gene/hg38/${variantDetailObj.gene_symbol}`" target="_blank">Search by gene...</a>
            </div>
          </div>
        </div>
        <template v-if="variantDetailObj.variant_type === 'small' && variantDetailObj.mane_select">
          <div class="detail-row">
            <div class="row">
              <div class="col-6">
                VarSome:
              </div>
              <div class="col-6">
                <a :href="`https://varsome.com/variant/hg38/${variantDetailObj.mane_select}:${encodeURIComponent(displayFormatHGVS(variantDetailObj.hgvsc))}?annotation-mode=germline`" target="_blank">Search by hvgs...</a>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="variantDetailObj.variant_type === 'small' && !variantDetailObj.mane_select">
          <template v-for="(ncbi_id,key) in variantDetailObj.ncbi_ids" :key="key">
            <div class="detail-row">
              <div class="row">
                <div class="col-6">
                  VarSome ({{ncbi_id}}):
                </div>
                <div class="col-6">
                  <a :href="`https://varsome.com/variant/hg38/${ncbi_id}:${encodeURIComponent(displayFormatHGVS(variantDetailObj.hgvsc))}?annotation-mode=germline`" target="_blank">Search by hvgs...</a>
                </div>
              </div>
            </div>
          </template>
        </template>

        <div v-if="variantDetailObj.variant_type === 'small'" class="detail-row">
          <div class="row">
            <div class="col-6">
              VarSome:
            </div>
            <div class="col-6">
              <a :href="`https://varsome.com/variant/hg38/${variantDetailObj.chrom.replaceAll('chr','')}-${variantDetailObj.start}-${variantDetailObj.ref}-${variantDetailObj.alt}?annotation-mode=germline`" target="_blank">Search by position...</a>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if='type ==="hgv"'>
        <div class="detail-row">
          <div class="row">
            <div class="col-8">
              <b>Transcript</b>
            </div>
            <div class="col-4">
              <b>Position</b>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-8">
              {{variantDetailObj.transcript}}
            </div>
            <div class="col-4 geneDetailPosition">
              {{variantDetailObj.position}}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if='(type ==="position")'>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              Position:
            </div>
            <div class="col-6">
              {{variantDetailObj.chrom}}: {{variantDetailObj.start}}-{{ variantDetailObj.end }}
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              UCSC:
            </div>
            <div class="col-6">
              <a :href="`https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=${variantDetailObj.chrom}:${variantDetailObj.start}-${variantDetailObj.end}`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div class="detail-row">
          <div class="row">
            <div class="col-6">
              Franklin:
            </div>
            <div class="col-6">
              <a :href="`https://franklin.genoox.com/clinical-db/variant/snp/${variantDetailObj.chrom}-${variantDetailObj.start}-${variantDetailObj.ref}-${variantDetailObj.alt}`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div  v-if="variantDetailObj.hg19_chrom && variantDetailObj.hg19_start && variantDetailObj.variant_type === 'small'" class="detail-row">
          <div class="row">
            <div class="col-6">
              gnomAD v2:
            </div>
            <div class="col-6">
              <a :href="`https://gnomad.broadinstitute.org/variant/${variantDetailObj.hg19_chrom.replaceAll('chr','')}-${variantDetailObj.hg19_start}-${variantDetailObj.ref}-${variantDetailObj.alt}?dataset=gnomad_r2_1`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div  v-if="variantDetailObj.hg19_chrom && variantDetailObj.hg19_start && variantDetailObj.variant_type === 'structural'" class="detail-row">
          <div class="row">
            <div class="col-6">
              gnomAD v2:
            </div>
            <div class="col-6">
              <a :href="`https://gnomad.broadinstitute.org/variant/${variantDetailObj.hg19_chrom.replaceAll('chr','')}-${variantDetailObj.hg19_end ? variantDetailObj.hg19_start : variantDetailObj.hg19_start > 100 ? variantDetailObj.hg19_start - 100 : 0}-${variantDetailObj.hg19_end ? variantDetailObj.hg19_end : variantDetailObj.hg19_start + 100}?dataset=gnomad_sv_r2_1`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div  v-if="variantDetailObj.variant_type === 'small'" class="detail-row">
          <div class="row">
            <div class="col-6">
              gnomAD v3:
            </div>
            <div class="col-6">
              <a :href="`https://gnomad.broadinstitute.org/variant/${variantDetailObj.chrom}-${variantDetailObj.start}-${variantDetailObj.ref}-${variantDetailObj.alt}?dataset=gnomad_r3`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div  v-if="variantDetailObj.variant_type === 'small'" class="detail-row">
          <div class="row">
            <div class="col-6">
              gnomAD v4:
            </div>
            <div class="col-6">
              <a :href="`https://gnomad.broadinstitute.org/variant/${variantDetailObj.chrom}-${variantDetailObj.start}-${variantDetailObj.ref}-${variantDetailObj.alt}?dataset=gnomad_r4`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
        <div  v-if="variantDetailObj.variant_type === 'structural'" class="detail-row">
          <div class="row">
            <div class="col-6">
              gnomAD v4:
            </div>
            <div class="col-6">
              <a :href="`https://gnomad.broadinstitute.org/variant/${variantDetailObj.chrom}-${variantDetailObj.end ? variantDetailObj.start : variantDetailObj.start > 100 ? variantDetailObj.start - 100 : 0}-${variantDetailObj.end ? variantDetailObj.end : variantDetailObj.end + 100}?dataset=gnomad_sv_r4`" target="_blank">Search...</a>
            </div>
          </div>
        </div>
      </div>
    </q-banner>
  </q-popup-proxy>
</template>


<script>
export default {
  name: 'variantDetailsBox',
  props: {
    variantDetailObj: Object,
    type: String,
    variantType: String,
  },
  data() {
    return{

    }
  },
  async created() {

  },
  methods: {
    displayFormatHGVS(v){
      if(v) {
        let value = v.split(':')
        if ((value[1]).length > 30) {
          return decodeURIComponent( value[1].slice(0, 30) + "..." )
        } else {
          return decodeURIComponent(value[1])
        }
      }
    },
  }
}
</script>
