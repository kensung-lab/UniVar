export class ControlFile {
  in_sv_files: string[];
  in_snp_file: string;
  output_name: string;
  ped_path: string;
  access_group: string;
  database_name: string;

  constructor() {
    this.in_sv_files = [];
  }
}
