define(`annotation_from_bed_gz',
[[annotation]]
file="__EXOMISER_PREFIX__`_'$1.bed.gz"
`columns = [ 5, 6, 7, 8 ]'
`ops=["self", "self", "self", "self"]'
names=["ReMMScore_float"`,' "Exomiser_$1_ExGeneSPheno_float"`,' "Exomiser_$1_ExGeneSVar_float"`, '"Exomiser_$1_ExGeneSCombi_float" ]
)dnl
dnl
ifdef(`__EXOMISER_PREFIX__',dnl
`annotation_from_bed_gz'(AD)
`annotation_from_bed_gz'(AR)
`annotation_from_bed_gz'(MT)
`annotation_from_bed_gz'(XD)
`annotation_from_bed_gz'(XR)
)dnl


[[annotation]]
file="__CLINVAR_DIR__/vcf_GRCh38/clinvar_`'__CLINVAR_VERSION__.vcf.gz"
fields = ["CLNDN","CLNDNINCL","CLNDISDB","CLNDISDBINCL","CLNHGVS","CLNREVSTAT","CLNSIG","CLNSIGCONF","CLNSIGINCL","CLNSIGSCV","CLNVC","CLNVCSO","CLNVI","ID"]
ops=["self", "self", "self", "self", "self", "self", "self", "self", "self", "self", "first", "first", "self", "first"]
names=["CLNDN","CLNDNINCL","CLNDISDB","CLNDISDBINCL","CLNHGVS","CLNREVSTAT","CLNSIG","CLNSIGCONF","CLNSIGINCL","CLNSIGSCV","CLNVC","CLNVCSO","CLNVI","CLNID"]
