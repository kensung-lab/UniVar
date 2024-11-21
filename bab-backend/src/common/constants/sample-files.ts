export const SAMPLE_FILE_BUCKET = 'bab-dev-data-store';
// export const SAMPLE_FILE_BASE_KEY = 'backend/sample/';
export const SAMPLE_FILE_BASE_KEY = '';
export const HPO_SAMPLE_KEY = SAMPLE_FILE_BASE_KEY + 'demo1_trio.hpo';
export const PED_SAMPLE_KEY = SAMPLE_FILE_BASE_KEY + 'demo1_trio.ped';
export const SNP_VCF_SAMPLE_KEY = SAMPLE_FILE_BASE_KEY + 'demo1_trio.vcf.gz';
export const SV_VCF_SAMPLE_KEY =
  SAMPLE_FILE_BASE_KEY + 'demo1_trio.manta.vcf.gz';
export const USER_MENU_KEY = SAMPLE_FILE_BASE_KEY + 'UniVar_User_Manual.pdf';
export const TUTORIAL_KEY = SAMPLE_FILE_BASE_KEY + 'UniVar_Tutorial.pdf';
export enum SampleType {
  hpo = 'hpo',
  ped = 'ped',
  snp = 'snp',
  sv = 'sv',
  menu = 'menu',
  tutorial = 'tutorial',
}
