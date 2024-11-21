import { ExomiserInfo } from 'src/variantsInfo';

export class ExomiserRunResponse {
  run: string;
  display_name: string;
  is_ready: boolean;
  hpos: string[];

  constructor(exomiserInfo: ExomiserInfo) {
    this.run = exomiserInfo.run;
    this.display_name = exomiserInfo.display_name;
    this.is_ready = exomiserInfo.is_ready;
    this.hpos = exomiserInfo.hpos;
  }
}
