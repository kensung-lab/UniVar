export class ExomiserParam {
  proband_id: string;
  ped_path: string;
  hpo_path: string;
  access_group: string;
  exomiser_run: string;
  vcf_files: string[];
  database_name: string;

  constructor() {
    this.vcf_files = [];
  }
}
