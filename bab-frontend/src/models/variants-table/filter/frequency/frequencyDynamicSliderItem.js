import sliderFiveStep from '@/models/variants-table/filter/common/sliderFiveStep.json'

const FREQ_DYNAMIC_ITEM = [

  /* BOTH */
  {
    label : "gnomAD - Global",
    field : "gnomad_af",
    sliderObject : sliderFiveStep,
    isShow: false,
    group : "both"
  },
  {
    label : "gnomAD - East Asian",
    field : "gnomad_eas_af",
    sliderObject : sliderFiveStep,
    isShow: false,
    group : "both"
  },


  /* SNP */
  {
    label : "gnomAD v3 - East Asian",
    field : "gnomadv3_af_eas",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "snp"
  },
  {
    label : "gnomAD v3 - Global",
    field : "gnomadv3_af",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "snp"
  },


  /* SV */
  {
    label : "DGV Gold (outer)",
    field : "dgv_gold_outer",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },
  {
    label : "DGV Gold (inner)",
    field : "dgv_gold_inner",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },
  {
    label : "1KGP - East Asian",
    field : "one_kg_eas",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },
  {
    label : "1KGP - Survtyper - East Asian",
    field : "one_kg_sur_eas",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },
  {
    label : "1KGP - Global",
    field : "one_kg",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },
  {
    label : "1KGP - Survtyper - Global",
    field : "one_kg_sur",
    sliderObject : sliderFiveStep,
    isShow: false,
    group: "sv"
  },


]

export default FREQ_DYNAMIC_ITEM