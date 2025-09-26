from abc import ABC, abstractmethod
import json
import sys
from classes.mongo_db import MongoDB
from time import time, sleep
import boto3
from datetime import datetime
import os
import smtplib, ssl
from email.message import EmailMessage
import requests
import random

# default parameters
DEFAULT_PIPELINE_VERSION = '1.0.2'
DEFAULT_GENE_TABLE_VERSION = '1.0.2'
DEFAULT_APP_NAME = 'VariantHandler'
DEFAULT_ACCESS_GROUP = 'steam'
DEFAULT_PIPELINE_COMPLETE_NUM = 3
DEFAULT_MONGODB_USER = 'univar-backend'


class VariantHandler(ABC):
    # database related name
    MONGO_DB_GENE_DATABASE_NAME = 'gene'
    MONGO_DB_COMMON_DATABASE_NAME = 'common'
    MONGO_DB_PIPELINE_VERSION_COLLECTION_NAME = 'pipelineversion'
    MONGO_DB_GENE_COLLECTION_NAME = 'genes'
    MONGO_DB_VARIANT_COLLECTION_NAME = 'variants'
    MONGO_DB_VARIANT_EXONS_COLLECTION_NAME = 'variant_exons'
    MONGO_DB_COMPHET_COLLECTION_NAME = 'comphet'
    MONGO_DB_COMMONINFO_COLLECTION_NAME = 'commoninfo'
    MONGO_DB_SAMPLES_COLLECTION_NAME = 'samples'
    MONGO_DB_COMPLETE_INFO_COLLECTION_NAME = 'complete_info'
    MONGO_DB_DATABASE_COLLECTION_NAME = 'databases'
    MONGO_DB_EXOMISER_INFO_COLLECTION_NAME = 'exomiser_info'

    SPLIT_SIZE = 10000
    DEFAULT_DATABSE_TIMEOUT = 3000000

    JSON_FILE_EXT = '.json'

    result_folder = None
    pipeline_version = DEFAULT_PIPELINE_VERSION
    variant_file_path = None
    access_group = DEFAULT_ACCESS_GROUP
    variant_table_name = None
    proband_id = None
    database_path = None
    result_folder = None
    gene_db_version = DEFAULT_GENE_TABLE_VERSION
    app_name = DEFAULT_APP_NAME
    complete_num = DEFAULT_PIPELINE_COMPLETE_NUM
    HETEROZYGOUS = [[1,0],[0,1]]
    already_success = False
    complete_email = None
    email_user = None
    brand = None

    SCENARIO_LOOKUP = {
        'dominant': '0',
        'recessive': '1',
        'de_novo': '2',
        'compound_het': '3',
        'x_linked': '4',
    }

    @abstractmethod
    def load_data(self):
        pass

    def complete_loading(self):
        if self.already_success:
            return
        database_obj = {}
        edit = False
        database = None
        if self.DEFAULT_APP_NAME == 'CompletePipeline':
            if hasattr(self, 'run_complete') and self.run_complete:
                database = self._get_database(self.database_path)
                database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, { '$set': { 'is_ready': True }})
                database.drop_table(self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME)
                database.grant_access('admin', DEFAULT_MONGODB_USER, [{ 'role': 'dbOwner', 'db': self.db_name }])
                temp_database_obj = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name})
                if temp_database_obj and 'cramLocation' in temp_database_obj:
                    for cram_location in temp_database_obj['cramLocation']:
                        database.update_one(self.db_name, self.MONGO_DB_SAMPLES_COLLECTION_NAME, {'name': cram_location['sample_id']}, {'$set': {'cram_server_location': cram_location['path']}})

                if self.complete_email:
                    # send complete email to user
                    with smtplib.SMTP_SSL(os.environ['SMTP_HOST'], os.environ['SMTP_PORT'], context=ssl.create_default_context()) as server:
                        server.login(os.environ['SMTP_USER'], os.environ['SMTP_PASS'])
                        msg = EmailMessage()
                        msg.set_content('This is my message')

                        msg['Subject'] = '[Unified Variant Interpretation Platform] Annotation Pipeline Completed'
                        msg['From'] = "UniVar Admin <" + self.complete_email + ">"
                        msg['To'] = self.complete_email
                        email_user = self.email_user if self.email_user else 'user'
                        msg.set_content("""\
Dear %s,
The annotation for id [%s] has been completed.

You may follow below link to see the result:
https://web.app.univar.live:4333/variant-table
                        """ % (email_user, self.db_name))

                        server.send_message(msg)
                        server.quit()

                # To ensure the access right is grant for backend database user
                database.close_database()
                database = None
                sleep(60)
                # call api the api will check if hpo terms is upload when init if have then run exomiser
                headers = {"Authorization": "Bearer variant-import-tool"}
                response = requests.post(os.environ['BACKEND_BASE_URL'] + 'pipeline/init-exomiser', headers=headers, json={"selected_database": self.db_name, "track_number": 'pipeline:' + str(round(time() * random.random())), "secret": os.environ['BACKEND_SECRET']})
                sys.stderr.write("Response Code: %d\n" % (response.status_code))
                sys.stderr.write("Response Raw: " + str(response.raw) + "\n")
        elif self.DEFAULT_APP_NAME == 'Exomiser2JSON':
            database = self._get_database(self.database_path)
            # mark exomiser able to use
            complete_info = {}
            complete_info['tool_name'] = self.app_name
            complete_info['tool_version'] = self.APP_VERSION
            complete_info['completed_time'] = datetime.now()
            complete_info['spent_time'] = time() - self.start_time
            database.update_one(self.db_name, self.MONGO_DB_EXOMISER_INFO_COLLECTION_NAME, {'run': self.exomiser_run }, { '$push': {'complete_infos': complete_info}})
            # hard code to true as now merged all vcf then run exomiser, exomiser only run once
            database.update_one(self.db_name, self.MONGO_DB_EXOMISER_INFO_COLLECTION_NAME, {'run': self.exomiser_run }, [{ '$set': { 'is_ready': True }}])
            # database.update_one(self.db_name, self.MONGO_DB_EXOMISER_INFO_COLLECTION_NAME, {'run': self.exomiser_run }, [{ '$set': { 'is_ready': { '$cond': { 'if': { '$eq': ['$complete_num', {'$size': '$complete_infos' }] }, 'then': True, 'else': False }}}}])
        else:
            # check if self.result_folder exist
            if self.result_folder:
                complete_info_array = []
                source_str = ''
            else:
                # insert to DB
                database = self._get_database(self.database_path)
                temp_database_obj = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name})
                if temp_database_obj:
                    database_obj = temp_database_obj
                    edit = True

            if hasattr(self,'sample_infos') and self.sample_infos['detail']:
                database_obj['samples'] = self.sample_infos
            
            database_obj['database_name'] = self.db_name
            database_obj['display_name'] = self.db_name
            if 'create_time' not in database_obj or not database_obj['create_time']:
                database_obj['create_time'] = datetime.now()
            database_obj['modify_time'] = datetime.now()
            database_obj['is_ready'] = False
            if 'access_group' not in database_obj and hasattr(self,'access_group') and self.access_group:
                database_obj['access_group'] = []
                database_obj['access_group'].append(self.access_group)
            
            tool_complete_info = {}
            tool_complete_info['tool_name'] = self.app_name
            tool_complete_info['tool_version'] = self.APP_VERSION
            tool_complete_info['completed_time'] = datetime.now()
            tool_complete_info['spent_time'] = time() - self.start_time
            if hasattr(self,'source') and self.source:
                tool_complete_info['source'] = self.source
                source_str = '-_-' + self.source + '-_-'
            if self.result_folder:
                database_obj['tool_complete_info'] = tool_complete_info
            elif not edit:
                database_obj['tool_complete_infos'] = [tool_complete_info]


            if self.result_folder:
                complete_info_array.append(database_obj)
                # May need to modify if not save result to result folder
                self.save_result(complete_info_array, self.db_name, self.MONGO_DB_COMPLETE_INFO_COLLECTION_NAME, source_str if source_str else None)
            elif not edit:
                database.insert_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, database_obj)
            else:
                if 'access_group' not in database_obj and hasattr(self,'access_group') and self.access_group:
                    database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, { '$set': { 'access_group' : database_obj['access_group'] } })
                if 'samples' in database_obj and database_obj['samples'] and hasattr(self,'sample_infos') and self.sample_infos['detail']:
                    database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, { '$set': { 'samples' : database_obj['samples'] } })
                database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, { '$set': { 'modify_time' : database_obj['modify_time'] } })
                database.update_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, {'database_name': self.db_name }, { '$push': { 'tool_complete_infos' : tool_complete_info } })
        
        if database:
            database.close_database()


    def _load_samples(self, order):
        sample_array = []
        display_dict = {}
        sample_count = 1
        for sample in self.sample_infos['detail']:
            if sample['sample_id'] in order:
                sample_obj = {}
                sample_obj['sample_id'] = sample['index'] + 1
                sample_obj['family_id'] = sample['family_id']
                sample_obj['name'] = sample['act_sample']
                sample_obj['paternal_id'] = sample['father']['act_sample'] if sample['has_father'] else '-9'
                sample_obj['maternal_id'] = sample['mother']['act_sample'] if sample['has_mother'] else '-9'
                if self.uat_mode:
                    sample_obj['display_family_id'] = self.db_name
                    display_name = "sample" + str(sample_count)
                    if sample_obj['name'] in display_dict:
                        display_name = display_dict[sample_obj['name']]
                    else:
                        display_dict[sample_obj['name']] = "sample" + str(sample_count)
                        sample_count += 1
                    sample_obj['display_name'] = display_name
                    if sample['has_father']:
                        display_paternal_id = "sample" + str(sample_count)
                        if sample['father']['sample_id'] in display_dict:
                            display_paternal_id = display_dict[sample['father']['sample_id']]
                        else:
                            display_dict[sample['father']['sample_id']] = "sample" + str(sample_count)
                            sample_count += 1
                        sample_obj['display_paternal_id'] = display_paternal_id
                    if sample['has_mother']:
                        display_maternal_id = "sample" + str(sample_count)
                        if sample['mother']['sample_id'] in display_dict:
                            display_maternal_id = display_dict[sample['mother']['sample_id']]
                        else:
                            display_dict[sample['mother']['sample_id']] = "sample" + str(sample_count)
                            sample_count += 1
                        sample_obj['display_maternal_id'] = display_maternal_id
                sample_obj['sex'] = sample['sex']
                sample_obj['phenotype'] = sample['phenotype']
                sample_array.append(sample_obj)
        # check if the sample database exist if no then create
        database = self._get_database(self.database_path)
        for sample in sample_array:
            database.replace_one(self.db_name, self.MONGO_DB_SAMPLES_COLLECTION_NAME, {'sample_id': sample['sample_id']}, sample)
        database.close_database()

    def set_basic_param(self):
        database = self._get_database(self.database_path)
        if isinstance(database, MongoDB):
            if self.db_name:
                database_info = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, { 'database_name': self.db_name })
                if self.DEFAULT_APP_NAME == 'CompletePipeline':
                    if 'email' in database_info and database_info['email']:
                        self.complete_email = database_info['email']
                    if 'complete_num' in database_info and database_info['complete_num']:
                        self.complete_num = database_info['complete_num']
                    if 'access_group' in database_info and database_info['access_group']:
                        self.email_user = database_info['access_group'][0]
            pipeline_filter = { 'version': self.pipeline_version }
            pipeline_version = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_PIPELINE_VERSION_COLLECTION_NAME, pipeline_filter)
            self.gene_db_version = pipeline_version['univar_gene_version']['version'] if pipeline_version else DEFAULT_GENE_TABLE_VERSION
            self.complete_num = pipeline_version['pipeline_required'] if pipeline_version and 'pipeline_required' in pipeline_version else self.complete_num
            if self.DEFAULT_APP_NAME == 'CompletePipeline' and self.db_name:
                database_info = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, { 'database_name': self.db_name })
                if database_info and 'brand' in database_info and database_info['brand']:
                    self.brand = database_info['brand']
                    if 'email' in database_info and database_info['email']:
                        self.complete_email = database_info['email']
                    if 'complete_num' in database_info and database_info['complete_num']:
                        self.complete_num = database_info['complete_num']
            else:
                database_info = database.find_one(self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME, { 'type': 'version_info' })
                if not database_info:
                    commoninfo_results = [] 
                    version_info = {}
                    version_info['type'] = 'version_info'
                    version_info['pipeline'] = self.pipeline_version
                    if self.brand:
                        version_info['brand'] = self.brand
                    version_info[os.path.basename(__file__)] = self.APP_VERSION
                    commoninfo_results.append(version_info)

                    self.save_result(commoninfo_results, self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME)
        else:
            raise NotImplementedError('Not Implemented Error')
        database.close_database()
        sys.stdout.write("complete setting basic param for " + (self.VARIANT_TYPE if hasattr(self, 'VARIANT_TYPE') and self.VARIANT_TYPE else '') + ((' ' + self.source) if hasattr(self, 'source') and self.source else '') + '\n')

    def save_result(self, array_result, database_name, collection_name, extra_info=None):
        # may be switch between DB and local?
        if self.result_folder:
            file_name = database_name + '@' + collection_name + ('-_-' + extra_info + '_-_' if extra_info else '-_-') + self.VARIANT_TYPE + '_-_' + self._get_date_for_file_name() +  self.JSON_FILE_EXT
            if self.result_folder.startswith("s3://"):
                s3_client = boto3.client('s3')
                bucket_name = self.result_folder.replace("s3://", "").split("/")[0]
                path = self.result_folder.replace("s3://" + bucket_name + "/", "")
                path = path + '/' if path[-1] != "/" else path

                s3_client.put_object(
                    Body=json.dumps(array_result, default=str),
                    Bucket= bucket_name,
                    Key= path + file_name 
                )
            else:
                result_folder =  self.result_folder + '/' if self.result_folder[-1] != "/" else self.result_folder
                # store in disk
                os.makedirs(os.path.dirname(result_folder), exist_ok=True)
                with open(result_folder + file_name, "w") as f:
                    json.dump(array_result, f, default=str)
        else:
            database = self._get_database(self.database_path)
            if isinstance(database, MongoDB) and array_result and len(array_result) > 0:
                database.insert_many(database_name, collection_name, array_result)
            database.close_database()

    def _get_database(self, url):
        database = None
        if url.startswith("mongodb"):
            database = MongoDB(url, self.DEFAULT_DATABSE_TIMEOUT, self.app_name)
        else:
            raise ValueError('Not Supported Database')
        return database
    
    # ===================================== #
    # utils function                        #
    # ===================================== #

    # get date for file name
    def _get_date_for_file_name(self):
        return str(time()).replace(".","")
    
    def _get_max_number(self, number1, original_highest):
        result = original_highest if original_highest != None else number1
        try:
            result = float(number1) if float(number1) > float(original_highest) else float(original_highest)
        except Exception:
            sys.stderr.write("Get Max Number error: " + str(number1) + "\n")

        return result
    
    def _handle_compound_het(self, variant_dict, comphet_array):
        if 'sample' in variant_dict and len(variant_dict['sample']) > 0:
            if self.sample_infos['has_father'] and self.sample_infos['has_mother'] and 'gene_objs' in variant_dict and len(variant_dict['genotypes_index']) > self.sample_infos['father']['index'] and len(variant_dict['genotypes_index']) > self.sample_infos['mother']['index']:
                for gene in variant_dict['gene_objs']:
                    # check if proband HETEROZYGOUS and either (father is HETEROZYGOUS and mother not HETEROZYGOUS) or (mother is HETEROZYGOUS and father not HETEROZYGOUS)
                    if 'ensembl_gene_id' in gene and variant_dict['genotypes_index'][self.sample_infos['proband']['index']] in self.HETEROZYGOUS and ((variant_dict['genotypes_index'][self.sample_infos['father']['index']] in self.HETEROZYGOUS and variant_dict['genotypes_index'][self.sample_infos['mother']['index']] in self.EMPTY) or (variant_dict['genotypes_index'][self.sample_infos['mother']['index']] in self.HETEROZYGOUS and variant_dict['genotypes_index'][self.sample_infos['father']['index']] in self.EMPTY)):
                        temp_het_obj = {}
                        temp_het_obj['variant_id'] = str(variant_dict['variant_id'])
                        temp_het_obj['genotypes_index'] = variant_dict['genotypes_index']
                        temp_het_obj['variant_type'] = variant_dict['variant_type']
                        temp_het_obj['ensembl_gene_id'] = gene['ensembl_gene_id']
                        if hasattr(self, 'source') and self.source:
                            temp_het_obj['source'] = self.source
                        comphet_array.append(temp_het_obj)

    def _set_scenario(self, variant_dict):
        temp_sample = []
        """
            try to create a object for later use
            object contain 4 scenario, and each of them is an array
            the array contain number to indicate if this variant is that scenario then what affect should that 'sample' be
            -1 ~ impossible, 0 ~ not affected, 1 ~ affected, 2 ~ any
            so in whole
            For a trio case
            010 would be one example that indicate:
            for this variant be dominant it require 1st sample not affected, 2nd sample affected and 3rd sample not affected 
        """
        temp_variant_obj = {}
        temp_variant_obj['dominant'] = []
        temp_variant_obj['recessive'] = []
        temp_variant_obj['de_novo'] = []
        temp_variant_obj['x_linked'] = []
        if(variant_dict['genotypes_index']):
            for idx, person in enumerate(variant_dict['genotypes_index']):
                temp_person_scenario = 0
                if(person[0] == 1):
                    temp_person_scenario += 1
                if(person[1] == 1):
                    temp_person_scenario += 2

                # sample start for frontend filter the sample
                if temp_person_scenario > 0:
                    temp_sample.append(idx)

                # scenario start
                
                # dominant
                temp_variant_obj['dominant'].append(0 if temp_person_scenario == 0 else 1)
                # recessive
                if ((self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx) or (self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx)) and temp_person_scenario == 0:
                    temp_variant_obj['recessive'].append(-1)
                elif ((self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx) or (self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx)) and temp_person_scenario == 3:
                    temp_variant_obj['recessive'].append(1)
                elif (self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx) or (self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx):
                    temp_variant_obj['recessive'].append(0)
                elif temp_person_scenario == 3:
                    temp_variant_obj['recessive'].append(1)
                else:
                    temp_variant_obj['recessive'].append(0)
                # de novo
                if self.sample_infos['proband']['index'] == idx:
                    if temp_person_scenario == 0:
                        temp_variant_obj['de_novo'].append(-1)
                    else:
                        temp_variant_obj['de_novo'].append(1)
                elif (self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx) or (self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx):
                    if temp_person_scenario == 0:
                        temp_variant_obj['de_novo'].append(0)
                    else:
                        temp_variant_obj['de_novo'].append(-1)
                else:
                    if temp_person_scenario == 0:
                        temp_variant_obj['de_novo'].append(0)
                    else:
                        temp_variant_obj['de_novo'].append(1)
                # x linked
                if variant_dict['chrom'] == 'chrX':
                    # if proband is male
                    if self.sample_infos['proband']['sex'] == 1:
                        if self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(-1)
                            elif temp_person_scenario == 3:
                                temp_variant_obj['x_linked'].append(1)
                            else:
                                temp_variant_obj['x_linked'].append(0)
                        elif self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(0)
                            else:
                                temp_variant_obj['x_linked'].append(1)
                        elif self.sample_infos['proband']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(0)
                            elif temp_person_scenario == 1 or temp_person_scenario == 2:
                                temp_variant_obj['x_linked'].append(-1)                                
                            else:
                                temp_variant_obj['x_linked'].append(1)
                        else:
                            if temp_person_scenario == 3:
                                temp_variant_obj['x_linked'].append(1)
                            elif temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(0)
                            else: 
                                if self.sample_infos['detail'][idx]['sex'] == 1:
                                    temp_variant_obj['x_linked'].append(1)
                                elif self.sample_infos['detail'][idx]['sex'] == 2:
                                    temp_variant_obj['x_linked'].append(0)
                                else:
                                    # if sex is unknown
                                    temp_variant_obj['x_linked'].append(2)
                    elif self.sample_infos['proband']['sex'] == 2:
                        if self.sample_infos['has_mother'] and self.sample_infos['mother']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(-1)
                            elif temp_person_scenario == 3:
                                temp_variant_obj['x_linked'].append(1)
                            else:
                                temp_variant_obj['x_linked'].append(0)
                        elif self.sample_infos['has_father'] and self.sample_infos['father']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(-1)
                            else:
                                temp_variant_obj['x_linked'].append(1)
                        elif self.sample_infos['proband']['index'] == idx:
                            if temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(0)
                            elif temp_person_scenario == 3:
                                temp_variant_obj['x_linked'].append(1)
                            else:
                                temp_variant_obj['x_linked'].append(-1)
                        else:
                            if temp_person_scenario == 3:
                                temp_variant_obj['x_linked'].append(1)
                            elif temp_person_scenario == 0:
                                temp_variant_obj['x_linked'].append(0)
                            else: 
                                if self.sample_infos['detail'][idx]['sex'] == 1:
                                    temp_variant_obj['x_linked'].append(1)
                                elif self.sample_infos['detail'][idx]['sex'] == 2:
                                    temp_variant_obj['x_linked'].append(0)
                                else:
                                    # if sex is unknown
                                    temp_variant_obj['x_linked'].append(2)
                    # if sex is unknown NOT handle
                    else:
                        temp_variant_obj['x_linked'].append(2)
                    # else:
                    #     if self.sample_infos['mother']['index'] == idx:
                    #         if tempPersonScenario == 0:
                    #             tempVariantObj['x_linked'].append(-1)
                    #         elif tempPersonScenario == 3:
                    #             tempVariantObj['x_linked'].append(1)
                    #         else:
                    #             tempVariantObj['x_linked'].append(0)
                    #     elif self.sample_infos['father']['index'] == idx:
                    #         if tempPersonScenario == 0:
                    #             tempVariantObj['x_linked'].append(0)
                    #         else:
                    #             tempVariantObj['x_linked'].append(1)
                    #     elif self.sample_infos['proband']['index'] == idx:
                    #         if tempPersonScenario == 0:
                    #             tempVariantObj['x_linked'].append(0)
                    #         else:
                    #             tempVariantObj['x_linked'].append(1)
                    #     else:
                    #         if tempPersonScenario == 3:
                    #             tempVariantObj['x_linked'].append(1)
                    #         elif tempPersonScenario == 0:
                    #             tempVariantObj['x_linked'].append(0)
                    #         else: 
                    #             if self.sample_infos['detail'][idx]['sex'] == 1:
                    #                 tempVariantObj['x_linked'].append(1)
                    #             elif self.sample_infos['detail'][idx]['sex'] == 2:
                    #                 tempVariantObj['x_linked'].append(0)
                    #             else:
                    #                 # if sex is unknown
                    #                 tempVariantObj['x_linked'].append(2)

        variant_dict['sample'] = temp_sample
        """
            try to create a list of condition for scenario
            first digit is indicate which scenario
            0 ~ dominant
            1 ~ recessive
            2 ~ de novo
            3 ~ compound het (will compute later)
            4 ~ x linked
            after first digit is digit to indicate if that sample is affected or not
            0 ~ not affected, 1 ~ affected
            so in whole
            For a trio case
            0010 would be one example that indicate:
            for this variant be dominant it require 1st sample not affected, 2nd sample affected and 3rd sample not affected 
        """
        temp_scenario = []
        for key in temp_variant_obj.keys():
            if -1 not in temp_variant_obj[key] and temp_variant_obj[key]:
                temp_case1 = self.SCENARIO_LOOKUP[key]
                temp_case2 = self.SCENARIO_LOOKUP[key]
                for cases in temp_variant_obj[key]:
                    if cases != 2:
                        temp_case1 += str(cases)
                        temp_case2 += str(cases)
                    else:
                        temp_case1 += '0'
                        temp_case2 += '1'
                temp_scenario.append(temp_case1)
                if 2 in temp_variant_obj[key]:
                    temp_scenario.append(temp_case2) 

        variant_dict['scenario'] = temp_scenario

    def _order_format_list(self, sample_order, data_list, in_order):
        # Combine the data_values and data_samples using zip()
        combined_data = list(zip(data_list, in_order))
        # Sort the combined_data based on the sample_order values
        sorted_data = sorted(combined_data, key=lambda x: sample_order.index(x[1]))

        return [item[0] for item in sorted_data]