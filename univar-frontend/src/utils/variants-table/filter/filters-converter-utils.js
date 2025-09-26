import sliderLoFUpper from '@/models/variants-table/filter/pathogenicity/sliderLoFUpper.json'
import sliderFiveStep from '@/models/variants-table/filter/common/sliderFiveStep.json'
import sliderSVLength from '@/models/variants-table/filter/others/sliderSVLength.json'
import sliderExom from '@/models/variants-table/filter/prioritization/sliderExom.json'
import sliderMisUpper from '@/models/variants-table/filter/pathogenicity/sliderMisUpper.json'
import impactHighOptions from '@/models/variants-table/filter/impact/impactHighOptions.json'
import impactMedOptions from '@/models/variants-table/filter/impact/impactMedOptions.json'
import impactLowOptions from '@/models/variants-table/filter/impact/impactLowOptions.json'
import impactModifierOptions from '@/models/variants-table/filter/impact/impactModifierOptions.json'
import default_search_fields from '@/models/variants-table/filter/common/default_search_fields.json'
import frequencyDynamicSliderItem from '@/models/variants-table/filter/frequency/frequencyDynamicSliderItem'
import sliderCADD from '@/models/variants-table/filter/prediction/sliderCADD.json'
import sliderPolyphen from '@/models/variants-table/filter/prediction/sliderPolyphen.json'
import sliderSift from '@/models/variants-table/filter/prediction/sliderSift.json'
import sliderAlphaMissense from '@/models/variants-table/filter/prediction/sliderAlphaMissense.json'
import sliderZscore from '@/models/variants-table/filter/prediction/sliderZscore.json'
import sliderZscorev4 from '@/models/variants-table/filter/prediction/sliderZscorev4.json'
import sliderRevel from '@/models/variants-table/filter/prediction/sliderRevel.json'
import sliderSpliceAI from '@/models/variants-table/filter/prediction/sliderSpliceAI.json'
import { getScenarioSearchStr } from '@/utils/variants-table/filter/radio-utils'

//Non-slider key
const DEFAULT_SEARCH_FIELDS = default_search_fields

//Slider key
const DEFAULT_SLIDER = [
  { field: 'polyphen_score', model: sliderPolyphen },
  { field: 'sift_score', model: sliderSift },
  { field: 'len', model: sliderSVLength },
  { field: 'revel', model: sliderRevel },
  { field: 'cadd_phred', model: sliderCADD },
  { field: 'am_pathogenicity', model: sliderAlphaMissense },
  { field: 'constraint_v2_mis_z', model: sliderZscore },
  { field: 'constraint_v2_syn_z', model: sliderZscore },
  { field: 'constraint_v2_oe_lof_upper', model: sliderLoFUpper },
  { field: 'constraint_v2_oe_mis_upper', model: sliderMisUpper },
  { field: 'constraint_v4_mis_z', model: sliderZscorev4 },
  { field: 'constraint_v4_syn_z', model: sliderZscorev4 },
  { field: 'constraint_v4_oe_lof_upper', model: sliderLoFUpper },
  { field: 'constraint_v4_oe_mis_upper', model: sliderMisUpper },
  { field: 'highest_exomiser_scombi', model: sliderExom },
  { field: 'exomiser_ad_exgenescombi', model: sliderExom },
  { field: 'exomiser_ar_exgenescombi', model: sliderExom },
  { field: 'exomiser_xd_exgenescombi', model: sliderExom },
  { field: 'exomiser_xr_exgenescombi', model: sliderExom },
  { field: 'exomiser_mt_exgenescombi', model: sliderExom },
  { field: 'highest_exomiser_spheno', model: sliderExom },
  { field: 'exomiser_ad_exgenespheno', model: sliderExom },
  { field: 'exomiser_ar_exgenespheno', model: sliderExom },
  { field: 'exomiser_xd_exgenespheno', model: sliderExom },
  { field: 'exomiser_xr_exgenespheno', model: sliderExom },
  { field: 'exomiser_mt_exgenespheno', model: sliderExom },
  { field: 'highest_exomiser_gene_combined_score', model: sliderExom },
  { field: 'highest_exomiser_gene_pheno_score', model: sliderExom },
  { field: 'highest_af', model: sliderFiveStep },
  { field: 'gnomadv2e_af', model: sliderFiveStep },
  { field: 'gnomadv2e_afr_af', model: sliderFiveStep },
  { field: 'gnomadv2e_amr_af', model: sliderFiveStep },
  { field: 'gnomadv2e_asj_af', model: sliderFiveStep },
  { field: 'gnomadv2e_eas_af', model: sliderFiveStep },
  { field: 'gnomadv2e_fin_af', model: sliderFiveStep },
  { field: 'gnomadv2e_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv2e_oth_af', model: sliderFiveStep },
  { field: 'gnomadv2e_sas_af', model: sliderFiveStep },
  { field: 'gnomadv2g_af', model: sliderFiveStep },
  { field: 'gnomadv2g_afr_af', model: sliderFiveStep },
  { field: 'gnomadv2g_amr_af', model: sliderFiveStep },
  { field: 'gnomadv2g_asj_af', model: sliderFiveStep },
  { field: 'gnomadv2g_eas_af', model: sliderFiveStep },
  { field: 'gnomadv2g_fin_af', model: sliderFiveStep },
  { field: 'gnomadv2g_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv2g_oth_af', model: sliderFiveStep },
  { field: 'gnomadv2g_sas_af', model: sliderFiveStep },
  { field: 'gnomadv3g_af', model: sliderFiveStep },
  { field: 'gnomadv3g_afr_af', model: sliderFiveStep },
  { field: 'gnomadv3g_amr_af', model: sliderFiveStep },
  { field: 'gnomadv3g_asj_af', model: sliderFiveStep },
  { field: 'gnomadv3g_eas_af', model: sliderFiveStep },
  { field: 'gnomadv3g_fin_af', model: sliderFiveStep },
  { field: 'gnomadv3g_mid_af', model: sliderFiveStep },
  { field: 'gnomadv3g_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv3g_oth_af', model: sliderFiveStep },
  { field: 'gnomadv3g_sas_af', model: sliderFiveStep },
  { field: 'gnomadv4e_af', model: sliderFiveStep },
  { field: 'gnomadv4e_afr_af', model: sliderFiveStep },
  { field: 'gnomadv4e_amr_af', model: sliderFiveStep },
  { field: 'gnomadv4e_asj_af', model: sliderFiveStep },
  { field: 'gnomadv4e_eas_af', model: sliderFiveStep },
  { field: 'gnomadv4e_fin_af', model: sliderFiveStep },
  { field: 'gnomadv4e_mid_af', model: sliderFiveStep },
  { field: 'gnomadv4e_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv4e_oth_af', model: sliderFiveStep },
  { field: 'gnomadv4e_sas_af', model: sliderFiveStep },
  { field: 'gnomadv4g_af', model: sliderFiveStep },
  { field: 'gnomadv4g_afr_af', model: sliderFiveStep },
  { field: 'gnomadv4g_amr_af', model: sliderFiveStep },
  { field: 'gnomadv4g_asj_af', model: sliderFiveStep },
  { field: 'gnomadv4g_eas_af', model: sliderFiveStep },
  { field: 'gnomadv4g_fin_af', model: sliderFiveStep },
  { field: 'gnomadv4g_mid_af', model: sliderFiveStep },
  { field: 'gnomadv4g_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv4g_oth_af', model: sliderFiveStep },
  { field: 'gnomadv4g_sas_af', model: sliderFiveStep },
  { field: 'dgv_gold_outer', model: sliderFiveStep },
  { field: 'dgv_gold_inner', model: sliderFiveStep },
  { field: 'hkbc', model: sliderFiveStep },
  { field: 'one_kg_eas', model: sliderFiveStep },
  { field: 'one_kg_sur_eas', model: sliderFiveStep },
  { field: 'one_kg', model: sliderFiveStep },
  { field: 'one_kg_sur', model: sliderFiveStep },
  { field: 'gnomadv2_sv_af', model: sliderFiveStep },
  { field: 'gnomadv2_sv_afr_af', model: sliderFiveStep },
  { field: 'gnomadv2_sv_amr_af', model: sliderFiveStep },
  { field: 'gnomadv2_sv_eas_af', model: sliderFiveStep },
  { field: 'gnomadv2_sv_eur_af', model: sliderFiveStep },
  { field: 'gnomadv2_sv_oth_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_afr_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_ami_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_amr_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_asj_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_eas_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_fin_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_mid_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_nfe_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_oth_af', model: sliderFiveStep },
  { field: 'gnomadv4_sv_sas_af', model: sliderFiveStep },
  { field: 'han_sv_af', model: sliderFiveStep },
  { field: 'highest_splice_ai', model: sliderSpliceAI },
  { field: 'spliceai_pred_ds_ag', model: sliderSpliceAI },
  { field: 'spliceai_pred_ds_al', model: sliderSpliceAI },
  { field: 'spliceai_pred_ds_dg', model: sliderSpliceAI },
  { field: 'spliceai_pred_ds_dl', model: sliderSpliceAI }
]

//Location Search
const LOCATION_SEARCH_FIELDS = ['chrom', 'start', 'end', 'gene_objs.gene_filter']

/**
 * @description
 *  takes a variantsFilter object as input and returns a new filter object based on the provided filter criteria.
 *  The function performs various transformations and mappings on the input filter to generate the desired output.
 *
 * @param {Object} variantsFilter - An object containing filter conditions for variants. Each key represents a filter field, and the corresponding value represents the filter value.
 *
 * @returns {Object} newFilter : new filter object generated based on the input variantsFilter. It includes transformed and mapped properties based on the provided filter criteria.
 *
 * @remark :
 *  - Run this function when 1.init page with URL, 2.load preset/bookmark 3.load local storage
 *  - Convert a bookmark object/url object to exact variantsFilter object in variant table
 *
 */
export function getFilterObjectByVariantsFilter(variantsFilter) {
  //console.log('variantsFilter : ',variantsFilter)

  if (!variantsFilter) {
    return
  }

  let newFilter = {}
  newFilter['impact'] = []

  //Non-slider key
  Object.keys(variantsFilter).forEach((key) => {
    let objectValue = variantsFilter[key]
    let mapValue

    //Non slider value
    if (DEFAULT_SEARCH_FIELDS.some((obj) => obj.field === key)) {
      const index = DEFAULT_SEARCH_FIELDS.findIndex((obj) => obj.field === key)
      const type = DEFAULT_SEARCH_FIELDS[index]['type']

      if (type === 'boolean') {
        objectValue = Number(objectValue)
        //console.log(objectValue)
      }

      if (objectValue !== null) {
        if (key === 'scenario') {
          newFilter['scenario'] = objectValue.toString()
          return
        }
        if (key === 'impact') {
          let impact = []

          if (!Array.isArray(objectValue)) {
            objectValue = objectValue.split('@')
          }

          const existedInHigh = objectValue
            .filter((value) => impactHighOptions.some((obj) => obj.value === value))
            .map((value) => value)
          const existedInMed = objectValue
            .filter((value) => impactMedOptions.some((obj) => obj.value === value))
            .map((value) => value)
          const existedInLow = objectValue
            .filter((value) => impactLowOptions.some((obj) => obj.value === value))
            .map((value) => value)
          const existedInMod = objectValue
            .filter((value) => impactModifierOptions.some((obj) => obj.value === value))
            .map((value) => value)
          if (existedInHigh.length > 0) {
            newFilter['impactHighSelected'] = existedInHigh
          }
          if (existedInMed.length > 0) {
            newFilter['impactMedSelected'] = existedInMed
          }
          if (existedInLow.length > 0) {
            newFilter['impactLowSelected'] = existedInLow
          }
          if (existedInMod.length > 0) {
            newFilter['impactModifierSelected'] = existedInMod
          }

          impact = impact.concat(existedInHigh, existedInMed, existedInLow, existedInMod)
          newFilter['impact'] = impact

          return
        }
        if (key === 'quality') {
          if (typeof objectValue === 'object' && !Array.isArray(objectValue)) {
            newFilter[key] = objectValue
          } else {
            newFilter[key] = { step: 1, value: { $gte: +objectValue } }
          }
          return
        }

        if (!Array.isArray(objectValue)) {
          //Not array
          //If value can be split by "@"
          if (typeof objectValue === 'string') {
            const arrValue = objectValue.split('@')
            if (Array.isArray(arrValue) && type === 'array') {
              newFilter[key] = arrValue
            } else {
              newFilter[key] = objectValue
            }
          } else {
            //if(typeof(objectValue) === 'number' || typeof(objectValue) === 'string'){
            mapValue = Number(objectValue)
            newFilter[key] = mapValue
          }
        } else {
          //If value is already an array
          newFilter[key] = objectValue
        }
      }
    }

    if (LOCATION_SEARCH_FIELDS.includes(key)) {
      newFilter[key] = objectValue
    }
  })

  //Slider normal
  Object.keys(variantsFilter).forEach((key) => {
    let objectValue = variantsFilter[key]
    if (DEFAULT_SLIDER.some((obj) => obj.field === key)) {
      const index = DEFAULT_SLIDER.findIndex((obj) => obj.field === key)
      const model = DEFAULT_SLIDER[index]['model']
      const cons = model.conditions

      const value = getSearchValueFromStep(objectValue, model)

      if (typeof objectValue !== 'object') {
        let obj = {}
        obj[cons] = +objectValue
        objectValue = obj
      }
      newFilter[key] = { step: value, value: objectValue }
    }

    frequencyDynamicSliderItem.map((item) => {
      if (item.field === key) {
        item.isShow = true
      }
      return item
    })
  })

  if (newFilter['impact'].length === 0) {
    delete newFilter.impact
  }

  return newFilter
}

function getSearchValueFromStep(value, models) {
  let step, mapValue

  if (typeof value === 'number' || typeof value === 'string') {
    mapValue = Number(value)
  } else {
    mapValue = Number(Object.values(value)[0])
  }
  if (models.markerList) {
    models.markerList.forEach((el) => {
      if (el['db_value'] === mapValue) {
        step = el['value']
      }
    })
  }

  if (!step) {
    return mapValue
  }

  return step
}

/**
 * @description
 *  updates the filters and variantsFilter objects based on the provided newFilters object.
 *
 * @param {Object} newFilters - made from getFilterObjectByVariantsFilter
 * @param {Object} filters - The filters object stores the current filter values (vue basic model object - see filters_default.js)
 * @param {Object} variantsFilter - An object containing filter conditions for variants. (Will pass this object to /variant/find API call)
 * @param {Object} variantsSamples - An array of variant samples, each containing a name, group, and active status.
 *
 * @returns None : updates the filters and variantsFilter objects passed as input parameters.
 *
 *
 */
export function loadNewFiltersFromFilterObject(
  newFilters,
  filters,
  variantsFilter,
  variantsSamples
) {
  // console.log('newFilters : ',newFilters)
  // console.log('default filters : ', filters)
  // console.log('variantsFilter : ', variantsFilter)
  // console.log('variantsSamples : ', variantsSamples)

  let searchText = ''

  //Replace vue model value to trigger UI update + Replace variantsFilter to trigger API call to get new variants data from new filter
  for (const key in newFilters) {
    // eslint-disable-next-line no-prototype-builtins
    if (filters.hasOwnProperty(key)) {
      if (key === 'quality') {
        if (typeof newFilters[key] === 'object') {
          if (newFilters[key]['value']) {
            filters[key] = newFilters[key]['value']['$gte']
            variantsFilter[key] = newFilters[key]['value']
          } else {
            filters[key] = Object.values(newFilters[key])[0]
            variantsFilter[key] = newFilters[key]
          }
        }
        continue
      }

      if (typeof newFilters[key] === 'object' && !Array.isArray(newFilters[key])) {
        if (newFilters[key].hasOwnProperty('step')) {
          filters[key] = newFilters[key]['step']
          variantsFilter[key] = newFilters[key]['value']
          const matchedElement = DEFAULT_SLIDER.find((item) => item.field === key)
          let exists = false
          if (matchedElement?.model?.markerList?.length > 0) {
            exists = matchedElement.model.markerList.some(
              (item) => item.value === newFilters[key]['step']
            )

            if (exists === false) {
              filters['slider'][key]['open'] = true
              filters['slider'][key]['custom_value'] = newFilters[key]['step']
            }
          }
        }
      } else {
        filters[key] = newFilters[key]
        if (
          !(
            key === 'impactHighSelected' ||
            key === 'impactMedSelected' ||
            key === 'impactLowSelected' ||
            key === 'impactModifierSelected'
          )
        ) {
          variantsFilter[key] = newFilters[key]
        }
      }
      if (key === 'polyphen_pred') {
        filters.PolyphenPredClick = true
      }
      if (key === 'sift_pred') {
        filters.siftPredClick = true
      }
      if (key === 'impactHighSelected') {
        filters.impactHighClick = true
      }
      if (key === 'impactMedSelected') {
        filters.impactMedClick = true
      }
      if (key === 'impactLowSelected') {
        filters.impactLowClick = true
      }
      if (key === 'impactModifierSelected') {
        filters.impactModifierClick = true
      }
      if (key === 'scenario') {
        if (newFilters[key] === 'any') {
          variantsFilter['scenario'] = 'any'
          filters.scenario = 'any'
          filters.scenarioSelected = 'any'
        } else {
          variantsFilter['scenario'] = getScenarioSearchStr(
            newFilters[key].charAt(0),
            variantsSamples
          )
          filters.scenarioSelected = newFilters[key].charAt(0)
          filters.scenario = newFilters[key].charAt(0)
        }
      }
    }

    if (key === 'impact') {
      if (newFilters[key].length > 0) {
        variantsFilter['impact'] = newFilters[key]
      }
    }

    if (LOCATION_SEARCH_FIELDS.includes(key)) {
      let value = newFilters[key]

      if (typeof value === 'object') {
        value = Object.values(value)[0]
      }

      if (key === 'gene_objs.gene_filter') {
        searchText = value
        let in_value = ''
        if (Array.isArray(value)) {
          in_value = value
        } else {
          in_value = value.split(',')
        }
        variantsFilter['gene_objs.gene_filter'] = { $in: in_value }
      } else {
        if (key === 'chrom') {
          searchText = searchText + value
          if (newFilters['start']) {
            searchText = searchText + ':'
          }
          variantsFilter['chrom'] = value
        }
        if (key === 'start') {
          searchText = searchText + value
          variantsFilter['start'] = { $gte: +value }
        }
        if (key === 'end') {
          searchText = searchText + '-' + value
          variantsFilter['end'] = { $lte: +value }
        }
      }
    }
  }

  if (searchText !== '') {
    filters.geneLocationSearchText = searchText
  }

  // console.log(filters)
  // console.log(variantsFilter)

  return true
}
