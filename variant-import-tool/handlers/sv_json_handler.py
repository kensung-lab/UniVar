import gzip
import itertools
import multiprocessing
import sys
from time import time
import pandas as pd
import re
from interfaces.variant_handler import VariantHandler
from math import log10, floor
from liftover import ChainFile
import json
import copy
import numpy as np
import os

class SVJSON2JSON(VariantHandler):

    DEFAULT_APP_NAME = 'SVJSON2JSON'
    APP_VERSION = '1.0.0'
    VARIANT_TYPE = 'structural'
    SPLIT_SIZE = 1000
    BND_RELATED_THRESHOLD = 500
    MIN_SAMPLE_SIZE = 1000

    RENAMED_FIELD = {
        'chromosome': 'chrom',
        'position': 'start',
        'vcfInfo.END': 'end',
        'vcfInfo.SUPP': 'supp',
        'svLength': 'len',
        'refAllele': 'ref',
        'vcfInfo.SVTYPE': 'type',
        'vcfInfo.LEFT_SVINSSEQ': 'LEFT_SVINSSEQ',
        'vcfInfo.RIGHT_SVINSSEQ': 'RIGHT_SVINSSEQ',
    }

    CLINGEN_HI_MAPPING = {
        'unlikely': 1,
        'autosomal': 2,
        'little': 3,
        'emerging': 4,
        'sufficient': 5,
        'no': 0,
    }

    UNIVAR_SVTYPE_LOOKUP = {
        'DEL': ['deletion','copy_number_variation', 'copy_number_loss', 'cnv|loss', 'cnv|gain+loss', 'cnv|alu deletion', 'cnv|deletion', 'cnv|herv deletion', 'cnv|line1 deletion', 'cnv|mobile element deletion', 'cnv|sva deletion', 'loss', 'indel', 'cnv', 'del'],
        'DUP': ['duplication ','copy_number_variation', 'copy_number_gain', 'cnv|gain', 'cnv|gain+loss', 'cnv|duplication', 'cnv|tandem duplication', 'gain', 'indel', 'cnv', 'dup', 'tandem_duplication'],
        # same as DUP
        'DUP:TANDEM': ['duplication ','copy_number_variation', 'copy_number_gain', 'cnv|gain', 'cnv|gain+loss', 'cnv|duplication', 'cnv|tandem duplication', 'gain', 'indel', 'cnv', 'dup', 'tandem_duplication'],
        'INS': ['insertion','mobile_element_insertion', 'copy_number_gain', 'cnv|alu insertion', 'cnv|herv insertion', 'cnv|insertion', 'cnv|line1 insertion', 'cnv|mobile element insertion', 'cnv|novel sequence insertion', 'cnv|sva insertion', 'cnv', 'ins'],
        'INV': ['inversion', 'other|inversion', 'inv'],
        # below are complex types
        'DUP:INV': ['cpx', 'bnd', 'ctx', 'tra'],
        'BND': ['cpx', 'bnd', 'ctx', 'tra'],
        'TRA': ['cpx', 'bnd', 'ctx', 'tra'],
        'CPX': ['cpx', 'bnd', 'ctx', 'tra'],
        'CTX': ['cpx', 'bnd', 'ctx', 'tra'],
    }

    TOP_TRANSCRIPT_COLUMNS = ['mane_select', 'ncbi_ids']

    AF_ANNO_OVERLAP_FILTER = 0.8
    AF_RECI_OVERLAP_FILTER = 0.8

    GENE_DATABASE_CONSTRAINT_COLUMNS = ['constraint_v2_pli','constraint_v2_oe_lof', 'constraint_v2_oe_lof_lower', 
                                    'constraint_v2_oe_lof_upper', 'constraint_v2_mis_z', 'constraint_v2_oe_mis', 'constraint_v2_oe_mis_lower', 'constraint_v2_oe_mis_upper',
                                    'constraint_v2_syn_z', 'constraint_v2_oe_syn', 'constraint_v2_oe_syn_lower', 'constraint_v2_oe_syn_upper', 'constraint_v4_pli',
                                    'constraint_v4_oe_lof', 'constraint_v4_oe_lof_lower', 'constraint_v4_oe_lof_upper', 'constraint_v4_mis_z', 'constraint_v4_oe_mis',
                                    'constraint_v4_oe_mis_lower', 'constraint_v4_oe_mis_upper', 'constraint_v4_syn_z', 'constraint_v4_oe_syn', 'constraint_v4_oe_syn_lower',
                                    'constraint_v4_oe_syn_upper']

    GNOMAD_V2_AF_USED_FIELDS = ['allAf', 'afrAf', 'amrAf', 'easAf', 'eurAf', 'othAf', 'allAn', 'afrAn', 'amrAn', 'easAn', 'eurAn', 'othAn']

    GNOMAD_V2_AF_KEY_MAP = {
        'allAf': {
            'name': 'gnomAD v2 - Global',
            'an': 'allAn',
        },
        'afrAf': {
            'name': 'gnomAD v2 - African/African American',
            'an': 'afrAn',
        },
        'amrAf': {
            'name': 'gnomAD v2 - Latino/Admixed American',
            'an': 'amrAn',
        },
        'easAf': {
            'name': 'gnomAD v2 - East Asian',
            'an': 'easAn',
        },
        'eurAf': {
            'name': 'gnomAD v2 - European',
            'an': 'eurAn',
        },
        'othAf': {
            'name': 'gnomAD v2 - Other (population not assigned)',
            'an': 'othAn',
        },
    }

    GNOMAD_V4_AF_USED_FIELDS = ['allAf', 'afrAf', 'amiAf', 'amrAf', 'asjAf', 'easAf', 'midAf', 'finAf', 'nfeAf', 'othAf', 'sasAf', 
                                'allAn', 'afrAn', 'amiAn', 'amrAn', 'asjAn', 'easAn', 'midAn', 'finAn', 'nfeAn', 'othAn', 'sasAn']

    GNOMAD_V4_AF_KEY_MAP = {
        'allAf': {
            'name': 'gnomAD v4 - Global',
            'an': 'allAn',
        },
        'afrAf': {
            'name': 'gnomAD v4 - African/African American',
            'an': 'afrAn',
        },
        'amiAf': {
            'name': 'gnomAD v4 - Amish',
            'an': 'amiAn',
        },
        'amrAf': {
            'name': 'gnomAD v4 - Latino/Admixed American',
            'an': 'amrAn',
        },
        'asjAf': {
            'name': 'gnomAD v4 - Ashkenazi Jewish',
            'an': 'asjAn',
        },
        'easAf': {
            'name': 'gnomAD v4 - East Asian',
            'an': 'easAn',
        },
        'midAf': {
            'name': 'gnomAD v4 - Middle Eastern',
            'an': 'midAn',
        },
        'finAf': {
            'name': 'gnomAD v4 - Finnish',
            'an': 'finAn',
        },
        'nfeAf': {
            'name': 'gnomAD v4 - Non-Finnish European',
            'an': 'nfeAn',
        },
        'othAf': {
            'name': 'gnomAD v4 - Other (population not assigned)',
            'an': 'othAn',
        },
        'sasAf': {
            'name': 'gnomAD v4 - South Asian',
            'an': 'sasAn',
        },
    }

    # require to be in order
    SPECICAL_HANDLE_COLUMNS = ['altAlleles', 'samples', 'vcfInfo.SAMPLE_ORDER']

    EMPTY = [[0,0],[None,0], [0,None], [None,None]]

    # complex SV types
    COMPLEX_SVTYPE = ['BND', 'TRA', 'CPX', 'CTX', 'DUP:INV']
    NO_CHECK_OVERLAP_TYPE = ["INS"]
    NO_CHECK_OVERLAP_TYPE.extend(COMPLEX_SVTYPE)
    CHECK_OVERLAP_TYPE = ["DEL", "DUP", "INV", "DUP:TANDEM"]

    # remove unused key    
    EMPTY_KEY = {'gts', 'gt_types', 'gt_phases', 'gt_depths', 'gt_ref_depths', 'gt_alt_depths', 'gt_quals', 'gt_alt_freqs'}

    def __init__(self, variant_file_path, database_path, sample_infos, database_name, result_folder=None, pipeline_version=None, proband_id=None, access_group=None, uat_mode=None, process_num=None, source=None, liftover_path=None, brand=None):
        self.start_time = time()
        self.app_name = self.DEFAULT_APP_NAME
        self.pipeline_version = pipeline_version if pipeline_version else self.pipeline_version
        self.variant_file_path = variant_file_path
        self.result_folder = result_folder
        self.access_group = access_group
        self.process_num = process_num
        self.database_path = database_path
        self.sample_infos = sample_infos
        self.db_name = database_name
        self.proband_id = proband_id
        self.uat_mode = uat_mode
        self.liftover_path = liftover_path
        self.brand = brand
        # always assume the file name format as <patient_id>_<family_type><(_<family_member_id>)+>_<time_or_some_unqiue_text>.vcf.gz
        file_names = variant_file_path.split('/')[-1].split('.')
        self.source = source if source else file_names[-3]
        self.VARIANT_ID_PREFIX = 'S:' + self.source + ':'
        self.set_basic_param()
        self._remove_existing()

    def load_data(self):
        if self.already_success:
            return
        self._load_header()
        self._load_samples([sample.replace("_", "-") for sample in self.header['samples']])

        # Read the CSV file in chunks using multiprocessing
        start_time = time()
        sys.stdout.write("start massage variants with multiprocessing\n")
        pool = multiprocessing.Pool(self.process_num)
        chunks = pd.read_csv(self.variant_file_path, sep='\t', chunksize=self.SPLIT_SIZE)
        sv_lists = pool.map(self._read_json_chunk, chunks)
        pool.close()
        pool.join()
        sys.stdout.write("all message variants completed in %ds\n" % (time() - start_time))

        self.sv_object_list = sum(sv_lists, [])
        # When BND relationship required, can uncomment below code but it may cause performance issue (RAM and time)
        # Process related variants in parallel
        # start_time = time()
        # sys.stdout.write("start finding related variants with multiprocessing\n")
        # pool = multiprocessing.Pool(self.process_num)
        # pool.map(self._get_related_variant, sv_lists)
        # pool.close()
        # pool.join()
        # sys.stdout.write("Found all related variants completed in %ds\n" % (time() - start_time))

    ####### start private method ########
    def _read_json_chunk(self, chunk):
        database = self._get_database(self.database_path)
        variant_array, exon_obj_array, comphet_array = [], [], []
        lifter = ChainFile(self.liftover_path, 'hg38', 'hg19')
        chunk_num = -1
        start_chunk_time = time()
        is_continue = True
        sv_list = []

        for index, row in chunk.iterrows():
            if not is_continue:
                break
            if chunk_num == -1:
                chunk_num = index
            variant_dict = {}
            sv_obj = {}
            temp_ensembl_gene_list, temp_ensembl_exon_list = [], []
            transcript_list, low_transcript_list, exon_list, low_exon_list = [], [], [], []
            transcript_dict, exon_dict = {}, {}
            all_gene = set()
            default_gene_dict, no_default_gene_dict = {}, {}
            # should run once only since it is not really tsv
            for ii, field in enumerate(row):
                if '],"genes":[' == field or ']}' == field:
                    break
                else:
                    if ',' == field[-1]: 
                        field = field[:-1]
                    variant_dict = json.loads(field)
                    # if the dict doesn't contain chromosome column then it should be gene column
                    if 'chromosome' not in variant_dict:
                        is_continue = False
                        break
                    # loop rename key
                    for keys in self.RENAMED_FIELD.keys():
                        key_array = keys.split('.')
                        value = self._get_dict_value_recursive(variant_dict, key_array)
                        if value:
                            sv_obj[self.RENAMED_FIELD[keys]] = value
                    # handle special handle columns
                    for key in self.SPECICAL_HANDLE_COLUMNS:
                        # here handle all sample order related information
                        if key == 'vcfInfo.SAMPLE_ORDER':
                            key_array = key.split('.')
                            sample_order = self._get_dict_value_recursive(variant_dict, key_array)
                            if sample_order:
                                #use the sample order to order others column that require to re-order
                                key_array = 'vcfInfo.COPY_NUM_GENOTYPE'.split('.')
                                copy_num_genotype = self._get_dict_value_recursive(variant_dict, key_array)
                                key_array = 'vcfInfo.COPY_NUM_GENOTYPE_QUALITY'.split('.')
                                copy_num_genotype_qual = self._get_dict_value_recursive(variant_dict, key_array)
                                sv_obj['copy_num_genotype'] = copy_num_genotype.split(',')
                                sv_obj['copy_num_genotype_qual'] = copy_num_genotype_qual.split(',')
                                self._order_format_list(self.sample_infos['sample_id'], sv_obj['copy_num_genotype'], sample_order.split(','))
                                self._order_format_list(self.sample_infos['sample_id'], sv_obj['copy_num_genotype_qual'], sample_order.split(','))
                        else:
                            if key in variant_dict:
                                if key == 'altAlleles':
                                    if isinstance(variant_dict['altAlleles'], list) and len(variant_dict['altAlleles']) == 1:
                                        sv_obj['alt'] = variant_dict['altAlleles'][0]
                                    else:
                                        sv_obj['alt'] = variant_dict['altAlleles']
                                    if 'vcfInfo' in variant_dict and 'SVINSSEQ' in variant_dict['vcfInfo'] and variant_dict['vcfInfo']['SVINSSEQ'] and sv_obj['type'] == 'INS':
                                        sv_obj['alt'] = variant_dict['vcfInfo']['SVINSSEQ']

                                elif key == 'samples':
                                    sv_obj['genotypes_index'] = []
                                    sv_obj['copy_num_genotype'] = []
                                    for sample in variant_dict[key]:
                                        if '/' in sample['genotype']:
                                            sv_obj['genotypes_index'].append([int(v) if v != '.' else None for v in sample['genotype'].split('/')])
                                        elif '|' in sample['genotype']:
                                            sv_obj['genotypes_index'].append([int(v) if v != '.' else None for v in sample['genotype'].split('|')])
                                        elif sample['genotype'] == '0' or sample['genotype'] == '1':
                                            sv_obj['genotypes_index'].append([int(sample['genotype']), None])
                                        else:
                                            sv_obj['genotypes_index'].append([None, None])
                                        if 'copyNumber' in sample and sample['copyNumber']:
                                            sv_obj['copy_num_genotype'].append(sample['copyNumber'])

                    # ============================= #
                    # handle hardcode columns start #
                    # ============================= #

                    if 'len' in sv_obj and sv_obj['len'] > 10000:
                        if 'ref' in sv_obj and len(sv_obj['ref']) > 10000:
                            sv_obj['ref'] = sv_obj['ref'][0]
                        if 'alt' in sv_obj and len(sv_obj['alt']) > 10000:
                            if 'type' in sv_obj and sv_obj['type']:
                                sv_obj['alt'] = '<' + sv_obj['type'] + '>' 

                    self._get_sv_specific_columns(sv_obj, variant_dict, temp_ensembl_gene_list, temp_ensembl_exon_list, database)
                    left_bkpt_element = {
                        'ensembl_gene': self._check_bkpt_overlap(temp_ensembl_gene_list, sv_obj['start'], transcript_list, low_transcript_list, transcript_dict, True),
                        'ensembl_exon': self._check_bkpt_overlap(temp_ensembl_exon_list, sv_obj['start'], exon_list, low_exon_list, exon_dict, False)
                    }

                    right_bkpt_element = {
                        'ensembl_gene': self._check_bkpt_overlap(temp_ensembl_gene_list, sv_obj['end'] if 'end' in sv_obj else -1, transcript_list, low_transcript_list, transcript_dict, True),
                        'ensembl_exon': self._check_bkpt_overlap(temp_ensembl_exon_list, sv_obj['end'] if 'end' in sv_obj else -1, exon_list, low_exon_list, exon_dict, False)
                    }
                    plof = self._check_p_lof(sv_obj['type'], sv_obj['start'], sv_obj['end'] if 'end' in sv_obj else -1, left_bkpt_element, right_bkpt_element, temp_ensembl_exon_list, temp_ensembl_gene_list)
                    if plof:
                        sv_obj['p_lof'] = plof

                    gene_obj_list = []
                    for database_name in self.GENE_DATABASE_CONSTRAINT_COLUMNS:
                        sv_obj[database_name] = set()
                    self._get_gene_obj_list(database, gene_obj_list, transcript_list, transcript_dict, all_gene, default_gene_dict, no_default_gene_dict, sv_obj, True)

                    # delete duplicate gene from hgnc_list
                    for transcript in transcript_list:
                        if transcript in low_transcript_list:
                            low_transcript_list.remove(transcript)
                    self._get_gene_obj_list(database, gene_obj_list, low_transcript_list, transcript_dict, all_gene, default_gene_dict, no_default_gene_dict, sv_obj, False)


                    for gene in all_gene:
                        if gene not in default_gene_dict and gene in no_default_gene_dict:
                            no_default_gene_dict[gene]['default_show'] = True
                            
                    for database_name in self.GENE_DATABASE_CONSTRAINT_COLUMNS:
                        sv_obj[database_name] = list(sv_obj[database_name])
                        if database_name in sv_obj and len(sv_obj[database_name]) > 0:
                            sv_obj['first_' + database_name] = sv_obj[database_name][0]

                     # remove duplicate gene object
                    unique_gene_obj_list = []
                    for gene_obj in gene_obj_list:
                        is_contain = False
                        for unique_gene_obj in unique_gene_obj_list:
                            if unique_gene_obj['transcript'] == gene_obj['transcript']:
                                is_contain = True
                        if not is_contain:
                            unique_gene_obj_list.append(gene_obj)

                    # not using clinGen HI as order 
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('clingen_hi_order') if gene.get('clingen_hi_order') else -1, reverse= True)
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('gene') if gene.get('gene') else '', reverse= False)
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('is_related') if gene.get('is_related') else False, reverse= False)
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('is_canonical') if gene.get('is_canonical') else -1, reverse= True)
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('is_mane_plus_clinical') if gene.get('is_mane_plus_clinical') else -1, reverse= True)
                    unique_gene_obj_list.sort(key=lambda gene:gene.get('is_mane_select') if gene.get('is_mane_select') else -1, reverse= True)

                    if len(unique_gene_obj_list) > 0:
                        for key in unique_gene_obj_list[0]:
                            if key in self.TOP_TRANSCRIPT_COLUMNS:
                                variant_dict[key] = unique_gene_obj_list[0][key]

                    # ============================= #
                    # handle hardcode columns end   #
                    # ============================= #
                    sv_obj['variant_type'] = self.VARIANT_TYPE
                    sv_obj['gene_objs'] = unique_gene_obj_list
                    sv_obj['variant_id'] = self.VARIANT_ID_PREFIX + str(index)  
                    sv_obj['sv_id'] = self.VARIANT_ID_PREFIX + str(index)
                    sv_obj['genotypes_index'] = self._order_format_list(self.sample_infos['sample_id'], sv_obj['genotypes_index'], self.sample_order)
                    sv_obj['copy_num_genotype'] = self._order_format_list(self.sample_infos['sample_id'], sv_obj['copy_num_genotype'], self.sample_order)
                    sv_obj['caller'] = self.source
                    exon_obj = {}
                    exon_obj['exons'] = temp_ensembl_exon_list if len(temp_ensembl_exon_list) < 20000 else temp_ensembl_exon_list[:2000]
                    exon_obj['variant_id'] = sv_obj['variant_id']
                    exon_obj_array.append(exon_obj)
                    if sv_obj['genotypes_index']:
                        self._set_scenario(sv_obj)

                    if not sv_obj['chrom'].startswith('chrUn_'):
                        try:
                            temp_hg19_obj = lifter.convert_coordinate(sv_obj['chrom'].replace("chr",""), sv_obj['start'])
                            if temp_hg19_obj:
                                sv_obj['hg19_chrom'] = temp_hg19_obj[0][0]
                                sv_obj['hg19_start'] = temp_hg19_obj[0][1]
                                sv_obj['hg19_strand'] = temp_hg19_obj[0][2]
                            if 'end' in sv_obj and sv_obj['end']:
                                temp_hg19_obj = lifter.convert_coordinate(sv_obj['chrom'].replace("chr",""), sv_obj['end'])
                                if temp_hg19_obj:
                                    sv_obj['hg19_end'] = temp_hg19_obj[0][1]

                        except Exception as e:
                            print("liftover error: ", e)
                    # compound het map for later update
                    self._handle_compound_het(sv_obj, comphet_array)
                    sv_list.append(sv_obj)

                    size_bytes = len(json.dumps(sv_obj))
                    if size_bytes > 16000000:  # Threshold for oversized (adjust if needed)
                        print(f"!!! OVERSIZED SV at index {index} (chunk_num {chunk_num}): {size_bytes} bytes", file=sys.stderr)
                        oversized_json = json.dumps(sv_obj, indent=2, default=str)
                        sys.stdout.write(oversized_json + '\n')
                        print(f"!!! OVERSIZED SV JSON printed to stdout for index {index}", file=sys.stderr)
                    # Optional: Track max size for non-oversized
                    else:
                        if not hasattr(self, 'max_sv_size'):
                            self.max_sv_size = 0
                        if size_bytes > self.max_sv_size:
                            self.max_sv_size = size_bytes
                            print(f"New max size so far: {size_bytes} bytes at index {index}", file=sys.stdout)

                    variant_array.append(sv_obj)
        sys.stdout.write("massage chunk %d completed in %ds\n" % (chunk_num, time() - start_chunk_time))
        start_write_time = time()
        if variant_array and len(variant_array) > 0:
            self.save_result(variant_array, self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, str(chunk_num) + '-_-' + self.source)
            if len(exon_obj_array) > 0:
                self.save_result(exon_obj_array, self.db_name, self.MONGO_DB_VARIANT_EXONS_COLLECTION_NAME, str(chunk_num) + '-_-' + self.source)
            sys.stdout.write("chunk %d write variants completed in %ds\n" % (chunk_num, time() - start_write_time))
            if len(comphet_array) > 0:
                self.save_result(comphet_array, self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, str(chunk_num) + '-_-' + self.source)
            sys.stdout.write("chunk %d write compound het completed in %ds\n" % (chunk_num, time() - start_write_time))
        database.close_database()
        return sv_list

    def _load_header(self):
        # always assume header is in first line
        with gzip.open(self.variant_file_path, 'rt') as f:
            line = f.readline()
            # assume the format is always like this:
            line = line.replace(',"positions":[', '')
            line = line + '}'
            header = json.loads(line)
            self.header = header['header']
            self.sample_order = [sample.replace("_", "-") for sample in self.header['samples']]

    def _remove_existing(self):
        database = self._get_database(self.database_path)
        # check if this program has already run successfully
        database_exist = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, { 'database_name': self.db_name })
        if database_exist and 'tool_complete_infos' in database_exist and any(d['tool_name'] == self.DEFAULT_APP_NAME and d['source'] == self.source for d in database_exist['tool_complete_infos']):
            # no need to run
            self.already_success = True
        # then need to check if the variant table got any variant that is from existing source
        elif database_exist:
            handler_condition = { 'variant_type': self.VARIANT_TYPE, 'caller': self.source }
            variant_exist = database.find_one_variant(self.db_name, handler_condition)
            if variant_exist:
                database.delete_many(self.db_name, self.MONGO_DB_VARIANT_EXONS_COLLECTION_NAME, handler_condition)
                database.delete_many(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, handler_condition)
                # database.update_one(self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME, {'type: ': 'version_info', os.path.basename(__file__) + '_' + self.source: self.APP_VERSION }, { '$unset' : { os.path.basename(__file__) + '_' + self.source :1}})
        database.close_database()

    def _get_dict_value_recursive(self, dict, key_array, index=0):
        result = None
        if index >= len(key_array):
            raise ValueError("Index cannot be larger then length of key array")
        elif index == len(key_array) -1:
            if key_array[index] in dict:
                result = self._get_str_value(dict[key_array[index]])
        else:
            if key_array[index] in dict:
                result = self._get_dict_value_recursive(dict[key_array[index]], key_array, index+1)
        return result


    def _get_related_variant(self, sv_obj_list):
        start_time = time()
        sys.stdout.write("start gathering related variant information for BND\n")
        database = self._get_database(self.database_path)
        bnd_variants = [sv for sv in sv_obj_list if sv['type'] == 'BND']
        
        for bnd_variant in bnd_variants:
            orig_related_variants = bnd_variant.get('related_variants', [])
            related_variants = self.recur_find_bnd(self.sv_object_list, bnd_variant.copy(), orig_related_variants.copy())
            
            if related_variants:
                self.append_related_variant(bnd_variant, related_variants, database)
        
        database.close_database()
        sys.stdout.write("completed gathering related variant information for BND in %ds\n" % (time() - start_time))

    # get string value in different type
    def _get_str_value(self, string):
        result = string
        try:
            float_result = float(string)
            if 'E' in string or len(str(float_result)) <= len(string):
                result = float_result
            else:
                int_result = int(string)
                if str(int_result) != string:
                    result = string
                else:
                    result = int_result
        except:
            result = string
        return result
    
    # get file format from VCF (version)
    def _read_file_format(self, line):
        return line.split('=')[1].strip()

    def _try_to_round_sig(self, number, digit):
        result = number
        # check is tuple
        if type(number) is tuple:
            number = number[0]

        try:
            result = self._round_sig(number, digit)
        except:
            result = number
        return result

    def _round_sig(self, x, sig=2):
        return round(x, sig-int(floor(log10(abs(x))))-1)
    
    def _unique(self, sequence):
        seen = set()
        return [x for x in sequence if not (x in seen or seen.add(x))]
    
    def get_severity(self, impacts):
        temp_impact_severity = None
        for impact in impacts:
            if temp_impact_severity == 'HIGH' or self.SO_IMPACT[impact] == 'HIGH':
                temp_impact_severity = 'HIGH'
            elif temp_impact_severity == 'MODERATE' or self.SO_IMPACT[impact] == 'MODERATE':
                temp_impact_severity = 'MODERATE'
            elif temp_impact_severity == 'LOW' or self.SO_IMPACT[impact] == 'LOW':
                temp_impact_severity = 'LOW'
            else:
                temp_impact_severity = 'MODIFIER'
        return temp_impact_severity

    def _get_list_of_values(self, input_list, key):
        return list(set([e[key] for e in input_list]))
    
    def _round_it(self, x, sig):
        try:
            y = round(x, sig-int(floor(log10(abs(x))))-1)
            return y
        except Exception:
            return x
    
    # ============================================================== #
    # sv related                                                     #
    # ============================================================== #
    def _get_sv_specific_columns(self, sv_obj, variant_dict, temp_ensembl_gene_list, temp_ensembl_exon_list, database):
        if 'ensembl_gene' in variant_dict:
            self._get_ensembl_gene(variant_dict, temp_ensembl_gene_list)
        if 'ensembl_exon' in variant_dict:
            self._get_ensembl_exon(variant_dict, temp_ensembl_exon_list)
        self._get_afs(sv_obj, variant_dict)
        self._get_hit_reported(sv_obj, variant_dict)
        self._get_exons_list(database, temp_ensembl_exon_list)

    def _get_ensembl_gene(self, variant_dict, temp_ensembl_gene_list):
        for ensembl_gene in variant_dict['ensembl_gene']:
            temp_ensembl_gene_dict = {}
            if 'start' in ensembl_gene:
                temp_ensembl_gene_dict['start'] = ensembl_gene['start']
            if 'end' in ensembl_gene:
                temp_ensembl_gene_dict['end'] = ensembl_gene['end']
            if 'STRAND' in ensembl_gene:
                temp_ensembl_gene_dict['strand'] = ensembl_gene['STRAND']
            if 'ENST_ID' in ensembl_gene:
                temp_ensembl_gene_dict['enst_id'] = ensembl_gene['ENST_ID']
            if 'reciprocalOverlap' in ensembl_gene:
                temp_ensembl_gene_dict['reciprocal_overlap'] = ensembl_gene['reciprocalOverlap']
            if 'annotationOverlap' in ensembl_gene:
                temp_ensembl_gene_dict['annotation_overlap'] = ensembl_gene['annotationOverlap']     
            if temp_ensembl_gene_dict != {}:
                temp_ensembl_gene_list.append(temp_ensembl_gene_dict)

    def _get_ensembl_exon(self, variant_dict, temp_ensembl_exon_list):
        for ensembl_exon in variant_dict['ensembl_exon']:
            temp_ensembl_exon_dict = {}
            if 'start' in ensembl_exon:
                temp_ensembl_exon_dict['start'] = ensembl_exon['start']
            if 'end' in ensembl_exon:
                temp_ensembl_exon_dict['end'] = ensembl_exon['end']
            if 'EXON_ID' in ensembl_exon:
                temp_ensembl_exon_dict['EXON_ID'] = ensembl_exon['EXON_ID']
            if 'ENST_ID' in ensembl_exon:
                temp_ensembl_exon_dict['enst_id'] = ensembl_exon['ENST_ID']
                # for support both new and old version
                temp_ensembl_exon_dict['ENST_ID'] = ensembl_exon['ENST_ID']
            if 'GENE_SYMBOL' in ensembl_exon:
                temp_ensembl_exon_dict['gene_symbol'] = ensembl_exon['GENE_SYMBOL']
            if 'reciprocalOverlap' in ensembl_exon:
                temp_ensembl_exon_dict['reciprocal_overlap'] = ensembl_exon['reciprocalOverlap']
                temp_ensembl_exon_dict['reciprocalOverlap'] = ensembl_exon['reciprocalOverlap']
            if 'annotationOverlap' in ensembl_exon:
                temp_ensembl_exon_dict['annotation_overlap'] = ensembl_exon['annotationOverlap']
                temp_ensembl_exon_dict['annotationOverlap'] = ensembl_exon['annotationOverlap']
            if 'IS_CODING' in ensembl_exon:
                temp_ensembl_exon_dict['is_coding'] = ensembl_exon['IS_CODING']       
                temp_ensembl_exon_dict['IS_CODING'] = ensembl_exon['IS_CODING']       
            if temp_ensembl_exon_dict != {}:
                temp_ensembl_exon_list.append(temp_ensembl_exon_dict)

    def _get_onekg_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        any_eas_af = False
        any_global_af = False
        any_eas_sur_af = False
        any_global_sur_af = False
        if '1kg_survtyper_DelDupIns' in variant_dict or '1kg_NYGC_30x' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            if '1kg_survtyper_DelDupIns' in variant_dict:
                af_source_dict['1kg_survtyper_DelDupIns'] = variant_dict['1kg_survtyper_DelDupIns']
            if '1kg_NYGC_30x' in variant_dict:
                af_source_dict['1kg_NYGC_30x'] = variant_dict['1kg_NYGC_30x']

            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    eas_af, all_af, eas_ns, all_ns = None, None, None, None
                    if 'start' in af_dict:
                        if sv_obj['type'] in ['INS', 'BND']:
                            temp_af_dict['source_start'] = af_dict['start'] - 1
                        else:
                            temp_af_dict['source_start'] = af_dict['start']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'SVTYPE' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['SVTYPE']
                    if 'SVLEN' in af_dict:
                        temp_af_dict['svLength'] = round(float(af_dict['SVLEN']), 2)
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    if 'AF_EAS2504' in af_dict:
                        eas_af = self._round_it(float(af_dict['AF_EAS2504']), 3)
                    if 'AF_grp2504' in af_dict:
                        all_af = self._round_it(float(af_dict['AF_grp2504']), 3)
                    if 'NS_EAS2504' in af_dict:
                        eas_ns = self._round_it(float(af_dict['NS_EAS2504']), 3)
                    if 'NS_grp2504' in af_dict:
                        all_ns = self._round_it(float(af_dict['NS_grp2504']), 3)

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            if key == '1kg_survtyper_DelDupIns':
                                temp_af_dict['source'] = "1KGP - East Asian"
                                temp_af_dict['source_filter'] = 'one_kg_eas'
                            else:
                                temp_af_dict['source'] = "1KGP - Survtyper - East Asian"
                                temp_af_dict['source_filter'] = 'one_kg_sur_eas'
                                
                            if eas_af and eas_af != "NA" and eas_ns >= self.MIN_SAMPLE_SIZE:
                                temp_af_dict['AF'] = eas_af if eas_af else -1
                                temp_af_dict['SAMPLE_COUNT'] = eas_ns
                                highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                if highest_af == temp_af_dict['AF']:
                                    highest_af_info['source'] = temp_af_dict['source']
                                if temp_af_dict['source'] == '1KGP - East Asian':
                                    any_eas_af = True
                                else:
                                    any_eas_sur_af = True
                                sv_af_list.append(temp_af_dict.copy())
                                
                            if key == '1kg_survtyper_DelDupIns':
                                temp_af_dict['source'] = "1KGP - Global"
                                temp_af_dict['source_filter'] = 'one_kg'
                            else:
                                temp_af_dict['source'] = "1KGP - Survtyper - Global"
                                temp_af_dict['source_filter'] = 'one_kg_sur'

                            if all_af and all_af != "NA" and all_ns >= self.MIN_SAMPLE_SIZE:
                                temp_af_dict['AF'] = all_af if all_af else -1
                                temp_af_dict['SAMPLE_COUNT'] = all_ns
                                highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                if highest_af == temp_af_dict['AF']:
                                    highest_af_info['source'] = temp_af_dict['source']
                                if temp_af_dict['source'] == '1KGP - Global':
                                    any_global_af = True
                                else:
                                    any_global_sur_af = True
                                sv_af_list.append(temp_af_dict.copy())
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)
        temp_af_dict = {}
        temp_af_dict['AF'] = -1

        
        if not any_eas_af:
            temp_af_dict['source'] = "1KGP - East Asian"
            temp_af_dict['source_filter'] = 'one_kg_eas'
            sv_af_list.append(temp_af_dict.copy())
        if not any_eas_sur_af:
            temp_af_dict['source'] = "1KGP - Survtyper - East Asian"
            temp_af_dict['source_filter'] = 'one_kg_sur_eas'
            sv_af_list.append(temp_af_dict.copy())
        if not any_global_af:
            temp_af_dict['source'] = "1KGP - Global"
            temp_af_dict['source_filter'] = 'one_kg'
            sv_af_list.append(temp_af_dict.copy())
        if not any_global_sur_af:
            temp_af_dict['source'] = "1KGP - Survtyper - Global"
            temp_af_dict['source_filter'] = 'one_kg_sur'
            sv_af_list.append(temp_af_dict.copy())

        return highest_af

    def _get_gnomad_v2_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        temp_global_af_dict = {}
        for each_af in self.GNOMAD_V2_AF_KEY_MAP.keys():
            temp_global_af_dict['v2' + each_af] = -1
        if 'gnomAD-preview' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            if 'gnomAD-preview' in variant_dict:
                af_source_dict['gnomAD-preview'] = variant_dict['gnomAD-preview']
            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    temp_af_an_dict = {}
                    if 'begin' in af_dict:
                        temp_af_dict['source_start'] = af_dict['begin']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'variantType' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['variantType']
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    
                    if 'variantId' in af_dict:
                        for field_name in self.GNOMAD_V2_AF_USED_FIELDS:
                            if field_name in af_dict:
                                temp_af_an_dict[field_name] = self._round_it(float(af_dict[field_name]), 3)

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            if 'source_end' in temp_af_dict and temp_af_dict['source_end'] and temp_af_dict['source_start']:
                                if temp_af_dict['source_start'] > temp_af_dict['source_end']:
                                    temp_af_dict['source_start'] = temp_af_dict['source_start'] - 1
                                if temp_af_dict['source_end'] > temp_af_dict['source_start']:
                                    temp_af_dict['source_end'] = temp_af_dict['source_end'] - 1
                            
                            if sv_obj['type'] == 'INS':
                                temp_af_dict['svLength'] = 0
                            else:
                                temp_af_dict['svLength'] = temp_af_dict['source_end'] - temp_af_dict['source_start'] + 1

                            temp_key_map = self.GNOMAD_V2_AF_KEY_MAP
                            for each_af in temp_key_map.keys():
                                temp_af_dict['source'] = temp_key_map[each_af]['name']
                                hit_Af_gnomad = True
                                temp_af_dict['AF'] = temp_af_an_dict[each_af] if temp_af_an_dict[each_af] else -1
                                temp_af_dict['SAMPLE_COUNT'] = temp_af_an_dict[temp_key_map[each_af]['an']]
                                temp_global_af_dict['v2' + each_af] = self._get_max_number(temp_af_an_dict[each_af], temp_global_af_dict['v2' + each_af])
                                if each_af == 'allAf' or each_af == 'easAf':
                                    highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                    if highest_af == temp_af_dict['AF']:
                                        highest_af_info = {}
                                        highest_af_info['source'] = temp_af_dict['source']
                                sv_af_list.append(temp_af_dict.copy())
                            hit_Af = True
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)

        # set the no value af to -1 for searching
        sv_obj["gnomadv2_sv_af"] = temp_global_af_dict['v2allAf']
        sv_obj["gnomadv2_sv_afr_af"] = temp_global_af_dict['v2afrAf']
        sv_obj["gnomadv2_sv_amr_af"] = temp_global_af_dict['v2amrAf']
        sv_obj["gnomadv2_sv_eas_af"] = temp_global_af_dict['v2easAf']
        sv_obj["gnomadv2_sv_eur_af"] = temp_global_af_dict['v2eurAf']
        sv_obj["gnomadv2_sv_oth_af"] = temp_global_af_dict['v2othAf']
        return highest_af

    def _get_gnomad_v4_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        temp_global_af_dict = {}
        for each_af in self.GNOMAD_V4_AF_KEY_MAP.keys():
            temp_global_af_dict['v4' + each_af] = -1
        if 'gnomad' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            af_source_dict['gnomad'] = variant_dict['gnomad']
            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    failed_filter = False
                    temp_af_an_dict = {}
                    if 'begin' in af_dict:
                        temp_af_dict['source_start'] = af_dict['begin']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'variantType' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['variantType']
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    if 'failedFilter' in af_dict:
                        failed_filter = af_dict['failedFilter']
                        if not isinstance(failed_filter, bool):
                            if failed_filter == 'true':
                                failed_filter = True
                    if 'variantId' in af_dict:
                        for field_name in self.GNOMAD_V4_AF_USED_FIELDS:
                            if field_name in af_dict:
                                temp_af_an_dict[field_name] = self._round_it(float(af_dict[field_name]), 3)
                    
                    if failed_filter:
                        continue

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            if 'source_end' in temp_af_dict and temp_af_dict['source_end'] and temp_af_dict['source_start']:
                                if temp_af_dict['source_start'] > temp_af_dict['source_end']:
                                    temp_af_dict['source_start'] = temp_af_dict['source_start'] - 1
                                if temp_af_dict['source_end'] > temp_af_dict['source_start']:
                                    temp_af_dict['source_end'] = temp_af_dict['source_end'] - 1
                            
                            if sv_obj['type'] == 'INS':
                                temp_af_dict['svLength'] = 0
                            else:
                                temp_af_dict['svLength'] = temp_af_dict['source_end'] - temp_af_dict['source_start'] + 1

                            temp_key_map = self.GNOMAD_V4_AF_KEY_MAP 
                            for each_af in temp_key_map.keys():
                                temp_af_dict['source'] = temp_key_map[each_af]['name']
                                hit_Af_gnomad = True
                                temp_af_dict['AF'] = temp_af_an_dict[each_af] if temp_af_an_dict[each_af] else -1
                                temp_af_dict['SAMPLE_COUNT'] = temp_af_an_dict[temp_key_map[each_af]['an']]
                                temp_global_af_dict['v4' + each_af] = self._get_max_number(temp_af_an_dict[each_af], temp_global_af_dict['v4' + each_af])
                                if each_af == 'allAf' or each_af == 'easAf':
                                    highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                    if highest_af == temp_af_dict['AF']:
                                        highest_af_info = {}
                                        highest_af_info['source'] = temp_af_dict['source']
                                sv_af_list.append(temp_af_dict.copy())
                            hit_Af = True
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)

        # set the no value af to -1 for searching
        sv_obj["gnomadv4_sv_af"] = temp_global_af_dict['v4allAf']
        sv_obj["gnomadv4_sv_afr_af"] = temp_global_af_dict['v4afrAf']
        sv_obj["gnomadv4_sv_ami_af"] = temp_global_af_dict['v4amiAf']
        sv_obj["gnomadv4_sv_amr_af"] = temp_global_af_dict['v4amrAf']
        sv_obj["gnomadv4_sv_asj_af"] = temp_global_af_dict['v4asjAf']
        sv_obj["gnomadv4_sv_eas_af"] = temp_global_af_dict['v4easAf']
        sv_obj["gnomadv4_sv_mid_af"] = temp_global_af_dict['v4midAf']
        sv_obj["gnomadv4_sv_fin_af"] = temp_global_af_dict['v4finAf']
        sv_obj["gnomadv4_sv_nfe_af"] = temp_global_af_dict['v4nfeAf']
        sv_obj["gnomadv4_sv_oth_af"] = temp_global_af_dict['v4othAf']
        sv_obj["gnomadv4_sv_sas_af"] = temp_global_af_dict['v4sasAf']
        
        return highest_af

    def _get_dgv_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        any_inner = False
        any_outer = False
        if 'Dgv_gold_inner' in variant_dict or 'Dgv_gold_outer' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            if 'Dgv_gold_inner' in variant_dict:
                af_source_dict['Dgv_gold_inner'] = variant_dict['Dgv_gold_inner']
            if 'Dgv_gold_outer' in variant_dict:
                af_source_dict['Dgv_gold_outer'] = variant_dict['Dgv_gold_outer']

            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    if 'start' in af_dict:
                        temp_af_dict['source_start'] = af_dict['start']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'variant_sub_type' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['variant_sub_type']
                    if 'SVLEN' in af_dict:
                        temp_af_dict['svLength'] = round(float(af_dict['SVLEN']), 2)
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    if 'Frequency' in af_dict:
                        af = self._round_it(float(af_dict['Frequency'].replace('%',''))/100, 3)
                    if 'num_samples' in af_dict:
                        temp_af_dict['SAMPLE_COUNT'] = self._get_str_value(af_dict['num_samples'])

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            temp_af_dict['svLength'] = temp_af_dict['source_end'] - temp_af_dict['source_start'] + 1
                            
                            if key == 'Dgv_gold_inner':
                                temp_af_dict['source'] = 'DGV Gold (inner)'
                                temp_af_dict['source_filter'] = 'dgv_gold_inner'
                                any_inner = True
                            elif key == 'Dgv_gold_outer':
                                temp_af_dict['source'] = 'DGV Gold (outer)'
                                temp_af_dict['source_filter'] = 'dgv_gold_outer'
                                any_outer = True
                                
                            temp_af_dict['AF'] = af if af else -1
                            highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                            if highest_af == temp_af_dict['AF']:
                                highest_af_info['source'] = temp_af_dict['source']
                            sv_af_list.append(temp_af_dict.copy())
                            
                            hit_Af_dgv = True
                            hit_Af = True
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)
        temp_af_dict = {}
        temp_af_dict['AF'] = -1

        if not any_inner:
            temp_af_dict['source'] = 'DGV Gold (inner)'
            temp_af_dict['source_filter'] = 'dgv_gold_inner'
            sv_af_list.append(temp_af_dict.copy())
        if not any_outer:
            temp_af_dict['source'] = 'DGV Gold (outer)'
            temp_af_dict['source_filter'] = 'dgv_gold_outer'
            sv_af_list.append(temp_af_dict.copy())

        return highest_af    

    def _get_han_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        any_eas_af = False
        han_highest_af = -1
        if '945_han_af' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            af_source_dict['945_han_af'] = variant_dict['945_han_af']

            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    eas_af, eas_ns = None, None
                    if 'start' in af_dict:
                        if sv_obj['type'] in ['INS', 'BND']:
                            temp_af_dict['source_start'] = af_dict['start'] - 1
                        else:
                            temp_af_dict['source_start'] = af_dict['start']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'SVTYPE' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['SVTYPE']
                    if 'SVLEN' in af_dict:
                        temp_af_dict['svLength'] = round(float(af_dict['SVLEN']), 2)
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    if 'AF' in af_dict:
                        eas_af = self._round_it(float(af_dict['AF']), 3)
                    if 'NS' in af_dict:
                        eas_ns = self._round_it(float(af_dict['NS']), 3)

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            temp_af_dict['source'] = "945 Han"
                            temp_af_dict['source_filter'] = 'han_945'

                            if eas_af and eas_af != "NA":
                                temp_af_dict['AF'] = eas_af if eas_af else -1
                                temp_af_dict['SAMPLE_COUNT'] = eas_ns
                                highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                if highest_af == temp_af_dict['AF']:
                                    highest_af_info['source'] = temp_af_dict['source']
                                any_eas_af = True
                                han_highest_af = self._get_max_number(temp_af_dict['AF'], han_highest_af)
                                sv_af_list.append(temp_af_dict.copy())
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)
                            
        temp_af_dict = {}
        temp_af_dict['AF'] = -1
        
        if not any_eas_af:
            temp_af_dict['source'] = "945 Han"
            temp_af_dict['source_filter'] = 'han_945'
            sv_af_list.append(temp_af_dict.copy())

        sv_obj["han_sv_af"] = han_highest_af

        return highest_af

    def _get_colors_sv_af(self, sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info):
        any_eas_af = False
        han_highest_af = -1
        if 'colors_db_af' in variant_dict:
            temp_af_dict = {}
            af_source_dict = {}
            af_source_dict['colors_sv_af'] = variant_dict['colors_db_af']

            for key in af_source_dict:
                af_source_list = af_source_dict[key]
                for af_dict in af_source_list:
                    anno_overlap, reci_overlap = -1.0, -1.0
                    eas_af, eas_ns = None, None
                    if 'start' in af_dict:
                        if sv_obj['type'] in ['INS', 'BND']:
                            temp_af_dict['source_start'] = af_dict['start'] - 1
                        else:
                            temp_af_dict['source_start'] = af_dict['start']
                    if 'end' in af_dict:
                        temp_af_dict['source_end'] = af_dict['end']
                    if 'SVTYPE' in af_dict:
                        temp_af_dict['source_svType'] = af_dict['SVTYPE']
                    if 'SVLEN' in af_dict:
                        temp_af_dict['svLength'] = round(float(af_dict['SVLEN']), 2)
                    if 'annotationOverlap' in af_dict:
                        anno_overlap = float(af_dict['annotationOverlap'])
                        temp_af_dict['annoOverlap'] = self._round_it(anno_overlap, 3)
                    if 'reciprocalOverlap' in af_dict:
                        reci_overlap = float(af_dict['reciprocalOverlap'])
                        temp_af_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                    if 'AF' in af_dict:
                        eas_af = self._round_it(float(af_dict['AF']), 3)
                    if 'NS' in af_dict:
                        eas_ns = self._round_it(float(af_dict['NS']), 3)

                    if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_af_dict['source_svType'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                        if (sv_obj['type'] in self.CHECK_OVERLAP_TYPE and anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                            temp_af_dict['source'] = "Consortium of Long Read Sequencing Database"
                            temp_af_dict['source_filter'] = 'colors_sv'

                            if eas_af and eas_af != "NA":
                                temp_af_dict['AF'] = eas_af if eas_af else -1
                                temp_af_dict['SAMPLE_COUNT'] = eas_ns
                                highest_af = self._get_max_number(temp_af_dict['AF'], highest_af)
                                if highest_af == temp_af_dict['AF']:
                                    highest_af_info['source'] = temp_af_dict['source']
                                any_eas_af = True
                                han_highest_af = self._get_max_number(temp_af_dict['AF'], han_highest_af)
                                sv_af_list.append(temp_af_dict.copy())
                    elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                        print("Unrecognized SV type for AF check: ", sv_obj['type'], file=sys.stderr)
                            
        temp_af_dict = {}
        temp_af_dict['AF'] = -1
        
        if not any_eas_af:
            temp_af_dict['source'] = "Consortium of Long Read Sequencing Database"
            temp_af_dict['source_filter'] = 'colors_sv'
            sv_af_list.append(temp_af_dict.copy())

        sv_obj["colors_sv_af"] = han_highest_af

        return highest_af


    def _get_afs(self, sv_obj, variant_dict):
        highest_af = -1
        highest_af_info = {}
        sv_af_list = []
        # Search for Hit on AF
        # 1. 1KG (called with Survtyper) and 1KG
        highest_af = self._get_onekg_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)
        # 2. gnomAD
        highest_af = self._get_gnomad_v2_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)
        highest_af = self._get_gnomad_v4_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)
        # 3. DGV inner and outer
        highest_af = self._get_dgv_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)
        # 4. 945 Han
        highest_af = self._get_han_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)
        # 5. CoLoRSdb (as currently we are only using normal samples as AF, which CoLoRSdb contain non normal samples, we will skip this for now)
        # highest_af = self._get_colors_sv_af(sv_obj, variant_dict, sv_af_list, highest_af, highest_af_info)

        # Sort afs by descending (annoOverlap + reciOverlap) sum, then take top 500
        if sv_af_list and len(sv_af_list) > 500:
            sv_af_list.sort(key=lambda af: (af.get('annoOverlap', 0) + af.get('reciOverlap', 0)), reverse=True)
            sv_af_list = sv_af_list[:500]

        sv_obj['afs'] = sv_af_list
        sv_obj['highest_af'] = highest_af
        sv_obj['highest_af_info'] = highest_af_info

    def _get_clinvar(self, sv_obj, variant_dict, sv_intpn_list, patho_label_list, hit_reported_sv):
        temp_clinvar_objs = []
        if 'clinvar_custom' in variant_dict:
            for intpn_dict in variant_dict['clinvar_custom']:
                temp_intpn_dict = {}
                clinvar_sig = []
                if 'start' in intpn_dict:
                    temp_intpn_dict['start'] = intpn_dict['start']
                if 'end' in intpn_dict:
                    temp_intpn_dict['end'] = intpn_dict['end']
                if 'Type' in intpn_dict:
                    temp_intpn_dict['Type'] = intpn_dict['Type']
                # also not too sure why is store in list...
                if 'ClinicalSignificance' in intpn_dict and intpn_dict['ClinicalSignificance'] != None:
                    clinvar_sig.append(intpn_dict['ClinicalSignificance'])
                    temp_intpn_dict['ClinicalSignificance'] = intpn_dict['ClinicalSignificance']
                if 'RCVaccession' in intpn_dict:
                    temp_intpn_dict['rc_vaccession'] = intpn_dict['RCVaccession']
                if 'ReviewStatus' in intpn_dict:
                    temp_intpn_dict['review_status'] = intpn_dict['ReviewStatus']
                if 'VariationID' in intpn_dict:
                    temp_intpn_dict['variation_id'] = intpn_dict['VariationID']
                if 'reciprocalOverlap' in intpn_dict:
                    temp_intpn_dict['reciprocal_overlap'] = intpn_dict['reciprocalOverlap']
                if 'annotationOverlap' in intpn_dict:
                    temp_intpn_dict['annotation_overlap'] = intpn_dict['annotationOverlap']
                
                if sv_obj['type'] in self.UNIVAR_SVTYPE_LOOKUP and temp_intpn_dict['Type'].lower() in self.UNIVAR_SVTYPE_LOOKUP[sv_obj['type']]:
                    if ('annotation_overlap' in temp_intpn_dict and  temp_intpn_dict['annotation_overlap'] >= self.AF_ANNO_OVERLAP_FILTER and 'reciprocal_overlap' in temp_intpn_dict and temp_intpn_dict['reciprocal_overlap'] >= self.AF_RECI_OVERLAP_FILTER) or sv_obj['type'] not in self.CHECK_OVERLAP_TYPE:
                        temp_intpn_dict['source'] = 'ClinVar'
                        temp_intpn_dict['interpretation'] = ','.join(clinvar_sig)

                        if 'ClinicalSignificance' in temp_intpn_dict:
                            if temp_intpn_dict['ClinicalSignificance'].startswith('Pathogenic') and 'Likely pathogenic' not in temp_intpn_dict['ClinicalSignificance']:
                                temp_intpn_dict['clinical_score'] = 0
                            elif temp_intpn_dict['ClinicalSignificance'].startswith('Pathogenic') and 'Likely pathogenic' in temp_intpn_dict['ClinicalSignificance']:
                                temp_intpn_dict['clinical_score'] = 1
                            elif 'Likely pathogenic' in temp_intpn_dict['ClinicalSignificance'] and not temp_intpn_dict['ClinicalSignificance'].startswith('Pathogenic'):
                                temp_intpn_dict['clinical_score'] = 2
                            elif 'Likely benign' in temp_intpn_dict['ClinicalSignificance'] and not temp_intpn_dict['ClinicalSignificance'].startswith('Benign'):
                                temp_intpn_dict['clinical_score'] = 3
                            elif 'Likely benign' in temp_intpn_dict['ClinicalSignificance'] and temp_intpn_dict['ClinicalSignificance'].startswith('Benign'):
                                temp_intpn_dict['clinical_score'] = 4
                            elif temp_intpn_dict['ClinicalSignificance'].startswith('Benign') and 'Likely benign' not in temp_intpn_dict['ClinicalSignificance']:
                                temp_intpn_dict['clinical_score'] = 5
                            else:
                                temp_intpn_dict['clinical_score'] = 6
                        else:
                            temp_intpn_dict['clinical_score'] = 6

                        sv_intpn_list.append(temp_intpn_dict.copy())          
                        temp_clinvar_objs.append(temp_intpn_dict.copy())   

                        for y in clinvar_sig:
                            if y.lower() in ['pathogenic', 'likely pathogenic', 'pathogenic/Likely pathogenic', 'likely pathogenic; risk factor', 'pathogenic; risk factor']:
                                patho_label_list.append('pathogenic')
                            elif y.lower() in ['benign', 'likely benign', 'benign/likely benign']:
                                patho_label_list.append('benign')
                            else:
                                patho_label_list.append('others')
                        
                        hit_reported_sv = True
                elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                    print("Unrecognized SV type for ClinVar check: ", sv_obj['type'], file=sys.stderr)

        if temp_clinvar_objs and len(temp_clinvar_objs) > 0:
            temp_clinvar_objs.sort(key=lambda clinvar:clinvar['clinical_score'], reverse= False)
            temp_clinvar_obj =  temp_clinvar_objs[0]
            if 'review_status' in temp_clinvar_obj:
                sv_obj['clnrevstat'] = temp_clinvar_obj['review_status']
            if 'ClinicalSignificance' in temp_clinvar_obj:
                sv_obj['clnsig'] =  temp_clinvar_obj['ClinicalSignificance']
            if 'variation_id' in temp_clinvar_obj:
                sv_obj['clnid'] = temp_clinvar_obj['variation_id']
            if 'Type' in temp_clinvar_obj:
                sv_obj['clnvc'] = temp_clinvar_obj['Type']

        return hit_reported_sv
    
    def _get_decipher(self, sv_obj, variant_dict, sv_ext_var_list, hit_reported_sv):
        if 'decipher' in variant_dict:
            for decipher_dict in variant_dict['decipher']:
                temp_ext_var_dict = {}
                anno_overlap, reci_overlap, num_deletions, num_duplications = 0, 0, 0, 0
                if 'begin' in decipher_dict:
                    temp_ext_var_dict['source_start'] = decipher_dict['begin']
                if 'end' in decipher_dict:
                    temp_ext_var_dict['source_end'] = decipher_dict['end']
                if 'annotationOverlap' in decipher_dict:
                    anno_overlap = float(decipher_dict['annotationOverlap'])
                    temp_ext_var_dict['annoOverlap'] = self._round_it(anno_overlap, 3) 
                if 'reciprocalOverlap' in decipher_dict:
                    reci_overlap = float(decipher_dict['reciprocalOverlap'])
                    temp_ext_var_dict['reciOverlap'] = self._round_it(reci_overlap, 3)
                if 'numDeletions' in decipher_dict:
                    num_deletions = float(decipher_dict['numDeletions'])
                if 'numDuplications' in decipher_dict:
                    num_duplications = float(decipher_dict['numDuplications'])

                if sv_obj['type'] in self.NO_CHECK_OVERLAP_TYPE or (anno_overlap >= self.AF_ANNO_OVERLAP_FILTER and reci_overlap >= self.AF_RECI_OVERLAP_FILTER):
                    if (sv_obj['type'] == 'DEL' and num_deletions > 0) or (sv_obj['type'] in ["DUP", "INS"] and num_duplications > 0) or sv_obj['type'] in self.NO_CHECK_OVERLAP_TYPE or sv_obj['type'] in ["INV"]:
                        temp_ext_var_dict['source'] = 'DECIPHER'
                        temp_ext_var_dict['svLength'] = temp_ext_var_dict['source_end'] - temp_ext_var_dict['source_start'] + 1   
                        sv_ext_var_list.append(temp_ext_var_dict.copy())         
                        
                        hit_reported_sv = True
                elif sv_obj['type'] not in self.UNIVAR_SVTYPE_LOOKUP:
                    print("Unrecognized SV type for ClinVar check: ", sv_obj['type'], file=sys.stderr)

        return hit_reported_sv

    def _get_hit_reported(self, sv_obj, variant_dict):
        sv_intpn_list, sv_ext_var_list, patho_label_list = [], [], []
        hit_reported_sv = False
        # Search for Hit on reported SV
        # 1. ClinVar
        hit_reported_sv = self._get_clinvar(sv_obj, variant_dict, sv_intpn_list, patho_label_list, hit_reported_sv)
        # 2. DECIPHER
        hit_reported_sv = self._get_decipher(sv_obj, variant_dict, sv_ext_var_list, hit_reported_sv)
        sv_obj['is_pathogenic'] = hit_reported_sv
        sv_obj['exts'] = sv_ext_var_list
        sv_obj['intpns'] = sv_intpn_list

    def _get_exons_list(self, database, exons):
        transcript_list = [exon['enst_id'].split('.')[0] for exon in exons]
        genes = database.find(self.MONGO_DB_GENE_DATABASE_NAME, self.MONGO_DB_GENE_COLLECTION_NAME, { 'version' : self.gene_db_version, 'transcript_stable_id': { "$in": transcript_list } })
        gene_dict =  {gene['transcript_stable_id']:gene for gene in genes}
        for exon in exons:
            part_of_transcript = exon['enst_id'].split('.')[0]
            if part_of_transcript in gene_dict:
                gene = gene_dict[part_of_transcript]
                if 'gene_symbol' in gene and gene['gene_symbol']:
                    exon['GENE_SYMBOL'] = gene['gene_symbol']
                if 'gene_stable_id' in gene and gene['gene_stable_id']:
                    exon['gene_stable_id'] = gene['gene_stable_id']
                


    def _get_gene_obj_list(self, database, result_list, orig_transcript_list, transcript_dict, all_gene, default_gene_dict, no_default_gene_dict, sv_obj, is_related):
        genes = database.find(self.MONGO_DB_GENE_DATABASE_NAME, self.MONGO_DB_GENE_COLLECTION_NAME, { 'version' : self.gene_db_version, 'ensembl_transcript_id': { "$in": orig_transcript_list } })
        gene_dict =  {gene['transcript_stable_id']:gene for gene in genes}
        for orig_transcript in orig_transcript_list:
            part_of_transcript = orig_transcript.split('.')[0]
            if part_of_transcript in gene_dict:
                result_list.append(self._gene_database2gene_obj(gene_dict[part_of_transcript], is_related, orig_transcript, transcript_dict, all_gene, default_gene_dict, no_default_gene_dict, sv_obj))
    
    def _gene_database2gene_obj(self, gene, is_related, orig_transcript, transcript_dict, all_gene, default_gene_dict, no_default_gene_dict, sv_obj):
        gene_obj = { 'is_related': is_related }
        gene_obj['transcript'] = orig_transcript
        default_show = False
        if 'gene_symbol' in gene and gene['gene_symbol']:
            gene_obj['gene'] = gene['gene_symbol']
            gene_obj['gene_filter'] = gene['gene_symbol'].upper()
        if 'entrez' in gene and gene['entrez']:
            gene_obj['entrez_gene_id'] = gene['entrez']
        if 'gene_stable_id' in gene and gene['gene_stable_id']:
            gene_obj['ensembl_gene_id'] = gene['gene_stable_id']
        if 'p_haplo' in gene and gene['p_haplo']:
            gene_obj['p_haplo'] = gene['p_haplo']
        if 'p_triplo' in gene and gene['p_triplo']:
            gene_obj['p_triplo'] = gene['p_triplo']
        if 'clingen_hi' in gene and gene['clingen_hi']:
            gene_obj['clingen_hi'] = gene['clingen_hi']
            gene_obj['clingen_hi_order'] = self.CLINGEN_HI_MAPPING[gene['clingen_hi']]
        if 'clingen_ts' in gene and gene['clingen_ts']:
            gene_obj['clingen_ts'] = gene['clingen_ts']
        if 'strand' in gene and gene['strand']:
            gene_obj['strand'] = gene['strand']
        if 'is_canonical' in gene and gene['is_canonical']:
            gene_obj['is_canonical'] = gene['is_canonical']
            default_show = True
            # sv_obj['is_canonical'] = True
        if 'is_mane_select' in gene and gene['is_mane_select']:
            gene_obj['is_mane_select'] = gene['is_mane_select']
            default_show = True
            if 'ncbi_id' in gene and gene['ncbi_id']:
                if 'mane_select' in sv_obj and gene['ncbi_id'] not in sv_obj['mane_select']:
                    gene_obj['mane_select'] += ',' + gene['ncbi_id']
                elif 'mane_select' not in sv_obj:
                    gene_obj['mane_select'] = gene['ncbi_id']
                    
            elif 'ncbi_ids' in gene and gene['ncbi_ids']:
                for ncbi_id in gene['ncbi_ids']:
                    if 'mane_select' in sv_obj and ncbi_id not in sv_obj['mane_select']:
                        gene_obj['mane_select'] += ',' + ncbi_id
                    elif 'mane_select' not in sv_obj:
                        gene_obj['mane_select'] = ncbi_id
            else:
                sys.stdout.write("missing ncbi_id: %s \n" % orig_transcript)
        else:
            gene_obj['is_mane_select'] = False
            if 'ncbi_ids' in gene and gene['ncbi_ids']:
                gene_obj['ncbi_ids'] = gene['ncbi_ids']
        if 'is_mane_plus_clinical' in gene and gene['is_mane_plus_clinical']:
            gene_obj['is_mane_plus_clinical'] = gene['is_mane_plus_clinical']
            default_show = True
            if 'ncbi_id' in gene and gene['ncbi_id']:
                if 'mane_plus_clinical' in gene_obj and gene['ncbi_id'] not in gene_obj['mane_plus_clinical']:
                    gene_obj['mane_plus_clinical'] += ',' + gene['ncbi_id']
                else:
                    gene_obj['mane_plus_clinical'] = gene['ncbi_id']
            elif 'ncbi_ids' in gene and gene['ncbi_ids']:
                for ncbi_id in gene['ncbi_ids']:
                    if 'mane_plus_clinical' in gene_obj and ncbi_id not in gene_obj['mane_plus_clinical']:
                        gene_obj['mane_plus_clinical'] += ',' + ncbi_id
                    elif 'mane_plus_clinical' not in gene_obj:
                        gene_obj['mane_plus_clinical'] = ncbi_id
            else:
                sys.stdout.write("missing ncbi_id: %s \n" % orig_transcript)
        if gene_obj['transcript'] in transcript_dict:
            if 'annotation_overlap' in transcript_dict[gene_obj['transcript']]:
                gene_obj['annotation_overlap'] = transcript_dict[gene_obj['transcript']]['annotation_overlap']
            if 'reciprocal_overlap' in transcript_dict[gene_obj['transcript']]:
                gene_obj['reciprocal_overlap'] = transcript_dict[gene_obj['transcript']]['reciprocal_overlap']
            if 'start' in transcript_dict[gene_obj['transcript']]:
                gene_obj['bkpt_start'] = transcript_dict[gene_obj['transcript']]['start']
            if 'end' in transcript_dict[gene_obj['transcript']]:
                gene_obj['bkpt_end'] = transcript_dict[gene_obj['transcript']]['end']
            if 'strand' in transcript_dict[gene_obj['transcript']]:
                gene_obj['strand'] = transcript_dict[gene_obj['transcript']]['strand']
        if 'ensembl_gene_id' in gene_obj and gene_obj['ensembl_gene_id']:
            all_gene.add(gene_obj['ensembl_gene_id'])
            if default_show:
                gene_obj['default_show'] = True
                default_gene_dict[gene_obj['ensembl_gene_id']] = gene_obj
            else:
                no_default_gene_dict[gene_obj['ensembl_gene_id']] = gene_obj


        if default_show:
            for database_name in self.GENE_DATABASE_CONSTRAINT_COLUMNS:
                if database_name in gene and gene[database_name]:
                    sv_obj[database_name].add(gene[database_name])
                    gene_obj[database_name] = gene[database_name]

        return gene_obj
    
    
    def recur_find_bnd(self, sv_obj_list, bnd_variant, orig_related_variants):
        alt = bnd_variant['alt']
        separator = ']' if ']' in alt else '['
        alt_list = alt.split(separator)
        
        for position in alt_list:
            if ':' in position:
                chrom, start = position.split(':')[:2]
                start = int(start)
                temp_sv_id = {orig_related_variant['sv_id'] for orig_related_variant in orig_related_variants}
                related_variants = [sv for sv in sv_obj_list if sv['chrom'] == chrom and start - self.BND_RELATED_THRESHOLD <= sv['start'] <= start + self.BND_RELATED_THRESHOLD and sv['sv_id'] not in temp_sv_id]
                
                if related_variants:
                    orig_related_variants.extend(related_variants)
                    
                    for related_variant in related_variants:
                        if related_variant['type'] == 'BND':
                            new_related_variants = orig_related_variants.copy()
                            unique_new_related_variants = [bnd_variant] + [new_related_variant for new_related_variant in new_related_variants if new_related_variant['sv_id'] != bnd_variant['sv_id']]
                            orig_related_variants.extend(self.recur_find_bnd(sv_obj_list, related_variant.copy(), unique_new_related_variants))
        
        unique_results = [orig_related_variant for orig_related_variant in orig_related_variants if orig_related_variant['sv_id'] != bnd_variant['sv_id']]
        return unique_results

    
    def append_related_variant(self, target_sv, related_variants, database):
        temp_related_variants = target_sv.get('related_variants', [])
        
        for related_variant in related_variants:
            if related_variant['sv_id'] != target_sv['sv_id']:
                related_variant_to_stored = {k: v for k, v in related_variant.items() if k not in ['related_variants', 'afs', 'gt_types', 'exts', 'intpns', 'exons', 'constraint_pli', 'constraint_pli_v2', 'constraint_pli_v4', 'gnomad_eas_af', 'gnomad_af']}
                
                if related_variant_to_stored not in temp_related_variants:
                    temp_related_variants.append(related_variant_to_stored)
        
        database.update_one(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, {'sv_id': target_sv['sv_id']}, {'$set': {'related_variants': temp_related_variants}})
        target_sv['related_variants'] = temp_related_variants
    
    # bioinformatic related
    def _filter_is_coding(self, input_list):
        isCoding_list = []
        for i in input_list:
            if i['is_coding'] == 1:
                isCoding_list.append(i)
        return isCoding_list
    
    def _full_overlap(self, sv_type, input_list):
        overlap_list = []
        if sv_type in self.CHECK_OVERLAP_TYPE:
            for i in input_list:
                if not 'annotation_overlap' in i.keys() or i['annotation_overlap'] == 1:
                    overlap_list.append(i['enst_id'])
        return overlap_list
    
    def _check_if_overlap(self, left_bkpt,right_bkpt,input_list):
        in_range = []
        for i in input_list:
            element_start = float(i['start'])
            element_end = float(i['end'])
            
            if (left_bkpt >= element_start and right_bkpt <= element_end) or (left_bkpt >= element_start and left_bkpt <= element_end) or (right_bkpt >= element_start and right_bkpt <= element_end) or (left_bkpt < element_start and right_bkpt > element_end):
                in_range.append(i)

        return in_range


    def _check_bkpt_overlap(self, target_list,bkpt, transcript_list, low_transcript_list, transcript_dict, is_transcript):
        hits = []
        bkpt = float(bkpt)
        
        target_list = copy.deepcopy(target_list) # Only remove overlap fields in copy, not reference
        for t in target_list:
            start = float(t['start'])
            end = float(t['end'])
            transcript_dict[t['enst_id']] = t.copy()
            if(bkpt >= start and bkpt <= end):
                t.pop('annotation_overlap', None)
                t.pop('reciprocal_overlap', None)
                hits.append(t)
                if is_transcript:
                    transcript_list.append(t['enst_id'])
                else:
                    # exon storing the whole obj
                    transcript_list.append(t)
                    
            else:
                low_transcript_list.append(t['enst_id'])
                
        return hits
    
    def _check_p_lof(self, svtype, left_bkpt, right_bkpt, left_bkpt_element, right_bkpt_element, ensembl_exon, ensembl_gene):
        coding_exon = self._filter_is_coding(ensembl_exon)
        cds = self._get_list_of_values(coding_exon,'enst_id')
        
        full_gene_overlap = self._full_overlap(svtype,ensembl_gene)
        full_cds_overlap = self._full_overlap(svtype,coding_exon)
        
        l_cds = self._get_list_of_values(self._filter_is_coding(left_bkpt_element['ensembl_exon']),'enst_id')
        r_cds = self._get_list_of_values(self._filter_is_coding(right_bkpt_element['ensembl_exon']),'enst_id')
        common_cds = np.intersect1d(l_cds, r_cds)
        
        l_gene = self._get_list_of_values(left_bkpt_element['ensembl_gene'],'enst_id')
        r_gene = self._get_list_of_values(right_bkpt_element['ensembl_gene'],'enst_id')
        common_gene = np.intersect1d(l_gene, r_gene)
        
        plof = 'False'
        
        # Any overlap with any coding exon
        if svtype == 'DEL' and len(cds) > 0:
            plof = "LOF"
        elif svtype == 'DUP' or svtype == 'DUP:TANDEM':
            # Both bkpts in coding exons of the same gene
            if len(common_cds) > 0:
                plof = "LOF"    
            # Overlaps at least one exon and both bkpts within gene
            elif len(common_gene) > 0 and len(np.intersect1d(common_gene, full_cds_overlap)) > 0:
                plof = "DUP_LOF"
            elif len(common_gene) == 0 and len(full_gene_overlap) > 0:
                plof = "COPY_GAIN"
        # Inserted into any coding exon
        elif svtype == 'INS' and len(self._check_if_overlap(left_bkpt,right_bkpt,coding_exon)) > 0:
            plof = "LOF"
        elif svtype == 'INV':
            # Exactly one breakpoint in a gene (exon or intron) and the other breakpoint is outside of the same gene + 
            # overlap cds of that gene
            
            # OR any inversion where both breakpoints are contained within the same gene +
            # overlap at least one coding exon from that gene
            if ((len(l_gene) > 0 or len(r_gene) > 0) and len(common_gene) == 0 and (len(np.intersect1d(l_gene, cds)) > 0 or len(np.intersect1d(r_gene, cds)) > 0)) or (len(l_gene) > 0 and len(r_gene) > 0 and len(common_gene) > 0 and (len(np.intersect1d(l_gene, cds)) > 0 or len(np.intersect1d(r_gene, cds)) > 0)):    
                plof = "LOF"
            # Both bkpts outside gene and inversion spans whole gene
            elif len(common_gene) == 0 and len(full_gene_overlap) > 0:
                plof = "INV_SPAN" 
        elif svtype in self.COMPLEX_SVTYPE:
            plof = "N/A"

        return plof
    

    def _get_type(self, alt, ref):
        result = 'unknown'
        if self.is_snp(alt, ref):
            result = 'snp'
        elif self.is_indel(alt, ref):
            result = 'indel'
        return result
    
    def is_snp(self, alt, ref):
        if len(ref) > 1 and len(alt) > 1: return False
        if alt not in ['A', 'T', 'C', 'G']:
            return False
        return True

    def is_indel(self, alt, ref):
        if len(ref) > 1: return True

        for i in range(0, len(alt)):
            if alt[i] == b'<': continue
            if alt[i] == b".":
                return True
        if len(alt) > 1:
            return True
        return False