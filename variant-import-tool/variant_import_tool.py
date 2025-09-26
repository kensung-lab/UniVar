############################################################
#                   Variant Import Tool                    #
#                   Version: 1.0.2                         #
############################################################
import argparse
import sys
from time import time
import pandas as pd

from classes.mongo_db import MongoDB
from handlers.exomiser_handler import Exomiser2JSON
from handlers.snp_vcf_handler import SNPVCF2JSON
from handlers.sv_json_handler import SVJSON2JSON
from handlers.complete_pipeline import CompletePipeline
import csv
import os

# default parameters
DEFAULT_PROCESS_NUM = 50

# variant type
SNP_VCF = 'snp_vcf'
SV_JSON = 'sv_json'
COMPLETE = 'complete'
EXOMISER = 'exomiser'

# constant
PED_DUMMY_CONSTANT = 'DUMMY'

class VariantImportTool(object):
    def __init__(self, variant_file_path, ped_file_path, database_path, variant_type, result_folder, pipeline_version=None, database_name=None, proband_id=None, access_group=None, uat_mode=None, process_num=None, source=None, complete_num=None, exomiser_run=None, liftover_path=None, brand=None):
        start_time = time()
        handler = None
        if database_path == 'MONGO_BASE_URL':
            database_path = os.environ['MONGO_BASE_URL']

        # @Deprecated
        # always assume the file name format as <patient_id>_<family_type><(_<family_member_id>)+>_<time_or_some_unqiue_text>.vcf.gz
        # @Now
        # always assume the file name format as <patient_id>_<family_type>_<time_or_some_unqiue_text>.vcf.gz
        # for sv it may be this format s3://<somepath>/<patient_id>_<family_type>_<time_or_some_unqiue_text>.vcf.gz#<source>
        if variant_file_path.startswith('s3://'):
            variant_file_path = variant_file_path.split('/')[-1]
            if not source:
                source = variant_file_path.split('#')[-1] if '#' in variant_file_path else None
            variant_file_path = '.'.join([variant_file_path.split('.')[0], source, 'json', 'gz'])

        file_names = variant_file_path.split('/')[-1].split('.')
        proband_id = proband_id if proband_id else '_'.join(file_names[0].split('_')[:-2])
        process_num = process_num if process_num else DEFAULT_PROCESS_NUM
        if variant_type == SNP_VCF:
            handler = SNPVCF2JSON(variant_file_path, database_path, self._get_sample_infos(ped_file_path, proband_id), self._get_database_name(database_name, file_names, uat_mode), result_folder, pipeline_version, proband_id, access_group, uat_mode, process_num, liftover_path, brand)
        elif variant_type == SV_JSON:
            handler = SVJSON2JSON(variant_file_path, database_path, self._get_sample_infos(ped_file_path, proband_id), self._get_database_name(database_name, file_names, uat_mode), result_folder, pipeline_version, proband_id, access_group, uat_mode, process_num, source, liftover_path, brand)
        elif variant_type == COMPLETE:
            handler = CompletePipeline(database_path, self._get_database_name(database_name, file_names, uat_mode), pipeline_version, process_num, complete_num, brand)
        elif variant_type == EXOMISER:
             handler = Exomiser2JSON(variant_file_path, database_path, self._get_sample_infos(ped_file_path, proband_id), self._get_database_name(database_name, file_names, uat_mode), exomiser_run, result_folder, proband_id, process_num, source, brand)
        else:
            raise NotImplementedError('Not Implemented Handler Error')

        sys.stdout.write("Start loading data\n")
        handler.load_data()
        handler.complete_loading()
        sys.stdout.write("Variant Import Tool completed in %ds\n" % (time() - start_time))

    def _get_database_name(self, database_name, file_names, uat_mode):
        result = None
        if database_name and database_name != 'DUMMY':
            result = database_name
        elif not uat_mode:
            result = file_names[0].split('_')[0] + '_' + file_names[0].split('_')[1] + '_' + file_names[0].split('_')[-1]
        else:
            result = 'family_' + file_names[0].split('_')[1] + '_' + file_names[0].split('_')[-1]
        return result

    def _get_sample_infos(self, ped_file_path, proband_id):
        if not hasattr(self, "_sample_infos"):
            self._sample_infos = {}
            self._sample_infos['detail'] = []
            self._sample_infos['has_father'] = False
            self._sample_infos['has_mother'] = False
            self._sample_infos['sample_id'] = []
            # The source of pedgiree may change in the future
            pedigree_infos = []
            with open(ped_file_path, 'r') as file:
                csvreader = csv.reader(file, delimiter='\t')
                index = 0
                for row in csvreader:
                    if row[0].startswith("#"):
                        continue
                    # create pedigree_info for later use
                    already_in_list = False
                    for pedigree_info in pedigree_infos:
                        if 'ID' in pedigree_info and pedigree_info['ID'] == row[1]:
                            already_in_list = True
                    if not already_in_list and (row[2] not in [0, -9] or row[3] not in [0, -9]):
                        pedigree_info = {}
                        pedigree_info['Child'] = row[1].replace('_','-')
                        if row[2] != -9:
                            pedigree_info['Father'] = row[2].replace('_','-')
                        if row[3] != -9:
                            pedigree_info['Mother'] = row[3].replace('_','-')
                        pedigree_infos.append(pedigree_info)
                    sample_info = {}
                    sample_info['sample_id'] = row[1].replace('_','-')
                    sample_info['act_sample'] = row[1]
                    sample_info['index'] = index
                    sample_info['has_father'] = False
                    sample_info['has_mother'] = False
                    sample_info['sex'] = row[4]
                    sample_info['family_id'] = row[0]
                    sample_info['phenotype'] = row[5]
                    self._sample_infos['detail'].append(sample_info)
                    self._sample_infos['sample_id'].append(sample_info['sample_id'])
                    index += 1
            for detail in self._sample_infos['detail']:
                    self._get_relationship(pedigree_infos, detail, self._sample_infos['detail'], proband_id)
        return self._sample_infos
    
    def _get_relationship(self, pedigree_infos, sample_obj, detail_list, proband_id):
        is_proband = sample_obj['sample_id'] == proband_id.replace('_','-')
        sample_obj['info'] = 'other' if not is_proband else 'proband'
        for pedigree_info in pedigree_infos:
            if pedigree_info['Child'] == sample_obj['sample_id']:
                for detail in detail_list:
                    # TODO clear the relationship
                    if 'Father' in pedigree_info and detail['sample_id'] == pedigree_info['Father']:
                        detail['info'] = 'father' if is_proband else 'other'
                        sample_obj['father'] = detail
                        sample_obj['has_father'] = True
                    elif 'Mother' in pedigree_info and detail['sample_id'] == pedigree_info['Mother']:
                        detail['info'] = 'mother' if is_proband else 'other'
                        sample_obj['mother'] = detail
                        sample_obj['has_mother'] = True
                    
        if is_proband:
            self._sample_infos['proband'] = sample_obj
            if sample_obj['has_father']:
                self._sample_infos['father'] = sample_obj['father']
                self._sample_infos['has_father'] = True
            if sample_obj['has_mother']:
                self._sample_infos['mother'] = sample_obj['mother']
                self._sample_infos['has_mother'] = True

if __name__ == "__main__":
    p = argparse.ArgumentParser(prog='Variant Import Tool', 
                                description='Convert Variant to Database', 
                                epilog="python variant_import_tool.py <variant_file_path> <ped_file_path> <database_path> <variant_type>")
    p.add_argument("variant_file_path", help="this field is to set the path for the variant, currently only accept SNP VCF")
    p.add_argument("ped_file_path", help="this field is to set the path for the ped file")
    p.add_argument("database_path", help="this field is to set connection url for database")
    p.add_argument("variant_type", help="this field is to set connection url for database")
    p.add_argument("--result-folder", help="this field is to set the result folder location, can be hard disk or s3")
    p.add_argument("--pipeline-version", help="this field is to set the pipeline version, it will affect the gene database version that this tool use")
    p.add_argument("--database-name", help="this field is to set the mongoDB database name. It is optional, if not pass will follow the name of the variant file")
    p.add_argument("--proband-id", help="this field is to set the proband id. It is optional, if not pass will follow the name of the variant file")
    p.add_argument("--access-group", help="this field is to set the access group of this database in csv format")
    p.add_argument("--process-num", type=int, help="this field is to set the maximum number of process to run this program")
    p.add_argument("--source", help="this field is to set the source caller of the variant file, only for SV. It is optional, if not pass will follow the name of the variant file")
    p.add_argument("--complete-num", type=int, help="this field is to set the complete_num for the complete_pipeline handler")
    p.add_argument("--uat", action='store_true', help="this field is to set is it for UAT", default=False)
    p.add_argument("--exomiser-run", help="this field is to set the exomiser run unique string")
    p.add_argument("--liftover-path", help="this field is to set the path of the liftover file")
    p.add_argument("--brand", help="this field is to set the brand of this run", default="univar")

    a = p.parse_args()
    
    VariantImportTool(a.variant_file_path, a.ped_file_path, a.database_path, a.variant_type, a.result_folder, a.pipeline_version, a.database_name, a.proband_id, a.access_group, a.uat, a.process_num, a.source, a.complete_num, a.exomiser_run, a.liftover_path, a.brand)