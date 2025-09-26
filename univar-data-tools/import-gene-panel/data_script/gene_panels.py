import asyncio
import config
import json
import logging
import pandas as pd
import requests
import traceback
from datetime import datetime
from requests.adapters import HTTPAdapter, Retry
from tqdm import tqdm

def generate_clingen_json():
    print("Starting ClinGen JSON generation...")
    df = pd.read_csv(config.CLINGEN_GENE_DISEASE_PATH, skiprows=config.CLINGEN_GENE_DISEASE_SKIP_LINES)
    if '+' in df['GENE SYMBOL'][0]:
        df = df.drop(0)  # Drop the +++++++ line
        print("Dropped header line from ClinGen data")
    
    unique_diseases = df['GCEP'].unique()
    for disease in tqdm(unique_diseases, desc="Processing ClinGen diseases"):
        panel = {}
        panel['id'] = disease
        panel['name'] = "(clingen)" + disease
        panel['version'] = config.CLINGEN_GENE_DISEASE_VERSION
        panel['genes'] = []
        for index, row in df[df['GCEP'] == disease].iterrows():
            if row['CLASSIFICATION'].lower() not in ("strong", "definitive"):
                continue
            gene_obj = {}
            gene_obj['gene_data'] = {}
            gene_obj['gene_data']['gene_symbol'] = row['GENE SYMBOL']
            gene_obj['gene_data']['classification'] = row['CLASSIFICATION']
            gene_obj['gene_data']['disease_label'] = row['DISEASE LABEL']
            panel['genes'].append(gene_obj)

        output_file = f"{config.OUTPUT_DIR}/clingen_{disease.lower().replace(' ', '_').replace('/', '.')}.json"
        with open(output_file, 'w') as f:
            json.dump(panel, f, ensure_ascii=False)
        print(f"Saved ClinGen panel: {output_file}")
    print("ClinGen JSON generation completed.")

async def fetch_panel_list(country, url):
    print(f"Fetching panel list for {country}...")
    panel_list = []
    i = 1
    while True:
        responses = json.loads(http_request(url).text)
        
        # output_file = f"{config.OUTPUT_DIR}/panelapp_{country}.{datetime.today().strftime('%Y%m%d')}.p{i}.json"
        # with open(output_file, 'w') as f:
        #     json.dump(responses, f, ensure_ascii=False)
        # print(f"Saved backup: {output_file}")

        panel_list.extend([result['id'] for result in responses['results']])
        next_url = responses['next']
        if next_url is None:
            break
        url = next_url
        i += 1
    print(f"Retrieved {len(panel_list)} panels for {country}")
    return panel_list

async def save_panel_details(panel_id, country):
    panel_api_info = config.PANELAPP_INFO[country]
    panel_obj = {}
    
    try:
        responses = json.loads(http_request(f"{panel_api_info['PANELAPP_DETAILS']}{panel_id}?format=json").text)
        
        panel_obj['id'] = f"panel{country}_{panel_id}"
        panel_obj['name'] = f"({country}){responses['name']}"
        panel_obj['version'] = responses['version']
        panel_obj['genes'] = []

        for g in responses['genes']:
            gene_obj = {}
            gene_obj['gene_data'] = {}
            gene_obj['gene_data']['gene_symbol'] = g['gene_data']['gene_symbol']
            gene_obj['gene_data']['confidence_level'] = int(g['confidence_level'])
            panel_obj['genes'].append(gene_obj)

        output_file = f"{config.OUTPUT_DIR}/panel{country}_{panel_id}.json"
        with open(output_file, 'w') as f:
            json.dump(panel_obj, f, ensure_ascii=False)
        return f"Saved panel: {output_file}"
    except Exception as e:
        logging.error(f"[FAIL] Processing panel {panel_id} for {country}")
        logging.error(traceback.format_exc())
        return f"Failed to process panel {panel_id}"

async def generate_panelapp_json(country):
    print(f"Starting PanelApp JSON generation for {country}...")
    panel_api_info = config.PANELAPP_INFO[country]
    panel_list = await fetch_panel_list(country, panel_api_info['PANELAPP_LIST'])
    
    tasks = [save_panel_details(pid, country) for pid in panel_list]
    results = []
    for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc=f"Processing {country} panels"):
        result = await f
        results.append(result)
        print(result)
    print(f"PanelApp JSON generation for {country} completed.")

def http_request(url):
    try:
        s = requests.Session()
        retries = Retry(total=5, backoff_factor=2, status_forcelist=[502, 503, 504])
        s.mount('http://', HTTPAdapter(max_retries=retries))
        return s.get(url)
    except Exception as e:
        logging.error(f"[FAIL] Request to {url}")
        logging.error(traceback.format_exc())
        raise

async def main():
    generate_clingen_json()
    await generate_panelapp_json('uk')
    await generate_panelapp_json('au')

if __name__ == "__main__":
    asyncio.run(main())