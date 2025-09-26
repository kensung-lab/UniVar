# -*- coding: utf-8 -*-
"""
Created on Tue Jan 23 11:17:57 2024

@author: ccyauyeung
"""

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
from pyhpo import Ontology
import json
import os


# create hpo term dictionary
_ = Ontology()

df_pyhpo = Ontology.to_dataframe()
df_pyhpo['hpo_id'] = df_pyhpo.index

df_gene2pheno = df_pyhpo[['hpo_id', 'name','genes', 'ic_gene', 'dTop_l']].drop_duplicates()
df_gene2pheno['gene'] = df_gene2pheno.genes.str.split('|')
df_gene2pheno['hpo_gene_cnt'] = df_gene2pheno.genes.str.split('|', expand=False).agg([len])
df_gene2pheno = df_gene2pheno.explode('gene')
df_gene2pheno = df_gene2pheno.drop(columns=['genes'])


panel_to_gene_list = []

# create panel app list
folder_path = '../data'
for filename in os.listdir(folder_path):
    if filename.endswith(".json"):
        file_path = os.path.join(folder_path, filename)
        with open(file_path, 'r') as f:
            data =json.load(f)

        temp_dict = {}
        temp_dict['display_name'] = data['name']
        panel_to_gene_list.append(temp_dict.copy())
        
        for ii in data['genes']:
            gene_data = ii['gene_data']
            temp_dict['gene'] = gene_data['gene_symbol']
            
            if 'confidence_level' in gene_data:
                temp_dict['confidence_level'] = gene_data['confidence_level']
            elif 'classification' in gene_data:
                temp_dict['classification'] = gene_data['classification']
                
            panel_to_gene_list.append(temp_dict.copy())

df_genePanel = pd.DataFrame(panel_to_gene_list).drop_duplicates()


# keep green and amber genes only
df_genePanel['confidence_level'] = df_genePanel['confidence_level'].fillna(0)
df_genePanel = df_genePanel[(df_genePanel.classification.isin(['Definitive', 'Strong']))|(df_genePanel.confidence_level>1)]

panel_display_list = list(df_genePanel.display_name.unique())
panel2hpo = []

# compute top 5 most common hpo term in each gene panel
for i in panel_display_list:
    
    panel_dict = {}
    panel_dict['display_name'] = i
    df_genePanel_target = df_genePanel[df_genePanel.display_name.isin([i])]
    df_genePanel_target = df_genePanel_target.merge(df_gene2pheno[['gene', 'hpo_id', 'name','ic_gene', 'dTop_l', 'hpo_gene_cnt']], how='left', on=['gene']).drop_duplicates()
    df_genePanel_target_cnt = df_genePanel_target.groupby(['hpo_id', 'name', 'ic_gene', 'dTop_l', 'hpo_gene_cnt'])['gene'].count().reset_index(name='gene_cnt')
    df_genePanel_target_cnt = df_genePanel_target_cnt[df_genePanel_target_cnt.dTop_l>=3].sort_values(by=['gene_cnt'], ascending=False).reset_index(drop=True)
    
    hpo_predict = ','.join(list(df_genePanel_target_cnt[0:5].hpo_id.unique()))
    panel_dict['hpo_top5'] = hpo_predict    
    panel2hpo.append(panel_dict.copy())


df_panel2hpo = pd.DataFrame(panel2hpo)

df_panel2hpo.to_csv(r'data/panel2hpo_top5.tsv', sep='\t', index=False)
