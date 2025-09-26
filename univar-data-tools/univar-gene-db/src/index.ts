import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import "dotenv/config";

// DB Flag
// const IS_SHARDED = true;

// DB Versions
const UPDATE_PIPELINE_VERSION = "1.0.2";
const UNIVAR_GENE_DATABASE_VERSION = "1.0.2";
const ENSEMBL_VERSION = "113";
const PHI_VERSION = "2022-08-04";
const CLINGEN_VERSION = "2025-02-22";
const GNOMAD_V2_LOF_METRICS_VERSION = "2.1.1";
const GNOMAD_V4_LOF_METRICS_VERSION = "4.1";
const MANE_VERSION = "1.4";

// File Paths
const ENSEMBL_DB_PATH =
  process.env.DATA_SRC_PATH + "Homo_sapiens.GRCh38.113.entrez.tsv";
const NCBI_DB_PATH = process.env.DATA_SRC_PATH + "MANE.GRCh38.v1.4.summary.txt";
const ENTREZ_SYMBOL_DB_PATH =
  process.env.DATA_SRC_PATH + "Homo_sapiens.GRCh38.113.gene.bed";
const PHI_DB_PATH = process.env.DATA_SRC_PATH + "pHI.pTS.gene.35917817.tsv";
const CLINGEN_DB_PATH =
  process.env.DATA_SRC_PATH + "ClinGen_gene_curation_list_GRCh38.tsv";
const GNOMAD_V2_LOF_METRICS_DB_PATH =
  process.env.DATA_SRC_PATH + "gnomad.v2.1.1.lof_metrics.by_transcript.txt";
const GNOMAD_V4_LOF_METRICS_DB_PATH =
  process.env.DATA_SRC_PATH + "gnomad.v4.1.constraint_metrics.tsv";
const EXTRA_REFSEQ_PATH =
  process.env.DATA_SRC_PATH +
  "Galaxy1-UCSC_Main_on_Human_wgEncodeGencodeRefSeqV47_genome.tabular";

// Define the schema for the data
const geneSchema = new mongoose.Schema({
  gene_stable_id: String,
  transcript_stable_id: String,
  ensembl_transcript_id: String,
  entrez: String,
  version: String,
  ncbi_id: String,
  ncbi_ids: [String],
  gene_symbol: String,
  clingen_hi: String,
  clingen_ts: String,
  p_haplo: Number,
  p_triplo: Number,
  constraint_v2_pli: Number,
  constraint_v2_oe_lof: Number,
  constraint_v2_oe_lof_lower: Number,
  constraint_v2_oe_lof_upper: Number,
  constraint_v2_mis_z: Number,
  constraint_v2_oe_mis: Number,
  constraint_v2_oe_mis_lower: Number,
  constraint_v2_oe_mis_upper: Number,
  constraint_v2_syn_z: Number,
  constraint_v2_oe_syn: Number,
  constraint_v2_oe_syn_lower: Number,
  constraint_v2_oe_syn_upper: Number,
  constraint_v4_pli: Number,
  constraint_v4_oe_lof: Number,
  constraint_v4_oe_lof_lower: Number,
  constraint_v4_oe_lof_upper: Number,
  constraint_v4_mis_z: Number,
  constraint_v4_oe_mis: Number,
  constraint_v4_oe_mis_lower: Number,
  constraint_v4_oe_mis_upper: Number,
  constraint_v4_syn_z: Number,
  constraint_v4_oe_syn: Number,
  constraint_v4_oe_syn_lower: Number,
  constraint_v4_oe_syn_upper: Number,
  strand: String,
  is_canonical: Boolean,
  is_mane_select: Boolean,
  is_mane_plus_clinical: Boolean,
});

geneSchema.index({ version: 1, gene_symbol: 1 });
geneSchema.index({ version: 1 });
geneSchema.index({ version: 1, transcript_stable_id: 1 });
geneSchema.index({ version: 1, ensembl_transcript_id: 1 });
geneSchema.index({ version: 1, ncbi_id: 1 });

const versionSchema = new mongoose.Schema({
  gene_database_version: String,
  ensembl_version: String,
  phi_version: String,
  clingen_version: String,
  gnomad_v2_lof_metrics_version: String,
  gnomad_v4_lof_metrics_version: String,
  mane_version: String,
});

const pipelineversionSchema = new mongoose.Schema(
  {
    version: String,
    brand: String,
    small_variant: {},
    structural_variant: {},
    univar_gene_version: {
      version: String,
      detail: {},
    },
    pipeline_required: Number,
  },
  { collection: "pipelineversion" }
);

const CLINGEN_HI_MAP = new Map([
  ["0", "no"],
  ["1", "little"],
  ["2", "emerging"],
  ["3", "sufficient"],
  ["30", "autosomal"],
  ["40", "unlikely"],
]);

const CLINGEN_TS_MAP = new Map([
  ["0", "no"],
  ["1", "little"],
  ["2", "emerging"],
  ["3", "sufficient"],
  ["40", "unlikely"],
  ["Not yet evaluated", "Not yet evaluated"],
]);

// Define the type for transcript
type Transcript = {
  gene_stable_id?: string;
  transcript_stable_id?: string;
  ensembl_transcript_id?: string;
  entrez?: string;
  version?: string;
  ncbi_id?: string;
  ncbi_ids?: string[];
  gene_symbol?: string;
  clingen_hi?: string;
  clingen_ts?: string;
  p_haplo?: number;
  p_triplo?: number;
  constraint_v2_pli?: number;
  constraint_v2_oe_lof?: number;
  constraint_v2_oe_lof_lower?: number;
  constraint_v2_oe_lof_upper?: number;
  constraint_v2_mis_z?: number;
  constraint_v2_oe_mis?: number;
  constraint_v2_oe_mis_lower?: number;
  constraint_v2_oe_mis_upper?: number;
  constraint_v2_syn_z?: number;
  constraint_v2_oe_syn?: number;
  constraint_v2_oe_syn_lower?: number;
  constraint_v2_oe_syn_upper?: number;
  constraint_v4_pli?: number;
  constraint_v4_oe_lof?: number;
  constraint_v4_oe_lof_lower?: number;
  constraint_v4_oe_lof_upper?: number;
  constraint_v4_mis_z?: number;
  constraint_v4_oe_mis?: number;
  constraint_v4_oe_mis_lower?: number;
  constraint_v4_oe_mis_upper?: number;
  constraint_v4_syn_z?: number;
  constraint_v4_oe_syn?: number;
  constraint_v4_oe_syn_lower?: number;
  constraint_v4_oe_syn_upper?: number;
  strand?: string;
  is_canonical?: boolean;
  is_mane_select?: boolean;
  is_mane_plus_clinical?: boolean;
};

type PhiPts = {
  Gene: string;
  pHaplo: number;
  pTriplo: number;
};

type ClinGenGene = {
  "Gene Symbol": string;
  "Gene ID": string;
  cytoBand: string;
  "Genomic Location": string;
  "Haploinsufficiency Score": string;
  "Haploinsufficiency Description": string;
  "Haploinsufficiency PMID1": string;
  "Haploinsufficiency PMID2": string;
  "Haploinsufficiency PMID3": string;
  "Haploinsufficiency PMID4": string;
  "Haploinsufficiency PMID5": string;
  "Haploinsufficiency PMID6": string;
  "Triplosensitivity Score": string;
  "Triplosensitivity Description": string;
  "Triplosensitivity PMID1": string;
  "Triplosensitivity PMID2": string;
  "Triplosensitivity PMID3": string;
  "Triplosensitivity PMID4": string;
  "Triplosensitivity PMID5": string;
  "Triplosensitivity PMID6": string;
  "Date Last Evaluated": Date;
  "Haploinsufficiency Disease ID": string;
  "Triplosensitivity Disease ID": string;
};

// Define the model for the data
let Gene: any = null;
let Version: any = null;
const transcriptMap = new Map<string, Transcript>();
const transcriptWithNumNap = new Map<string, Transcript>();
let tempGeneMap = new Map<string, PhiPts | ClinGenGene>();
let startDate: Date;

async function main() {
  startDate = new Date();
  let connection = await mongoose.connect(process.env.MONGO_BASE_URL!, {
    dbName: "common",
  });
  const PipelineVersion = connection.model(
    "PipelineVersion",
    pipelineversionSchema
  );
  await PipelineVersion.updateOne(
    {
      brand: "univar",
      version: UPDATE_PIPELINE_VERSION,
      "univar_gene_version.version": UNIVAR_GENE_DATABASE_VERSION,
    },
    {
      $set: {
        "univar_gene_version.detail.ensembl": ENSEMBL_VERSION,
        "univar_gene_version.detail.probability of Haplo and Triplo scores":
          PHI_VERSION,
        "univar_gene_version.detail.clingen": CLINGEN_VERSION,
        "univar_gene_version.detail.gnomad_v2_constraint":
          GNOMAD_V2_LOF_METRICS_VERSION,
        "univar_gene_version.detail.gnomad_v4_constraint":
          GNOMAD_V4_LOF_METRICS_VERSION,
        "univar_gene_version.detail.MANE": MANE_VERSION,
      },
    }
  );
  await connection.disconnect();
  await mongoose.connection.close();
  await mongoose.disconnect();

  await mongoose.connect(process.env.MONGO_BASE_URL!, { dbName: "gene" });
  // no need to shard as data smaller than 64MB
  // if (IS_SHARDED) {
  //   const adminDb = mongoose.connection?.db?.admin();
  //   if (adminDb) {
  //     await adminDb.command({ shardCollection: "gene.genes", key: { _id: 1 } });
  //   }
  // }

  Gene = mongoose.model("Gene", geneSchema);
  Version = mongoose.model("Version", versionSchema);
  await Gene.ensureIndexes();

  // not too sure why mongoose add pipelineverison collection to gene db
  await mongoose.connection?.db?.dropCollection("pipelineversion");
  const version = new Version({
    gene_database_version: UNIVAR_GENE_DATABASE_VERSION,
    ensembl_version: ENSEMBL_VERSION,
    phi_version: PHI_VERSION,
    clingen_version: CLINGEN_VERSION,
    gnomad_v2_lof_metrics_version: GNOMAD_V2_LOF_METRICS_VERSION,
    gnomad_v4_lof_metrics_version: GNOMAD_V4_LOF_METRICS_VERSION,
    mane_version: MANE_VERSION,
  });

  await version.save();

  // Open a stream to read Ensembl transcript DB first
  readSteamFile(
    ENTREZ_SYMBOL_DB_PATH,
    "\t",
    readGeneMappingDBFunction,
    endGeneMappingFunction
  );
}

async function readSteamFile(
  filepath: string,
  separator: string,
  onDataFunction: (row: any) => void,
  onDataEndFunction: () => void
) {
  // Open a stream to read file
  const stream = fs
    .createReadStream(filepath)
    .pipe(csv({ separator: separator }));

  stream.on("data", (row) => onDataFunction(row));
  stream.on("end", () => onDataEndFunction());
}

// Start function Gene Mapping DB
async function readGeneMappingDBFunction(row: any) {
  // Create a new document from the row data
  const gene = {
    transcript_stable_id: row.TRANSCRIPT_ID.split(".")[0],
    ensembl_transcript_id: row.TRANSCRIPT_ID,
    gene_symbol: row.GENE,
    strand: row.STRAND,
    gene_stable_id: row.GENE_ID,
    is_canonical: row.IS_CANONICAL,
    is_mane_select: row.IS_MANE_SELECT,
    is_mane_plus_clinical: row.IS_MANE_PLUS_CLINICAL,
    version: UNIVAR_GENE_DATABASE_VERSION,
  };

  // Save transcript map for later use
  transcriptWithNumNap.set(row.TRANSCRIPT_ID, gene);
  transcriptMap.set(row.TRANSCRIPT_ID.split(".")[0], gene);
}

async function endGeneMappingFunction() {
  console.log("Finished reading gene mapping database");
  // Then read the transcript database to get ncbi id
  readSteamFile(NCBI_DB_PATH, "\t", readNCBIDBFunction, endNCBIDBFunction);
}
// End Gene Mapping DB

// Start NCBI Transcript (Only MANE SELECT)
async function readNCBIDBFunction(row: any) {
  if (transcriptWithNumNap.has(row.Ensembl_nuc)) {
    const transcript = transcriptMap.get(row.Ensembl_nuc.split(".")[0]);
    transcript!.ncbi_id = row.RefSeq_nuc;
  }
}

async function endNCBIDBFunction() {
  console.log("Finished reading MANE SELECT NCBI transcript database");
  readSteamFile(
    EXTRA_REFSEQ_PATH,
    "\t",
    readAllRefseqFunction,
    endAllRefseqFunction
  );
}
// END NCBI Transcript (Only MANE SELECT)

// Start REFSEQ (NCBI) Transcript (Others)
async function readAllRefseqFunction(row: any) {
  if (
    transcriptWithNumNap.has(row["#transcriptId"]) &&
    row.rnaAcc.startsWith("NM")
  ) {
    const transcript = transcriptMap.get(row["#transcriptId"].split(".")[0]);
    if (!transcript!.ncbi_ids) {
      transcript!.ncbi_ids = [];
    }
    transcript!.ncbi_ids.push(row.rnaAcc);
  }
}

async function endAllRefseqFunction() {
  console.log("Finished reading All RefSeq transcript database");
  readSteamFile(
    ENSEMBL_DB_PATH,
    "\t",
    readEnsemblTranscriptDBFunction,
    endEnsemblTranscriptFunction
  );
}

// END REFSEQ (NCBI) Transcript (Others)

// Start Ensembl Transcript
async function readEnsemblTranscriptDBFunction(row: any) {
  if (transcriptMap.has(row.transcript_stable_id)) {
    const transcript = transcriptMap.get(row.transcript_stable_id);
    transcript!.entrez = row.xref;
  }
}

async function endEnsemblTranscriptFunction() {
  console.log("Finished reading Ensembl transcript database");
  readSteamFile(
    GNOMAD_V2_LOF_METRICS_DB_PATH,
    "\t",
    readGnomadV2LofMetricsDBFunction,
    endGnomadV2LofMetricsDBFunction
  );
}

// End Ensembl Transcript

// Start Gnomad Lof V2 Metrics DB
async function readGnomadV2LofMetricsDBFunction(row: any) {
  if (transcriptMap.has(row.transcript)) {
    const transcript = transcriptMap.get(row.transcript);
    var headerMapping = new Map();
    headerMapping.set("syn_z", "constraint_v2_syn_z");
    headerMapping.set("oe_syn", "constraint_v2_oe_syn");
    headerMapping.set("oe_syn_lower", "constraint_v2_oe_syn_lower");
    headerMapping.set("oe_syn_upper", "constraint_v2_oe_syn_upper");
    headerMapping.set("mis_z", "constraint_v2_mis_z");
    headerMapping.set("oe_mis", "constraint_v2_oe_mis");
    headerMapping.set("oe_mis_lower", "constraint_v2_oe_mis_lower");
    headerMapping.set("oe_mis_upper", "constraint_v2_oe_mis_upper");
    headerMapping.set("pLI", "constraint_v2_pli");
    headerMapping.set("oe_lof", "constraint_v2_oe_lof");
    headerMapping.set("oe_lof_lower", "constraint_v2_oe_lof_lower");
    headerMapping.set("oe_lof_upper", "constraint_v2_oe_lof_upper");

    for (const [key, value] of headerMapping.entries()) {
      if (
        row[key] &&
        row[key] !== "NA" &&
        row[key] !== "NaN" &&
        isNumeric(row[key])
      ) {
        (transcript! as any)[value] = row[key];
      } else if (
        row[key] &&
        row[key] !== "NA" &&
        row[key] !== "NaN" &&
        !isNumeric(row[key])
      ) {
        console.log("row: ", row);
        console.log("key: ", key);
      }
    }
  }
}

async function endGnomadV2LofMetricsDBFunction() {
  console.log("Finished reading gnomad V2 LoF metrics database");
  readSteamFile(
    GNOMAD_V4_LOF_METRICS_DB_PATH,
    "\t",
    readGnomadV4LofMetricsDBFunction,
    endGnomadV4LofMetricsDBFunction
  );
}
// End Gnomad Lof V2 Metrics DB

// Start Gnomad Lof V4 Metrics DB
async function readGnomadV4LofMetricsDBFunction(row: any) {
  if (transcriptMap.has(row.transcript)) {
    const transcript = transcriptMap.get(row.transcript);
    var headerMapping = new Map();
    headerMapping.set("syn.z_score", "constraint_v4_syn_z");
    headerMapping.set("syn.oe", "constraint_v4_oe_syn");
    headerMapping.set("syn.oe_ci.lower", "constraint_v4_oe_syn_lower");
    headerMapping.set("syn.oe_ci.upper", "constraint_v4_oe_syn_upper");
    headerMapping.set("mis.z_score", "constraint_v4_mis_z");
    headerMapping.set("mis.oe", "constraint_v4_oe_mis");
    headerMapping.set("mis.oe_ci.lower", "constraint_v4_oe_mis_lower");
    headerMapping.set("mis.oe_ci.upper", "constraint_v4_oe_mis_upper");
    headerMapping.set("lof.pLI", "constraint_v4_pli");
    headerMapping.set("lof.oe", "constraint_v4_oe_lof");
    headerMapping.set("lof.oe_ci.lower", "constraint_v4_oe_lof_lower");
    headerMapping.set("lof.oe_ci.upper", "constraint_v4_oe_lof_upper");

    for (const [key, value] of headerMapping.entries()) {
      if (
        row[key] &&
        row[key] !== "NA" &&
        row[key] !== "NaN" &&
        isNumeric(row[key])
      ) {
        (transcript! as any)[value] = row[key];
      } else if (
        row[key] &&
        row[key] !== "NA" &&
        row[key] !== "NaN" &&
        !isNumeric(row[key])
      ) {
        console.log("row: ", row);
        console.log("key: ", key);
      }
    }
  }
}

async function endGnomadV4LofMetricsDBFunction() {
  console.log("Finished reading gnomad V4 LoF metrics database");
  readSteamFile(PHI_DB_PATH, "\t", readPHIDBFunction, endPHIDBFunction);
}
// End Gnomad Lof Metrics DB

// Start pHI pTS DB
async function readPHIDBFunction(row: any) {
  tempGeneMap.set(row["Gene"], row);
}

async function endPHIDBFunction() {
  console.log("Finished reading pHI and pTS database");
  for (const transcript of transcriptMap.values()) {
    if (tempGeneMap.has(transcript.gene_symbol!)) {
      const row = tempGeneMap.get(transcript.gene_symbol!);
      transcript.p_haplo = (<PhiPts>row!).pHaplo;
      transcript.p_triplo = (<PhiPts>row!).pTriplo;
    }
  }
  tempGeneMap = new Map<string, any>();
  readSteamFile(
    CLINGEN_DB_PATH,
    "\t",
    readClinGenDBFunction,
    endClinGenDBFunction
  );
}
// End pHI pTS DB

// Start ClinGen DB
async function readClinGenDBFunction(row: any) {
  tempGeneMap.set(row["Gene Symbol"], row);
}

async function endClinGenDBFunction() {
  console.log("Finished reading ClinGen database");
  for (const transcript of transcriptMap.values()) {
    if (tempGeneMap.has(transcript.gene_symbol!)) {
      const row = tempGeneMap.get(transcript.gene_symbol!);
      if (CLINGEN_HI_MAP.has((<ClinGenGene>row)["Haploinsufficiency Score"])) {
        transcript.clingen_hi = CLINGEN_HI_MAP.get(
          (<ClinGenGene>row)["Haploinsufficiency Score"] + ""
        );
      }
      if (CLINGEN_TS_MAP.has((<ClinGenGene>row)["Triplosensitivity Score"])) {
        transcript.clingen_ts = CLINGEN_TS_MAP.get(
          (<ClinGenGene>row)["Triplosensitivity Score"] + ""
        );
      } else if ((<ClinGenGene>row)["Triplosensitivity Score"] + "" == "-1") {
        transcript.clingen_ts = CLINGEN_TS_MAP.get("0");
      }
    }
  }

  let eachStartDate = new Date();
  const transcripts = Array.from(transcriptMap.values());

  const chunkSize = 10000;
  for (let ii = 0; ii < transcripts.length; ii += chunkSize) {
    const chunk = transcripts.slice(ii, ii + chunkSize);
    await Gene.insertMany(chunk);
    console.log(
      "inserted: ",
      ii,
      " genes in ",
      (new Date().getTime() - eachStartDate.getTime()) / 1000 + "s"
    );
    eachStartDate = new Date();
  }

  console.log(
    "Finished in " + (new Date().getTime() - startDate.getTime()) / 1000 + "s"
  );
  process.exit(0);
}
// End ClinGen DB

function isNumeric(str: number) {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

main();
