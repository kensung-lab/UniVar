import { describe, it ,expect, beforeEach} from 'vitest';
import {
  getSortingFromURL,
  getDisplayColumnsFromURL,
  getDisplayColumnsObjectFromURL,
  getSelectedDBFromURL,
  getSamplesStatusFromURL,
  getPanelsFromURL,
  getURLFromAllConditions
} from '@/utils/variants-table/url-control/url-control-utils';


describe('getSortingFromURL', () => {
  it('should modify sortingColumns based on url_query sort', () => {
    const url_query = { sort: 'start:asc,end:desc' };
    const sortingColumns = [
      { column: 'chrom', sort: 'asc' }
    ];
    const currentColumn = [
      { name: 'start', isFrozen: true },
      { name: 'end', isShow: true }
    ];

    getSortingFromURL(url_query, sortingColumns, currentColumn)
    expect(sortingColumns).toEqual([
      { column: 'chrom', sort: 'asc' },
      { column: 'start', sort: 'asc' },
      { column: 'end', sort: 'desc' }
    ]);
  });

  it('should not modify sortingColumns if url_query sort does not include valid columns', () => {
    const url_query = { sort: 'invalid_columns:asc' };
    const sortingColumns = [
      { column: 'chrom', sort: 'asc' }
    ];
    const currentColumn = [
      { name: 'chrom', isFrozen: true },
      { name: 'start', isShow: true }
    ];

    getSortingFromURL(url_query, sortingColumns, currentColumn)
    expect(sortingColumns).toEqual([
      { column: 'chrom', sort: 'asc' }
    ]);
  });

  it('should not modify sortingColumns if url_query sort is not provided', () => {
    const url_query = {};
    const sortingColumns = [
      { column: 'chrom', sort: 'asc' }
    ];
    const currentColumn = [
      { name: 'chrom', isFrozen: true },
      { name: 'start', isShow: true }
    ];

    getSortingFromURL(url_query, sortingColumns, currentColumn)
    expect(sortingColumns).toEqual([
      { column: 'chrom', sort: 'asc' }
    ]);
  });


  it('Should remain unchanged if element isShow is false in currentColumn', () => {
    const url_query = {};
    const sortingColumns = [
      { column: 'chrom', sort: 'asc' }
    ];
    const currentColumn = [
      { name: 'chrom', isFrozen: true },
      { name: 'start', isShow: false }
    ];

    getSortingFromURL(url_query, sortingColumns, currentColumn)
    expect(sortingColumns).toEqual([
      { column: 'chrom', sort: 'asc' }
    ]);
  });
});


describe('getDisplayColumnsFromURL', () => {
  const currentColumns = [
    { name: 'col1', isFrozen: true, isShow: true },
    { name: 'col2', isFrozen: true, isShow: true },
    { name: 'col3', isFrozen: false, isShow: true },
    { name: 'col4', isFrozen: false, isShow: false },
  ];

  it('should return current columns if URL has no query', () => {
    const urlQuery = null;
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(currentColumns);
  });


  it('should return current columns if URL has no display or frozen query', () => {
    const urlQuery = {};
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(currentColumns);
  });

  it('should keep the original order if names do not exist in frozenCols', () => {
    const urlQuery = { frozen: 'col3,col1' , display:'col4,col2' };
    const result = getDisplayColumnsFromURL(urlQuery,
      [
        { name: 'col1', isFrozen: true, isShow: true },
        { name: 'col2', isFrozen: true, isShow: true },
        { name: 'col4', isFrozen: true, isShow: true },
      ]
    );
    expect(result).toEqual(
      [
        { name: 'col1', isFrozen: true, isShow: true },
        { name: 'col4', isFrozen: false, isShow: true },
        { name: 'col2', isFrozen: false, isShow: true }
      ]
    );
  });


  it('should show only frozen columns if URL has frozen but no display query with expect order', () => {
    const urlQuery = { frozen: 'col3,col1' };
    const expected = [
      { name: 'col3', isFrozen: true, isShow: true },
      { name: 'col1', isFrozen: true, isShow: true },
      { name: 'col2', isFrozen: false, isShow: true },
      { name: 'col4', isFrozen: false, isShow: false },
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(expected);
  });

  it('should show only display columns if URL has display but no frozen query with expect order', () => {
    const urlQuery = { display: 'col4,col2' };
    const expected = [
      { name: 'col4', isFrozen: false, isShow: true },
      { name: 'col2', isFrozen: false, isShow: true },
      { name: 'col1', isFrozen: false, isShow: false },
      { name: 'col3', isFrozen: false, isShow: false },
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(expected);
  });

  it('should show both frozen and display columns if URL has both frozen and display query with expect order', () => {
    const urlQuery = { frozen: 'col1,col3', display: 'col2' };
    const expected = [
      { name: 'col1', isFrozen: true, isShow: true },
      { name: 'col3', isFrozen: true, isShow: true },
      { name: 'col2', isFrozen: false, isShow: true },
      { name: 'col4', isFrozen: false, isShow: false },
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(expected);
  });

  it('should sort frozen columns in the order specified in the URL', () => {
    const urlQuery = { frozen: 'col3,col1' };
    const expected = [
      { name: 'col3', isFrozen: true, isShow: true },
      { name: 'col1', isFrozen: true, isShow: true },
      { name: 'col2', isFrozen: false, isShow: true },
      { name: 'col4', isFrozen: false, isShow: false },
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(expected);
  });

  it('should sort display columns in the order specified in the URL', () => {
    const urlQuery = { display: 'col4,col2' };
    const expected = [
      { name: 'col4', isFrozen: false, isShow: true },
      { name: 'col2', isFrozen: false, isShow: true },
      { name: 'col1', isFrozen: false, isShow: false },
      { name: 'col3', isFrozen: false, isShow: false },
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);
    expect(result).toEqual(expected);
  });

  it('should remain unchanged if no display & frozen inside urlQuery', () => {
    const urlQuery = { frozen: '123' , display: '456'};
    const expected = [
      { name: 'col1', isFrozen: false, isShow: false },
      { name: 'col2', isFrozen: false, isShow: false },
      { name: 'col3', isFrozen: false, isShow: false },
      { name: 'col4', isFrozen: false, isShow: false }
    ];
    const result = getDisplayColumnsFromURL(urlQuery, currentColumns);

    expect(result).toEqual(expected);
  });
});


describe('getDisplayColumnsObjectFromURL', () => {

  const url_query = { frozen: 'samples_genotypes,chrom,start,end', display : 'gnomad_afr_af,gnomad_eas_af,gnomad_amr_af,ref,mane_select,alt,gene_symbol,gnomad_nfe_af,gnomad_sas_af,constraint_mis_z,existing_variation,exomiser_mt_exgenescombi,exomiser_xd_exgenescombi,exomiser_xr_exgenescombi' };

  it('should make a columns name object according to  url query', () => {
    const result = getDisplayColumnsObjectFromURL(url_query);

    const expected = {
      "frozen": [
        "samples_genotypes",
        "chrom",
        "start",
        "end"
      ],
      "display": [
        "gnomad_afr_af",
        "gnomad_eas_af",
        "gnomad_amr_af",
        "ref",
        "mane_select",
        "alt",
        "gene_symbol",
        "gnomad_nfe_af",
        "gnomad_sas_af",
        "constraint_mis_z",
        "existing_variation",
        "exomiser_mt_exgenescombi",
        "exomiser_xd_exgenescombi",
        "exomiser_xr_exgenescombi"
      ]
    };

    expect(result).toEqual(expected);
  });

  it('should remain unchanged if no frozen inside url_query ', () => {

    const url_query = { display : 'gnomad_afr_af,gnomad_eas_af,gnomad_amr_af,ref,mane_select,alt,gene_symbol,gnomad_nfe_af,gnomad_sas_af,constraint_mis_z,existing_variation,exomiser_mt_exgenescombi,exomiser_xd_exgenescombi,exomiser_xr_exgenescombi' };
    const result = getDisplayColumnsObjectFromURL(url_query);

    const expected = {
      "display": [
        "gnomad_afr_af",
        "gnomad_eas_af",
        "gnomad_amr_af",
        "ref",
        "mane_select",
        "alt",
        "gene_symbol",
        "gnomad_nfe_af",
        "gnomad_sas_af",
        "constraint_mis_z",
        "existing_variation",
        "exomiser_mt_exgenescombi",
        "exomiser_xd_exgenescombi",
        "exomiser_xr_exgenescombi"
      ]
    };

    expect(result).toEqual(expected);
  });

  it('should remain unchanged if no display inside url_query ', () => {

    const url_query = { frozen: 'samples_genotypes,chrom,start,end' };
    const result = getDisplayColumnsObjectFromURL(url_query);

    const expected = {
      "frozen": [
        "samples_genotypes",
        "chrom",
        "start",
        "end"
      ],
    };

    expect(result).toEqual(expected);
  });

});


describe('getSelectedDBFromURL', () => {
  const databaseOptions = [
    { label: 'Database 1', value: 'db1' },
    { label: 'Database 2', value: 'db2' },
    { label: 'Database 3', value: 'db3' },
  ];

  it('should return null if "db" is not in URL', () => {
    const urlQuery = {};
    const result = getSelectedDBFromURL(urlQuery, databaseOptions);
    expect(result).toBeNull();
  });

  it('should return null if "db" in URL is not in database options', () => {
    const urlQuery = { db: 'db4' };
    const result = getSelectedDBFromURL(urlQuery, databaseOptions);
    expect(result).toBeNull();
  });

  it('should return the value of "db" in URL if it matches a database option', () => {
    const urlQuery = { db: 'db2' };
    const result = getSelectedDBFromURL(urlQuery, databaseOptions);
    expect(result).toEqual('db2');
  });
});


describe('getSamplesStatusFromURL', () => {
  let variantsSamples;

  beforeEach(() => {
    variantsSamples = [
      { name: 'sample1', group: '' , active : false},
      { name: 'sample2', group: '' , active : true},
      { name: 'sample3', group: '' , active : true},
    ];
  });

  it('should set active/not_active for matching active/not_active samples in URL', () => {
    const url_query = { active: 'sample1,sample2', not_active : 'sample3' };

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].active).toEqual(true);
    expect(variantsSamples[1].active).toEqual(true);
    expect(variantsSamples[2].active).toEqual(false);
  });

  it('should set group to "affected" for matching samples in URL', () => {
    const url_query = { affected: 'sample1,sample2' };

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('affected');
    expect(variantsSamples[1].group).toEqual('affected');
    expect(variantsSamples[2].group).toEqual('');
  });

  it('should set group to "not_affected" for matching samples in URL', () => {
    const url_query = { not_affected: 'sample2,sample3' };

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('');
    expect(variantsSamples[1].group).toEqual('not_affected');
    expect(variantsSamples[2].group).toEqual('not_affected');
  });

  it('should set both "affected" and "not_affected" group for matching samples in URL and not affected default group', () => {
    const url_query = { affected: 'sample2', not_affected: 'sample3' };

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('');
    expect(variantsSamples[1].group).toEqual('affected');
    expect(variantsSamples[2].group).toEqual('not_affected');
  });

  it('should not set group/active/not_active for non-matching samples and set group/active/not_active for matching samples', () => {
    const url_query = { affected: 'sample2', not_affected: 'samplessssss', active:'sssssss',not_active: 'sample3' };

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('');
    expect(variantsSamples[1].group).toEqual('affected');
    expect(variantsSamples[2].group).toEqual('');
    expect(variantsSamples[2].active).toEqual(false);
  });


  it('should handle empty URL query object', () => {
    const url_query = {};

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('');
    expect(variantsSamples[1].group).toEqual('');
    expect(variantsSamples[2].group).toEqual('');
    expect(variantsSamples[0].active).toEqual(false);
    expect(variantsSamples[1].active).toEqual(true);
    expect(variantsSamples[2].active).toEqual(true);
  });

  it('should handle empty affected/not_affected/active/not_active  ', () => {
    const url_query = { affected: '', not_affected: '' , active: ''};

    getSamplesStatusFromURL(url_query, variantsSamples);

    expect(variantsSamples[0].group).toEqual('');
    expect(variantsSamples[1].group).toEqual('');
    expect(variantsSamples[2].group).toEqual('');
    expect(variantsSamples[0].active).toEqual(false);
    expect(variantsSamples[1].active).toEqual(true);
    expect(variantsSamples[2].active).toEqual(true);
  });
});


describe('getPanelsFromURL', () => {
  it('should return empty array if "panels" is not in URL', () => {
    const url_query = {};

    const result = getPanelsFromURL(url_query);

    expect(result).toEqual([]);
  });

  it('should return array of panels if "panels" is in URL', () => {
    const url_query = { panels: 'panel1,panel2,panel3' };

    const result = getPanelsFromURL(url_query);

    expect(result).toEqual(['panel1', 'panel2', 'panel3']);
  });

  it('should decode URI components and split url parameter into array', () => {
    const url_query = { panels: 'panel%201,panel%202,panel%203' };

    const result = getPanelsFromURL(url_query);

    expect(result).toEqual(['panel 1', 'panel 2', 'panel 3']);
  });
});


describe('getURLFromAllConditions', () => {
  const variantsFilter = {
    filter1: 'value1',
    filter2: ['value2', 'value3'],
    filter3: { value: 'value4' },
    caller : "cnvkit",
    clnsig : ["Pathogenic","Pathogenic,_protective"],
    cadd_phred : 20,
    univar_high_impact: 1,
    is_read: false,
    note: 1,
    is_pathogenic: true,
    sift_pred : []
  };
  const database = 'testdb';
  const variantsSamples = [
    { name: 'sample1', group: 'affected' , active : false},
    { name: 'sample2', group: 'not_affected' , active : true},
    { name: 'sample3', group: '' , active : true},
  ];
  const currentColumn = [
    { name: 'column1', isFrozen: true, isShow: true },
    { name: 'column2', isFrozen: false, isShow: true },
    { name: 'column3', isFrozen: false, isShow: false },
  ];
  const sortingColumns = [
    { column: 'column1', sort: 'asc' },
    { column: 'column2', sort: 'desc' },
  ];
  const panels = ['panel1', 'panel2', 'panel3'];

  it('should return URL with all conditions', () => {
    const expectedURL =
      window.location.href +
      '?q=1' +
      '&filter1=value1' +
      '&filter2=value2%40value3' +
      '&filter3=value4' +
      '&caller=cnvkit' +
      '&clnsig=Pathogenic%40Pathogenic%2C_protective' +
      '&cadd_phred=20' +
      '&univar_high_impact=1' +
      '&is_read=0' +
      '&note=1' +
      '&is_pathogenic=1' +
      '&sift_pred=' +
      '&db=testdb' +
      '&affected=sample1' +
      '&not_affected=sample2' +
      '&active=sample2,sample3' +
      '&not_active=sample1' +
      '&frozen=column1' +
      '&display=column2' +
      '&sort=column1:asc,column2:desc' +
      '&panels=panel1%2Cpanel2%2Cpanel3';

    const result = getURLFromAllConditions(
      variantsFilter,
      database,
      variantsSamples,
      currentColumn,
      sortingColumns,
      panels
    );

    // console.log('result : ',result)
    // console.log('expectedURL : ',expectedURL)

    expect(result).toEqual(expectedURL);
  });

  it('should handle empty conditions', () => {
    const expectedURL = window.location.href + '?q=1' + '&db=testdb';

    const result = getURLFromAllConditions(
      {},
      database,
      [],
      [],
      [],
      []
    );

    expect(result).toEqual(expectedURL);
  });

  it('should handle empty arrays in conditions', () => {
    const expectedURL =
      window.location.href +
      '?q=1' +
      '&db=testdb'

    const result = getURLFromAllConditions(
      {},
      database,
      [],
      [],
      [],
      []
    );

    expect(result).toEqual(expectedURL);
  });

  it('should handle undefined and null values in conditions', () => {
    const expectedURL =
      window.location.href +
      '?q=1' +
      '&db=testdb' +
      '&active=sample1,sample2' +
      '&not_active=sample3' +
      '&frozen=column1';

    const result = getURLFromAllConditions(
      {
        filter1: undefined,
        filter2: null,
        filter3: ""
      },
      database,
      [
        { name: 'sample1', group: undefined, active: true },
        { name: 'sample2', group: null, active: true  },
        { name: 'sample3', group: '', active: false  },
      ],
      [
        { name: 'column1', isFrozen: true, isShow: undefined },
        { name: 'column2', isFrozen: false, isShow: null },
        { name: 'column3' },
      ],
      [undefined, null],
      undefined
    );

    expect(result).toEqual(expectedURL);
  });
});


