import sys
from time import time
import pandas as pd
import re
from interfaces.variant_handler import VariantHandler
from math import log10, floor

# This is for Exomiser above 13
class Exomiser2JSON(VariantHandler):

    DEFAULT_APP_NAME = 'Exomiser2JSON'
    APP_VERSION = '1.0.0'
    VARIANT_TYPE = 'both'

    EXOMISER_SCORE_COLUMNS = ['EXOMISER_GENE_COMBINED_SCORE', 'EXOMISER_GENE_PHENO_SCORE', 'EXOMISER_GENE_VARIANT_SCORE']
    HIGHEST_COLUMN_COLUMNS = ['GENE_SYMBOL', 'MOI', 'EXOMISER_ACMG_CLASSIFICATION', 'EXOMISER_ACMG_EVIDENCE', 'EXOMISER_ACMG_DISEASE_ID', 'EXOMISER_ACMG_DISEASE_NAME']
    HIGHEST_COLUMN_COLUMNS.extend(EXOMISER_SCORE_COLUMNS)

    USE_COLUMN = ['CONTIG', 'START', 'END', 'REF', 'ALT', 'ALL_PATH', "VCF_ID"]
    USE_COLUMN.extend(HIGHEST_COLUMN_COLUMNS)

    def __init__(self, variant_file_path, database_path, sample_infos, database_name, exomiser_run, result_folder=None, proband_id=None, process_num=None, source=None, brand=None):
        self.start_time = time()
        self.app_name = self.DEFAULT_APP_NAME
        self.variant_file_path = variant_file_path
        self.result_folder = result_folder
        self.process_num = process_num
        self.database_path = database_path
        self.sample_infos = sample_infos
        self.db_name = database_name
        self.proband_id = proband_id
        self.exomiser_run = exomiser_run
        self.brand = brand
        self.source = source if source != 'snp' else None
        self.info_dict = {}
        self.format_dict = {}
        self.header_arr = []
        self.sample_order = []
        self.set_basic_param()

    def load_data(self):
        if self.already_success:
            return
        self._load_header()

        df = pd.read_csv(self.variant_file_path, sep='\t', usecols=self.USE_COLUMN, dtype={'EXOMISER_ACMG_CLASSIFICATION': str, 'EXOMISER_ACMG_EVIDENCE': str, 'EXOMISER_ACMG_DISEASE_ID': str, 'EXOMISER_ACMG_DISEASE_NAME': str})
        self._read_vcf_chunk(df)

    ####### start private method ########
    def _read_vcf_chunk(self, chunk):
        sys.stdout.write("start massage exomiser data\n")
        database = self._get_database(self.database_path)
        start_chunk_time = time()
        variants_map = {}
        data_dicts = chunk.to_dict(orient='records')

        for temp_dict in data_dicts:
            column_key = str(temp_dict['VCF_ID'])
            variant_dict = {}
            for key in temp_dict:
                if key in self.USE_COLUMN:
                    if key in temp_dict and not pd.isna(temp_dict[key]):
                        if key == 'ALL_PATH':
                            list_of_paths = temp_dict['ALL_PATH'].split(',')
                            for path in list_of_paths:
                                key_value = path.split('=')
                                if key_value[0] == 'REMM':
                                    variant_dict['remm'] = self._try_to_round_sig(self._get_str_value(key_value[1]), 6)
                                    break
                        else:
                            # convert to lower case
                            variant_dict[key.lower()] = temp_dict[key] 
            existing_array = []
            if column_key in variants_map and variants_map[column_key]:
                existing_array = variants_map[column_key]
            existing_array.append(variant_dict)
            variants_map[column_key] = existing_array

        del data_dicts
        sys.stdout.write("massage exomiser data completed in %ds\n" % (time() - start_chunk_time))
        start_write_time = time()
        # start order the exomiser score in variants_map
        for key in variants_map.keys():
            variants_map[key].sort(key=lambda x: x['exomiser_gene_combined_score'], reverse=True)
            update_exomiser_dict = {}
            update_exomiser_dict[self.exomiser_run] = {}
            top_exomiser = variants_map[key][0]

            for column_key in self.HIGHEST_COLUMN_COLUMNS:
                lower_key = column_key.lower() 
                if lower_key in top_exomiser and not pd.isna(top_exomiser[lower_key]):
                    key_name = 'highest_' + lower_key
                    if column_key not in self.EXOMISER_SCORE_COLUMNS:
                        update_exomiser_dict[self.exomiser_run][key_name] = top_exomiser[lower_key]
                    else:
                        update_exomiser_dict[self.exomiser_run][key_name] = self._try_to_round_sig(self._get_str_value(top_exomiser[lower_key]), 6)
            if 'remm' in top_exomiser and not pd.isna(top_exomiser['remm']):
                update_exomiser_dict[self.exomiser_run]['highest_remm'] = self._try_to_round_sig(self._get_str_value(top_exomiser['remm']), 6)

            update_exomiser_dict[self.exomiser_run]['exomisers'] = variants_map[key]

            caller_name = ""
            variant_part = ""
            if key.endswith("-"):
                variant_part = key[:-1]
            else:
                variant_part, caller_name = key.rsplit('-', 1)
            
            key_info = variant_part.split('_')
            query_string = {}
            if caller_name and caller_name != "":
                query_string = {'chrom': key_info[0], 'start': int(key_info[1]), 'ref': key_info[2], 'type': key_info[3].replace("<","").replace(">", "") }
                query_string['caller'] = caller_name
            else:
                query_string = {'chrom': key_info[0], 'start': int(key_info[1]), 'ref': key_info[2], 'alt': key_info[3] }
            database.update_one(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, query_string, { '$set': update_exomiser_dict})
        # shouldn't require? since exomiser filter is using greater than
        # no_exomiser_dict = {}
        # no_exomiser_dict[self.exomiser_run] = {}
        # no_exomiser_dict[self.exomiser_run]['highest_exomiser_gene_combined_score'] = -1
        # no_exomiser_dict[self.exomiser_run]['highest_exomiser_gene_pheno_score'] = -1
        # no_exomiser_dict[self.exomiser_run]['highest_exomiser_gene_variant_score'] = -1
        # database.update_many(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, {self.exomiser_run: {'$exists': False}}, { '$set': no_exomiser_dict})
        sys.stdout.write("write exomiser data completed in %ds\n" % (time() - start_write_time))
        database.close_database()

    def _load_header(self):
        with open(self.variant_file_path, "rt") as f:
            for line in f:
                # info row
                if line.startswith('#'):
                    self.header_arr = line.strip().split('\t')
                    break

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

    # read info line from VCF
    def _read_info(self, line):
        ## example line: ##INFO=<ID=AC,Number=A,Type=Integer,Description="Allele count in genotypes, for each ALT allele, in the same order as listed">
        
        # Regular expression to match key-value pairs
        temp_line = line[8:-1]
        re_key_value = re.compile(r'(\w+)=(?:"([^"]*)"|([^,"]*))')

        # Extract key-value pairs from the INFO string
        temp_info_dict = {}
        for match in re_key_value.finditer(temp_line):
            key = match.group(1)
            value = match.group(2) or match.group(3)
            temp_info_dict[key] = value
        
        if 'CSQ' in line:
            prefix = 'Consequence annotations from Ensembl VEP. Format:'
            temp_desc = ''
            if temp_info_dict['Description'].startswith(prefix):
                temp_desc = temp_info_dict['Description'][len(prefix):]  # remove the prefix
            temp_info_dict['Format'] = temp_desc.split('|') 
        self.info_dict[temp_info_dict['ID']] = temp_info_dict

    def _read_format(self, line):
        ## example line: ##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths for the ref and alt alleles in the order listed">
        
        # Regular expression to match key-value pairs
        temp_line = line[10:-1]
        re_key_value = re.compile(r'(\w+)=(?:"([^"]*)"|([^,"]*))')

        # Extract key-value pairs from the INFO string
        temp_format_dict = {}
        for match in re_key_value.finditer(temp_line):
            key = match.group(1)
            value = match.group(2) or match.group(3)
            temp_format_dict[key] = value
        
        self.format_dict[temp_format_dict['ID']] = temp_format_dict
    
    def _read_hpo_terms(self, line):
        return line.split("=")[1].split(",")
    
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
    
    def _handle_gene_related_special_columns(self, gene_object, dict_array):
        for column_key in self.TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS:
            if column_key in gene_object and (gene_object[column_key] or gene_object[column_key] == 0):
                dict_array[column_key].append(gene_object[column_key])
        for column_key in self.TOP_TRANSCRIPT_SPECICAL_COLUMNS:
            if column_key == 'impact_severity':
                if column_key in gene_object and gene_object[column_key]:
                    if dict_array[column_key] == 'HIGH' or gene_object[column_key] == 'HIGH':
                        dict_array[column_key] = 'HIGH'
                    elif dict_array[column_key] == 'MODERATE' or gene_object[column_key] == 'MODERATE':
                        dict_array[column_key] = 'MODERATE'
                    elif dict_array[column_key] == 'LOW' or gene_object[column_key] == 'LOW':
                        dict_array[column_key] = 'LOW'
                    else:
                        dict_array[column_key] = 'MODIFIER'
            elif column_key == 'impact':
                dict_array[column_key].update(gene_object[column_key])

    # bioinformatic related
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