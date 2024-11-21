import gzip
import itertools
import multiprocessing
import sys
from time import time
import pandas as pd
import re
from interfaces.variant_handler import VariantHandler
from pymongo.collation import Collation

class CompletePipeline(VariantHandler):

    DEFAULT_APP_NAME = 'CompletePipeline'
    APP_VERSION = '1.0.0'
    VARIANT_TYPE = 'both'
    # for compound het should split smaller
    SPLIT_SIZE = 1000

    def __init__(self, database_path, database_name, pipeline_version=None, process_num=None, complete_num=None):
        self.start_time = time()
        self.app_name = self.DEFAULT_APP_NAME
        self.pipeline_version = pipeline_version if pipeline_version else self.pipeline_version
        self.process_num = process_num
        self.database_path = database_path
        self.db_name = database_name
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
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("$**", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("chrom", 1), ("start", 1)],collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene", 1), ("chrom", 1), ("start", 1)],collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene_filter", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.gene_filter", 1), ("chrom", 1), ("start", 1)],collation=Collation(locale="en_US", numericOrdering=True))
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.clingen_hi", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("gene_objs.clingen_ts", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("quality", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("pass_filter", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("type", 1), ("variant_type", 1)])
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_coding", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_exonic", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("polyphen_score", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("sift_score", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("cadd_phred", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("impact_severity", 1), ("variant_type", 1), ("revel", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("polyphen_pred", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("sift_pred", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("polyphen_score", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("sift_score", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("cadd_phred", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("revel", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("constraint_mis_z", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("constraint_syn_z", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("constraint_oe_mis_upper", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("highest_exomiser_scombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_ad_exgenescombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_ar_exgenescombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_xd_exgenescombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_xr_exgenescombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_mt_exgenescombi", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("highest_exomiser_spheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_ad_exgenespheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_ar_exgenespheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_xd_exgenespheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_xr_exgenespheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("exomiser_mt_exgenespheno", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("clnsig", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'small'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("p_lof", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("is_pathogenic", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("len", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("caller", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'structural'})
        database.create_index(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, [("afs.source", 1), ("afs.AF", 1), ("variant_type", 1)], partialFilterExpression = {'variant_type': 'structural'})
        sys.stdout.write("Completed add index for variant table\n")
        database.create_index(self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, [("ensembl_gene_id", 1)])
        sys.stdout.write("Completed add index for all tables in %ds\n" % (time() - start_time))


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
