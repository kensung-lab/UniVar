import { GenePanelService, DatabaseService } from 'src/applicationInfo';
import {
  Filters,
  Samples,
  filterModifier,
  checkSelectedDatabaseExist,
  CustomException,
  EXCEPTION_CODE,
  massageVariantSort,
  ResourceAccess,
  RoleAccess,
} from 'src/common';

describe('filterModifier', () => {
  let genePanelService: GenePanelService;
  let filter: Filters;
  let panels: string[];
  let samples: Samples[];
  let userInfo: any;
  let track_number: string;

  beforeEach(() => {
    genePanelService = <any>jest.fn();
    genePanelService.getGenePanelList = jest.fn();
    filter = {
      scenario: '1100',
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      hkbc: {
        $lte: 0.001,
      },
      gnomadv3_af_eas: {
        $lte: 0.001,
      },
      pass_filter: ['PASS'],
      quality: {
        $gte: 3672.7,
      },
      snv_type: 'snp',
      is_coding: 0,
      is_exonic: 1,
      univar_high_impact: 1,
      impact: [
        'frameshift_variant',
        'splice_acceptor_variant',
        'splice_donor_variant',
        'start_lost',
        'start_retained_variant',
        'stop_gained',
        'stop_lost',
        'inframe_deletion',
        'inframe_insertion',
        'missense_variant',
        'protein_altering_variant',
        'splice_region_variant',
        '3_prime_UTR_variant',
        'downstream_gene_variant',
        'intergenic_variant',
        '5_prime_UTR_variant',
        'intron_variant',
        'non_coding_transcript_exon_variant',
        'stop_retained_variant',
        'synonymous_variant',
        'upstream_gene_variant',
      ],
      spliceai_pred_ds_ag: {
        $gte: 0.8,
      },
      spliceai_pred_ds_al: {
        $gte: 0.5,
      },
      spliceai_pred_ds_dg: {
        $gte: 0.2,
      },
      spliceai_pred_ds_dl: {
        $gte: 0.8,
      },
      sv_type: 'DEL',
      p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
      polyphen_pred: [
        'probably_damaging',
        'possibly_damaging',
        'benign',
        'unknown',
      ],
      sift_pred: [
        'deleterious',
        'tolerated_low_confidence',
        'deleterious_low_confidence',
        'tolerated',
      ],
      is_pathogenic: true,
      revel: {
        $lte: 0.348,
      },
      cadd_phred: {
        $gte: 20,
      },
      polyphen_score: {
        $lte: 0.01,
      },
      sift_score: {
        $lte: 0.001,
      },
      clnsig: [
        'Pathogenic/Likely_pathogenic',
        'Pathogenic,_drug_response,_protective,_risk_factor',
        'Pathogenic,_protective',
        'Pathogenic,_risk_factor',
        'Pathogenic',
        'Likely_pathogenic',
      ],
      clingen_hi: ['sufficient'],
      clingen_ts: ['emerging'],
      constraint_mis_z: {
        $gte: 2,
      },
      constraint_syn_z: {
        $gte: 0,
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      constraint_oe_mis_upper: {
        $lte: 0.5,
      },
      highest_exomiser_scombi: {
        $gte: 0.5,
      },
      exomiser_ad_exgenescombi: {
        $gte: 0.1,
      },
      exomiser_ar_exgenescombi: {
        $gte: 0.5,
      },
      exomiser_xd_exgenescombi: {
        $gte: 0.1,
      },
      exomiser_xr_exgenescombi: {
        $gte: 0.5,
      },
      exomiser_mt_exgenescombi: {
        $gte: 0.1,
      },
      is_read: true,
      variant_type: 'small',
      caller: 'manta',
      len: {
        $lte: 1000000,
      },
      chrom: 'chr1',
      start: {
        $gte: 51937,
      },
      end: {
        $lte: 65417,
      },
    };
    panels = [
      'Brain Malformations',
      'Brugada Syndrome',
      'Catecholaminergic Polymorphic Ventricular Tachycardia',
      'Epilepsy',
    ];
    samples = [
      {
        i: 0,
        name: 'sample1',
        sample_id: 1,
        family_id: 'family_trio_20230105-110345',
        mother_id: 'sample3',
        father_id: 'family_trio_20230105-110345',
        sex: 'F',
        phenotype: '2',
        group: 'affected',
        active: true,
      },
      {
        i: 1,
        name: 'sample2',
        sample_id: 2,
        family_id: 'family_trio_20230105-110345',
        mother_id: '-9',
        father_id: 'family_trio_20230105-110345',
        sex: 'M',
        phenotype: '1',
        group: 'not_affected',
        active: true,
      },
      {
        i: 2,
        name: 'sample3',
        sample_id: 3,
        family_id: 'family_trio_20230105-110345',
        mother_id: '-9',
        father_id: 'family_trio_20230105-110345',
        sex: 'F',
        phenotype: '1',
        group: 'not_affected',
        active: true,
      },
    ];
    userInfo = {
      preferred_username: 'univar-test01',
      group: ['bteam'],
      groups: ['bteam'],
      exp: 0,
      iat: 0,
      auth_time: 0,
      jti: '',
      aud: '',
      sub: '',
      typ: '',
      azp: '',
      session_state: '',
      acr: '',
      realm_access: new RoleAccess(),
      resource_access: new ResourceAccess(),
      scope: '',
      sid: '',
      email_verified: false,
      name: '',
      given_name: '',
      family_name: '',
      email: '',
    };
    track_number = 'your-track-number';
  });

  it('should return an empty filter object if no filter is provided', async () => {
    const result = await filterModifier(
      genePanelService,
      {},
      [],
      samples,
      userInfo,
      track_number,
    );
    expect(result).toEqual({});
  });

  it('should return an null filter object if no filter is provided', async () => {
    const result = await filterModifier(
      genePanelService,
      null,
      null,
      null,
      userInfo,
      track_number,
    );
    expect(result).toEqual({});
  });

  it('should handle default filter correctly (test 1)', async () => {
    genePanelService.getGenePanelList = jest.fn().mockResolvedValue([
      {
        genes: [
          { gene_symbol: 'ACTB' },
          { gene_symbol: 'AHI1' },
          { gene_symbol: 'AKT3' },
          { gene_symbol: 'APC2' },
          { gene_symbol: 'CDK5RAP2' },
          { gene_symbol: 'DCC' },
          { gene_symbol: 'DCX' },
          { gene_symbol: 'DOCK6' },
          { gene_symbol: 'KIF21A' },
          { gene_symbol: 'MTOR' },
          { gene_symbol: 'NEDD4L' },
          { gene_symbol: 'NFIA' },
          { gene_symbol: 'PIK3CA' },
          { gene_symbol: 'PIK3R2' },
          { gene_symbol: 'PROK2' },
          { gene_symbol: 'PROKR2' },
          { gene_symbol: 'QARS1' },
          { gene_symbol: 'RAB3GAP1' },
          { gene_symbol: 'ROBO3' },
          { gene_symbol: 'STIL' },
          { gene_symbol: 'TUBB2B' },
          { gene_symbol: 'TUBG1' },
          { gene_symbol: 'WDR62' },
          { gene_symbol: 'SCN5A' },
          { gene_symbol: 'CASQ2' },
          { gene_symbol: 'RYR2' },
          { gene_symbol: 'TECRL' },
          { gene_symbol: 'TRDN' },
          { gene_symbol: 'ALG13' },
          { gene_symbol: 'ARX' },
          { gene_symbol: 'ATP1A2' },
          { gene_symbol: 'BRAT1' },
          { gene_symbol: 'BRAT1' },
          { gene_symbol: 'CHD2' },
          { gene_symbol: 'CHRNA4' },
          { gene_symbol: 'CHRNB2' },
          { gene_symbol: 'CLN3' },
          { gene_symbol: 'CLN5' },
          { gene_symbol: 'CLN6' },
          { gene_symbol: 'CLN8' },
          { gene_symbol: 'CNTNAP2' },
          { gene_symbol: 'CSTB' },
          { gene_symbol: 'CTSD' },
          { gene_symbol: 'CTSF' },
          { gene_symbol: 'DEPDC5' },
          { gene_symbol: 'DNM1' },
          { gene_symbol: 'DOCK7' },
          { gene_symbol: 'EEF1A2' },
          { gene_symbol: 'EPM2A' },
          { gene_symbol: 'GABRA1' },
          { gene_symbol: 'GABRB3' },
          { gene_symbol: 'GABRG2' },
          { gene_symbol: 'GNAO1' },
          { gene_symbol: 'GNAO1' },
          { gene_symbol: 'GRIN1' },
          { gene_symbol: 'GRIN2A' },
          { gene_symbol: 'GRIN2B' },
          { gene_symbol: 'GRIN2D' },
          { gene_symbol: 'GRN' },
          { gene_symbol: 'KCNA1' },
          { gene_symbol: 'KCNA2' },
          { gene_symbol: 'KCNA2' },
          { gene_symbol: 'KCNB1' },
          { gene_symbol: 'KCNC1' },
          { gene_symbol: 'KCNC1' },
          { gene_symbol: 'KCNH5' },
          { gene_symbol: 'KCNMA1' },
          { gene_symbol: 'KCNQ2' },
          { gene_symbol: 'KCNQ2' },
          { gene_symbol: 'KCNT1' },
          { gene_symbol: 'KCTD7' },
          { gene_symbol: 'LGI1' },
          { gene_symbol: 'MFSD8' },
          { gene_symbol: 'NHLRC1' },
          { gene_symbol: 'NPRL3' },
          { gene_symbol: 'PCDH19' },
          { gene_symbol: 'PIGO' },
          { gene_symbol: 'PLCB1' },
          { gene_symbol: 'PNKP' },
          { gene_symbol: 'PNPO' },
          { gene_symbol: 'PPT1' },
          { gene_symbol: 'PRRT2' },
          { gene_symbol: 'PURA' },
          { gene_symbol: 'ROGDI' },
          { gene_symbol: 'SCARB2' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1B' },
          { gene_symbol: 'SCN1B' },
          { gene_symbol: 'SCN2A' },
          { gene_symbol: 'SCN3A' },
          { gene_symbol: 'SCN8A' },
          { gene_symbol: 'SERPINI1' },
          { gene_symbol: 'SLC25A22' },
          { gene_symbol: 'SLC35A2' },
          { gene_symbol: 'SPTAN1' },
          { gene_symbol: 'ST3GAL5' },
          { gene_symbol: 'STXBP1' },
          { gene_symbol: 'SYNGAP1' },
          { gene_symbol: 'SYNJ1' },
          { gene_symbol: 'SZT2' },
          { gene_symbol: 'TPP1' },
          { gene_symbol: 'WDR45' },
          { gene_symbol: 'WWOX' },
        ],
      },
    ]);
    const result = await filterModifier(
      genePanelService,
      filter,
      panels,
      samples,
      userInfo,
      track_number,
    );

    expect(result).toEqual({
      scenario: '1100',
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      is_read: 'univar-test01',
      variant_type: 'small',
      chrom: 'chr1',
      start: {
        $gte: 51937,
      },
      end: {
        $lte: 65417,
      },
      'gene_objs.gene_filter': {
        $in: [
          'ACTB',
          'AHI1',
          'AKT3',
          'APC2',
          'CDK5RAP2',
          'DCC',
          'DCX',
          'DOCK6',
          'KIF21A',
          'MTOR',
          'NEDD4L',
          'NFIA',
          'PIK3CA',
          'PIK3R2',
          'PROK2',
          'PROKR2',
          'QARS1',
          'RAB3GAP1',
          'ROBO3',
          'STIL',
          'TUBB2B',
          'TUBG1',
          'WDR62',
          'SCN5A',
          'CASQ2',
          'RYR2',
          'TECRL',
          'TRDN',
          'ALG13',
          'ARX',
          'ATP1A2',
          'BRAT1',
          'BRAT1',
          'CHD2',
          'CHRNA4',
          'CHRNB2',
          'CLN3',
          'CLN5',
          'CLN6',
          'CLN8',
          'CNTNAP2',
          'CSTB',
          'CTSD',
          'CTSF',
          'DEPDC5',
          'DNM1',
          'DOCK7',
          'EEF1A2',
          'EPM2A',
          'GABRA1',
          'GABRB3',
          'GABRG2',
          'GNAO1',
          'GNAO1',
          'GRIN1',
          'GRIN2A',
          'GRIN2B',
          'GRIN2D',
          'GRN',
          'KCNA1',
          'KCNA2',
          'KCNA2',
          'KCNB1',
          'KCNC1',
          'KCNC1',
          'KCNH5',
          'KCNMA1',
          'KCNQ2',
          'KCNQ2',
          'KCNT1',
          'KCTD7',
          'LGI1',
          'MFSD8',
          'NHLRC1',
          'NPRL3',
          'PCDH19',
          'PIGO',
          'PLCB1',
          'PNKP',
          'PNPO',
          'PPT1',
          'PRRT2',
          'PURA',
          'ROGDI',
          'SCARB2',
          'SCN1A',
          'SCN1A',
          'SCN1A',
          'SCN1B',
          'SCN1B',
          'SCN2A',
          'SCN3A',
          'SCN8A',
          'SERPINI1',
          'SLC25A22',
          'SLC35A2',
          'SPTAN1',
          'ST3GAL5',
          'STXBP1',
          'SYNGAP1',
          'SYNJ1',
          'SZT2',
          'TPP1',
          'WDR45',
          'WWOX',
        ],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          $or: [
            {
              impact_severity: 'HIGH',
            },
            {
              clnsig: {
                $in: [
                  'Pathogenic',
                  'Pathogenic,_drug_response,_protective,_risk_factor',
                  'Pathogenic,_protective',
                  'Pathogenic,_risk_factor',
                  'Pathogenic/Likely_pathogenic',
                  'Likely_pathogenic',
                ],
              },
            },
            {
              impact_severity: 'MODERATE',
              $or: [
                {
                  polyphen_score: {
                    $gt: 0.85,
                  },
                },
                {
                  sift_score: {
                    $lt: 0.05,
                  },
                },
                {
                  cadd_phred: {
                    $gt: 20,
                  },
                },
                {
                  revel: {
                    $gt: 0.5,
                  },
                },
              ],
            },
          ],
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          cadd_phred: {
            $gte: 20,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          caller: 'manta',
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          // caller: 'manta',
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });

  it('should handle default filter correctly (test 2)', async () => {
    genePanelService.getGenePanelList = jest.fn().mockResolvedValue([
      {
        genes: [
          { gene_symbol: 'ACTB' },
          { gene_symbol: 'AHI1' },
          { gene_symbol: 'AKT3' },
          { gene_symbol: 'APC2' },
          { gene_symbol: 'CDK5RAP2' },
          { gene_symbol: 'DCC' },
          { gene_symbol: 'DCX' },
          { gene_symbol: 'DOCK6' },
          { gene_symbol: 'KIF21A' },
          { gene_symbol: 'MTOR' },
          { gene_symbol: 'NEDD4L' },
          { gene_symbol: 'NFIA' },
          { gene_symbol: 'PIK3CA' },
          { gene_symbol: 'PIK3R2' },
          { gene_symbol: 'PROK2' },
          { gene_symbol: 'PROKR2' },
          { gene_symbol: 'QARS1' },
          { gene_symbol: 'RAB3GAP1' },
          { gene_symbol: 'ROBO3' },
          { gene_symbol: 'STIL' },
          { gene_symbol: 'TUBB2B' },
          { gene_symbol: 'TUBG1' },
          { gene_symbol: 'WDR62' },
          { gene_symbol: 'SCN5A' },
          { gene_symbol: 'CASQ2' },
          { gene_symbol: 'RYR2' },
          { gene_symbol: 'TECRL' },
          { gene_symbol: 'TRDN' },
          { gene_symbol: 'ALG13' },
          { gene_symbol: 'ARX' },
          { gene_symbol: 'ATP1A2' },
          { gene_symbol: 'BRAT1' },
          { gene_symbol: 'BRAT1' },
          { gene_symbol: 'CHD2' },
          { gene_symbol: 'CHRNA4' },
          { gene_symbol: 'CHRNB2' },
          { gene_symbol: 'CLN3' },
          { gene_symbol: 'CLN5' },
          { gene_symbol: 'CLN6' },
          { gene_symbol: 'CLN8' },
          { gene_symbol: 'CNTNAP2' },
          { gene_symbol: 'CSTB' },
          { gene_symbol: 'CTSD' },
          { gene_symbol: 'CTSF' },
          { gene_symbol: 'DEPDC5' },
          { gene_symbol: 'DNM1' },
          { gene_symbol: 'DOCK7' },
          { gene_symbol: 'EEF1A2' },
          { gene_symbol: 'EPM2A' },
          { gene_symbol: 'GABRA1' },
          { gene_symbol: 'GABRB3' },
          { gene_symbol: 'GABRG2' },
          { gene_symbol: 'GNAO1' },
          { gene_symbol: 'GNAO1' },
          { gene_symbol: 'GRIN1' },
          { gene_symbol: 'GRIN2A' },
          { gene_symbol: 'GRIN2B' },
          { gene_symbol: 'GRIN2D' },
          { gene_symbol: 'GRN' },
          { gene_symbol: 'KCNA1' },
          { gene_symbol: 'KCNA2' },
          { gene_symbol: 'KCNA2' },
          { gene_symbol: 'KCNB1' },
          { gene_symbol: 'KCNC1' },
          { gene_symbol: 'KCNC1' },
          { gene_symbol: 'KCNH5' },
          { gene_symbol: 'KCNMA1' },
          { gene_symbol: 'KCNQ2' },
          { gene_symbol: 'KCNQ2' },
          { gene_symbol: 'KCNT1' },
          { gene_symbol: 'KCTD7' },
          { gene_symbol: 'LGI1' },
          { gene_symbol: 'MFSD8' },
          { gene_symbol: 'NHLRC1' },
          { gene_symbol: 'NPRL3' },
          { gene_symbol: 'PCDH19' },
          { gene_symbol: 'PIGO' },
          { gene_symbol: 'PLCB1' },
          { gene_symbol: 'PNKP' },
          { gene_symbol: 'PNPO' },
          { gene_symbol: 'PPT1' },
          { gene_symbol: 'PRRT2' },
          { gene_symbol: 'PURA' },
          { gene_symbol: 'ROGDI' },
          { gene_symbol: 'SCARB2' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1A' },
          { gene_symbol: 'SCN1B' },
          { gene_symbol: 'SCN1B' },
          { gene_symbol: 'SCN2A' },
          { gene_symbol: 'SCN3A' },
          { gene_symbol: 'SCN8A' },
          { gene_symbol: 'SERPINI1' },
          { gene_symbol: 'SLC25A22' },
          { gene_symbol: 'SLC35A2' },
          { gene_symbol: 'SPTAN1' },
          { gene_symbol: 'ST3GAL5' },
          { gene_symbol: 'STXBP1' },
          { gene_symbol: 'SYNGAP1' },
          { gene_symbol: 'SYNJ1' },
          { gene_symbol: 'SZT2' },
          { gene_symbol: 'TPP1' },
          { gene_symbol: 'WDR45' },
          { gene_symbol: 'WWOX' },
        ],
      },
    ]);
    filter.is_read = false;
    filter.scenario = '2200';
    delete filter.chrom;
    delete filter.start;
    delete filter.end;
    delete filter.univar_high_impact;
    filter['gene_objs.gene_filter'] = { $in: ['abcd123'] };

    const result = await filterModifier(
      genePanelService,
      filter,
      panels,
      samples,
      userInfo,
      track_number,
    );

    expect(result).toEqual({
      scenario: {
        $in: ['2100', '2000'],
      },
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      is_read: {
        $ne: 'univar-test01',
      },
      variant_type: 'small',
      'gene_objs.gene_filter': {
        $in: [
          'ACTB',
          'AHI1',
          'AKT3',
          'APC2',
          'CDK5RAP2',
          'DCC',
          'DCX',
          'DOCK6',
          'KIF21A',
          'MTOR',
          'NEDD4L',
          'NFIA',
          'PIK3CA',
          'PIK3R2',
          'PROK2',
          'PROKR2',
          'QARS1',
          'RAB3GAP1',
          'ROBO3',
          'STIL',
          'TUBB2B',
          'TUBG1',
          'WDR62',
          'SCN5A',
          'CASQ2',
          'RYR2',
          'TECRL',
          'TRDN',
          'ALG13',
          'ARX',
          'ATP1A2',
          'BRAT1',
          'BRAT1',
          'CHD2',
          'CHRNA4',
          'CHRNB2',
          'CLN3',
          'CLN5',
          'CLN6',
          'CLN8',
          'CNTNAP2',
          'CSTB',
          'CTSD',
          'CTSF',
          'DEPDC5',
          'DNM1',
          'DOCK7',
          'EEF1A2',
          'EPM2A',
          'GABRA1',
          'GABRB3',
          'GABRG2',
          'GNAO1',
          'GNAO1',
          'GRIN1',
          'GRIN2A',
          'GRIN2B',
          'GRIN2D',
          'GRN',
          'KCNA1',
          'KCNA2',
          'KCNA2',
          'KCNB1',
          'KCNC1',
          'KCNC1',
          'KCNH5',
          'KCNMA1',
          'KCNQ2',
          'KCNQ2',
          'KCNT1',
          'KCTD7',
          'LGI1',
          'MFSD8',
          'NHLRC1',
          'NPRL3',
          'PCDH19',
          'PIGO',
          'PLCB1',
          'PNKP',
          'PNPO',
          'PPT1',
          'PRRT2',
          'PURA',
          'ROGDI',
          'SCARB2',
          'SCN1A',
          'SCN1A',
          'SCN1A',
          'SCN1B',
          'SCN1B',
          'SCN2A',
          'SCN3A',
          'SCN8A',
          'SERPINI1',
          'SLC25A22',
          'SLC35A2',
          'SPTAN1',
          'ST3GAL5',
          'STXBP1',
          'SYNGAP1',
          'SYNJ1',
          'SZT2',
          'TPP1',
          'WDR45',
          'WWOX',
          'ABCD123',
        ],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          cadd_phred: {
            $gte: 20,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          caller: 'manta',
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          // caller: 'manta',
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });

  it('should handle default filter correctly (test 3)', async () => {
    filter.is_read = false;
    filter.scenario = '2222';
    delete filter.chrom;
    delete filter.start;
    delete filter.end;
    delete filter.univar_high_impact;
    filter['gene_objs.gene_filter'] = { $in: ['abcd123'] };
    userInfo.groups = ['steam'];

    const result = await filterModifier(
      genePanelService,
      filter,
      [],
      samples,
      userInfo,
      track_number,
    );

    expect(result).toEqual({
      scenario: {
        $in: ['2111', '2011', '2101', '2001', '2110', '2010', '2100', '2000'],
      },
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      is_read: {
        $ne: 'univar-test01',
      },
      variant_type: 'small',
      'gene_objs.gene_filter': {
        $in: ['ABCD123'],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          cadd_phred: {
            $gte: 20,
          },
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          caller: 'manta',
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });
  it('should handle default filter correctly (test 4)', async () => {
    filter.is_read = false;
    filter.scenario = 'any';
    delete filter.chrom;
    delete filter.start;
    delete filter.end;
    delete filter.univar_high_impact;
    filter['gene_objs.gene_filter'] = { $in: ['abcd123'] };
    delete userInfo.groups;

    const result = await filterModifier(
      genePanelService,
      filter,
      [],
      samples,
      userInfo,
      track_number,
    );

    expect(result).toEqual({
      scenario: {
        $in: ['0100', '1100', '2100', '3100', '4100'],
      },
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      is_read: {
        $ne: 'univar-test01',
      },
      variant_type: 'small',
      'gene_objs.gene_filter': {
        $in: ['ABCD123'],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          cadd_phred: {
            $gte: 20,
          },
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          caller: 'manta',
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });
  it('should handle default filter correctly (test 5)', async () => {
    filter.is_read = false;
    filter.scenario = 'any';
    delete filter.chrom;
    delete filter.start;
    delete filter.end;
    delete filter.univar_high_impact;
    filter['gene_objs.gene_filter'] = { $in: ['abcd123'] };
    delete userInfo.groups;
    samples[0].group = 'not_affected';

    const result = await filterModifier(
      genePanelService,
      filter,
      [],
      samples,
      userInfo,
      track_number,
    );

    expect(result).toEqual({
      scenario: {
        $in: ['0000', '1000', '2000', '3000', '4000'],
      },
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      is_read: {
        $ne: 'univar-test01',
      },
      variant_type: 'small',
      'gene_objs.gene_filter': {
        $in: ['ABCD123'],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          cadd_phred: {
            $gte: 20,
          },
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          caller: 'manta',
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });
  it('should handle default filter correctly (test 6)', async () => {
    filter.scenario = 'any';
    delete filter.chrom;
    delete filter.start;
    delete filter.end;
    delete filter.univar_high_impact;
    delete filter.is_read;
    filter['gene_objs.gene_filter'] = { $in: ['abcd123'] };
    samples[0].group = 'not_affected';

    const result = await filterModifier(
      genePanelService,
      filter,
      [],
      samples,
      null,
      track_number,
    );

    expect(result).toEqual({
      scenario: { $in: ['0000', '1000', '2000', '3000', '4000'] },
      highest_af: {
        $lte: 0.001,
      },
      gnomad_af: {
        $lte: 0.01,
      },
      gene_objs: {
        $elemMatch: {
          clingen_hi: { $in: ['sufficient'] },
          clingen_ts: { $in: ['emerging'] },
        },
      },
      constraint_oe_lof_upper: {
        $lte: 0.35,
      },
      variant_type: 'small',
      'gene_objs.gene_filter': {
        $in: ['ABCD123'],
      },
      // sample: {
      //   $in: [0, 1, 2],
      // },
      $or: [
        {
          gnomadv3_af_eas: {
            $lte: 0.001,
          },
          pass_filter: ['PASS'],
          quality: {
            $gte: 3672.7,
          },
          type: 'snp',
          is_coding: 0,
          is_exonic: 1,
          cadd_phred: {
            $gte: 20,
          },
          impact: [
            'frameshift_variant',
            'splice_acceptor_variant',
            'splice_donor_variant',
            'start_lost',
            'start_retained_variant',
            'stop_gained',
            'stop_lost',
            'inframe_deletion',
            'inframe_insertion',
            'missense_variant',
            'protein_altering_variant',
            'splice_region_variant',
            '3_prime_UTR_variant',
            'downstream_gene_variant',
            'intergenic_variant',
            '5_prime_UTR_variant',
            'intron_variant',
            'non_coding_transcript_exon_variant',
            'stop_retained_variant',
            'synonymous_variant',
            'upstream_gene_variant',
          ],
          spliceai_pred_ds_ag: {
            $gte: 0.8,
          },
          spliceai_pred_ds_al: {
            $gte: 0.5,
          },
          spliceai_pred_ds_dg: {
            $gte: 0.2,
          },
          spliceai_pred_ds_dl: {
            $gte: 0.8,
          },
          polyphen_pred: [
            'probably_damaging',
            'possibly_damaging',
            'benign',
            'unknown',
          ],
          sift_pred: [
            'deleterious',
            'tolerated_low_confidence',
            'deleterious_low_confidence',
            'tolerated',
          ],
          revel: {
            $lte: 0.348,
          },
          polyphen_score: {
            $lte: 0.01,
          },
          sift_score: {
            $lte: 0.001,
          },
          clnsig: [
            'Pathogenic/Likely_pathogenic',
            'Pathogenic,_drug_response,_protective,_risk_factor',
            'Pathogenic,_protective',
            'Pathogenic,_risk_factor',
            'Pathogenic',
            'Likely_pathogenic',
          ],
          constraint_mis_z: {
            $gte: 2,
          },
          constraint_syn_z: {
            $gte: 0,
          },
          exomiser_mt_exgenescombi: {
            $gte: 0.1,
          },
          constraint_oe_mis_upper: {
            $lte: 0.5,
          },
          highest_exomiser_scombi: {
            $gte: 0.5,
          },
          exomiser_ad_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_ar_exgenescombi: {
            $gte: 0.5,
          },
          exomiser_xd_exgenescombi: {
            $gte: 0.1,
          },
          exomiser_xr_exgenescombi: {
            $gte: 0.5,
          },
          variant_type: 'small',
        },
        {
          caller: 'manta',
          afs: {
            $elemMatch: {
              source_filter: 'hkbc',
              AF: {
                $lte: 0.001,
              },
            },
          },
          type: 'DEL',
          p_lof: ['DUP_LOF', 'LOF', 'COPY_GAIN', 'INV_SPAN'],
          is_pathogenic: true,
          len: {
            $lte: 1000000,
          },
          variant_type: 'structural',
        },
      ],
    });
  });
});

describe('checkSelectedDatabaseExist', () => {
  let databaseService: DatabaseService;
  let track_number: string;
  let selected_database: string;
  let userInfo: any;

  beforeEach(() => {
    databaseService = <any>jest.fn();
    track_number = 'your-track-number';
    selected_database = 'your-selected-database';
    userInfo = {};
  });

  it('should throw an exception if the selected database does not exist', async () => {
    databaseService.findDatabaseList = jest.fn().mockResolvedValue([]);

    await expect(
      checkSelectedDatabaseExist(
        databaseService,
        track_number,
        selected_database,
        userInfo,
      ),
    ).rejects.toThrow(
      new CustomException(EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST),
    );
  });

  // Add more test cases to cover different scenarios
});

describe('massageVariantSort', () => {
  it('should return the sorted array with default columns if no special columns are provided', () => {
    const sort = [
      { column: 'column1', sort: 'asc' },
      { column: 'column2', sort: 'desc' },
    ];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['column1', 1],
      ['column2', -1],
      ['chrom', 1],
      ['start', 1],
    ]);
  });

  it('should return the sorted array with default columns if chrom are provided', () => {
    const sort = [{ column: 'chrom', sort: 'desc' }];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['chrom', -1],
      ['start', 1],
    ]);
  });
  it('should return the sorted array with default columns if start are provided', () => {
    const sort = [{ column: 'start', sort: 'desc' }];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['start', -1],
      ['chrom', 1],
    ]);
  });
  it('should return the sorted array with default columns if start and chrom are provided', () => {
    const sort = [
      { column: 'chrom', sort: 'desc' },
      { column: 'start', sort: 'desc' },
    ];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['chrom', -1],
      ['start', -1],
    ]);
  });
  it('should return the sorted array with default columns if gene_symbol are provided', () => {
    const sort = [{ column: 'gene_symbol', sort: 'desc' }];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['gene_objs.gene', -1],
      ['chrom', 1],
      ['start', 1],
    ]);
  });
  it('should return the sorted array with default columns if ensembl_gene_id are provided', () => {
    const sort = [{ column: 'ensembl_gene_id', sort: 'desc' }];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['gene_objs.ensembl_gene_id', -1],
      ['chrom', 1],
      ['start', 1],
    ]);
  });
  it('should return the sorted array with default columns if entrez_gene_id are provided', () => {
    const sort = [{ column: 'entrez_gene_id', sort: 'desc' }];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['gene_objs.entrez_gene_id', -1],
      ['chrom', 1],
      ['start', 1],
    ]);
  });
  it('should return the sorted array with default columns if ensembl_transcript_id and start are provided', () => {
    const sort = [
      { column: 'ensembl_transcript_id', sort: 'asc' },
      { column: 'start', sort: 'desc' },
    ];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['gene_objs.ensembl_transcript_id', 1],
      ['start', -1],
      ['chrom', 1],
    ]);
  });
  it('should return the sorted array with default columns if pathogenic and start are provided', () => {
    const sort = [
      { column: 'pathogenic', sort: 'desc' },
      { column: 'start', sort: 'asc' },
    ];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['is_pathogenic', -1],
      ['start', 1],
      ['chrom', 1],
    ]);
  });

  it('should return the sorted array with default columns if source and chrom are provided', () => {
    const sort = [
      { column: 'source', sort: 'desc' },
      { column: 'chrom', sort: 'desc' },
    ];

    const result = massageVariantSort(sort);

    expect(result).toEqual([
      ['caller', -1],
      ['chrom', -1],
      ['start', 1],
    ]);
  });
  it('should return the sorted array with default columns if didnot pass anything ', () => {
    const result = massageVariantSort(null);

    expect(result).toEqual([
      ['chrom', 1],
      ['start', 1],
    ]);
  });
});
