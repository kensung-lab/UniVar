import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';
import { exit } from 'process';
import 'dotenv/config';

// versioning (Update EVERY TIME !!!!!)
const UNIVAR_GENE_PANEL_VERSION = '1.0.2';
const CLINGEN_PANEL_VERSION = '01-10-2025';
const PANEL_UK_VERSION = '01-10-2025';
const PANEL_AU_VERSION = '01-10-2025';
const CUSTOM_PANEL_VERSION = '1.0.0';

// DB Flag
const IS_SHARDED = true;

// constant panel Name
const CLINGEN_PANEL_NAME = 'ClinGen';
const PANEL_AU_PANEL_NAME = 'Panel AU';
const PANEL_UK_PANEL_NAME = 'Panel UK';
const CUSTOM_PANEL_NAME = 'UniVar Custom Panel';

// default path
const DATA_PATH = './data';
const IGNORE_JSON_NAME = 'merge_panellist.json';
const HPO_TERMS_FILE = 'panel2hpo_top5.tsv';

// type definition
export class GenePanel {
  gp_id?: string;
  display_name?: string;
  genes: any[];
  source: string;
  version: string;
  panel_version: string;
  hpos?: string[];

  constructor(genePanelJson : GenePanelJson) {

    this.display_name = genePanelJson.name;
    // should never be empty
    this.genes = genePanelJson.genes ? genePanelJson.genes.map((geneInfo: GeneInfo) => geneInfo.gene_data) : [];
    this.version = genePanelJson.version!;
    this.gp_id = genePanelJson.id;
    if(genePanelJson.name.startsWith('(clingen)')) {
      this.source = CLINGEN_PANEL_NAME;
    } else if(genePanelJson.id.startsWith('panelau_') || genePanelJson.id.startsWith('paneluk_')) {
      this.source = genePanelJson.id.startsWith('panelau_') ? PANEL_AU_PANEL_NAME : PANEL_UK_PANEL_NAME;
    } else if(genePanelJson.id.startsWith('univar_')) {
      this.source = CUSTOM_PANEL_NAME;
    } else {
      this.source = 'UNKNOWN';
    }
    this.panel_version = UNIVAR_GENE_PANEL_VERSION;
  }
}

export class GenePanelJson {
  id: string;
  name: string;
  genes: GeneInfo[];
  version?: string; 

  constructor(id: string, name: string, genes: GeneInfo[], version: string) {
    this.id = id;
    this.name = name;
    this.genes = genes;
    this.version = version;
  }
}

export class GeneInfo {
  gene_data?: GeneData;
}

export class GeneData {
  gene_symbol?: string;
  classification?: string;
  disease_label?: string;
  confidence_level?: string;
}

export class MergePanel {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class GenePanelVersion {
  version: string;
  clingen: string;
  panel_au: string;
  panel_uk: string;
  custom: string;
  create_date: Date;

  constructor(version: string, clingen: string, panel_au: string, panel_uk: string, custom: string) {
    this.version = version;
    this.clingen = clingen;
    this.panel_au = panel_au;
    this.panel_uk = panel_uk;
    this.custom = custom;
    this.create_date = new Date();
  }
}

// database config
const genePanelsSchema = new mongoose.Schema({
  "gp_id": {
    "type": mongoose.Schema.Types.String,
  },
  "display_name": {
    "type": mongoose.Schema.Types.String
  },
  "genes": {
    "type": mongoose.Schema.Types.Mixed
  },
  "version": {
    "type": mongoose.Schema.Types.String
  },
  "panel_version": {
    "type": mongoose.Schema.Types.String
  },
  "source": {
    "type": mongoose.Schema.Types.String
  },
  "hpos": {
    "type": mongoose.Schema.Types.Mixed
  }
});
genePanelsSchema.index({"gp_id": 1, "version": 1, "panel_version": 1}, {unique: true});
genePanelsSchema.index({"panel_version": 1});

const genePanelVersionsSchema = new mongoose.Schema({
  "version": {
    "type": mongoose.Schema.Types.String
  },
  "clingen": {
    "type": mongoose.Schema.Types.String
  },
  "panel_au": {
    "type": mongoose.Schema.Types.String
  },
  "panel_uk": {
    "type": mongoose.Schema.Types.String
  },
  "custom": {
    "type": mongoose.Schema.Types.String
  },
  "create_date": {
    "type": mongoose.Schema.Types.Date
  }
});
genePanelVersionsSchema.index({"version":1}, {unique: true});
genePanelVersionsSchema.index({"create_date":-1});

const serverOptions = {
  socketTimeoutMS: 0,
  connectTimeoutMS: 0,
  serverSelectionTimeoutMS: 0,
  dbName: 'common',
};

const main = async () => {
  const folderPath = DATA_PATH;
  const files = fs.readdirSync(folderPath);

  const hpoExists = fs.existsSync(folderPath + '/' + HPO_TERMS_FILE);
  const hpoInfos = new Map();
  if (hpoExists) {
    const hpoFile = fs.readFileSync(folderPath + '/' + HPO_TERMS_FILE, { encoding: 'utf8', flag: 'r' });
    hpoFile.split('\n').forEach((line) => {
      if(line?.length > 0) {
        const hpoInfo = line.split('\t');
        hpoInfos.set(hpoInfo[0], hpoInfo[1].split(','));
      }

    });
  }
  if (IS_SHARDED) {
    const mongooseConnection = await mongoose.connect(process.env.MONGO_BASE_URL!, {dbName: "admin"});
    const adminDb = mongooseConnection.connection?.db?.admin();
    if (adminDb) {
      await adminDb.command({ enableSharding: 'common' });
      await adminDb.command({ shardCollection: "common.genepanels", key: { _id: 1 } });
    }
    await mongooseConnection.disconnect();
    await mongoose.disconnect();
  }

  const genePanelConnection = mongoose.createConnection(process.env.MONGO_BASE_URL!, serverOptions);

  const GenePanelsModel = genePanelConnection.model('GenePanels', genePanelsSchema);
  const GenePanelVersionsModel = genePanelConnection.model('GenePanelVersions', genePanelVersionsSchema);

  const genePanelVersionObj = new GenePanelVersion(UNIVAR_GENE_PANEL_VERSION, CLINGEN_PANEL_VERSION, PANEL_AU_VERSION, PANEL_UK_VERSION, CUSTOM_PANEL_VERSION);
  await (new GenePanelVersionsModel(genePanelVersionObj)).save();

  const jsonFiles = files.filter(file => path.extname(file) === '.json' && path.basename(file) !== IGNORE_JSON_NAME && !/\.p\d+\.json$/.test(path.basename(file)));


  let count = 0;
  for(const file of jsonFiles) {
    const filePath = path.join(folderPath, file);
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const jsonObj = JSON.parse(jsonData); // string to "any" object first
    const genePanelData = jsonObj as GenePanelJson;
    const tempGenePanel = new GenePanel(genePanelData);
    if(tempGenePanel && hpoInfos.has(tempGenePanel.display_name)) {
      tempGenePanel.hpos = hpoInfos.get(tempGenePanel.display_name);
    }
    const genePanel = new GenePanelsModel(tempGenePanel);
    await genePanel.save();
    count % 100 == 0 ? console.log('inserted: ', count) : null;
    count++;
  }
  genePanelConnection.close();
}

main().then(() => {
  console.log("insert completed");
  exit();
});




