import sliderExom from '@/models/variants-table/filter/prioritization/sliderExom.json'

const EXOM_SLIDER_ITEM = {
  combined : [
    {
      label : "Highest Exomiser Combi",
      field : "highest_exomiser_scombi",
      sliderObject : sliderExom,
    },
    {
      label : "ExomAD Scombi",
      field : "exomiser_ad_exgenescombi",
      sliderObject : sliderExom,
    },
    {
      label : "ExomAR Scombi",
      field : "exomiser_ar_exgenescombi",
      sliderObject : sliderExom
    },
    {
      label : "ExomXD Scombi",
      field : "exomiser_xd_exgenescombi",
      sliderObject : sliderExom
    },
    {
      label : "ExomXR Scombi",
      field : "exomiser_xr_exgenescombi",
      sliderObject : sliderExom
    },
    {
      label : "ExomMT Scombi",
      field : "exomiser_mt_exgenescombi",
      sliderObject : sliderExom
    },
  ],
  phenotype : [
    {
      label : "Highest Exomiser Spheno",
      field : "highest_exomiser_spheno",
      sliderObject : sliderExom,
    },
    {
      label : "ExomAD SPheno",
      field : "exomiser_ad_exgenespheno",
      sliderObject : sliderExom,
    },
    {
      label : "ExomAR SPheno",
      field : "exomiser_ar_exgenespheno",
      sliderObject : sliderExom
    },
    {
      label : "ExomXD SPheno",
      field : "exomiser_xd_exgenespheno",
      sliderObject : sliderExom
    },
    {
      label : "ExomXR SPheno",
      field : "exomiser_xr_exgenespheno",
      sliderObject : sliderExom
    },
    {
      label : "ExomMT SPheno",
      field : "exomiser_mt_exgenespheno",
      sliderObject : sliderExom
    }
  ],
  exomiser : [
    {
      label : "Highest Exomiser Gene Combined Score",
      field : "highest_exomiser_gene_combined_score",
      sliderObject : sliderExom,
    },
    {
      label : "Highest Exomiser Gene Pheno Score",
      field : "highest_exomiser_gene_pheno_score",
      sliderObject : sliderExom,
    }
  ]
}

export default EXOM_SLIDER_ITEM