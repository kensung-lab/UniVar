import { describe, it, expect } from 'vitest'

import {
  getFilterObjectByVariantsFilter,
  loadNewFiltersFromFilterObject
} from '@/utils/variants-table/filter/filters-converter-utils'

describe('getFilterObjectByVariantsFilter', () => {

  it('should return the updated filter object based on the variantsFilter (all)', () => {
    const variantsFilter = {
      "impact": [
        "frameshift_variant",
        "missense_variant"
      ],
      "chrom": "chr1",
      "start": {
        "$gte": 1234
      },
      "end": {
        "$lte": 5678
      },
      "scenario": "any",
      "pass_filter": [
        "PASS"
      ],
      "quality": {
        "$gte": 1000
      },
      "snv_type": "snp",
      "is_coding": 1,
      "is_exonic": 1,
      "univar_high_impact": 1,
      "sv_type": "INS",
      "p_lof": [
        "LOF",
        "DUP_LOF"
      ],
      "polyphen_pred": [
        "probably_damaging"
      ],
      "sift_pred": [
        "deleterious"
      ],
      "clnsig": [
        "Pathogenic",
        "Pathogenic,_drug_response,_protective,_risk_factor"
      ],
      "is_pathogenic": 1,
      "clingen_hi": "emerging",
      "clingen_ts": "emerging",
      "is_read": 1,
      "note": 1,
      "variant_type": "small",
      "highest_af": {
        "$lte": 0.05
      },
      "gnomad_eas_af": {
        "$lte": 0.05
      },
      "spliceai_pred_ds_ag": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_al": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_dg": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_dl": {
        "$gte": 0.5
      },
      "revel": {
        "$lte": 0.736
      },
      "cadd_phred": {
        "$gte": 20
      },
      "polyphen_score": {
        "$lte": 0.05
      },
      "sift_score": {
        "$lte": 0.05
      },
      "constraint_mis_z": {
        "$gte": 2
      },
      "constraint_syn_z": {
        "$gte": 2
      },
      "constraint_oe_lof_upper": {
        "$lte": 0.5
      },
      "constraint_oe_mis_upper": {
        "$lte": 0.5
      },
      "highest_exomiser_scombi": {
        "$gte": 0.5
      },
      "exomiser_ad_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_ar_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_xd_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_xr_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_mt_exgenescombi": {
        "$gte": 0.5
      }
    };

    const result = getFilterObjectByVariantsFilter(variantsFilter);

    expect(result).toEqual({
      impact: [ 'frameshift_variant', 'missense_variant' ],
      impactHighSelected: [ 'frameshift_variant' ],
      impactMedSelected: [ 'missense_variant' ],
      chrom: 'chr1',
      start: { '$gte': 1234 },
      end: { '$lte': 5678 },
      scenario: 'any',
      pass_filter: [ 'PASS' ],
      quality: { '$gte': 1000 },
      snv_type: 'snp',
      is_coding: 1,
      is_exonic: 1,
      univar_high_impact: 1,
      sv_type: 'INS',
      p_lof: [ 'LOF', 'DUP_LOF' ],
      polyphen_pred: [ 'probably_damaging' ],
      sift_pred: [ 'deleterious' ],
      clnsig: [
        'Pathogenic',
        'Pathogenic,_drug_response,_protective,_risk_factor'
      ],
      is_pathogenic: 1,
      clingen_hi: ['emerging'],
      clingen_ts: ['emerging'],
      is_read: 1,
      note: 1,
      variant_type: 'small',
      highest_af: { step: 4, value: { '$lte': 0.05 } },
      gnomad_eas_af: { step: 4, value: { '$lte': 0.05 } },
      spliceai_pred_ds_ag: { step: 3, value: { '$gte': 0.5 } },
      spliceai_pred_ds_al: { step: 3, value: { '$gte': 0.5 } },
      spliceai_pred_ds_dg: { step: 3, value: { '$gte': 0.5 } },
      spliceai_pred_ds_dl: { step: 3, value: { '$gte': 0.5 } },
      revel: { step: 7, value: { '$lte': 0.736 } },
      cadd_phred: { step: 2, value: { '$gte': 20 } },
      polyphen_score: { step: 4, value: { '$lte': 0.05 } },
      sift_score: { step: 4, value: { '$lte': 0.05 } },
      constraint_mis_z: { step: 4, value: { '$gte': 2 } },
      constraint_syn_z: { step: 4, value: { '$gte': 2 } },
      constraint_oe_lof_upper: { step: 3, value: { '$lte': 0.5 } },
      constraint_oe_mis_upper: { step: 3, value: { '$lte': 0.5 } },
      highest_exomiser_scombi: { step: 3, value: { '$gte': 0.5 } },
      exomiser_ad_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
      exomiser_ar_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
      exomiser_xd_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
      exomiser_xr_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
      exomiser_mt_exgenescombi: { step: 3, value: { '$gte': 0.5 } }
    });
  });

  it('should return the updated filter object based on the variantsFilter from url', () => {
    const variantsFilter = {
      "q": "1",
      "impact": "frameshift_variant@missense_variant@downstream_gene_variant@intergenic_variant@intron_variant@splice_region_variant",
      "chrom": "chr1",
      "start": { '$gte': 1234 },
      "end": "5678",
      "scenario": "any",
      "pass_filter": "PASS",
      "quality": "1000",
      "snv_type": "snp",
      "is_coding": "1",
      "is_exonic": "1",
      "univar_high_impact": "1",
      "sv_type": "INS",
      "p_lof": "LOF@DUP_LOF",
      "polyphen_pred": "probably_damaging",
      "sift_pred": "deleterious",
      "clnsig": "Pathogenic@Pathogenic,_drug_response,_protective,_risk_factor",
      "is_pathogenic": "1",
      "clingen_hi": "emerging",
      "clingen_ts": "emerging",
      "is_read": "1",
      "note": 1,
      "variant_type": "small",
      "highest_af":  { '$lte': 0.05 } ,
      "gnomad_eas_af": "0.05",
      "spliceai_pred_ds_ag": "0.5",
      "spliceai_pred_ds_al": "0.5",
      "spliceai_pred_ds_dg": "0.5",
      "spliceai_pred_ds_dl": "0.5",
      "revel": "0.736",
      "cadd_phred": "20",
      "polyphen_score": "0.05",
      "sift_score": "0.05",
      "constraint_mis_z": "2",
      "constraint_syn_z": "2",
      "constraint_oe_lof_upper": "0.5",
      "constraint_oe_mis_upper": "0.5",
      "highest_exomiser_scombi": "0.5",
      "exomiser_ad_exgenescombi": "0.5",
      "exomiser_ar_exgenescombi": "0.5",
      "exomiser_xd_exgenescombi": "0.5",
      "exomiser_xr_exgenescombi": "0.5",
      "exomiser_mt_exgenescombi": "0.5",
      "db": "family_duopat_20230105-152056",
      "affected": "sample1",
      "not_affected": "sample2",
      "active": "sample1,sample2",
      "frozen": "end,start,chrom",
      "display": "ref,alt,samples_genotypes,gene_symbol,hgvsc,hgvsp,existing_variation,mane_select,cgd_agegroup,cgd_inheritance,cgd_manifestationcategories,exomiser_ad_exgenescombi,exomiser_ar_exgenescombi,exomiser_xd_exgenescombi,exomiser_xr_exgenescombi,exomiser_mt_exgenescombi,quality,gnomad_af,gnomad_eas_af,gnomad_afr_af,gnomad_amr_af,gnomad_nfe_af,gnomad_sas_af,gnomadv3_af,gnomadv3_af_eas,gnomadv3_af_afr,gnomadv3_af_amr,gnomadv3_af_nfe,gnomadv3_af_sas,impact,revel,constraint_mis_z,constraint_oe_lof_upper,clnsig,clnsigconf,clnid",
      "sort": "chrom:asc",
      "panels": "Colon Cancer"
    };

    const result = getFilterObjectByVariantsFilter(variantsFilter);

    //console.log('result:',result)

    expect(result).toEqual({
        impact: [
          'frameshift_variant',
          'missense_variant',
          'splice_region_variant',
          'downstream_gene_variant',
          'intergenic_variant',
          'intron_variant'
        ],
        impactHighSelected: [ 'frameshift_variant' ],
        impactMedSelected: [ 'missense_variant' ],
        impactLowSelected: ['splice_region_variant'],
        impactModifierSelected: [ 'downstream_gene_variant', 'intergenic_variant', 'intron_variant' ],
        chrom: 'chr1',
        start: { '$gte': 1234 },
        end: '5678',
        scenario: 'any',
        pass_filter: [ 'PASS' ],
        quality: { step: 1, value: { '$gte': 1000 } },
        snv_type: 'snp',
        is_coding: 1,
        is_exonic: 1,
        univar_high_impact: 1,
        sv_type: 'INS',
        p_lof: [ 'LOF', 'DUP_LOF' ],
        polyphen_pred: [ 'probably_damaging' ],
        sift_pred: [ 'deleterious' ],
        clnsig: [
          'Pathogenic',
          'Pathogenic,_drug_response,_protective,_risk_factor'
        ],
        is_pathogenic: 1,
        clingen_hi: ['emerging'],
        clingen_ts: ['emerging'],
        is_read: 1,
        note: 1,
        variant_type: 'small',
        highest_af: { step: 4, value: { '$lte': 0.05 } },
        gnomad_eas_af: { step: 4, value: { '$lte': 0.05 } },
        spliceai_pred_ds_ag: { step: 3, value: { '$gte': 0.5 } },
        spliceai_pred_ds_al: { step: 3, value: { '$gte': 0.5 } },
        spliceai_pred_ds_dg: { step: 3, value: { '$gte': 0.5 } },
        spliceai_pred_ds_dl: { step: 3, value: { '$gte': 0.5 } },
        revel: { step: 7, value: { '$lte': 0.736 } },
        cadd_phred: { step: 2, value: { '$gte': 20 } },
        polyphen_score: { step: 4, value: { '$lte': 0.05 } },
        sift_score: { step: 4, value: { '$lte': 0.05 } },
        constraint_mis_z: { step: 4, value: { '$gte': 2 } },
        constraint_syn_z: { step: 4, value: { '$gte': 2 } },
        constraint_oe_lof_upper: { step: 3, value: { '$lte': 0.5 } },
        constraint_oe_mis_upper: { step: 3, value: { '$lte': 0.5 } },
        highest_exomiser_scombi: { step: 3, value: { '$gte': 0.5 } },
        exomiser_ad_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
        exomiser_ar_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
        exomiser_xd_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
        exomiser_xr_exgenescombi: { step: 3, value: { '$gte': 0.5 } },
        exomiser_mt_exgenescombi: { step: 3, value: { '$gte': 0.5 } }
      }
    );
  });

  it('should delete impact properties if length is zero', () => {
    const variantsFilter = {
      "impact": "aaaa@bbbbb,zzzzzzzzzzz,frameshift_variant",
    };

    const result = getFilterObjectByVariantsFilter(variantsFilter);
    //console.log('result:',result)

    expect(result).toEqual({});
  });


  it('should return a exact value for slider properties if slider step is null', () => {
    const variantsFilter = {
      "highest_af":  "1234" ,
    };

    const result = getFilterObjectByVariantsFilter(variantsFilter);

    expect(result).toEqual({ highest_af: { step: 1234, value: { '$lte': 1234 } } });
  });

  it('should return a correct variantsFilter if some non-slider properties is null', () => {
    const variantsFilter = {
      "clingen_hi":  null ,
      "highest_af":  "1234"
    };

    const result = getFilterObjectByVariantsFilter(variantsFilter);

    expect(result).toEqual({ highest_af: { step: 1234, value: { '$lte': 1234 } } });
  });

  it('should return an empty object when variantsFilter is null', () => {
    const variantsFilter = null;

    const result = getFilterObjectByVariantsFilter(variantsFilter);

    expect(result).toEqual(undefined);
  });
});





/************** loadNewFiltersFromFilterObject **************/

describe('loadNewFiltersFromFilterObject', () => {
  it('should update filters and variantsFilter based on newFilters', () => {
    const newFilters = {
      "impact": [
        "frameshift_variant",
        "missense_variant",
        "downstream_gene_variant",
        "intergenic_variant",
        "intron_variant"
      ],
      "impactHighSelected": [
        "frameshift_variant"
      ],
      "impactMedSelected": [
        "missense_variant"
      ],
      "impactLowSelected": [
        "downstream_gene_variant",
        "intergenic_variant",
        "intron_variant"
      ],
      "impactModifierSelected": [
        "splice_region_variant"
      ],
      "chrom": "chr1",
      "start": "1234",
      "end": "5678",
      "scenario": "any",
      "pass_filter": [
        "PASS"
      ],
      "quality": {
        "step": 1,
        "value": {
          "$gte": 1000
        }
      },
      "snv_type": "snp",
      "is_coding": 1,
      "is_exonic": 1,
      "univar_high_impact": 1,
      "sv_type": "INS",
      "p_lof": [
        "LOF",
        "DUP_LOF"
      ],
      "polyphen_pred": [
        "probably_damaging"
      ],
      "sift_pred": [
        "deleterious"
      ],
      "clnsig": [
        "Pathogenic",
        "Pathogenic,_drug_response,_protective,_risk_factor"
      ],
      "is_pathogenic": 1,
      "clingen_hi": "emerging",
      "clingen_ts": "emerging",
      "is_read": 1,
      "note" : 0,
      "variant_type": "small",
      "highest_af": {
        "step": 0.015,
        "value": {
          "$lte": 0.015
        }
      },
      "gnomad_eas_af": {
        "step": 4,
        "value": {
          "$lte": 0.05
        }
      },
      "spliceai_pred_ds_ag": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "spliceai_pred_ds_al": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "spliceai_pred_ds_dg": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "spliceai_pred_ds_dl": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "revel": {
        "step": 7,
        "value": {
          "$lte": 0.736
        }
      },
      "cadd_phred": {
        "step": 2,
        "value": {
          "$gte": 20
        }
      },
      "polyphen_score": {
        "step": 4,
        "value": {
          "$lte": 0.05
        }
      },
      "sift_score": {
        "step": 4,
        "value": {
          "$lte": 0.05
        }
      },
      "constraint_mis_z": {
        "step": 4,
        "value": {
          "$gte": 2
        }
      },
      "constraint_syn_z": {
        "step": 4,
        "value": {
          "$gte": 2
        }
      },
      "constraint_oe_lof_upper": {
        "step": 3,
        "value": {
          "$lte": 0.5
        }
      },
      "constraint_oe_mis_upper": {
        "step": 3,
        "value": {
          "$lte": 0.5
        }
      },
      "highest_exomiser_scombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "exomiser_ad_exgenescombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "exomiser_ar_exgenescombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "exomiser_xd_exgenescombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "exomiser_xr_exgenescombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      },
      "exomiser_mt_exgenescombi": {
        "step": 3,
        "value": {
          "$gte": 0.5
        }
      }
    };
    const filters = {
      "geneLocationSearchText": "chr1:1234-5678",
      "scenario": "any",
      "scenarioSelected": "any",
      "highest_af": 4,
      "gnomad_af": 5,
      "gnomad_eas_af": 4,
      "gnomadv3_af_eas": 5,
      "gnomadv3_af": 5,
      "dgv_gold_outer": 5,
      "dgv_gold_inner": 5,
      "hkbc": 5,
      "one_kg_eas": 5,
      "one_kg_sur_eas": 5,
      "one_kg": 5,
      "one_kg_sur": 5,
      "pass_filter": [
        "PASS"
      ],
      "quality": 1000,
      "spliceai_pred_ds_ag": 3,
      "spliceai_pred_ds_al": 3,
      "spliceai_pred_ds_dg": 3,
      "spliceai_pred_ds_dl": 3,
      "snv_type": "snp",
      "is_coding": 1,
      "is_exonic": 1,
      "impactHighClick": true,
      "impactHighSelected": [
        "frameshift_variant"
      ],
      "impactMedClick": true,
      "impactMedSelected": [
        "missense_variant"
      ],
      "impactLowClick": true,
      "impactLowSelected": [
        "downstream_gene_variant",
        "intergenic_variant",
        "intron_variant"
      ],
      "impactModifierClick": true,
      "impactModifierSelected": [
        "splice_region_variant"
      ],
      "univar_high_impact": 1,
      "sv_type": "INS",
      "p_lof": [
        "LOF",
        "DUP_LOF"
      ],
      "is_pathogenic": 1,
      "clnsig": [
        "Pathogenic",
        "Pathogenic,_drug_response,_protective,_risk_factor"
      ],
      "revel": 7,
      "cadd_phred": 2,
      "constraint_mis_z": 4,
      "constraint_syn_z": 4,
      "constraint_oe_lof_upper": 3,
      "constraint_oe_mis_upper": 3,
      "PolyphenPredClick": true,
      "polyphen_pred": [
        "probably_damaging"
      ],
      "siftPredClick": true,
      "sift_pred": [
        "deleterious"
      ],
      "polyphen_score": 4,
      "sift_score": 4,
      "clingen_hi": "emerging",
      "clingen_ts": "emerging",
      "is_repeat": null,
      "highest_exomiser_scombi": 3,
      "exomiser_ad_exgenescombi": 3,
      "exomiser_ar_exgenescombi": 3,
      "exomiser_xd_exgenescombi": 3,
      "exomiser_xr_exgenescombi": 3,
      "exomiser_mt_exgenescombi": 3,
      "is_read": 1,
      "note" : 0,
      "variant_type": "small",
      "len": 3,
      "caller": null,
      "slider": {
        "revel": {
          "open": false,
          "custom_value": ""
        },
        "cadd_phred": {
          "open": false,
          "custom_value": ""
        },
        "constraint_mis_z": {
          "open": false,
          "custom_value": ""
        },
        "constraint_oe_lof_upper": {
          "open": false,
          "custom_value": ""
        },
        "polyphen_score": {
          "open": false,
          "custom_value": ""
        },
        "sift_score": {
          "open": false,
          "custom_value": ""
        },
        "highest_exomiser_scombi": {
          "open": false,
          "custom_value": ""
        },
        "exomiser_ad_exgenescombi": {
          "open": false,
          "custom_value": ""
        },
        "exomiser_ar_exgenescombi": {
          "open": false,
          "custom_value": ""
        },
        "exomiser_xd_exgenescombi": {
          "open": false,
          "custom_value": ""
        },
        "exomiser_xr_exgenescombi": {
          "open": false,
          "custom_value": ""
        },
        "exomiser_mt_exgenescombi": {
          "open": false,
          "custom_value": ""
        },
        "quality": {
          "open": false,
          "custom_value": ""
        },
        "len": {
          "open": false,
          "custom_value": ""
        },
        "highest_af": {
          "open": false,
          "custom_value": ""
        },
        "gnomad_af": {
          "open": false,
          "custom_value": ""
        },
        "gnomad_eas_af": {
          "open": false,
          "custom_value": ""
        },
        "gnomadv3_af_eas": {
          "open": false,
          "custom_value": ""
        },
        "gnomadv3_af": {
          "open": false,
          "custom_value": ""
        },
        "dgv_gold_outer": {
          "open": false,
          "custom_value": ""
        },
        "dgv_gold_inner": {
          "open": false,
          "custom_value": ""
        },
        "hkbc": {
          "open": false,
          "custom_value": ""
        },
        "one_kg_eas": {
          "open": false,
          "custom_value": ""
        },
        "one_kg_sur_eas": {
          "open": false,
          "custom_value": ""
        },
        "one_kg": {
          "open": false,
          "custom_value": ""
        },
        "one_kg_sur": {
          "open": false,
          "custom_value": ""
        },
        "constraint_syn_z": {
          "open": false,
          "custom_value": ""
        },
        "constraint_oe_mis_upper": {
          "open": false,
          "custom_value": ""
        },
        "spliceai_pred_ds_ag": {
          "open": false,
          "custom_value": ""
        },
        "spliceai_pred_ds_al": {
          "open": false,
          "custom_value": ""
        },
        "spliceai_pred_ds_dg": {
          "open": false,
          "custom_value": ""
        },
        "spliceai_pred_ds_dl": {
          "open": false,
          "custom_value": ""
        }
      }
    };
    const variantsFilter = {
      "impact": [
        "frameshift_variant",
        "missense_variant",
        "downstream_gene_variant",
        "intergenic_variant",
        "intron_variant"
      ],
      "chrom": "chr1",
      "start": {
        "$gte": 1234
      },
      "end": {
        "$lte": 5678
      },
      "scenario": "any",
      "pass_filter": [
        "PASS"
      ],
      "quality": {
        "$gte": 1000
      },
      "snv_type": "snp",
      "is_coding": 1,
      "is_exonic": 1,
      "univar_high_impact": 1,
      "sv_type": "INS",
      "p_lof": [
        "LOF",
        "DUP_LOF"
      ],
      "polyphen_pred": [
        "probably_damaging"
      ],
      "sift_pred": [
        "deleterious"
      ],
      "clnsig": [
        "Pathogenic",
        "Pathogenic,_drug_response,_protective,_risk_factor"
      ],
      "is_pathogenic": 1,
      "clingen_hi": "emerging",
      "clingen_ts": "emerging",
      "is_read": 1,
      "note" :0,
      "variant_type": "small",
      "highest_af": {
        "$lte": 0.05
      },
      "gnomad_eas_af": {
        "$lte": 0.05
      },
      "spliceai_pred_ds_ag": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_al": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_dg": {
        "$gte": 0.5
      },
      "spliceai_pred_ds_dl": {
        "$gte": 0.5
      },
      "revel": {
        "$lte": 0.736
      },
      "cadd_phred": {
        "$gte": 20
      },
      "polyphen_score": {
        "$lte": 0.05
      },
      "sift_score": {
        "$lte": 0.05
      },
      "constraint_mis_z": {
        "$gte": 2
      },
      "constraint_syn_z": {
        "$gte": 2
      },
      "constraint_oe_lof_upper": {
        "$lte": 0.5
      },
      "constraint_oe_mis_upper": {
        "$lte": 0.5
      },
      "highest_exomiser_scombi": {
        "$gte": 0.5
      },
      "exomiser_ad_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_ar_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_xd_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_xr_exgenescombi": {
        "$gte": 0.5
      },
      "exomiser_mt_exgenescombi": {
        "$gte": 0.5
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    // console.log('filters :',filters)
    // console.log('variantsFilter :',variantsFilter)

    expect(filters).toEqual(
      {
        geneLocationSearchText: 'chr1:1234-5678',
        scenario: 'any',
        scenarioSelected: 'any',
        highest_af: 0.015,
        gnomad_af: 5,
        gnomad_eas_af: 4,
        gnomadv3_af_eas: 5,
        gnomadv3_af: 5,
        dgv_gold_outer: 5,
        dgv_gold_inner: 5,
        hkbc: 5,
        one_kg_eas: 5,
        one_kg_sur_eas: 5,
        one_kg: 5,
        one_kg_sur: 5,
        pass_filter: [ 'PASS' ],
        quality: 1000,
        spliceai_pred_ds_ag: 3,
        spliceai_pred_ds_al: 3,
        spliceai_pred_ds_dg: 3,
        spliceai_pred_ds_dl: 3,
        snv_type: 'snp',
        is_coding: 1,
        is_exonic: 1,
        impactHighClick: true,
        impactHighSelected: [ 'frameshift_variant' ],
        impactMedClick: true,
        impactMedSelected: [ 'missense_variant' ],
        impactLowClick: true,
        impactLowSelected: [ 'downstream_gene_variant', 'intergenic_variant', 'intron_variant' ],
        impactModifierClick: true,
        impactModifierSelected: [ 'splice_region_variant' ],
        univar_high_impact: 1,
        sv_type: 'INS',
        p_lof: [ 'LOF', 'DUP_LOF' ],
        is_pathogenic: 1,
        clnsig: [
          'Pathogenic',
          'Pathogenic,_drug_response,_protective,_risk_factor'
        ],
        revel: 7,
        cadd_phred: 2,
        constraint_mis_z: 4,
        constraint_syn_z: 4,
        constraint_oe_lof_upper: 3,
        constraint_oe_mis_upper: 3,
        PolyphenPredClick: true,
        polyphen_pred: [ 'probably_damaging' ],
        siftPredClick: true,
        sift_pred: [ 'deleterious' ],
        polyphen_score: 4,
        sift_score: 4,
        clingen_hi: 'emerging',
        clingen_ts: 'emerging',
        is_repeat: null,
        highest_exomiser_scombi: 3,
        exomiser_ad_exgenescombi: 3,
        exomiser_ar_exgenescombi: 3,
        exomiser_xd_exgenescombi: 3,
        exomiser_xr_exgenescombi: 3,
        exomiser_mt_exgenescombi: 3,
        is_read: 1,
        note: 0,
        variant_type: 'small',
        len: 3,
        caller: null,
        slider: {
          revel: { open: false, custom_value: '' },
          cadd_phred: { open: false, custom_value: '' },
          constraint_mis_z: { open: false, custom_value: '' },
          constraint_oe_lof_upper: { open: false, custom_value: '' },
          polyphen_score: { open: false, custom_value: '' },
          sift_score: { open: false, custom_value: '' },
          highest_exomiser_scombi: { open: false, custom_value: '' },
          exomiser_ad_exgenescombi: { open: false, custom_value: '' },
          exomiser_ar_exgenescombi: { open: false, custom_value: '' },
          exomiser_xd_exgenescombi: { open: false, custom_value: '' },
          exomiser_xr_exgenescombi: { open: false, custom_value: '' },
          exomiser_mt_exgenescombi: { open: false, custom_value: '' },
          quality: { open: false, custom_value: '' },
          len: { open: false, custom_value: '' },
          highest_af: { open: true, custom_value: 0.015 },
          gnomad_af: { open: false, custom_value: '' },
          gnomad_eas_af: { open: false, custom_value: '' },
          gnomadv3_af_eas: { open: false, custom_value: '' },
          gnomadv3_af: { open: false, custom_value: '' },
          dgv_gold_outer: { open: false, custom_value: '' },
          dgv_gold_inner: { open: false, custom_value: '' },
          hkbc: { open: false, custom_value: '' },
          one_kg_eas: { open: false, custom_value: '' },
          one_kg_sur_eas: { open: false, custom_value: '' },
          one_kg: { open: false, custom_value: '' },
          one_kg_sur: { open: false, custom_value: '' },
          constraint_syn_z: { open: false, custom_value: '' },
          constraint_oe_mis_upper: { open: false, custom_value: '' },
          spliceai_pred_ds_ag: { open: false, custom_value: '' },
          spliceai_pred_ds_al: { open: false, custom_value: '' },
          spliceai_pred_ds_dg: { open: false, custom_value: '' },
          spliceai_pred_ds_dl: { open: false, custom_value: '' }
        }
      }
    );

    expect(variantsFilter).toEqual(
      {
        impact: [
          'frameshift_variant',
          'missense_variant',
          'downstream_gene_variant',
          'intergenic_variant',
          'intron_variant'
        ],
        chrom: 'chr1',
        start: { '$gte': 1234 },
        end: { '$lte': 5678 },
        scenario: 'any',
        pass_filter: [ 'PASS' ],
        quality: { '$gte': 1000 },
        snv_type: 'snp',
        is_coding: 1,
        is_exonic: 1,
        univar_high_impact: 1,
        sv_type: 'INS',
        p_lof: [ 'LOF', 'DUP_LOF' ],
        polyphen_pred: [ 'probably_damaging' ],
        sift_pred: [ 'deleterious' ],
        clnsig: [
          'Pathogenic',
          'Pathogenic,_drug_response,_protective,_risk_factor'
        ],
        is_pathogenic: 1,
        clingen_hi: 'emerging',
        clingen_ts: 'emerging',
        is_read: 1,
        note:0,
        variant_type: 'small',
        highest_af: { '$lte': 0.015 },
        gnomad_eas_af: { '$lte': 0.05 },
        spliceai_pred_ds_ag: { '$gte': 0.5 },
        spliceai_pred_ds_al: { '$gte': 0.5 },
        spliceai_pred_ds_dg: { '$gte': 0.5 },
        spliceai_pred_ds_dl: { '$gte': 0.5 },
        revel: { '$lte': 0.736 },
        cadd_phred: { '$gte': 20 },
        polyphen_score: { '$lte': 0.05 },
        sift_score: { '$lte': 0.05 },
        constraint_mis_z: { '$gte': 2 },
        constraint_syn_z: { '$gte': 2 },
        constraint_oe_lof_upper: { '$lte': 0.5 },
        constraint_oe_mis_upper: { '$lte': 0.5 },
        highest_exomiser_scombi: { '$gte': 0.5 },
        exomiser_ad_exgenescombi: { '$gte': 0.5 },
        exomiser_ar_exgenescombi: { '$gte': 0.5 },
        exomiser_xd_exgenescombi: { '$gte': 0.5 },
        exomiser_xr_exgenescombi: { '$gte': 0.5 },
        exomiser_mt_exgenescombi: { '$gte': 0.5 }
      }
    );
  });


  it('should update filters and variantsFilter based on newFilters for special cases', () => {
    const newFilters = {
      "quality": {
          "$gte": 1001
      },
      "scenario" : "010",
      "chrom": "chr1",
      "start": {
        "$gte": 1234
      }
    };
    const filters = {
      "geneLocationSearchText": "chr1:1234-5678",
      "scenario": "0",
      "scenarioSelected": "any",
      "quality": 1000
    };
    const variantsFilter = {
      "quality": {
        "$gte": 1001
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    // console.log('filters :',filters)
    // console.log('variantsFilter :',variantsFilter)

    expect(filters).toEqual({
      geneLocationSearchText: 'chr1:1234',
      scenario: '0',
      scenarioSelected: '0',
      quality: 1001,
    });

    expect(variantsFilter).toEqual({
      quality: { '$gte': 1001 },
      scenario: "010",
      chrom: 'chr1',
      start: { '$gte': 1234 }
    });

  });


  it('should not update quality filters value if quality not object', () => {
    const newFilters = {
      "quality": 12345,
      "chrom": "chr1"
    };
    const filters = {
      "quality": 1000
    };
    const variantsFilter = {
      "quality": {
        "$gte": 1002
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    expect(filters).toEqual({ quality: 1000, geneLocationSearchText: 'chr1' });

    expect(variantsFilter).toEqual({
      quality: { '$gte': 1002 },
      chrom: 'chr1'
    });

  });


  it('should not update slider filters value if slider object has no step', () => {
    const newFilters = {
      "highest_af": {
        "value": {
          "$gte": 1000
        }
      },
      "chrom": "chr1"
    };
    const filters = {
      "highest_af": 1002
    };
    const variantsFilter = {
      "highest_af": {
        "$gte": 1002
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    expect(filters).toEqual({ highest_af: 1002, geneLocationSearchText: 'chr1' });

    expect(variantsFilter).toEqual( { highest_af: { '$gte': 1002 }, chrom: 'chr1' });

  });


  it('should not update impact filters value if impact array length is zero', () => {
    const newFilters = {
      "impact": []
    };
    const filters = {
      "highest_af": 1002
    };
    const variantsFilter = {
      "highest_af": {
        "$gte": 1002
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    expect(filters).toEqual({ highest_af: 1002 });
    expect(variantsFilter).toEqual(  { highest_af: { '$gte': 1002 } });

  });


  it('should update filters and variantsFilter if newFilters contains gene_objs search', () => {
    const newFilters = {
      "gene_objs.gene_filter" : "ABC,DEF"
    };
    const filters = {
      "geneLocationSearchText": "chr1:1234-5678",
      "scenario": "0",
      "scenarioSelected": "any",
      "quality": 1002
    };
    const variantsFilter = {
      "quality": {
        "$gte": 1002
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    expect(filters).toEqual({
      geneLocationSearchText: 'ABC,DEF',
      scenario: '0',
      scenarioSelected: 'any',
      quality: 1002
    });

    expect(variantsFilter).toEqual( {
      quality: { '$gte': 1002 },
      'gene_objs.gene_filter': { '$in': [ 'ABC', 'DEF' ] }
    });

  });


  it('should update filters and variantsFilter if newFilters gene_objs is array', () => {
    const newFilters = {
      "gene_objs.gene_filter" : {
        "$in": [
          "ABC",
          "DEF",
          "AAA",
          "WWW"
        ]
      }
    };
    const filters = {
      "geneLocationSearchText": "chr1:1234-5678",
      "scenario": "0",
      "scenarioSelected": "any",
      "quality": 1002
    };
    const variantsFilter = {
      "quality": {
        "$gte": 1002
      }
    };
    const variantsSamples = [
      {
        "i": 0,
        "name": "sample1",
        "sample_id": 1,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "F",
        "phenotype": "2",
        "group": "affected",
        "active": true
      },
      {
        "i": 1,
        "name": "sample2",
        "sample_id": 2,
        "family_id": "family_duopat_20230105-152056",
        "mother_id": "-9",
        "father_id": "family_duopat_20230105-152056",
        "sex": "M",
        "phenotype": "1",
        "group": "not_affected",
        "active": true
      }
    ];

    loadNewFiltersFromFilterObject(newFilters, filters, variantsFilter, variantsSamples);

    // console.log('filters :',filters)
    // console.log('variantsFilter :',variantsFilter)

    expect(filters).toEqual({
      geneLocationSearchText: [ 'ABC', 'DEF', 'AAA', 'WWW' ],
      scenario: '0',
      scenarioSelected: 'any',
      quality: 1002
    });

    expect(variantsFilter).toEqual( {
      quality: { '$gte': 1002 },
      'gene_objs.gene_filter': { '$in': [ 'ABC', 'DEF', 'AAA', 'WWW' ] }
    });

  });






});