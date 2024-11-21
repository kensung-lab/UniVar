// sex and affected code is following the website: https://gatk.broadinstitute.org/hc/en-us/articles/360035531972-PED-Pedigree-format
export class PedInfo {
  sample_id: string;
  sex: number; // (1=male; 2=female; other=unknown)
  affected: number; // (-9=missing; 0=missing; 1=unaffected; 2=affected)
  paternalID: string;
  maternalID: string;
}
