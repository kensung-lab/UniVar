// Add shards with retry logic
var shards = [
  "shard1ReplSet/shard1:27017",
  "shard2ReplSet/shard2:27017",
  "shard3ReplSet/shard3:27017",
  "shard4ReplSet/shard4:27017",
];

shards.forEach(function (shard) {
  var attempts = 0;
  var maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      sh.addShard(shard);
      print("Added shard: " + shard);
      break;
    } catch (e) {
      attempts++;
      print(
        "Failed to add " +
          shard +
          " (Attempt " +
          attempts +
          "): " +
          e +
          ". Retrying in 5 seconds..."
      );
      sleep(5000);
    }
  }
  if (attempts >= maxAttempts) {
    print(
      "Failed to add shard " + shard + " after " + maxAttempts + " attempts."
    );
  }
});

// Ensure the balancer is running
sh.startBalancer();
if (sh.getBalancerState()) {
  print("Balancer is enabled and running.");
} else {
  print("Warning: Balancer failed to start.");
}

db = db.getSiblingDB("common");
// for univar version
db.pipelineversion.insertOne({
  version: "1.0.2",
  brand: "univar",
  pipeline_required: 3,
  small_variant: {
    version: "1.0.2",
    dbs: {
      AlphaMissense: "2023-08-03",
      cadd: "1.7",
      cgd: "2025-02-24",
      clinvar: "2025-02-17",
      exomiser: "2410",
      flag_lrg: "2021-03-30",
      gnomad_v2: "v2.1.1",
      gnomad_v4: "v4.1",
      ReMM: "0.4",
      revel: "1.3",
      splice_ai: "1.3",
      utr_annotator: "2021-01-10",
      SIFT: "6.2.1",
    },
    tools: {
      exomiser: "14.1.0",
      "variant-import-tool": "1.0.2",
      VEP: "113",
    },
  },
  structural_variant: {
    version: "1.0.2",
    dbs: {
      "1000_genomes_project": "1000 Genomes 30x on GRCh38",
      "1000_genomes_project (Inhouse caller)": "2023-03-21",
      clinvar: "2025-02-06",
      dgv_gold: "2016-06-15",
      exomiser: "2410",
    },
    tools: {
      exomiser: "14.1.0",
      nirvana: "3.18.1",
      "variant-import-tool": "1.0.2",
    },
  },
  univar_gene_version: {
    detail: {
      clingen: "2025-02-22",
      ensembl: "113",
      gnomad_v2_constraint: "2.1.1",
      gnomad_v4_constraint: "4.1",
      MANE: "1.4",
      "probability of Haplo and Triplo scores": "2022-08-04",
    },
    version: "1.0.2",
  },
});
db.pipelineversion.createIndex({ version: 1 }, { unique: true });

db.bookmarks.insertMany([
  {
    name: "High risk (SNV/INDEL + SV)​",
    filters: {
      scenario: "any",
      clingen_hi: ["sufficient", "autosomal"],
      univar_high_impact: 1,
      p_lof: ["LOF", "DUP_LOF", "COPY_GAIN", "INV_SPAN"],
      gnomadv2e_af: {
        $lte: 0.005,
      },
      gnomadv3g_af: {
        $lte: 0.005,
      },
      one_kg: {
        $lte: 0.005,
      },
      one_kg_sur: {
        $lte: 0.005,
      },
      quality: {
        $gte: 30,
      },
    },
    panels: [],
    type: "filter",
    create_user: "anyone",
    access_group: ["anyone"],
    is_default: true,
    creation_date: {
      $date: new Date(),
    },
  },
  {
    name: "Basic (SNV/INDEL + SV)",
    filters: {
      scenario: "any",
      clingen_hi: ["sufficient", "autosomal"],
      gnomadv2e_af: {
        $lte: 0.005,
      },
      gnomadv3g_af: {
        $lte: 0.005,
      },
      one_kg: {
        $lte: 0.005,
      },
      one_kg_sur: {
        $lte: 0.005,
      },
      quality: {
        $gte: 30,
      },
    },
    panels: [],
    type: "filter",
    create_user: "anyone",
    access_group: ["anyone"],
    is_default: true,
    creation_date: {
      $date: new Date(),
    },
  },
]);

db.databases.createIndex({ access_group: 1, create_time: -1 });
db.databases.createIndex({ access_group: 1, create_time: -1, is_ready: 1 });
db.databases.createIndex({ create_time: -1 });
db.databases.createIndex({ database_name: 1 });
db.databases.createIndex({ display_name: 1 });