import { GenePanels } from 'src/applicationInfo';
import { SHOW_VERSION } from 'src/common';

export class GenePanel {
  _id: string;

  gp_id: string;

  display_name: string;

  version: string;

  genes: any[];

  constructor(genePanel: GenePanels) {
    this.gp_id = genePanel.gp_id;
    this.display_name =
      genePanel.source && SHOW_VERSION.includes(genePanel.source)
        ? genePanel.display_name + ' ' + genePanel.version
        : genePanel.display_name;
    this.version = genePanel.version;
    this.genes = genePanel.genes;
    this._id = genePanel._id.toString();
  }
}
