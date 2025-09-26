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
# from civicpy import civic

# This is for Exomiser below 13
class SNPVCF2JSON(VariantHandler):

    DEFAULT_APP_NAME = 'SNPVCF2JSON'
    APP_VERSION = '1.0.0'
    VARIANT_TYPE = 'small'

    NOT_USED_COLUMNS = ["ac", "af", "an", "dp", "excesshet", "fs", "mleac", "mq", "qd", "sor", "vqslod", "culprit", "allele", "mleaf", "readposranksum", "baseqranksum", "mqranksum", "gt_alt_frer_ad_exgenescombi"]
    RENAME_COLUMNS = {
        "amino_acids": "aa_change",
        "protein_position": "aa_length",
        "codons": "codon_change",
        "gnomadv2e_af": "gnomadv2e_af",
        "gnomadv2e_af_afr": "gnomadv2e_afr_af",
        "gnomadv2e_af_amr": "gnomadv2e_amr_af",
        "gnomadv2e_af_asj": "gnomadv2e_asj_af",
        "gnomadv2e_af_eas": "gnomadv2e_eas_af",
        "gnomadv2e_af_fin": "gnomadv2e_fin_af",
        "gnomadv2e_af_nfe": "gnomadv2e_nfe_af",
        "gnomadv2e_af_oth": "gnomadv2e_oth_af",
        "gnomadv2e_af_sas": "gnomadv2e_sas_af",
        "gnomadv2g_af": "gnomadv2g_af",
        "gnomadv2g_af_afr": "gnomadv2g_afr_af",
        "gnomadv2g_af_ami": "gnomadv2g_ami_af",
        "gnomadv2g_af_amr": "gnomadv2g_amr_af",
        "gnomadv2g_af_asj": "gnomadv2g_asj_af",
        "gnomadv2g_af_eas": "gnomadv2g_eas_af",
        "gnomadv2g_af_fin": "gnomadv2g_fin_af",
        "gnomadv2g_af_nfe": "gnomadv2g_nfe_af",
        "gnomadv2g_af_oth": "gnomadv2g_oth_af",
        "gnomadv3g_af": "gnomadv3g_af",
        "gnomadv3g_af_afr": "gnomadv3g_afr_af",
        "gnomadv3g_af_ami": "gnomadv3g_ami_af",
        "gnomadv3g_af_amr": "gnomadv3g_amr_af",
        "gnomadv3g_af_asj": "gnomadv3g_asj_af",
        "gnomadv3g_af_eas": "gnomadv3g_eas_af",
        "gnomadv3g_af_fin": "gnomadv3g_fin_af",
        "gnomadv3g_af_mid": "gnomadv3g_mid_af",
        "gnomadv3g_af_nfe": "gnomadv3g_nfe_af",
        "gnomadv3g_af_oth": "gnomadv3g_oth_af",
        "gnomadv3g_af_sas": "gnomadv3g_sas_af",
        "gnomade_af": "gnomadv4e_af",
        "gnomade_afr_af": "gnomadv4e_afr_af",
        "gnomade_amr_af": "gnomadv4e_amr_af",
        "gnomade_asj_af": "gnomadv4e_asj_af",
        "gnomade_eas_af": "gnomadv4e_eas_af",
        "gnomade_fin_af": "gnomadv4e_fin_af",
        "gnomade_mid_af": "gnomadv4e_mid_af",
        "gnomade_nfe_af": "gnomadv4e_nfe_af",
        "gnomade_remaining_af": "gnomadv4e_oth_af",
        "gnomade_sas_af": "gnomadv4e_sas_af",
        "gnomadg_af": "gnomadv4g_af",
        "gnomadg_afr_af": "gnomadv4g_afr_af",
        "gnomadg_ami_af": "gnomadv4g_ami_af",
        "gnomadg_amr_af": "gnomadv4g_amr_af",
        "gnomadg_asj_af": "gnomadv4g_asj_af",
        "gnomadg_eas_af": "gnomadv4g_eas_af",
        "gnomadg_fin_af": "gnomadv4g_fin_af",
        "gnomadg_mid_af": "gnomadv4g_mid_af",
        "gnomadg_nfe_af": "gnomadv4g_nfe_af",
        "gnomadg_remaining_af": "gnomadv4g_oth_af",
        "gnomadg_sas_af": "gnomadv4g_sas_af",
    }

    AF_PREFIXES = ["gnomadv4e_", "gnomadv4g_", "gnomadv2e_", "gnomadv2g_", "gnomadv3g_"]

    AF_SUFFIXES = ["af", "afr_af", "amr_af", "asj_af", "eas_af", "fin_af", "mid_af", "nfe_af", "oth_af", "sas_af"]

    AF_FIELDS = []
    for prefix in AF_PREFIXES:
        for suffix in AF_SUFFIXES:
            AF_FIELDS.append(prefix + suffix)

    AF_FIELDS.remove('gnomadv2e_mid_af')
    AF_FIELDS.remove('gnomadv2g_mid_af')
    AF_FIELDS.remove('gnomadv2g_sas_af') # doesn't have sas in gnomADv2 AF genome but in exome 

    # shouldn't appear anymore as now run after merged
    EXOMISER_COLUMNS = ["exomiser_ad_exgenescombi", "exomiser_ar_exgenescombi", "exomiser_mt_exgenescombi", "exomiser_xd_exgenescombi", "exomiser_xr_exgenescombi",
                        "exomiser_ad_exgenespheno", "exomiser_ar_exgenespheno", "exomiser_mt_exgenespheno", "exomiser_xd_exgenespheno", "exomiser_xr_exgenespheno"]
    
    SPLICE_AI_COLUMNS = ["spliceai_pred_ds_ag", "spliceai_pred_ds_al", "spliceai_pred_ds_dg", "spliceai_pred_ds_dl"]
    
    HIGHEST_AF_NAME_MAPPING = {
        'gnomadv2e_af': 'gnomAD v2 Exome - Global',
        'gnomadv2e_eas_af': 'gnomAD v2 Exome - East Asian',
        'gnomadv2g_af': 'gnomAD v2 Genome - Global',
        'gnomadv2g_eas_af': 'gnomAD v2 Genome - East Asian',
        'gnomadv3g_af': 'gnomAD v3 Genome - Global',
        'gnomadv3g_eas_af': 'gnomAD v3 Genome - East Asian',
        'gnomadv4e_af': 'gnomAD v4 Exome - Global',
        'gnomadv4e_eas_af': 'gnomAD v4 Exome - East Asian',
        'gnomadv4g_af': 'gnomAD v4 Genome - Global',
        'gnomadv4g_eas_af': 'gnomAD v4 Genome - East Asian',
    }

    HIGHEST_EXOMISER_MAPPING = {
        'exgenescombi': 'highest_exomiser_scombi',
        'exgenespheno': 'highest_exomiser_spheno'
    }

    SPECIAL_HANDLE_COLUMNS = ["polyphen", "sift", "consequence", "canonical", "clnid"]
    SPECIAL_HANDLE_COLUMNS.extend(RENAME_COLUMNS.keys())
    SPECIAL_HANDLE_COLUMNS.extend(EXOMISER_COLUMNS)
    SPECIAL_HANDLE_COLUMNS.extend(SPLICE_AI_COLUMNS)

    CSQ_NOT_USED_COLUMNS = ["symbol", "gene", "max_af_pops", "negative_train_site",
                            "cdna_position", "condons", "trembl", "variant_class", "symbol_source", "appris",
                            "ensp", "uniparc", "given_ref", "used_ref", "sift", "aa_af", "ea_af", "gnomad_af", "gnomad_afr_af", "gnomad_amr_af",
                            "gnomad_asj_af", "gnomad_eas_af", "gnomad_fin_af", "gnomad_nfe_af", "gnomad_oth_af", "gnomad_sas_af", "max_af", "somatic",
                            "af","afr_af", "amr_af", "eas_af", "eur_af", "sas_af", "aa_af", "ea_af", "tsl", "swissprot", "uniprot_isoform", "distance", "pubmed",
                            "five_prime_utr_variant_annotation", "five_prime_utr_variant_consequence", "hgvs_offset", "impact", "gnomadv2g", "gnomadv2e"]

    TOP_TRANSCRIPT_COLUMNS = ['aa_change', 'cadd_raw', 'ccds', 'cgd_agegroup', 'cgd_allelicconditions', 'cgd_comments', 'cgd_condition', 'cgd_entrezid', 'cgd_gene',
                              'cgd_hgncid', 'cgd_inheritance', 'cgd_interventioncategories', 'cgd_interventionrationale', 'cgd_manifestationcategories', 'cgd_references', 'clndisdb',
                              'clndisdbincl', 'clndn', 'clndnincl', 'clnhgvs', 'clnid', 'clnrevstat', 'clnsig', 'clnsigconf', 'clnsigincl', 'clnvc', 'clnvcso', 'clnvi',
                              'constraint_v2_oe_lof', 'constraint_v2_oe_lof_lower', 'constraint_v2_oe_lof_upper', 'constraint_v2_oe_mis', 'constraint_v2_oe_mis_lower', 'constraint_v2_oe_mis_upper', 'constraint_v2_oe_syn',
                              'constraint_v2_oe_syn_lower', 'constraint_v2_oe_syn_upper', 'constraint_v2_pli', 'constraint_v2_syn_z', 'constraint_v4_oe_lof', 'constraint_v4_oe_lof_lower', 'constraint_v4_oe_lof_upper',
                              'constraint_v4_oe_mis', 'constraint_v4_oe_mis_lower', 'constraint_v4_oe_mis_upper', 'constraint_v4_oe_syn', 'constraint_v4_oe_syn_lower', 'constraint_v4_oe_syn_upper', 
                              'constraint_v4_pli', 'constraint_v4_syn_z','domains', 'effect', 'end', 'existing_inframe_oorfs', 'existing_outofframe_oorfs',
                              'existing_uorfs', 'existing_variation', 'exomiser_ad_exgenescombi', 'exomiser_ad_exgenespheno', 'exomiser_ad_exgenesvar', 'exomiser_ar_exgenescombi', 'exomiser_ar_exgenespheno',
                              'exomiser_ar_exgenesvar', 'exomiser_mt_exgenescombi', 'exomiser_mt_exgenespheno', 'exomiser_mt_exgenesvar', 'exomiser_xd_exgenescombi', 'exomiser_xd_exgenespheno', 'exomiser_xd_exgenesvar',
                              'exomiser_xr_exgenescombi', 'exomiser_xr_exgenespheno', 'exomiser_xr_exgenesvar', 'flaglrg', 'gene_pheno', 'hgvsc', 'hgvsp', 'impact', 'impact_severity', 'is_coding', 'is_exonic',
                              'mane_plus_clinical', 'mane_select', 'pass_filter', 'pheno', 'polyphen_pred', 'polyphen_score', 'quality', 'refseq_match', 'sift_pred', 'sift_score', 
                              'spliceai_pred_dp_ag',  'spliceai_pred_dp_al', 'spliceai_pred_dp_dg', 'spliceai_pred_dp_dl',
                              'spliceai_pred_symbol', 'type', 'highest_af', 'clingen_hi', 'clingen_ts', 'p_lof', 'is_pathogenic', 'is_repeat', 'source', 'ensembl_gene_id', 'ncbi_ids', 'am_pathogenicity', 'am_class', 'remm', "colorsdb_af"]
    TOP_TRANSCRIPT_COLUMNS.extend(AF_FIELDS)

    TOP_TRANSCRIPT_RENAME_COLUMNS = {
        "gene": "gene_symbol",
        "transcript": "ensembl_transcript_id",
    }

    GENE_DATABASE_CONSTRAINT_COLUMNS = ['constraint_v2_pli','constraint_v2_oe_lof', 'constraint_v2_oe_lof_lower', 
                                        'constraint_v2_oe_lof_upper', 'constraint_v2_mis_z', 'constraint_v2_oe_mis', 'constraint_v2_oe_mis_lower', 'constraint_v2_oe_mis_upper',
                                        'constraint_v2_syn_z', 'constraint_v2_oe_syn', 'constraint_v2_oe_syn_lower', 'constraint_v2_oe_syn_upper', 'constraint_v4_pli',
                                        'constraint_v4_oe_lof', 'constraint_v4_oe_lof_lower', 'constraint_v4_oe_lof_upper', 'constraint_v4_mis_z', 'constraint_v4_oe_mis',
                                        'constraint_v4_oe_mis_lower', 'constraint_v4_oe_mis_upper', 'constraint_v4_syn_z', 'constraint_v4_oe_syn', 'constraint_v4_oe_syn_lower',
                                        'constraint_v4_oe_syn_upper']

    TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS = ['polyphen_pred', 'sift_pred','polyphen_score', 'sift_score', 'highest_splice_ai']
    
    TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS.extend(SPLICE_AI_COLUMNS)
    TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS.extend(GENE_DATABASE_CONSTRAINT_COLUMNS)

    TOP_TRANSCRIPT_SPECICAL_COLUMNS = ['impact', 'impact_severity', 'revel', 'cadd_phred']

    GENE_DATABASE_NORMAL_COLUMNS = ['p_haplo', 'p_triplo', 'clingen_hi' , 'clingen_ts' ]
    GENE_DATABASE_NORMAL_COLUMNS.extend(GENE_DATABASE_CONSTRAINT_COLUMNS)

    GENE_DATABASE_RENAME_MAPPING = {
        "entrez": "entrez_gene_id",
        "gene_stable_id": "ensembl_gene_id",
    }

    GENE_DATABASE_SPECIAL_COLUMNS = ['transcript_stable_id','gene_symbol','is_canonical', 'is_mane_select', 'is_mane_plus_clinical', 'ncbi_ids', 'ensembl_gene_id']

    EXONIC_IMPACTS = {"stop_gained",
                      "exon_variant",
                      "stop_lost",
                      "frameshift_variant",
                      "initiator_codon_variant",
                      "inframe_deletion",
                      "inframe_insertion",
                      "missense_variant",
                      "protein_altering_variant",
                      "incomplete_terminal_codon_variant",
                      "stop_retained_variant",
                      "5_prime_UTR_premature_start_codon_variant",
                      "synonymous_variant",
                      "coding_sequence_variant",
                      "5_prime_UTR_variant",
                      "3_prime_UTR_variant",
                      "transcript_ablation",
                      "transcript_amplification",
                      "feature_elongation",
                      "feature_truncation"}

    # May find a way not to include this map in python
    # https://asia.ensembl.org/info/genome/variation/prediction/predicted_data.html#consequences
    # last update date: 19th Oct 2023
    # last verify date: 3rd March 2025
    SO_IMPACT = {
        'transcript_ablation': 'HIGH',
        'splice_acceptor_variant': 'HIGH',
        'splice_donor_variant': 'HIGH',
        'stop_gained': 'HIGH',
        'frameshift_variant': 'HIGH',
        'stop_lost': 'HIGH',
        'start_lost': 'HIGH',
        'transcript_amplification': 'HIGH',
        'feature_elongation': 'HIGH',
        'feature_truncation': 'HIGH',
        'inframe_insertion': 'MODERATE',
        'inframe_deletion': 'MODERATE',
        'missense_variant': 'MODERATE',
        'protein_altering_variant': 'MODERATE',
        'splice_donor_5th_base_variant': 'LOW',
        'splice_region_variant': 'LOW',
        'splice_donor_region_variant': 'LOW',
        'splice_polypyrimidine_tract_variant': 'LOW',
        'incomplete_terminal_codon_variant': 'LOW',
        'start_retained_variant': 'LOW',
        'stop_retained_variant': 'LOW',
        'synonymous_variant': 'LOW',
        'coding_sequence_variant': 'MODIFIER',
        'mature_miRNA_variant': 'MODIFIER',
        '5_prime_UTR_variant': 'MODIFIER',
        '3_prime_UTR_variant': 'MODIFIER',
        'non_coding_transcript_exon_variant': 'MODIFIER',
        'intron_variant': 'MODIFIER',
        'NMD_transcript_variant': 'MODIFIER',
        'non_coding_transcript_variant': 'MODIFIER',
        'coding_transcript_variant': 'MODIFIER',
        'upstream_gene_variant': 'MODIFIER',
        'downstream_gene_variant': 'MODIFIER',
        'TFBS_ablation': 'MODIFIER',
        'TFBS_amplification': 'MODIFIER',
        'TF_binding_site_variant': 'MODIFIER',
        'regulatory_region_ablation': 'MODIFIER',
        'regulatory_region_amplification': 'MODIFIER',
        'regulatory_region_variant': 'MODIFIER',
        'intergenic_variant': 'MODIFIER',
        'sequence_variant': 'MODIFIER',
        '?': 'UNKNOWN',
        '': 'UNKNOWN',
        'UNKNOWN': 'UNKNOWN'
    }
    IMPACT_SEVERITY_ORDER = dict((x, i) for i, x in enumerate(list(SO_IMPACT.keys())[::-1]))
    EMPTY = [[0,0],[None,0], [0,None], [None,None]]

    # remove unused key    
    EMPTY_KEY = {'gts', 'gt_types', 'gt_phases', 'gt_depths', 'gt_ref_depths', 'gt_alt_depths', 'gt_quals', 'gt_alt_freqs'}

    def __init__(self, variant_file_path, database_path, sample_infos, database_name, result_folder=None, pipeline_version=None, proband_id=None, access_group=None, uat_mode=None, process_num=None, liftover_path=None, brand=None):
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
        self.brand = brand
        self.info_dict = {}
        self.format_dict = {}
        self.header_arr = []
        self.sample_order = []
        self.liftover_path = liftover_path
        self.set_basic_param()
        self._remove_existing()

    def load_data(self):
        if self.already_success:
            return
        self._load_header()
        self._load_samples(self.sample_order)
        # self._load_civic()
        pool = multiprocessing.Pool(self.process_num)
        # we want to keep the header row
        chunks = pd.read_csv(self.variant_file_path, sep='\t', skiprows=self.rownum - 2, chunksize=self.SPLIT_SIZE)
        pool.map(self._read_vcf_chunk, chunks)
        pool.close()
        pool.join()

    ####### start private method ########
    def _read_vcf_chunk(self, chunk):
        database = self._get_database(self.database_path)
        variant_array = []
        comphet_array = []
        chunk_num = -1
        start_chunk_time = time()
        lifter = ChainFile(self.liftover_path, 'hg38', 'hg19')
        for index, row in chunk.iterrows():
            if chunk_num == -1:
                chunk_num = index
            variant_dict = {}
            temp_csq_array = []
            temp_transcript_list = []
            sample_info_format = []
            genotypes_index = []
            gt_quals = []
            gt_ref_depths = []
            gt_alt_depths = []
            special_handle_dict = {}
            highest_exom_dict = {}
            highest_splice_ai = -1
            for ii, field in enumerate(row):
                if self.header_arr[ii] == '#CHROM':
                    variant_dict['chrom'] = field
                elif self.header_arr[ii] == 'POS':
                    variant_dict['start'] = int(field)
                elif self.header_arr[ii] == 'ID':
                    pass
                elif self.header_arr[ii] == 'REF':
                    variant_dict['ref'] = field
                elif self.header_arr[ii] == 'ALT':
                    variant_dict['alt'] = field
                elif self.header_arr[ii] == 'QUAL':
                    if field == '.':
                        variant_dict['quality'] = None
                    else:
                        variant_dict['quality'] = float(field)
                elif self.header_arr[ii] == 'FILTER':
                    if field == 'PASS':
                        variant_dict['pass_filter'] = field
                    else:
                        variant_dict['pass_filter'] = None
                elif self.header_arr[ii] == 'INFO':
                    temp_infos = field.split(';')
                    for temp_info in temp_infos:
                        infos = temp_info.split("=")
                        
                        if len(infos) > 1:
                            if infos[0] != 'CSQ':
                                if (infos[0]).lower() not in self.NOT_USED_COLUMNS and (infos[0]).lower() not in self.SPECIAL_HANDLE_COLUMNS:
                                    variant_dict[(infos[0]).strip().lower()] = self._get_str_value(infos[1])
                                elif (infos[0]).lower() in self.SPECIAL_HANDLE_COLUMNS:
                                    if (infos[0]).lower() in self.EXOMISER_COLUMNS:
                                        if infos[1]:
                                            variant_dict[(infos[0]).strip().lower()] = self._try_to_round_sig(self._get_str_value(infos[1]), 6)
                                            exom_type = (infos[0]).strip().lower().split('_')[-1]
                                            if exom_type not in highest_exom_dict and variant_dict[(infos[0]).strip().lower()]:
                                                highest_exom_dict[self.HIGHEST_EXOMISER_MAPPING[exom_type]] = variant_dict[(infos[0]).strip().lower()]
                                            elif variant_dict[(infos[0]).strip().lower()]:
                                                highest_exom_dict[self.HIGHEST_EXOMISER_MAPPING[exom_type]] = self._get_max_number(variant_dict[(infos[0]).strip().lower()], highest_exom_dict[exom_type])
                                    else:
                                        variant_dict[(infos[0]).strip().lower()] = infos[1]
                            else:
                                csq_array = infos[1].split(',')
                                for csq_line in csq_array:
                                    csq_infos = csq_line.split('|')
                                    csq_dict = { 'is_exonic': 0 }
                                    for jj, csq_info in enumerate(csq_infos):
                                        if csq_info != '':
                                            if self.info_dict['CSQ']['Format'][jj].lower() not in self.SPECIAL_HANDLE_COLUMNS and self.info_dict['CSQ']['Format'][jj].lower() not in self.CSQ_NOT_USED_COLUMNS:
                                                csq_dict[self.info_dict['CSQ']['Format'][jj].strip().lower()] = self._get_str_value(csq_info)
                                            else:
                                                if self.info_dict['CSQ']['Format'][jj].lower() in self.RENAME_COLUMNS:
                                                    csq_dict[self.RENAME_COLUMNS[self.info_dict['CSQ']['Format'][jj].strip().lower()]] = self._get_str_value(csq_info)
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() in self.SPLICE_AI_COLUMNS:
                                                    csq_dict[self.info_dict['CSQ']['Format'][jj].strip().lower()] = self._get_str_value(csq_info)
                                                    csq_dict['highest_splice_ai'] = self._get_max_number(csq_dict[self.info_dict['CSQ']['Format'][jj].strip().lower()], highest_splice_ai)
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() == 'consequence':
                                                    csq_dict['impact'] = list(itertools.chain.from_iterable(x.split("+") for x in csq_info.split('&')))
                                                    csq_dict['impact_so'] = sorted([(self.IMPACT_SEVERITY_ORDER.get(c, 0), c) for c in csq_dict['impact']], reverse=True)[0][1]
                                                    csq_dict['impact_severity'] = self.get_severity(csq_dict['impact'])
                                                    csq_dict['impact_severity_score'] =  3 if csq_dict['impact_severity'] == 'HIGH' else 2 if csq_dict['impact_severity'] == 'MODERATE' else 1 if csq_dict['impact_severity'] == 'LOW' else 0
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() == 'polyphen':
                                                    if csq_info and '(' in csq_info:
                                                        csq_dict['polyphen_pred'] = csq_info.split('(')[0]
                                                        csq_dict['polyphen_score'] = float(csq_info.split('(')[1][:-1])
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() == 'sift':
                                                    if csq_info and '(' in csq_info:
                                                        csq_dict['sift_pred'] = csq_info.split('(')[0]
                                                        csq_dict['sift_score'] = float(csq_info.split('(')[1][:-1])
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() == 'canonical':
                                                    csq_dict['is_canonical'] = csq_info
                                                elif self.info_dict['CSQ']['Format'][jj].strip().lower() == 'clnid':
                                                    csq_dict[self.info_dict['CSQ']['Format'][jj].strip().lower()] = csq_info
                                    
                                    if 'feature_type' in csq_dict and csq_dict['feature_type'] == 'Transcript':
                                        csq_dict['transcript'] = csq_dict['feature']
                                        for each_impact in csq_dict['impact']:
                                            if each_impact in self.EXONIC_IMPACTS:
                                                csq_dict['is_exonic'] = 1
                                        csq_dict['is_coding'] = 0
                                        if csq_dict['biotype'] == 'protein_coding' and csq_dict['is_exonic']:
                                            any_utr = False
                                            for impact in csq_dict['impact']:
                                                if '_UTR_' in impact:
                                                    any_utr = True
                                                    break
                                            if not any_utr:
                                                csq_dict['is_coding'] = 1
                                        del csq_dict['feature']
                                        del csq_dict['biotype']
                                        temp_transcript_list.append(csq_dict['transcript'].split('.')[0])
                                        temp_csq_array.append(csq_dict)
                elif self.header_arr[ii] == 'FORMAT':
                    if isinstance(field, str) and ':' in field:
                        sample_info_format = field.split(':')
                    else:
                        sample_info_format = [field]
                else:
                    # handle the format tags with order in sample_infos
                    if isinstance(field, str) and ':' in field: 
                        sample_format_infos = field.split(':')
                    else:
                        sample_format_infos = [field]
                    for idx, format in enumerate(sample_info_format):
                        if format == 'GT':
                            if isinstance(sample_format_infos[idx], str):
                                each_sample_gt = sample_format_infos[idx].replace('|', '/').split('/')
                                each_sample_gt = [None if gt_num == '.' else int(gt_num) for gt_num in each_sample_gt]
                            else:
                                each_sample_gt = sample_format_infos[idx] 
                            if len(each_sample_gt) == 1:
                                each_sample_gt.append(None)
                            genotypes_index.append(each_sample_gt)
                        elif format == 'GQ':
                            gt_quals.append(self._get_str_value(sample_format_infos[idx]))
                        elif format == 'AD':
                            temp_depths = sample_format_infos[idx].split(',')
                            if len(temp_depths) > 0:
                                gt_ref_depths.append(self._get_str_value(temp_depths[0]))
                            if len(temp_depths) > 1:
                                gt_alt_depths.append(self._get_str_value(temp_depths[1]))

            # since we are using ped sample order rather than vcf header order so we need to modify the order in format tag
            genotypes_index = self._order_format_list(self.sample_infos['sample_id'],genotypes_index, self.sample_order)
            gt_quals = self._order_format_list(self.sample_infos['sample_id'],gt_quals, self.sample_order)
            gt_ref_depths = self._order_format_list(self.sample_infos['sample_id'],gt_ref_depths, self.sample_order)
            gt_alt_depths = self._order_format_list(self.sample_infos['sample_id'],gt_alt_depths, self.sample_order)

            variant_dict['genotypes_index'] = genotypes_index
            if(variant_dict['genotypes_index']):
                self._set_scenario(variant_dict)

            # create gene object base on gene database
            genes = database.find(self.MONGO_DB_GENE_DATABASE_NAME, self.MONGO_DB_GENE_COLLECTION_NAME, { 'version' : self.gene_db_version, '$or': [{ 'transcript_stable_id': { "$in": temp_transcript_list } }, { 'ncbi_id': { "$in": temp_transcript_list } } ] })
            gene_dict =  {gene['transcript_stable_id']:gene for gene in genes}
            gene_dict.update({gene['ncbi_id']:gene for gene in genes})

            # setup for gene object
            for column_key in self.TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS:
                special_handle_dict[column_key] = []
            for column_key in self.TOP_TRANSCRIPT_SPECICAL_COLUMNS:
                if column_key == 'impact_severity':
                    special_handle_dict[column_key] = ''
                elif column_key == 'impact':
                    special_handle_dict[column_key] = set()
            # for column_key in self.HIGHEST_EXOMISER_MAPPING.values():
            #     if column_key in highest_exom_dict:
            #         variant_dict[column_key] = highest_exom_dict[column_key]
            #     else:
            #         variant_dict[column_key] = 0
            # for default show list
            all_gene = set()
            no_default_gene_set = set()
            default_gene_set = set()
            temp_gene_objects = []
            temp_is_coding = False
            temp_is_exonic = False
            for gene_object in temp_csq_array:
                if 'is_coding' in gene_object and gene_object['is_coding']:
                    temp_is_coding = True
                if 'is_exonic' in gene_object and gene_object['is_exonic']:
                    temp_is_exonic = True
                part_of_transcript = gene_object['transcript'].split('.')[0]
                if part_of_transcript in gene_dict:
                    gene = gene_dict[part_of_transcript]
                    default_show = False

                    for database_name in self.GENE_DATABASE_NORMAL_COLUMNS:
                        if database_name in gene and gene[database_name]:
                            gene_object[database_name] = gene[database_name]
                    for database_name in self.GENE_DATABASE_RENAME_MAPPING.keys():
                        if database_name in gene and gene[database_name]:
                            gene_object[self.GENE_DATABASE_RENAME_MAPPING[database_name]] = gene[database_name]
                    for database_name in self.GENE_DATABASE_SPECIAL_COLUMNS:
                        if database_name == 'transcript_stable_id':
                            # transcript we use ensembl
                            gene_object['transcript'] = gene['transcript_stable_id']
                        elif database_name == 'gene_symbol' and 'gene_symbol' in gene and gene['gene_symbol']:
                            gene_object['gene'] = gene['gene_symbol']
                            gene_object['gene_filter'] = gene['gene_symbol'].upper()
                        elif database_name == 'is_canonical':
                            if 'is_canonical' in gene and gene['is_canonical']:
                                gene_object['is_canonical'] = gene['is_canonical']
                                default_show = True
                            else:
                                gene_object['is_canonical'] = False
                        elif database_name == 'is_mane_select':
                            if 'is_mane_select' in gene and gene['is_mane_select']:
                                gene_object['is_mane_select'] = gene['is_mane_select']
                                default_show = True
                            else:
                                gene_object['is_mane_select'] = False
                        elif database_name == 'is_mane_plus_clinical':
                            if 'is_mane_plus_clinical' in gene and gene['is_mane_plus_clinical']:
                                gene_object['is_mane_plus_clinical'] = gene['is_mane_plus_clinical']
                                default_show = True
                                gene_dict['mane_plus_clinical'] = gene_object['transcript']
                            else:
                                gene_object['is_mane_plus_clinical'] = False
                        elif database_name == 'ncbi_ids':
                            # only add ncbi_ids when it is not MANE SELECT
                            if ('mane_select' not in gene_object or not gene_object['mane_select']) and 'ncbi_ids' in gene and gene['ncbi_ids']:
                                gene_object['ncbi_ids'] = gene['ncbi_ids']
                        elif database_name == 'ensembl_gene_id':
                            if 'ensembl_gene_id' in gene_object and gene_object['ensembl_gene_id']:
                                all_gene.add(gene_object['ensembl_gene_id'])
                    if default_show:
                        gene_object['default_show'] = True
                        default_gene_set.add(gene_object['ensembl_gene_id'])
                        self._handle_gene_related_special_columns(gene_object, special_handle_dict)
                    else:
                        no_default_gene_set.add(gene_object['ensembl_gene_id'])
                        gene_object['default_show'] = False

                    gene_object['is_related'] = True
                    temp_gene_objects.append(gene_object)
            
            variant_dict['is_coding'] = temp_is_coding
            variant_dict['is_exonic'] = temp_is_exonic
            # logic for bioinformation
            variant_dict['end'] = variant_dict['start'] + len(variant_dict['ref']) - 1
            variant_dict['genotype_qualities'] = [[int(i) if i != '.' else -1 for i in gt_quals]] if gt_quals else []
            variant_dict['allelic_depths'] = [ [ref_depth, alt_depth] for (ref_depth, alt_depth) in zip(gt_ref_depths, gt_alt_depths) ] if gt_ref_depths and gt_alt_depths else []

            de_dup_transcripts = set()
            de_dup_temp_gene_objects = []
            # remove duplicate and remove empty key
            for temp_gene_obj in temp_gene_objects:
                if temp_gene_obj['transcript'] not in de_dup_transcripts:
                    de_dup_transcripts.add(temp_gene_obj['transcript'])
                    new_temp_gene_object = {k: v for k, v in temp_gene_obj.items() if not(v is None or v == '' or ((isinstance(v, list) and len(v) == 0) or k in self.EMPTY_KEY))}
                    de_dup_temp_gene_objects.append(new_temp_gene_object)
            de_dup_temp_gene_objects = sorted(de_dup_temp_gene_objects, key=lambda gene:gene.get('impact_severity_score') if gene.get('impact_severity_score') else -1, reverse=True)
            de_dup_temp_gene_objects = sorted(de_dup_temp_gene_objects, key=lambda gene:gene.get('is_canonical') if gene.get('is_canonical') else -1, reverse=True)
            de_dup_temp_gene_objects = sorted(de_dup_temp_gene_objects, key=lambda gene:gene.get('is_mane_plus_clinical') if gene.get('is_mane_plus_clinical') else -1, reverse=True)
            de_dup_temp_gene_objects = sorted(de_dup_temp_gene_objects, key=lambda gene:gene.get('is_mane_select') if gene.get('is_mane_select') else -1, reverse=True)
            
            # add back show default if any gene that don't have any transcript that is canonical, is mane plus clinical or mane select
            for gene in all_gene:
                if gene not in default_gene_set and gene in no_default_gene_set:
                    for gene_object in de_dup_temp_gene_objects:
                        if 'ensembl_gene_id' in gene_object and gene_object['ensembl_gene_id'] == gene:
                            gene_object['default_show'] = True
                            self._handle_gene_related_special_columns(gene_object, special_handle_dict)
                        break

            variant_dict['gene_objs'] = de_dup_temp_gene_objects
            if len(variant_dict['gene_objs']) > 0:
                for key in variant_dict['gene_objs'][0]:
                    if key in self.TOP_TRANSCRIPT_COLUMNS:
                        variant_dict[key] = variant_dict['gene_objs'][0][key]
                    elif key in self.TOP_TRANSCRIPT_RENAME_COLUMNS:
                         variant_dict[self.TOP_TRANSCRIPT_RENAME_COLUMNS[key]] = variant_dict['gene_objs'][0][key]
            
            for column_key in self.TRANSCRIPT_DEFAULT_AS_ARRAY_COLUMNS:
                if special_handle_dict[column_key] and isinstance(special_handle_dict[column_key], list):
                    variant_dict[column_key] = self._unique(special_handle_dict[column_key])
                    variant_dict['first_' + column_key] = special_handle_dict[column_key][0]
                    if column_key == 'highest_splice_ai':
                        if variant_dict['first_' + column_key] <= 0.1:
                            variant_dict['splice_class'] = 'no_impact'
                        elif variant_dict['first_' + column_key] >= 0.2:
                            variant_dict['splice_class'] = 'predicted_impact'
                        else:
                            variant_dict['splice_class'] = 'no_info'
            for column_key in self.TOP_TRANSCRIPT_SPECICAL_COLUMNS:
                if column_key == 'impact_severity' and 'impact_severity' in variant_dict:
                    variant_dict[column_key] = special_handle_dict[column_key]
                elif column_key == 'impact' and 'impact' in variant_dict:
                    variant_dict[column_key] = list(variant_dict[column_key])
                    variant_dict[column_key] =  variant_dict[column_key] if variant_dict[column_key] and len(variant_dict[column_key]) > 0 else None
                    if variant_dict[column_key]:
                        variant_dict['first_impact'] = variant_dict[column_key][0]
                elif column_key == 'revel' and len(variant_dict['gene_objs']) > 0:
                    if column_key in variant_dict['gene_objs'][0]:
                        variant_dict[column_key] = variant_dict['gene_objs'][0][column_key]
                        # assume all of the revel should be a number
                        if variant_dict['gene_objs'][0][column_key] <= 0.183:
                            variant_dict['revel_class'] = 'bengin'
                        elif variant_dict['gene_objs'][0][column_key] >= 0.773:
                            variant_dict['revel_class'] = 'pathogenic'
                        else:
                            variant_dict['revel_class'] = 'neutral'
                    else:
                        variant_dict[column_key] = -1
                elif column_key == 'cadd_phred' and len(variant_dict['gene_objs']) > 0:
                    if column_key in variant_dict['gene_objs'][0]:
                        variant_dict[column_key] = variant_dict['gene_objs'][0][column_key]
                        # assume all cadd_phred should be a number
                        if variant_dict['gene_objs'][0][column_key] <= 22.7:
                            variant_dict['cadd_class'] = 'bengin'
                        elif variant_dict['gene_objs'][0][column_key] >= 25.3:
                            variant_dict['cadd_class'] = 'pathogenic'
                        else:
                            variant_dict['cadd_class'] = 'neutral'
                    else:
                        variant_dict[column_key] = -1
            
            # setup AF value
            for key in self.AF_FIELDS:
                if key in variant_dict:
                    if type(variant_dict[key]) is str and '&' in variant_dict[key]:
                        temp_gnomad_afs = variant_dict[key].split('&')
                        highest_each_gnomad_af = -1
                        for temp_gnomad_af in temp_gnomad_afs:
                            highest_each_gnomad_af = self._get_max_number(temp_gnomad_af, highest_each_gnomad_af)
                        variant_dict[key] = highest_each_gnomad_af
                    if variant_dict[key] == None or variant_dict[key] == '':
                        variant_dict[key] = -1
                    else:
                        variant_dict[key] = self._try_to_round_sig(variant_dict[key], 5)
                else:
                    variant_dict[key] = -1

            # setup the highest af value
            temp_highest_af = -1
            highest_af_info = {}
            for af_key in self.HIGHEST_AF_NAME_MAPPING.keys():
                if isinstance(variant_dict[af_key], list):
                    for temp_af in variant_dict[af_key]:
                        if temp_af:
                            temp_highest_af = self._get_max_number(temp_af, temp_highest_af)
                            if temp_highest_af == temp_af:
                                highest_af_info['source'] = self.HIGHEST_AF_NAME_MAPPING[af_key]
                elif variant_dict[af_key]:
                    temp_highest_af = self._get_max_number(variant_dict[af_key], temp_highest_af)
                    if temp_highest_af == variant_dict[af_key]:
                        highest_af_info['source'] = self.HIGHEST_AF_NAME_MAPPING[af_key]

            variant_dict['highest_af'] = temp_highest_af
            variant_dict['highest_af_info'] = highest_af_info
            try:
                temp_hg19_obj = lifter.convert_coordinate(variant_dict['chrom'].replace("chr",""), variant_dict['start'])
                if temp_hg19_obj:
                    variant_dict['hg19_chrom'] = temp_hg19_obj[0][0]
                    variant_dict['hg19_start'] = temp_hg19_obj[0][1]
                    variant_dict['hg19_strand'] = temp_hg19_obj[0][2]
                temp_hg19_obj = lifter.convert_coordinate(variant_dict['chrom'].replace("chr",""), variant_dict['end'])
                if temp_hg19_obj:
                    variant_dict['hg19_end'] = temp_hg19_obj[0][1]
            except Exception as e:
                print("liftover error: ", e)

            variant_dict['type'] = self._get_type(variant_dict['alt'], variant_dict['ref'])

            # only for cancer but can annotat for others too
            # civic_results = []
            # # query = civic.CoordinateQuery(variant_dict['chrom'].replace('chr', ''), variant_dict['start'], variant_dict['end'], alt=variant_dict['alt'], ref=variant_dict['ref'], build='GRCh38')
            # if (variant_dict['chrom'].replace('chr', '') + ',' + str(variant_dict['start']) + ',' + str(variant_dict['end']) + ',' + variant_dict['alt'] + ',' + variant_dict['ref']) in self.civic_variant_dict:
            #     civic_results.extend(self.civic_variant_dict[variant_dict['chrom'].replace('chr', '') + ',' + str(variant_dict['start']) + ',' + str(variant_dict['end']) + ',' + variant_dict['alt'] + ',' + variant_dict['ref']])
            # if(variant_dict['chrom'].replace('chr', '') + ',' + str(variant_dict['start']) + ',' + str(variant_dict['end'])) in self.civic_variant_dict:
            #     civic_results.extend(self.civic_variant_dict[variant_dict['chrom'].replace('chr', '') + ',' + str(variant_dict['start']) + ',' + str(variant_dict['end'])])
            # # civic_results = civic.search_variants_by_coordinates(query, 'exact')
            # if civic_results and len(civic_results) > 0:
            #     variant_dict['civic'] = []
            #     variant_dict['highest_civic'] = {}
            #     civic_result_count = 0
            #     for civic_result in civic_results:
            #         if civic_result.molecular_profiles:
            #             temp_civic_dict = {}
            #             temp_civic_dict['variant_id'] = civic_result.id
            #             temp_civic_dict['molecular_profile'] = []
            #             molecular_profile_count = 0
            #             for molecular_profile in civic_result.molecular_profiles:
            #                 temp_molecular_profile_dict = {}
            #                 temp_molecular_profile_dict['id'] = molecular_profile.id
            #                 temp_molecular_profile_dict['description'] = molecular_profile.description
            #                 temp_molecular_profile_dict['score'] = molecular_profile.molecular_profile_score
            #                 temp_molecular_profile_dict['evidence'] = []
            #                 evidence_count = 0
            #                 for evidence in molecular_profile.evidence:
            #                     temp_evidence_dict = {}
            #                     temp_evidence_dict['evidence_id'] = evidence.id
            #                     temp_evidence_dict['evidence_level'] = evidence.evidence_level
            #                     temp_evidence_dict['evidence_type'] = evidence.evidence_type
            #                     if evidence.disease_id:
            #                         disease = civic.get_disease_by_id(evidence.disease_id)
            #                         if disease:
            #                             temp_evidence_dict['disease_id'] = disease.id
            #                             temp_evidence_dict['disease_name'] = disease.name
            #                     temp_molecular_profile_dict['evidence'].append(temp_evidence_dict)
            #                     if evidence_count == 0:
            #                         temp_molecular_profile_dict['highest_evidence'] = temp_evidence_dict
            #                     evidence_count += 1
            #                 if molecular_profile_count == 0:
            #                     temp_civic_dict['highest_molecular_profile'] = temp_molecular_profile_dict
            #                 temp_civic_dict['molecular_profile'].append(temp_molecular_profile_dict)
            #                 molecular_profile_count += 1
            #             if civic_result_count == 0:
            #                 variant_dict['highest_civic'] = temp_civic_dict
            #             variant_dict['civic'].append(temp_civic_dict)
            #         civic_result_count += 1
                
            # hardcode in this handler all variant type are small
            variant_dict['variant_type'] = self.VARIANT_TYPE
            variant_dict['variant_id'] = str(index)
            
            # compound het map for later update
            self._handle_compound_het(variant_dict, comphet_array)

            # print('=======================================')
            # # start compare with mongoDB
            # mongo_variant = database.find_one_variant(self.db_name, {'chrom': variant_dict['chrom'], 'start': variant_dict['start']})
            # if 'sample' in variant_dict and len(variant_dict['sample']) > 0:
            #     # Find differences between variant_dict and mongo_variant
            #     diff = {}
            #     for key in variant_dict:
            #         if key in mongo_variant and variant_dict[key] != mongo_variant[key]:
            #             if key != 'gene_objs':
            #                 if isinstance(variant_dict[key], list) and isinstance(mongo_variant[key], list):
            #                     if sorted(variant_dict[key]) != sorted(mongo_variant[key]):
            #                         diff[key] = (variant_dict[key], mongo_variant[key])
            #                 else:
            #                     diff[key] = (variant_dict[key], mongo_variant[key])
            #             else:
            #                 for idx, gene in enumerate(variant_dict[key]):
            #                     for gene_key in gene:
            #                         if gene_key in mongo_variant[key][idx] and gene[gene_key] != mongo_variant[key][idx][gene_key]:
            #                             if isinstance(gene[gene_key], list) and isinstance(mongo_variant[key][idx][gene_key], list):
            #                                 if sorted(gene[gene_key]) != sorted(mongo_variant[key][idx][gene_key]):
            #                                     diff['gene_objs['+str(idx)+'].'+gene_key] = (gene[gene_key], mongo_variant[key][idx][gene_key])
            #                             else:
            #                                 diff['gene_objs['+str(idx)+'].'+gene_key] = (gene[gene_key], mongo_variant[key][idx][gene_key])
            #                         elif gene_key not in mongo_variant[key][idx] and gene != '':
            #                             diff['gene_objs['+str(idx)+'].'+gene_key] = (gene[gene_key], None)
            #                     # for gene_key in mongo_variant[key][idx]:
            #                     #     if gene_key not in gene and gene_key not in IGNORE_COLUMNS:
            #                     #         diff['gene_objs['+str(idx)+'].'+gene_key] = (None, mongo_variant[key][idx][gene_key])
            #         elif key not in mongo_variant and variant_dict[key] != '':
            #             diff[key] = (variant_dict[key], None)

            #     # Find keys that are only in mongo_variant
            #     for key in mongo_variant:
            #         if key not in variant_dict:
            #             diff[key] = (None, mongo_variant[key])

            #     # remove the differences with None and 'None'
            #     removeKey = []
            #     for key in diff:
            #         if diff[key] == (None, 'None'):
            #             removeKey.append(key)
            #     for key in removeKey:
            #         del diff[key]
            #     # Print the differences
            #     if diff:
            #         diff['chr'] = variant_dict['chrom']
            #         diff['start'] = variant_dict['start']
            #         print(diff)
            #         # if not is_first:
            #         #     print(",", json.dumps(diff))
            #         # else:
            #         #     print(json.dumps(diff))
            #         #     is_first = False
            
            # break
            variant_array.append(variant_dict)
        sys.stdout.write("massage chunk %d completed in %ds\n" % (chunk_num, time() - start_chunk_time))
        start_write_time = time()
        self.save_result(variant_array, self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, str(chunk_num))
        sys.stdout.write("chunk %d write variants completed in %ds\n" % (chunk_num, time() - start_write_time))
        if len(comphet_array) > 0:
            self.save_result(comphet_array, self.db_name, self.MONGO_DB_COMPHET_COLLECTION_NAME, str(chunk_num))
        sys.stdout.write("chunk %d write compound het completed in %ds\n" % (chunk_num, time() - start_write_time))
        database.close_database()

    def _load_header(self):
        self.rownum = 1
        headers = ""
        with gzip.open(self.variant_file_path, 'rt') as f:
            for line in f:
                # info row
                if line.startswith('#'):
                    headers += line
                    if line.startswith('##fileformat'):
                        self._read_file_format(line)
                    elif line.startswith('##INFO='):
                        self._read_info(line)
                    elif line.startswith('##FORMAT='):
                        self._read_format(line)
                    elif line.startswith('#CHROM'):
                        self.header_arr = line.strip().split('\t')
                else:
                    break
                self.rownum += 1
        
        # get the sample order
        for header in self.header_arr:
            if header not in ['#CHROM','POS','ID','REF','ALT','QUAL','FILTER','INFO', 'FORMAT']:
                self.sample_order.append(header.replace('_','-'))
        
        # create the database object as dict
        database = self._get_database(self.database_path)
        database.delete_one(self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME, {'type': 'vcf_header' })
        database.close_database()
        commoninfo_results = []
        vcf_header = {}
        vcf_header['type'] = 'vcf_header'
        vcf_header['vcf_header'] = headers
        commoninfo_results.append(vcf_header)
        
        # store the information
        self.save_result(commoninfo_results, self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME)

    def _remove_existing(self):
        database = self._get_database(self.database_path)
        # check if this program has already run successfully
        database_exist = database.find_one(self.MONGO_DB_COMMON_DATABASE_NAME, self.MONGO_DB_DATABASE_COLLECTION_NAME, { 'database_name': self.db_name })
        if database_exist and 'tool_complete_infos' in database_exist and any(d['tool_name'] == self.DEFAULT_APP_NAME for d in database_exist['tool_complete_infos']):
            # no need to run
            self.already_success = True
        # then need to check if the variant table got any variant that is from existing source
        elif database_exist:
            handler_condition = { 'variant_type': self.VARIANT_TYPE }
            variant_exist = database.find_one_variant(self.db_name, handler_condition)
            if variant_exist:
                database.delete_many(self.db_name, self.MONGO_DB_VARIANT_COLLECTION_NAME, handler_condition)
                database.drop_table(self.db_name, self.MONGO_DB_COMMONINFO_COLLECTION_NAME)
                database.drop_table(self.db_name, self.MONGO_DB_SAMPLES_COLLECTION_NAME)
        database.close_database()

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
    
    # def _load_civic(self):
    #     civic.load_cache(on_stale='ignore')
    #     variant_list = civic.get_all_variants()
    #     self.civic_variant_dict = {}
    #     for variant in variant_list:
    #         if hasattr(variant, 'coordinates') and variant.coordinates and variant.coordinates.chromosome and variant.coordinates.start and variant.coordinates.end:
    #             if variant.coordinates.variant_bases and variant.coordinates.reference_bases:
    #                 if (variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                         str(variant.coordinates.end) + ',' + variant.coordinates.variant_bases + ',' + 
    #                         variant.coordinates.reference_bases) in self.civic_variant_dict:
    #                     self.civic_variant_dict[variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                                         str(variant.coordinates.end) + ',' + variant.coordinates.variant_bases + ',' + 
    #                                         variant.coordinates.reference_bases].append(variant)
    #                 else:
    #                     self.civic_variant_dict[variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                                         str(variant.coordinates.end) + ',' + variant.coordinates.variant_bases + ',' + 
    #                                         variant.coordinates.reference_bases] = [variant]
    #             else:
    #                 if (variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                         str(variant.coordinates.end)) in self.civic_variant_dict:
    #                     self.civic_variant_dict[variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                                         str(variant.coordinates.end)].append(variant)
    #                 else:
    #                     self.civic_variant_dict[variant.coordinates.chromosome + ',' + str(variant.coordinates.start) + ',' + 
    #                                         str(variant.coordinates.end)] = [variant]