import gzip
import itertools
import multiprocessing
import sys
from time import time
import pandas as pd
import re
from interfaces.variant_handler import VariantHandler
from pymongo.collation import Collation
from pymongo.errors import OperationFailure

class CompletePipeline(VariantHandler):

    DEFAULT_APP_NAME = 'CompletePipeline'
    APP_VERSION = '1.0.0'
    VARIANT_TYPE = 'both'
    # for compound het should split smaller
    SPLIT_SIZE = 1000
    IS_SHARD_MONGODB = True # modify if mongodb is not sharded

    def __init__(self, database_path, database_name, pipeline_version=None, process_num=None, complete_num=None, brand=None):
        self.start_time = time()
        self.app_name = self.DEFAULT_APP_NAME
        self.pipeline_version = pipeline_version if pipeline_version else self.pipeline_version
        self.process_num = process_num
        self.database_path = database_path
        self.db_name = database_name
        self.brand = brand
        self.set_basic_param()
        # force overwrite the complete number
        if complete_num:
            self.complete_num = complete_num

    def load_data(self):
        # confirm pipeline complete
        database = self._get_database(self.database_path)
        db_obj = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name })
        if db_obj and self.complete_num == len(db_obj['tool_complete_infos']):
            
            # check got vcf header
            db_vcf_header = database.find_one(self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME, {'type': 'vcf_header' })
            if not db_vcf_header and 'vcf_header' in db_obj:
                commoninfo_results = []
                vcf_header = {}
                vcf_header['type'] = 'vcf_header'
                vcf_header['vcf_header'] = db_obj['vcf_header']
                commoninfo_results.append(vcf_header)
                self.save_result(commoninfo_results, self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME)
                database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, {"$unset": {"vcf_header": 1}})

            self.run_complete = True
            # first add index
            self._create_index(database)
            self.sample_infos = db_obj['samples']
            pool = multiprocessing.Pool(self.process_num)
            genes = database.distinct(self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, 'ensembl_gene_id')
            chunks = [genes[ii:ii+self.SPLIT_SIZE] for ii in range(0, len(genes), self.SPLIT_SIZE)]
            pool.map(self._calc_comp_het, chunks)
            pool.close()
            pool.join()
        database.close_database()

    ####### start private method ########
    def _create_index(self, database):
        start_time = time()
        sys.stdout.write("Start add index for variant table\n")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("$**", 1)], "all_column_index")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("chrom", 1), ("start", 1)], "chrom_start",collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene", 1)], "gene")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene", 1), ("chrom", 1), ("start", 1)], "gene_chrom_start",collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene_filter", 1)], "gene_filter")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene_filter", 1), ("chrom", 1), ("start", 1)], "gene_filter_chrom_start",collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.clingen_hi", 1)], "transcript_clingen_hi")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.clingen_ts", 1)], "transcript_clingen_ts")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("type", 1), ("variant_type", 1)], "type_variant_type")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_gene_symbol", 1)], "exomiser_highest_gene_symbol")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_moi", 1)], "exomiser_highest_moi")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_exomiser_acmg_classification", 1)], "highest_exomiser_acmg_classification")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_exomiser_gene_combined_score", 1)], "highest_exomiser_gene_combined_score")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_exomiser_gene_pheno_score", 1)], "highest_exomiser_gene_pheno_score")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("*.highest_exomiser_gene_variant_score", 1)], "highest_exomiser_gene_variant_score")
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("quality", 1), ("variant_type", 1)], "snp_quality", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("pass_filter", 1), ("variant_type", 1)], "snp_pass_filter", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_coding", 1), ("variant_type", 1)], "snp_is_coding", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_exonic", 1), ("variant_type", 1)], "snp_is_exonic", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact", 1), ("variant_type", 1)], "snp_impact", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("polyphen_score", 1)], "snp_impact_severity_polyphen_score", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("sift_score", 1)], "snp_impact_severity_sift_score", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("cadd_phred", 1)], "snp_impact_severity_cadd_phred", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("revel", 1)], "snp_impact_severity_revel", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_polyphen_pred", 1), ("variant_type", 1)], "snp_ployphen_pred", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_sift_pred", 1), ("variant_type", 1)], "snp_sift_pred", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_polyphen_score", 1), ("variant_type", 1)], "snp_polyphen_score", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_sift_score", 1), ("variant_type", 1)], "snp_sift_score", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("cadd_phred", 1), ("variant_type", 1)], "snp_cadd_phred", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("revel", 1), ("variant_type", 1)], "snp_revel", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("revel_class", 1), ("variant_type", 1)], "snp_revel_class", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("am_class", 1), ("variant_type", 1)], "snp_am_class", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("am_pathogenicity", 1), ("variant_type", 1)], "snp_am_pathogenicity", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_constraint_v2_mis_z", 1), ("variant_type", 1)], "snp_constraint_v2_mis_z", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_constraint_v2_syn_z", 1), ("variant_type", 1)], "snp_first_constraint_v2_syn_z", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_constraint_v2_oe_mis_upper", 1), ("variant_type", 1)], "snp_first_constraint_v2_oe_mis_upper", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("first_constraint_v2_oe_lof_upper", 1), ("variant_type", 1)], "snp_first_constraint_v2_oe_lof_upper", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("clnsig", 1), ("variant_type", 1)], "snp_clnsig", partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("p_lof", 1), ("variant_type", 1)], "sv_p_lof", partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_pathogenic", 1), ("variant_type", 1)], "sv_is_pathogenic", partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("len", 1), ("variant_type", 1)], "sv_variant_length", partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("caller", 1), ("variant_type", 1)], "sv_caller", partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("afs.source_filter", 1), ("afs.AF", 1), ("variant_type", 1)], "sv_af", partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("p_lof", 1), ("afs.AF", 1), ("afs.source_filter", 1), ("variant_type", 1)], "sv_lof_af", partialFilterExpression = {'variant_type': 'structural'})        
        sys.stdout.write("Completed add index for variant table\n")
        database.create_index(self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, [("ensembl_gene_id", 1)], "ensembl_gene")
        sys.stdout.write("Completed add index for all tables in %ds\n" % (time() - start_time))

        if self.IS_SHARD_MONGODB:
            sys.stdout.write("Enable sharding for database and shard table\n")
            admin_db = database.get_admin_database()

             # Enable sharding
            try:
                admin_db.command("enableSharding", self.db_name)
                print(f"Sharding enabled for {self.db_name}")
            except OperationFailure as e:
                if "already enabled" in str(e):
                    print(f"Sharding already enabled for {self.db_name}")
                else:
                    raise

            # Shard variants collection
            variant_ns = f"{self.db_name}.{self.MONGO_DB_VARIANT_COLLECTION_NAME}"
            try:
                collections = admin_db.command({"listCollections": 1, "nameOnly": True, "filter": {"name": self.MONGO_DB_VARIANT_COLLECTION_NAME}})
                is_sharded = any(coll.get("options", {}).get("sharded", False) for coll in collections.get("cursor", {}).get("firstBatch", []))

                if not is_sharded:
                    admin_db.command("shardCollection", variant_ns, key={"_id": 1})
                    print(f"Sharded {variant_ns} with key {{_id: 1}}")
                else:
                    print(f"{variant_ns} is already sharded")
            except OperationFailure as e:
                if "already sharded" in str(e):
                    print(f"{variant_ns} is already sharded")
                else:
                    raise

            # Shard exons collection (unchanged)
            exons_ns = f"{self.db_name}.{self.MONGO_DB_VARIANT_EXONS_COLLECTION_NAME}"
            try:
                collections = admin_db.command({"listCollections": 1, "nameOnly": True, "filter": {"name": self.MONGO_DB_VARIANT_EXONS_COLLECTION_NAME}})
                is_sharded = any(coll.get("options", {}).get("sharded", False) for coll in collections.get("cursor", {}).get("firstBatch", []))

                if not is_sharded:
                    admin_db.command("shardCollection", exons_ns, key={"_id": 1})
                    print(f"Sharded {exons_ns} with key {{_id: 1}}")
                else:
                    print(f"{exons_ns} is already sharded")
            except OperationFailure as e:
                if "already sharded" in str(e):
                    print(f"{exons_ns} is already sharded")
                else:
                    raise
            
            sys.stdout.write("Complete sharding for database and shard table\n")


    def _calc_comp_het(self, chunk):
        database = self._get_database(self.database_path)
        for ensembl_gene_id in chunk:
            compound_het_list = database.find(self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, { 'ensembl_gene_id': ensembl_gene_id })
            paternal_hit = False
            maternal_hit = False
            first_compound_het = None
            variant_ids = []
            for compound_het in compound_het_list:
                if compound_het['genotypes_index'][self.sample_infos['father']['index']] in self.HETEROZYGOUS:
                    paternal_hit = True
                elif compound_het['genotypes_index'][self.sample_infos['mother']['index']] in self.HETEROZYGOUS:
                    maternal_hit = True
                if not first_compound_het:
                    first_compound_het = compound_het
                variant_ids.append(compound_het['variant_id'])
            base_cases = []
            if paternal_hit and maternal_hit:
                # calculate for compound het
                temp_possible_array = []
                # just using the gt_types for index, proband always 1, parent always 0 and others always 2
                for idx, person in enumerate(first_compound_het['genotypes_index']):
                    if self.sample_infos['father']['index'] == idx or self.sample_infos['mother']['index'] == idx:
                        temp_possible_array.append('0')
                    elif self.sample_infos['proband']['index'] == idx:
                        temp_possible_array.append('1')
                    else:
                        temp_possible_array.append('2')
                base_cases = ["3"]
                for cases in temp_possible_array:
                    if cases != 2:
                        for i, case in enumerate(base_cases):
                            base_cases[i] = case + str(cases)
                    else:
                        temp_cases = base_cases.copy()
                        for i, case in enumerate(base_cases):
                            base_cases[i] = case + str('0')
                        for case in temp_cases:
                            base_cases.append(case + str('1'))
                database.update_many(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, { 'variant_id': {'$in': variant_ids} }, { "$push": { 'scenario': { '$each': base_cases } } })
        database.close_database()
