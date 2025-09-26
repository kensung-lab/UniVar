import sliderSpliceAI from "@/models/variants-table/filter/prediction/sliderSpliceAI.json"

const SPLICE_AI_SLIDER_ITEM = [
  {
    label : "Highest Δ score",
    field : "highest_splice_ai",
    sliderObject : sliderSpliceAI
  },
  {
    label : "Δ score of AG",
    field : "spliceai_pred_ds_ag",
    sliderObject : sliderSpliceAI
  },
  {
    label : "Δ score of AL",
    field : "spliceai_pred_ds_al",
    sliderObject : sliderSpliceAI
  },
  {
    label : "Δ score of DG",
    field : "spliceai_pred_ds_dg",
    sliderObject : sliderSpliceAI
  },
  {
    label : "Δ score of DL",
    field : "spliceai_pred_ds_dl",
    sliderObject : sliderSpliceAI
  }
]

export default SPLICE_AI_SLIDER_ITEM