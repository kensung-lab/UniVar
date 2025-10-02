CLINGEN_GENE_DISEASE_VERSION='2025-10-01'
CLINGEN_GENE_DISEASE_PATH='data/Clingen-Gene-Disease-Summary-2025-10-01.csv'
CLINGEN_GENE_DISEASE_SKIP_LINES=4 #Skip lines above the header line

PANELAPP_INFO = {
    'uk': { 
        'PANELAPP_LIST': 'https://panelapp.genomicsengland.co.uk/api/v1/panels/?format=json',
        'PANELAPP_DETAILS': 'https://panelapp.genomicsengland.co.uk/api/v1/panels/'
    },
    'au': { 
        'PANELAPP_LIST': 'https://panelapp-aus.org/api/v1/panels/?format=json',
        'PANELAPP_DETAILS': 'https://panelapp-aus.org/api/v1/panels/'
    }
}

OUTPUT_DIR="../data"