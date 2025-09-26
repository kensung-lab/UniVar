## Exomiser Analysis Template.
# These are all the possible options for running exomiser. Use this as a template for
# your own set-up.
---
analysis:
    # hg19 or hg38 - ensure that the application has been configured to run the specified assembly otherwise it will halt.
    genomeAssembly: hg38
    vcf: __VCF__
    ped: __PED__
    proband: __PROBAND__
    hpoIds: [ __HPO_IDS__ ]
    # These are the default settings, with values representing the maximum minor allele frequency in percent (%) permitted for an
    # allele to be considered as a causative candidate under that mode of inheritance.
    # If you just want to analyse a sample under a single inheritance mode, delete/comment-out the others. For AUTOSOMAL_RECESSIVE
    # or X_RECESSIVE ensure *both* relevant HOM_ALT and COMP_HET modes are present.
    # In cases where you do not want any cut-offs applied an empty map should be used e.g. inheritanceModes: {}
    inheritanceModes: {
            AUTOSOMAL_DOMINANT: 0.1,
            AUTOSOMAL_RECESSIVE_HOM_ALT: 0.1,
            AUTOSOMAL_RECESSIVE_COMP_HET: 2.0,
            X_DOMINANT: 0.1,
            X_RECESSIVE_HOM_ALT: 0.1,
            X_RECESSIVE_COMP_HET: 2.0,
            MITOCHONDRIAL: 0.2
    }
    #FULL or PASS_ONLY
    analysisMode: __ANALYSIS_MODE__
    #Possible frequencySources:
    #Thousand Genomes project - http://www.1000genomes.org/ (THOUSAND_GENOMES)
    #TOPMed - https://www.nhlbi.nih.gov/science/precision-medicine-activities (TOPMED)
    #UK10K - http://www.uk10k.org/ (UK10K)
    #ESP project - http://evs.gs.washington.edu/EVS/ (ESP_)
    #   ESP_AFRICAN_AMERICAN, ESP_EUROPEAN_AMERICAN, ESP_ALL,
    #ExAC project http://exac.broadinstitute.org/about (EXAC_)
    #   EXAC_AFRICAN_INC_AFRICAN_AMERICAN, EXAC_AMERICAN,
    #   EXAC_SOUTH_ASIAN, EXAC_EAST_ASIAN,
    #   EXAC_FINNISH, EXAC_NON_FINNISH_EUROPEAN,
    #   EXAC_OTHER
    #gnomAD - http://gnomad.broadinstitute.org/ (GNOMAD_E, GNOMAD_G)
    frequencySources: [
        THOUSAND_GENOMES,
        TOPMED,
        UK10K,

        ESP_AFRICAN_AMERICAN, ESP_EUROPEAN_AMERICAN, ESP_ALL,

        EXAC_AFRICAN_INC_AFRICAN_AMERICAN, EXAC_AMERICAN,
        EXAC_SOUTH_ASIAN, EXAC_EAST_ASIAN,
        EXAC_FINNISH, EXAC_NON_FINNISH_EUROPEAN,
        EXAC_OTHER,

        GNOMAD_E_AFR,
        GNOMAD_E_AMR,
#        GNOMAD_E_ASJ,
        GNOMAD_E_EAS,
        GNOMAD_E_FIN,
        GNOMAD_E_NFE,
        GNOMAD_E_OTH,
        GNOMAD_E_SAS,

        GNOMAD_G_AFR,
        GNOMAD_G_AMR,
#        GNOMAD_G_ASJ,
        GNOMAD_G_EAS,
        GNOMAD_G_FIN,
        GNOMAD_G_NFE,
        GNOMAD_G_OTH,
        GNOMAD_G_SAS
    ]
    #Possible pathogenicitySources: POLYPHEN, MUTATION_TASTER, SIFT, CADD, REMM
    #REMM is trained on non-coding regulatory regions
    #*WARNING* if you enable CADD or REMM ensure that you have downloaded and installed the CADD/REMM tabix files
    #and updated their location in the application.properties. Exomiser will not run without this.
    pathogenicitySources: [POLYPHEN, MUTATION_TASTER, SIFT, REMM]
    #this is the recommended order for a genome-sized analysis.
    #all steps are optional
    steps: [ 
        #intervalFilter: {interval: 'chr10:123256200-123256300'},
        # or for multiple intervals:
        #intervalFilter: {intervals: ['chr10:123256200-123256300', 'chr10:123256290-123256350']},
        # or using a BED file - NOTE this should be 0-based, Exomiser otherwise uses 1-based coordinates in line with VCF
        #intervalFilter: {bed: /full/path/to/bed_file.bed},
        #failedVariantFilter: {},
        #genePanelFilter: {geneSymbols: ['AMMECR1','ANKRD11','BLM','BRAF','CBL','CCDC8','CDC6','CDKN1C','CDT1','CENPJ','CHD7','CREBBP','CRIPT','CUL7','DHCR7','EP300','ERCC6','ERCC8','FANCA','FANCB','FANCC','FANCD2','FANCE','FANCF','FANCG','FANCI','FANCL','FGD1','FGF8','FGFR1','GH1','GHR','GHRHR','GLI2','GLI3','HDAC8','HESX1','HRAS','IGF1','IGF1R','IGFALS','INSR','KDM6A','KMT2D','KRAS','LHX3','LHX4','LIG4','MAP2K1','MAP2K2','NBN','NIPBL','NRAS','OBSL1','ORC1','ORC4','ORC6','OTX2','PAPPA2','PCNT','PIK3R1','PITX2','PNPLA6','POU1F1','PROKR2','PROP1','PTPN11','RAD21','RAF1','RBBP8','RIT1','RNU4ATAC','ROR2','RPL10','RPS6KA3','SAMD9','SHOC2','SHOX','SMC1A','SMC3','SOS1','SOX2','SOX3','SRCAP','STAT5B','TBCE','TRIM37','WRN','XRCC4','ZFP57','RNPC3','ACAN','ATRIP','ATRX','BTK','DNA2','DOK7','EPHX1','FANCM','GHSR','GPR161','H19','IFT172','IGF2','LIG1','MCM5','RAPSN','SHOX2','SMARCAL1','THRB']},
        hiPhivePrioritiser: {},
        #running the prioritiser followed by a priorityScoreFilter will remove genes
        #which are least likely to contribute to the phenotype defined in hpoIds, this will
        #dramatically reduce the time and memory required to analyse a genome.
        # 0.501 is a good compromise to select good phenotype matches and the best protein-protein interactions hits from hiPhive
        priorityScoreFilter: {priorityType: HIPHIVE_PRIORITY, minPriorityScore: 0.501},
        #variantEffectFilter: {remove: [SYNONYMOUS_VARIANT]},
        #regulatoryFeatureFilter removes all non-regulatory non-coding variants over 20Kb from a known gene.
        regulatoryFeatureFilter: {},
        #knownVariantFilter: {}, #removes variants represented in the database
        frequencyFilter: {maxFrequency: 2.0},
        pathogenicityFilter: {keepNonPathogenic: true},
        #inheritanceFilter and omimPrioritiser should always run AFTER all other filters have completed
        #they will analyse genes according to the specified modeOfInheritance above- UNDEFINED will not be analysed.
        inheritanceFilter: {},
        #omimPrioritiser isn't mandatory.
        omimPrioritiser: {}
        #Other prioritisers: Only combine omimPrioritiser with one of these.
        #Don't include any if you only want to filter the variants.
        #hiPhivePrioritiser: {},
        # or run hiPhive in benchmarking mode: 
        #hiPhivePrioritiser: {diseaseId: 'OMIM:101600', candidateGeneSymbol: FGFR2, runParams: 'human,mouse,fish,ppi'},
        #phenixPrioritiser: {}
        #exomeWalkerPrioritiser: {seedGeneIds: [11111, 22222, 33333]}
    ]
outputOptions:
    outputContributingVariantsOnly: false
    #numGenes options: 0 = all or specify a limit e.g. 500 for the first 500 results  
    numGenes: 500
    #outputDirectory options: specify the path of the output
    #outputFileName options: specify the filename without an extension and this will be added
    # according to the outputFormats option. If unspecified this will default to the following: 
    # {exomiserDir}/results/input-vcf-name-exomiser-results.html
    # alternatively, specify a fully qualifed path only. e.g. /users/jules/exomes/analysis    
    outputDirectory: __OUTPUTDIRPREFIX__
    outputFileName: __OUTPUTNAMEPREFIX__
    #out-format options: HTML, JSON, TSV_GENE, TSV_VARIANT, VCF (default: HTML)
    outputFormats: [TSV_VARIANT]