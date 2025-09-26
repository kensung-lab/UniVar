import { Test, TestingModule } from '@nestjs/testing';
import {
  GenePanelController,
  GenePanelService,
  GenePanels,
} from 'src/applicationInfo';
import { GenePanel, GenePanelList } from 'src/common';
import { Schema } from 'mongoose';

describe('GenePanelController', () => {
  let controller: GenePanelController;
  let genePanelService: GenePanelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenePanelController],
      providers: [
        {
          provide: GenePanelService,
          useValue: {
            getGenePanelList: jest.fn(async () => [
              {
                _id: {
                  $oid: '6490e8542026d6dfb8f01787',
                },
                gp_id: 'Aminoacidopathy',
                display_name: '(clingen)Aminoacidopathy',
                genes: [
                  {
                    gene_symbol: 'AASS',
                    classification: 'Definitive',
                    disease_label: 'hyperlysinemia',
                  },
                  {
                    gene_symbol: 'ACAD8',
                    classification: 'Definitive',
                    disease_label: 'isobutyryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'ACADSB',
                    classification: 'Definitive',
                    disease_label:
                      '2-methylbutyryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'ACSF3',
                    classification: 'Definitive',
                    disease_label:
                      'combined malonic and methylmalonic acidemia',
                  },
                  {
                    gene_symbol: 'ACY1',
                    classification: 'Definitive',
                    disease_label: 'aminoacylase 1 deficiency',
                  },
                  {
                    gene_symbol: 'ADK',
                    classification: 'Definitive',
                    disease_label: 'adenosine kinase deficiency',
                  },
                  {
                    gene_symbol: 'ALDH18A1',
                    classification: 'Definitive',
                    disease_label: 'P5CS deficiency',
                  },
                  {
                    gene_symbol: 'ALDH4A1',
                    classification: 'Definitive',
                    disease_label: 'hyperprolinemia type 2',
                  },
                  {
                    gene_symbol: 'ALDH7A1',
                    classification: 'Definitive',
                    disease_label: 'pyridoxine-dependent epilepsy',
                  },
                  {
                    gene_symbol: 'AMT',
                    classification: 'Definitive',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'ARG1',
                    classification: 'Definitive',
                    disease_label: 'hyperargininemia',
                  },
                  {
                    gene_symbol: 'ASL',
                    classification: 'Definitive',
                    disease_label: 'argininosuccinic aciduria',
                  },
                  {
                    gene_symbol: 'ASNS',
                    classification: 'Definitive',
                    disease_label:
                      'congenital microcephaly - severe encephalopathy - progressive cerebral atrophy syndrome',
                  },
                  {
                    gene_symbol: 'ASPA',
                    classification: 'Definitive',
                    disease_label: 'Canavan disease',
                  },
                  {
                    gene_symbol: 'ASS1',
                    classification: 'Definitive',
                    disease_label: 'citrullinemia type I',
                  },
                  {
                    gene_symbol: 'AUH',
                    classification: 'Definitive',
                    disease_label: '3-methylglutaconic aciduria type 1',
                  },
                  {
                    gene_symbol: 'BCAT2',
                    classification: 'Definitive',
                    disease_label:
                      'hypervalinemia and hyperleucine-isoleucinemia',
                  },
                  {
                    gene_symbol: 'BCKDHA',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease type 1A',
                  },
                  {
                    gene_symbol: 'BCKDHB',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease type 1B',
                  },
                  {
                    gene_symbol: 'BCKDK',
                    classification: 'Definitive',
                    disease_label:
                      'branched-chain keto acid dehydrogenase kinase deficiency',
                  },
                  {
                    gene_symbol: 'CA5A',
                    classification: 'Definitive',
                    disease_label:
                      'hyperammonemic encephalopathy due to carbonic anhydrase VA deficiency',
                  },
                  {
                    gene_symbol: 'CBS',
                    classification: 'Definitive',
                    disease_label: 'classic homocystinuria',
                  },
                  {
                    gene_symbol: 'CPS1',
                    classification: 'Definitive',
                    disease_label:
                      'carbamoyl phosphate synthetase I deficiency disease',
                  },
                  {
                    gene_symbol: 'CTH',
                    classification: 'Definitive',
                    disease_label: 'cystathioninuria',
                  },
                  {
                    gene_symbol: 'DBT',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease',
                  },
                  {
                    gene_symbol: 'DHTKD1',
                    classification: 'Definitive',
                    disease_label: '2-aminoadipic 2-oxoadipic aciduria',
                  },
                  {
                    gene_symbol: 'DLD',
                    classification: 'Definitive',
                    disease_label: 'pyruvate dehydrogenase E3 deficiency',
                  },
                  {
                    gene_symbol: 'DNAJC12',
                    classification: 'Definitive',
                    disease_label:
                      'hyperphenylalaninemia due to DNAJC12 deficiency',
                  },
                  {
                    gene_symbol: 'FAH',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type I',
                  },
                  {
                    gene_symbol: 'FMO3',
                    classification: 'Definitive',
                    disease_label: 'trimethylaminuria',
                  },
                  {
                    gene_symbol: 'GAD1',
                    classification: 'Definitive',
                    disease_label:
                      'obsolete early infantile epileptic encephalopathy',
                  },
                  {
                    gene_symbol: 'GAMT',
                    classification: 'Definitive',
                    disease_label:
                      'guanidinoacetate methyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'GATM',
                    classification: 'Definitive',
                    disease_label: 'AGAT deficiency',
                  },
                  {
                    gene_symbol: 'GCDH',
                    classification: 'Definitive',
                    disease_label: 'glutaryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'GCH1',
                    classification: 'Definitive',
                    disease_label: 'GTP cyclohydrolase I deficiency',
                  },
                  {
                    gene_symbol: 'GCSH',
                    classification: 'Strong',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'GLDC',
                    classification: 'Definitive',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'GLS',
                    classification: 'Definitive',
                    disease_label: 'glutaminase deficiency',
                  },
                  {
                    gene_symbol: 'GLUD1',
                    classification: 'Definitive',
                    disease_label: 'hyperinsulinism-hyperammonemia syndrome',
                  },
                  {
                    gene_symbol: 'GSS',
                    classification: 'Definitive',
                    disease_label:
                      'inherited glutathione synthetase deficiency',
                  },
                  {
                    gene_symbol: 'HAAO',
                    classification: 'Definitive',
                    disease_label:
                      'vertebral, cardiac, renal, and limb defects syndrome 1',
                  },
                  {
                    gene_symbol: 'HGD',
                    classification: 'Definitive',
                    disease_label: 'alkaptonuria',
                  },
                  {
                    gene_symbol: 'HIBCH',
                    classification: 'Definitive',
                    disease_label:
                      '3-hydroxyisobutyryl-CoA hydrolase deficiency',
                  },
                  {
                    gene_symbol: 'HLCS',
                    classification: 'Definitive',
                    disease_label: 'holocarboxylase synthetase deficiency',
                  },
                  {
                    gene_symbol: 'HPD',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type III',
                  },
                  {
                    gene_symbol: 'IVD',
                    classification: 'Definitive',
                    disease_label: 'isovaleric acidemia',
                  },
                  {
                    gene_symbol: 'KYNU',
                    classification: 'Definitive',
                    disease_label:
                      'vertebral, cardiac, renal, and limb defects syndrome 2',
                  },
                  {
                    gene_symbol: 'LMBRD1',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria and homocystinuria type cblF',
                  },
                  {
                    gene_symbol: 'MAT1A',
                    classification: 'Definitive',
                    disease_label: 'methionine adenosyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'MCCC1',
                    classification: 'Definitive',
                    disease_label:
                      '3-methylcrotonyl-CoA carboxylase deficiency',
                  },
                  {
                    gene_symbol: 'MCCC2',
                    classification: 'Definitive',
                    disease_label:
                      '3-methylcrotonyl-CoA carboxylase deficiency',
                  },
                  {
                    gene_symbol: 'MCEE',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic acidemia due to methylmalonyl-CoA epimerase deficiency',
                  },
                  {
                    gene_symbol: 'MMAA',
                    classification: 'Definitive',
                    disease_label: 'methylmalonic aciduria, cblA type',
                  },
                  {
                    gene_symbol: 'MMAB',
                    classification: 'Definitive',
                    disease_label: 'methylmalonic aciduria, cblB type',
                  },
                  {
                    gene_symbol: 'MMACHC',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria and homocystinuria type cblC',
                  },
                  {
                    gene_symbol: 'MMADHC',
                    classification: 'Definitive',
                    disease_label:
                      'inborn disorder of cobalamin metabolism and transport',
                  },
                  {
                    gene_symbol: 'MMUT',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria due to methylmalonyl-CoA mutase deficiency',
                  },
                  {
                    gene_symbol: 'MTHFR',
                    classification: 'Definitive',
                    disease_label:
                      'homocystinuria due to methylene tetrahydrofolate reductase deficiency',
                  },
                  {
                    gene_symbol: 'MTR',
                    classification: 'Definitive',
                    disease_label: 'methylcobalamin deficiency type cblG',
                  },
                  {
                    gene_symbol: 'MTRR',
                    classification: 'Definitive',
                    disease_label: 'methylcobalamin deficiency type cblE',
                  },
                  {
                    gene_symbol: 'NAGS',
                    classification: 'Definitive',
                    disease_label:
                      'hyperammonemia due to N-acetylglutamate synthase deficiency',
                  },
                  {
                    gene_symbol: 'OAT',
                    classification: 'Definitive',
                    disease_label: 'ornithine aminotransferase deficiency',
                  },
                  {
                    gene_symbol: 'OTC',
                    classification: 'Definitive',
                    disease_label: 'ornithine carbamoyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'PAH',
                    classification: 'Definitive',
                    disease_label: 'phenylketonuria',
                  },
                  {
                    gene_symbol: 'PCBD1',
                    classification: 'Definitive',
                    disease_label:
                      'pterin-4 alpha-carbinolamine dehydratase 1 deficiency',
                  },
                  {
                    gene_symbol: 'PCCA',
                    classification: 'Definitive',
                    disease_label: 'propionic acidemia',
                  },
                  {
                    gene_symbol: 'PCCB',
                    classification: 'Definitive',
                    disease_label: 'propionic acidemia',
                  },
                  {
                    gene_symbol: 'PHGDH',
                    classification: 'Definitive',
                    disease_label:
                      'neurometabolic disorder due to serine deficiency',
                  },
                  {
                    gene_symbol: 'PRODH',
                    classification: 'Definitive',
                    disease_label: 'hyperprolinemia type 1',
                  },
                  {
                    gene_symbol: 'PSAT1',
                    classification: 'Definitive',
                    disease_label:
                      'neurometabolic disorder due to serine deficiency',
                  },
                  {
                    gene_symbol: 'PTS',
                    classification: 'Definitive',
                    disease_label: 'BH4-deficient hyperphenylalaninemia A',
                  },
                  {
                    gene_symbol: 'PYCR1',
                    classification: 'Definitive',
                    disease_label: 'autosomal recessive cutis laxa type 2B',
                  },
                  {
                    gene_symbol: 'QDPR',
                    classification: 'Definitive',
                    disease_label: 'dihydropteridine reductase deficiency',
                  },
                  {
                    gene_symbol: 'SLC1A2',
                    classification: 'Definitive',
                    disease_label:
                      'developmental and epileptic encephalopathy, 41',
                  },
                  {
                    gene_symbol: 'SLC1A3',
                    classification: 'Definitive',
                    disease_label: 'episodic ataxia type 6',
                  },
                  {
                    gene_symbol: 'SLC1A4',
                    classification: 'Definitive',
                    disease_label:
                      'spastic tetraplegia-thin corpus callosum-progressive postnatal microcephaly syndrome',
                  },
                  {
                    gene_symbol: 'SLC25A13',
                    classification: 'Definitive',
                    disease_label: 'citrin deficiency',
                  },
                  {
                    gene_symbol: 'SLC25A15',
                    classification: 'Definitive',
                    disease_label: 'ornithine translocase deficiency',
                  },
                  {
                    gene_symbol: 'SLC38A8',
                    classification: 'Definitive',
                    disease_label:
                      'foveal hypoplasia - optic nerve decussation defect - anterior segment dysgenesis syndrome',
                  },
                  {
                    gene_symbol: 'SLC3A1',
                    classification: 'Definitive',
                    disease_label: 'cystinuria',
                  },
                  {
                    gene_symbol: 'SLC6A19',
                    classification: 'Definitive',
                    disease_label: 'Hartnup disease',
                  },
                  {
                    gene_symbol: 'SLC6A8',
                    classification: 'Definitive',
                    disease_label: 'creatine transporter deficiency',
                  },
                  {
                    gene_symbol: 'SLC7A7',
                    classification: 'Definitive',
                    disease_label: 'lysinuric protein intolerance',
                  },
                  {
                    gene_symbol: 'SLC7A9',
                    classification: 'Definitive',
                    disease_label: 'cystinuria',
                  },
                  {
                    gene_symbol: 'SPR',
                    classification: 'Definitive',
                    disease_label:
                      'dopa-responsive dystonia due to sepiapterin reductase deficiency',
                  },
                  {
                    gene_symbol: 'SUOX',
                    classification: 'Definitive',
                    disease_label: 'isolated sulfite oxidase deficiency',
                  },
                  {
                    gene_symbol: 'TAT',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type II',
                  },
                  {
                    gene_symbol: 'TH',
                    classification: 'Definitive',
                    disease_label: 'tyrosine hydroxylase deficiency',
                  },
                  {
                    gene_symbol: 'TYR',
                    classification: 'Definitive',
                    disease_label: 'oculocutaneous albinism type 1',
                  },
                ],
                version: '15-06-2023',
                panel_version: '1.0.1',
                source: 'ClinGen',
                __v: 0,
              },
              {
                _id: {
                  $oid: '6490e8542026d6dfb8f01789',
                },
                gp_id: 'Amyotrophic Lateral Sclerosis Spectrum Disorders',
                display_name:
                  '(clingen)Amyotrophic Lateral Sclerosis Spectrum Disorders',
                genes: [
                  {
                    gene_symbol: 'ALS2',
                    classification: 'Definitive',
                    disease_label: 'ALS2-related motor neuron disease',
                  },
                  {
                    gene_symbol: 'ANXA11',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 23',
                  },
                  {
                    gene_symbol: 'C9orf72',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 1',
                  },
                  {
                    gene_symbol: 'CHMP2B',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 7',
                  },
                  {
                    gene_symbol: 'FUS',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 6',
                  },
                  {
                    gene_symbol: 'GRN',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis',
                  },
                  {
                    gene_symbol: 'KIF5A',
                    classification: 'Definitive',
                    disease_label:
                      'amyotrophic lateral sclerosis, susceptibility to, 25',
                  },
                  {
                    gene_symbol: 'NEK1',
                    classification: 'Definitive',
                    disease_label:
                      'amyotrophic lateral sclerosis, susceptibility to, 24',
                  },
                  {
                    gene_symbol: 'OPTN',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 12',
                  },
                  {
                    gene_symbol: 'PFN1',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 18',
                  },
                  {
                    gene_symbol: 'SOD1',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 1',
                  },
                  {
                    gene_symbol: 'TARDBP',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 10',
                  },
                  {
                    gene_symbol: 'TBK1',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 4',
                  },
                  {
                    gene_symbol: 'UBQLN2',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 15',
                  },
                  {
                    gene_symbol: 'VAPB',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 8',
                  },
                  {
                    gene_symbol: 'VCP',
                    classification: 'Definitive',
                    disease_label:
                      'inclusion body myopathy with Paget disease of bone and frontotemporal dementia',
                  },
                ],
                version: '15-06-2023',
                panel_version: '1.0.1',
                source: 'ClinGen',
                __v: 0,
              },
            ]),
            getLatestPanelList: jest.fn(async () => [
              {
                _id: {
                  $oid: '6490e8542026d6dfb8f01787',
                },
                gp_id: 'Aminoacidopathy',
                display_name: '(clingen)Aminoacidopathy',
                genes: [
                  {
                    gene_symbol: 'AASS',
                    classification: 'Definitive',
                    disease_label: 'hyperlysinemia',
                  },
                  {
                    gene_symbol: 'ACAD8',
                    classification: 'Definitive',
                    disease_label: 'isobutyryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'ACADSB',
                    classification: 'Definitive',
                    disease_label:
                      '2-methylbutyryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'ACSF3',
                    classification: 'Definitive',
                    disease_label:
                      'combined malonic and methylmalonic acidemia',
                  },
                  {
                    gene_symbol: 'ACY1',
                    classification: 'Definitive',
                    disease_label: 'aminoacylase 1 deficiency',
                  },
                  {
                    gene_symbol: 'ADK',
                    classification: 'Definitive',
                    disease_label: 'adenosine kinase deficiency',
                  },
                  {
                    gene_symbol: 'ALDH18A1',
                    classification: 'Definitive',
                    disease_label: 'P5CS deficiency',
                  },
                  {
                    gene_symbol: 'ALDH4A1',
                    classification: 'Definitive',
                    disease_label: 'hyperprolinemia type 2',
                  },
                  {
                    gene_symbol: 'ALDH7A1',
                    classification: 'Definitive',
                    disease_label: 'pyridoxine-dependent epilepsy',
                  },
                  {
                    gene_symbol: 'AMT',
                    classification: 'Definitive',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'ARG1',
                    classification: 'Definitive',
                    disease_label: 'hyperargininemia',
                  },
                  {
                    gene_symbol: 'ASL',
                    classification: 'Definitive',
                    disease_label: 'argininosuccinic aciduria',
                  },
                  {
                    gene_symbol: 'ASNS',
                    classification: 'Definitive',
                    disease_label:
                      'congenital microcephaly - severe encephalopathy - progressive cerebral atrophy syndrome',
                  },
                  {
                    gene_symbol: 'ASPA',
                    classification: 'Definitive',
                    disease_label: 'Canavan disease',
                  },
                  {
                    gene_symbol: 'ASS1',
                    classification: 'Definitive',
                    disease_label: 'citrullinemia type I',
                  },
                  {
                    gene_symbol: 'AUH',
                    classification: 'Definitive',
                    disease_label: '3-methylglutaconic aciduria type 1',
                  },
                  {
                    gene_symbol: 'BCAT2',
                    classification: 'Definitive',
                    disease_label:
                      'hypervalinemia and hyperleucine-isoleucinemia',
                  },
                  {
                    gene_symbol: 'BCKDHA',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease type 1A',
                  },
                  {
                    gene_symbol: 'BCKDHB',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease type 1B',
                  },
                  {
                    gene_symbol: 'BCKDK',
                    classification: 'Definitive',
                    disease_label:
                      'branched-chain keto acid dehydrogenase kinase deficiency',
                  },
                  {
                    gene_symbol: 'CA5A',
                    classification: 'Definitive',
                    disease_label:
                      'hyperammonemic encephalopathy due to carbonic anhydrase VA deficiency',
                  },
                  {
                    gene_symbol: 'CBS',
                    classification: 'Definitive',
                    disease_label: 'classic homocystinuria',
                  },
                  {
                    gene_symbol: 'CPS1',
                    classification: 'Definitive',
                    disease_label:
                      'carbamoyl phosphate synthetase I deficiency disease',
                  },
                  {
                    gene_symbol: 'CTH',
                    classification: 'Definitive',
                    disease_label: 'cystathioninuria',
                  },
                  {
                    gene_symbol: 'DBT',
                    classification: 'Definitive',
                    disease_label: 'maple syrup urine disease',
                  },
                  {
                    gene_symbol: 'DHTKD1',
                    classification: 'Definitive',
                    disease_label: '2-aminoadipic 2-oxoadipic aciduria',
                  },
                  {
                    gene_symbol: 'DLD',
                    classification: 'Definitive',
                    disease_label: 'pyruvate dehydrogenase E3 deficiency',
                  },
                  {
                    gene_symbol: 'DNAJC12',
                    classification: 'Definitive',
                    disease_label:
                      'hyperphenylalaninemia due to DNAJC12 deficiency',
                  },
                  {
                    gene_symbol: 'FAH',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type I',
                  },
                  {
                    gene_symbol: 'FMO3',
                    classification: 'Definitive',
                    disease_label: 'trimethylaminuria',
                  },
                  {
                    gene_symbol: 'GAD1',
                    classification: 'Definitive',
                    disease_label:
                      'obsolete early infantile epileptic encephalopathy',
                  },
                  {
                    gene_symbol: 'GAMT',
                    classification: 'Definitive',
                    disease_label:
                      'guanidinoacetate methyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'GATM',
                    classification: 'Definitive',
                    disease_label: 'AGAT deficiency',
                  },
                  {
                    gene_symbol: 'GCDH',
                    classification: 'Definitive',
                    disease_label: 'glutaryl-CoA dehydrogenase deficiency',
                  },
                  {
                    gene_symbol: 'GCH1',
                    classification: 'Definitive',
                    disease_label: 'GTP cyclohydrolase I deficiency',
                  },
                  {
                    gene_symbol: 'GCSH',
                    classification: 'Strong',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'GLDC',
                    classification: 'Definitive',
                    disease_label: 'glycine encephalopathy',
                  },
                  {
                    gene_symbol: 'GLS',
                    classification: 'Definitive',
                    disease_label: 'glutaminase deficiency',
                  },
                  {
                    gene_symbol: 'GLUD1',
                    classification: 'Definitive',
                    disease_label: 'hyperinsulinism-hyperammonemia syndrome',
                  },
                  {
                    gene_symbol: 'GSS',
                    classification: 'Definitive',
                    disease_label:
                      'inherited glutathione synthetase deficiency',
                  },
                  {
                    gene_symbol: 'HAAO',
                    classification: 'Definitive',
                    disease_label:
                      'vertebral, cardiac, renal, and limb defects syndrome 1',
                  },
                  {
                    gene_symbol: 'HGD',
                    classification: 'Definitive',
                    disease_label: 'alkaptonuria',
                  },
                  {
                    gene_symbol: 'HIBCH',
                    classification: 'Definitive',
                    disease_label:
                      '3-hydroxyisobutyryl-CoA hydrolase deficiency',
                  },
                  {
                    gene_symbol: 'HLCS',
                    classification: 'Definitive',
                    disease_label: 'holocarboxylase synthetase deficiency',
                  },
                  {
                    gene_symbol: 'HPD',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type III',
                  },
                  {
                    gene_symbol: 'IVD',
                    classification: 'Definitive',
                    disease_label: 'isovaleric acidemia',
                  },
                  {
                    gene_symbol: 'KYNU',
                    classification: 'Definitive',
                    disease_label:
                      'vertebral, cardiac, renal, and limb defects syndrome 2',
                  },
                  {
                    gene_symbol: 'LMBRD1',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria and homocystinuria type cblF',
                  },
                  {
                    gene_symbol: 'MAT1A',
                    classification: 'Definitive',
                    disease_label: 'methionine adenosyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'MCCC1',
                    classification: 'Definitive',
                    disease_label:
                      '3-methylcrotonyl-CoA carboxylase deficiency',
                  },
                  {
                    gene_symbol: 'MCCC2',
                    classification: 'Definitive',
                    disease_label:
                      '3-methylcrotonyl-CoA carboxylase deficiency',
                  },
                  {
                    gene_symbol: 'MCEE',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic acidemia due to methylmalonyl-CoA epimerase deficiency',
                  },
                  {
                    gene_symbol: 'MMAA',
                    classification: 'Definitive',
                    disease_label: 'methylmalonic aciduria, cblA type',
                  },
                  {
                    gene_symbol: 'MMAB',
                    classification: 'Definitive',
                    disease_label: 'methylmalonic aciduria, cblB type',
                  },
                  {
                    gene_symbol: 'MMACHC',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria and homocystinuria type cblC',
                  },
                  {
                    gene_symbol: 'MMADHC',
                    classification: 'Definitive',
                    disease_label:
                      'inborn disorder of cobalamin metabolism and transport',
                  },
                  {
                    gene_symbol: 'MMUT',
                    classification: 'Definitive',
                    disease_label:
                      'methylmalonic aciduria due to methylmalonyl-CoA mutase deficiency',
                  },
                  {
                    gene_symbol: 'MTHFR',
                    classification: 'Definitive',
                    disease_label:
                      'homocystinuria due to methylene tetrahydrofolate reductase deficiency',
                  },
                  {
                    gene_symbol: 'MTR',
                    classification: 'Definitive',
                    disease_label: 'methylcobalamin deficiency type cblG',
                  },
                  {
                    gene_symbol: 'MTRR',
                    classification: 'Definitive',
                    disease_label: 'methylcobalamin deficiency type cblE',
                  },
                  {
                    gene_symbol: 'NAGS',
                    classification: 'Definitive',
                    disease_label:
                      'hyperammonemia due to N-acetylglutamate synthase deficiency',
                  },
                  {
                    gene_symbol: 'OAT',
                    classification: 'Definitive',
                    disease_label: 'ornithine aminotransferase deficiency',
                  },
                  {
                    gene_symbol: 'OTC',
                    classification: 'Definitive',
                    disease_label: 'ornithine carbamoyltransferase deficiency',
                  },
                  {
                    gene_symbol: 'PAH',
                    classification: 'Definitive',
                    disease_label: 'phenylketonuria',
                  },
                  {
                    gene_symbol: 'PCBD1',
                    classification: 'Definitive',
                    disease_label:
                      'pterin-4 alpha-carbinolamine dehydratase 1 deficiency',
                  },
                  {
                    gene_symbol: 'PCCA',
                    classification: 'Definitive',
                    disease_label: 'propionic acidemia',
                  },
                  {
                    gene_symbol: 'PCCB',
                    classification: 'Definitive',
                    disease_label: 'propionic acidemia',
                  },
                  {
                    gene_symbol: 'PHGDH',
                    classification: 'Definitive',
                    disease_label:
                      'neurometabolic disorder due to serine deficiency',
                  },
                  {
                    gene_symbol: 'PRODH',
                    classification: 'Definitive',
                    disease_label: 'hyperprolinemia type 1',
                  },
                  {
                    gene_symbol: 'PSAT1',
                    classification: 'Definitive',
                    disease_label:
                      'neurometabolic disorder due to serine deficiency',
                  },
                  {
                    gene_symbol: 'PTS',
                    classification: 'Definitive',
                    disease_label: 'BH4-deficient hyperphenylalaninemia A',
                  },
                  {
                    gene_symbol: 'PYCR1',
                    classification: 'Definitive',
                    disease_label: 'autosomal recessive cutis laxa type 2B',
                  },
                  {
                    gene_symbol: 'QDPR',
                    classification: 'Definitive',
                    disease_label: 'dihydropteridine reductase deficiency',
                  },
                  {
                    gene_symbol: 'SLC1A2',
                    classification: 'Definitive',
                    disease_label:
                      'developmental and epileptic encephalopathy, 41',
                  },
                  {
                    gene_symbol: 'SLC1A3',
                    classification: 'Definitive',
                    disease_label: 'episodic ataxia type 6',
                  },
                  {
                    gene_symbol: 'SLC1A4',
                    classification: 'Definitive',
                    disease_label:
                      'spastic tetraplegia-thin corpus callosum-progressive postnatal microcephaly syndrome',
                  },
                  {
                    gene_symbol: 'SLC25A13',
                    classification: 'Definitive',
                    disease_label: 'citrin deficiency',
                  },
                  {
                    gene_symbol: 'SLC25A15',
                    classification: 'Definitive',
                    disease_label: 'ornithine translocase deficiency',
                  },
                  {
                    gene_symbol: 'SLC38A8',
                    classification: 'Definitive',
                    disease_label:
                      'foveal hypoplasia - optic nerve decussation defect - anterior segment dysgenesis syndrome',
                  },
                  {
                    gene_symbol: 'SLC3A1',
                    classification: 'Definitive',
                    disease_label: 'cystinuria',
                  },
                  {
                    gene_symbol: 'SLC6A19',
                    classification: 'Definitive',
                    disease_label: 'Hartnup disease',
                  },
                  {
                    gene_symbol: 'SLC6A8',
                    classification: 'Definitive',
                    disease_label: 'creatine transporter deficiency',
                  },
                  {
                    gene_symbol: 'SLC7A7',
                    classification: 'Definitive',
                    disease_label: 'lysinuric protein intolerance',
                  },
                  {
                    gene_symbol: 'SLC7A9',
                    classification: 'Definitive',
                    disease_label: 'cystinuria',
                  },
                  {
                    gene_symbol: 'SPR',
                    classification: 'Definitive',
                    disease_label:
                      'dopa-responsive dystonia due to sepiapterin reductase deficiency',
                  },
                  {
                    gene_symbol: 'SUOX',
                    classification: 'Definitive',
                    disease_label: 'isolated sulfite oxidase deficiency',
                  },
                  {
                    gene_symbol: 'TAT',
                    classification: 'Definitive',
                    disease_label: 'tyrosinemia type II',
                  },
                  {
                    gene_symbol: 'TH',
                    classification: 'Definitive',
                    disease_label: 'tyrosine hydroxylase deficiency',
                  },
                  {
                    gene_symbol: 'TYR',
                    classification: 'Definitive',
                    disease_label: 'oculocutaneous albinism type 1',
                  },
                ],
                version: '15-06-2023',
                panel_version: '1.0.1',
                source: 'ClinGen',
                __v: 0,
              },
              {
                _id: {
                  $oid: '6490e8542026d6dfb8f01789',
                },
                gp_id: 'Amyotrophic Lateral Sclerosis Spectrum Disorders',
                display_name:
                  '(clingen)Amyotrophic Lateral Sclerosis Spectrum Disorders',
                genes: [
                  {
                    gene_symbol: 'ALS2',
                    classification: 'Definitive',
                    disease_label: 'ALS2-related motor neuron disease',
                  },
                  {
                    gene_symbol: 'ANXA11',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 23',
                  },
                  {
                    gene_symbol: 'C9orf72',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 1',
                  },
                  {
                    gene_symbol: 'CHMP2B',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 7',
                  },
                  {
                    gene_symbol: 'FUS',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 6',
                  },
                  {
                    gene_symbol: 'GRN',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis',
                  },
                  {
                    gene_symbol: 'KIF5A',
                    classification: 'Definitive',
                    disease_label:
                      'amyotrophic lateral sclerosis, susceptibility to, 25',
                  },
                  {
                    gene_symbol: 'NEK1',
                    classification: 'Definitive',
                    disease_label:
                      'amyotrophic lateral sclerosis, susceptibility to, 24',
                  },
                  {
                    gene_symbol: 'OPTN',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 12',
                  },
                  {
                    gene_symbol: 'PFN1',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 18',
                  },
                  {
                    gene_symbol: 'SOD1',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 1',
                  },
                  {
                    gene_symbol: 'TARDBP',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 10',
                  },
                  {
                    gene_symbol: 'TBK1',
                    classification: 'Definitive',
                    disease_label:
                      'frontotemporal dementia and/or amyotrophic lateral sclerosis 4',
                  },
                  {
                    gene_symbol: 'UBQLN2',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 15',
                  },
                  {
                    gene_symbol: 'VAPB',
                    classification: 'Definitive',
                    disease_label: 'amyotrophic lateral sclerosis type 8',
                  },
                  {
                    gene_symbol: 'VCP',
                    classification: 'Definitive',
                    disease_label:
                      'inclusion body myopathy with Paget disease of bone and frontotemporal dementia',
                  },
                ],
                version: '15-06-2023',
                panel_version: '1.0.1',
                source: 'ClinGen',
                __v: 0,
              },
            ]),
          },
        },
      ],
    }).compile();

    controller = module.get(GenePanelController);
    genePanelService = module.get(GenePanelService);
  });

  describe('getGenePanelList', () => {
    it('should get gene panel list', async () => {
      const baseRequest = {
        track_number: '123',
      };
      const userInfo = {};
      const genePanels: GenePanels[] = [
        {
          _id: new Schema.Types.ObjectId('6490e8542026d6dfb8f01787'),
          gp_id: 'Aminoacidopathy',
          display_name: '(clingen)Aminoacidopathy',
          genes: [
            {
              gene_symbol: 'AASS',
              classification: 'Definitive',
              disease_label: 'hyperlysinemia',
            },
            {
              gene_symbol: 'ACAD8',
              classification: 'Definitive',
              disease_label: 'isobutyryl-CoA dehydrogenase deficiency',
            },
            {
              gene_symbol: 'ACADSB',
              classification: 'Definitive',
              disease_label: '2-methylbutyryl-CoA dehydrogenase deficiency',
            },
            {
              gene_symbol: 'ACSF3',
              classification: 'Definitive',
              disease_label: 'combined malonic and methylmalonic acidemia',
            },
            {
              gene_symbol: 'ACY1',
              classification: 'Definitive',
              disease_label: 'aminoacylase 1 deficiency',
            },
            {
              gene_symbol: 'ADK',
              classification: 'Definitive',
              disease_label: 'adenosine kinase deficiency',
            },
            {
              gene_symbol: 'ALDH18A1',
              classification: 'Definitive',
              disease_label: 'P5CS deficiency',
            },
            {
              gene_symbol: 'ALDH4A1',
              classification: 'Definitive',
              disease_label: 'hyperprolinemia type 2',
            },
            {
              gene_symbol: 'ALDH7A1',
              classification: 'Definitive',
              disease_label: 'pyridoxine-dependent epilepsy',
            },
            {
              gene_symbol: 'AMT',
              classification: 'Definitive',
              disease_label: 'glycine encephalopathy',
            },
            {
              gene_symbol: 'ARG1',
              classification: 'Definitive',
              disease_label: 'hyperargininemia',
            },
            {
              gene_symbol: 'ASL',
              classification: 'Definitive',
              disease_label: 'argininosuccinic aciduria',
            },
            {
              gene_symbol: 'ASNS',
              classification: 'Definitive',
              disease_label:
                'congenital microcephaly - severe encephalopathy - progressive cerebral atrophy syndrome',
            },
            {
              gene_symbol: 'ASPA',
              classification: 'Definitive',
              disease_label: 'Canavan disease',
            },
            {
              gene_symbol: 'ASS1',
              classification: 'Definitive',
              disease_label: 'citrullinemia type I',
            },
            {
              gene_symbol: 'AUH',
              classification: 'Definitive',
              disease_label: '3-methylglutaconic aciduria type 1',
            },
            {
              gene_symbol: 'BCAT2',
              classification: 'Definitive',
              disease_label: 'hypervalinemia and hyperleucine-isoleucinemia',
            },
            {
              gene_symbol: 'BCKDHA',
              classification: 'Definitive',
              disease_label: 'maple syrup urine disease type 1A',
            },
            {
              gene_symbol: 'BCKDHB',
              classification: 'Definitive',
              disease_label: 'maple syrup urine disease type 1B',
            },
            {
              gene_symbol: 'BCKDK',
              classification: 'Definitive',
              disease_label:
                'branched-chain keto acid dehydrogenase kinase deficiency',
            },
            {
              gene_symbol: 'CA5A',
              classification: 'Definitive',
              disease_label:
                'hyperammonemic encephalopathy due to carbonic anhydrase VA deficiency',
            },
            {
              gene_symbol: 'CBS',
              classification: 'Definitive',
              disease_label: 'classic homocystinuria',
            },
            {
              gene_symbol: 'CPS1',
              classification: 'Definitive',
              disease_label:
                'carbamoyl phosphate synthetase I deficiency disease',
            },
            {
              gene_symbol: 'CTH',
              classification: 'Definitive',
              disease_label: 'cystathioninuria',
            },
            {
              gene_symbol: 'DBT',
              classification: 'Definitive',
              disease_label: 'maple syrup urine disease',
            },
            {
              gene_symbol: 'DHTKD1',
              classification: 'Definitive',
              disease_label: '2-aminoadipic 2-oxoadipic aciduria',
            },
            {
              gene_symbol: 'DLD',
              classification: 'Definitive',
              disease_label: 'pyruvate dehydrogenase E3 deficiency',
            },
            {
              gene_symbol: 'DNAJC12',
              classification: 'Definitive',
              disease_label: 'hyperphenylalaninemia due to DNAJC12 deficiency',
            },
            {
              gene_symbol: 'FAH',
              classification: 'Definitive',
              disease_label: 'tyrosinemia type I',
            },
            {
              gene_symbol: 'FMO3',
              classification: 'Definitive',
              disease_label: 'trimethylaminuria',
            },
            {
              gene_symbol: 'GAD1',
              classification: 'Definitive',
              disease_label:
                'obsolete early infantile epileptic encephalopathy',
            },
            {
              gene_symbol: 'GAMT',
              classification: 'Definitive',
              disease_label: 'guanidinoacetate methyltransferase deficiency',
            },
            {
              gene_symbol: 'GATM',
              classification: 'Definitive',
              disease_label: 'AGAT deficiency',
            },
            {
              gene_symbol: 'GCDH',
              classification: 'Definitive',
              disease_label: 'glutaryl-CoA dehydrogenase deficiency',
            },
            {
              gene_symbol: 'GCH1',
              classification: 'Definitive',
              disease_label: 'GTP cyclohydrolase I deficiency',
            },
            {
              gene_symbol: 'GCSH',
              classification: 'Strong',
              disease_label: 'glycine encephalopathy',
            },
            {
              gene_symbol: 'GLDC',
              classification: 'Definitive',
              disease_label: 'glycine encephalopathy',
            },
            {
              gene_symbol: 'GLS',
              classification: 'Definitive',
              disease_label: 'glutaminase deficiency',
            },
            {
              gene_symbol: 'GLUD1',
              classification: 'Definitive',
              disease_label: 'hyperinsulinism-hyperammonemia syndrome',
            },
            {
              gene_symbol: 'GSS',
              classification: 'Definitive',
              disease_label: 'inherited glutathione synthetase deficiency',
            },
            {
              gene_symbol: 'HAAO',
              classification: 'Definitive',
              disease_label:
                'vertebral, cardiac, renal, and limb defects syndrome 1',
            },
            {
              gene_symbol: 'HGD',
              classification: 'Definitive',
              disease_label: 'alkaptonuria',
            },
            {
              gene_symbol: 'HIBCH',
              classification: 'Definitive',
              disease_label: '3-hydroxyisobutyryl-CoA hydrolase deficiency',
            },
            {
              gene_symbol: 'HLCS',
              classification: 'Definitive',
              disease_label: 'holocarboxylase synthetase deficiency',
            },
            {
              gene_symbol: 'HPD',
              classification: 'Definitive',
              disease_label: 'tyrosinemia type III',
            },
            {
              gene_symbol: 'IVD',
              classification: 'Definitive',
              disease_label: 'isovaleric acidemia',
            },
            {
              gene_symbol: 'KYNU',
              classification: 'Definitive',
              disease_label:
                'vertebral, cardiac, renal, and limb defects syndrome 2',
            },
            {
              gene_symbol: 'LMBRD1',
              classification: 'Definitive',
              disease_label:
                'methylmalonic aciduria and homocystinuria type cblF',
            },
            {
              gene_symbol: 'MAT1A',
              classification: 'Definitive',
              disease_label: 'methionine adenosyltransferase deficiency',
            },
            {
              gene_symbol: 'MCCC1',
              classification: 'Definitive',
              disease_label: '3-methylcrotonyl-CoA carboxylase deficiency',
            },
            {
              gene_symbol: 'MCCC2',
              classification: 'Definitive',
              disease_label: '3-methylcrotonyl-CoA carboxylase deficiency',
            },
            {
              gene_symbol: 'MCEE',
              classification: 'Definitive',
              disease_label:
                'methylmalonic acidemia due to methylmalonyl-CoA epimerase deficiency',
            },
            {
              gene_symbol: 'MMAA',
              classification: 'Definitive',
              disease_label: 'methylmalonic aciduria, cblA type',
            },
            {
              gene_symbol: 'MMAB',
              classification: 'Definitive',
              disease_label: 'methylmalonic aciduria, cblB type',
            },
            {
              gene_symbol: 'MMACHC',
              classification: 'Definitive',
              disease_label:
                'methylmalonic aciduria and homocystinuria type cblC',
            },
            {
              gene_symbol: 'MMADHC',
              classification: 'Definitive',
              disease_label:
                'inborn disorder of cobalamin metabolism and transport',
            },
            {
              gene_symbol: 'MMUT',
              classification: 'Definitive',
              disease_label:
                'methylmalonic aciduria due to methylmalonyl-CoA mutase deficiency',
            },
            {
              gene_symbol: 'MTHFR',
              classification: 'Definitive',
              disease_label:
                'homocystinuria due to methylene tetrahydrofolate reductase deficiency',
            },
            {
              gene_symbol: 'MTR',
              classification: 'Definitive',
              disease_label: 'methylcobalamin deficiency type cblG',
            },
            {
              gene_symbol: 'MTRR',
              classification: 'Definitive',
              disease_label: 'methylcobalamin deficiency type cblE',
            },
            {
              gene_symbol: 'NAGS',
              classification: 'Definitive',
              disease_label:
                'hyperammonemia due to N-acetylglutamate synthase deficiency',
            },
            {
              gene_symbol: 'OAT',
              classification: 'Definitive',
              disease_label: 'ornithine aminotransferase deficiency',
            },
            {
              gene_symbol: 'OTC',
              classification: 'Definitive',
              disease_label: 'ornithine carbamoyltransferase deficiency',
            },
            {
              gene_symbol: 'PAH',
              classification: 'Definitive',
              disease_label: 'phenylketonuria',
            },
            {
              gene_symbol: 'PCBD1',
              classification: 'Definitive',
              disease_label:
                'pterin-4 alpha-carbinolamine dehydratase 1 deficiency',
            },
            {
              gene_symbol: 'PCCA',
              classification: 'Definitive',
              disease_label: 'propionic acidemia',
            },
            {
              gene_symbol: 'PCCB',
              classification: 'Definitive',
              disease_label: 'propionic acidemia',
            },
            {
              gene_symbol: 'PHGDH',
              classification: 'Definitive',
              disease_label: 'neurometabolic disorder due to serine deficiency',
            },
            {
              gene_symbol: 'PRODH',
              classification: 'Definitive',
              disease_label: 'hyperprolinemia type 1',
            },
            {
              gene_symbol: 'PSAT1',
              classification: 'Definitive',
              disease_label: 'neurometabolic disorder due to serine deficiency',
            },
            {
              gene_symbol: 'PTS',
              classification: 'Definitive',
              disease_label: 'BH4-deficient hyperphenylalaninemia A',
            },
            {
              gene_symbol: 'PYCR1',
              classification: 'Definitive',
              disease_label: 'autosomal recessive cutis laxa type 2B',
            },
            {
              gene_symbol: 'QDPR',
              classification: 'Definitive',
              disease_label: 'dihydropteridine reductase deficiency',
            },
            {
              gene_symbol: 'SLC1A2',
              classification: 'Definitive',
              disease_label: 'developmental and epileptic encephalopathy, 41',
            },
            {
              gene_symbol: 'SLC1A3',
              classification: 'Definitive',
              disease_label: 'episodic ataxia type 6',
            },
            {
              gene_symbol: 'SLC1A4',
              classification: 'Definitive',
              disease_label:
                'spastic tetraplegia-thin corpus callosum-progressive postnatal microcephaly syndrome',
            },
            {
              gene_symbol: 'SLC25A13',
              classification: 'Definitive',
              disease_label: 'citrin deficiency',
            },
            {
              gene_symbol: 'SLC25A15',
              classification: 'Definitive',
              disease_label: 'ornithine translocase deficiency',
            },
            {
              gene_symbol: 'SLC38A8',
              classification: 'Definitive',
              disease_label:
                'foveal hypoplasia - optic nerve decussation defect - anterior segment dysgenesis syndrome',
            },
            {
              gene_symbol: 'SLC3A1',
              classification: 'Definitive',
              disease_label: 'cystinuria',
            },
            {
              gene_symbol: 'SLC6A19',
              classification: 'Definitive',
              disease_label: 'Hartnup disease',
            },
            {
              gene_symbol: 'SLC6A8',
              classification: 'Definitive',
              disease_label: 'creatine transporter deficiency',
            },
            {
              gene_symbol: 'SLC7A7',
              classification: 'Definitive',
              disease_label: 'lysinuric protein intolerance',
            },
            {
              gene_symbol: 'SLC7A9',
              classification: 'Definitive',
              disease_label: 'cystinuria',
            },
            {
              gene_symbol: 'SPR',
              classification: 'Definitive',
              disease_label:
                'dopa-responsive dystonia due to sepiapterin reductase deficiency',
            },
            {
              gene_symbol: 'SUOX',
              classification: 'Definitive',
              disease_label: 'isolated sulfite oxidase deficiency',
            },
            {
              gene_symbol: 'TAT',
              classification: 'Definitive',
              disease_label: 'tyrosinemia type II',
            },
            {
              gene_symbol: 'TH',
              classification: 'Definitive',
              disease_label: 'tyrosine hydroxylase deficiency',
            },
            {
              gene_symbol: 'TYR',
              classification: 'Definitive',
              disease_label: 'oculocutaneous albinism type 1',
            },
          ],
          version: '15-06-2023',
          source: 'ClinGen',
        },
        {
          _id: new Schema.Types.ObjectId('6490e8542026d6dfb8f01789'),
          gp_id: 'Amyotrophic Lateral Sclerosis Spectrum Disorders',
          display_name:
            '(clingen)Amyotrophic Lateral Sclerosis Spectrum Disorders',
          genes: [
            {
              gene_symbol: 'ALS2',
              classification: 'Definitive',
              disease_label: 'ALS2-related motor neuron disease',
            },
            {
              gene_symbol: 'ANXA11',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 23',
            },
            {
              gene_symbol: 'C9orf72',
              classification: 'Definitive',
              disease_label:
                'frontotemporal dementia and/or amyotrophic lateral sclerosis 1',
            },
            {
              gene_symbol: 'CHMP2B',
              classification: 'Definitive',
              disease_label:
                'frontotemporal dementia and/or amyotrophic lateral sclerosis 7',
            },
            {
              gene_symbol: 'FUS',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 6',
            },
            {
              gene_symbol: 'GRN',
              classification: 'Definitive',
              disease_label:
                'frontotemporal dementia and/or amyotrophic lateral sclerosis',
            },
            {
              gene_symbol: 'KIF5A',
              classification: 'Definitive',
              disease_label:
                'amyotrophic lateral sclerosis, susceptibility to, 25',
            },
            {
              gene_symbol: 'NEK1',
              classification: 'Definitive',
              disease_label:
                'amyotrophic lateral sclerosis, susceptibility to, 24',
            },
            {
              gene_symbol: 'OPTN',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 12',
            },
            {
              gene_symbol: 'PFN1',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 18',
            },
            {
              gene_symbol: 'SOD1',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 1',
            },
            {
              gene_symbol: 'TARDBP',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 10',
            },
            {
              gene_symbol: 'TBK1',
              classification: 'Definitive',
              disease_label:
                'frontotemporal dementia and/or amyotrophic lateral sclerosis 4',
            },
            {
              gene_symbol: 'UBQLN2',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 15',
            },
            {
              gene_symbol: 'VAPB',
              classification: 'Definitive',
              disease_label: 'amyotrophic lateral sclerosis type 8',
            },
            {
              gene_symbol: 'VCP',
              classification: 'Definitive',
              disease_label:
                'inclusion body myopathy with Paget disease of bone and frontotemporal dementia',
            },
          ],
          version: '15-06-2023',
          source: 'ClinGen',
        },
      ];
      const genePanelData: GenePanel[] = genePanels.map(
        (genePanel) => new GenePanel(genePanel),
      );
      const result = new GenePanelList();
      result.lastModifyDate = new Date();
      result.genePanels = genePanelData;
      (<any>genePanelService.getLatestPanelList).mockResolvedValue(result);

      const response = await controller.getGenePanelList(baseRequest, userInfo);
      expect(response.data).toEqual(genePanelData);
      expect(genePanelService.getLatestPanelList).toHaveBeenCalledTimes(1);
      expect(genePanelService.getLatestPanelList).toHaveBeenCalledWith(
        baseRequest.track_number,
        userInfo,
      );
    });
  });
});
