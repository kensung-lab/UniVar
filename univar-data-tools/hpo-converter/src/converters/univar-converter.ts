import mongoose, { Schema } from "mongoose";
import { Converter } from "../interfaces/converter.js";
import { Edge, HPOFile, Node } from "../interfaces/hpo-files.js";

// database config
interface HPOTerms {
  version: string;
  hpos: UniVarDisplayHPOTerm[];
}

const hpoTermsSchema = new Schema<HPOTerms>({
  version: {type: Schema.Types.String, required: true },
  hpos: {type: Schema.Types.Mixed, required: true},
});

hpoTermsSchema.index({"version": 1}, { unique: true});

// define types
export interface UniVarDisplayHPOTerm {
  label: string;
  value: string;
  lazy: boolean;
  children?: UniVarDisplayHPOTerm[];
};

export class UniVarConverter implements Converter {
  hpoFile: HPOFile;
  serverOptions = {
    socketTimeoutMS: 0,
    connectTimeoutMS: 0,
    serverSelectionTimeoutMS: 0,
    dbName: 'common',
  };
  rootId: string = "http://purl.obolibrary.org/obo/HP_0000001";

  constructor(hpoFile: HPOFile) {
    this.hpoFile = hpoFile;
  }

  async convert() {
    
    const genePanelConnection = mongoose.createConnection(process.env.MONGO_BASE_URL!, this.serverOptions);
    const HpoTermsModel = genePanelConnection.model<HPOTerms>('HPOTerms', hpoTermsSchema);

    // assume data structure always the same
    const baseHpoFile = this.hpoFile.graphs[0];
    
    const hpoTerms: HPOTerms = { version: baseHpoFile.meta.version.split('/').at(-2)!, hpos: [] };
    const nodeMap = new Map<string, UniVarDisplayHPOTerm>();

    console.log('start reading nodes');
    // loop the list of nodes
    baseHpoFile.nodes
      .filter((eachNode: Node) => eachNode.id.includes('HP_'))
      .forEach((eachNode: Node) => {
        const eachUniVarDisplayHPOTerm: UniVarDisplayHPOTerm = {
          label: eachNode.lbl! + ' (' + this.getHPOTerm(eachNode.id) + ')',
          value: this.getHPOTerm(eachNode.id),
          lazy: false,
          children: [],
        }

        nodeMap.set(eachNode.id, eachUniVarDisplayHPOTerm);
        // set root
        if(eachNode.id === this.rootId) {
          hpoTerms.hpos.push(eachUniVarDisplayHPOTerm);
        }
    });
    console.log('complete reading nodes');
    console.log('start reading edges');
    // then construct the edge as child
    baseHpoFile.edges.forEach((eachEdge: Edge) => {
      // seem currently only got is a logic ...
      // please modify this when there is new logic in the future
      if (eachEdge.pred === 'is_a') {
        const parent = nodeMap.get(eachEdge.obj)!;
        parent.lazy = true;
        parent.children?.push(nodeMap.get(eachEdge.sub)!);
      }
    });
    console.log('complete reading edges');
    const hpoTermsModel = new HpoTermsModel(hpoTerms);
    await hpoTermsModel.save();
  }

  private getHPOTerm(id: string) {
    return id.split('/').at(-1)!.replaceAll('_', ':');
  }

};