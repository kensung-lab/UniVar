import { describe, it, expect } from 'vitest'

import {
  getFilterObjectByLocationSearching,
  removeLocationTextSearchFilter
} from '@/utils/variants-table/filter/location-search-utils'


describe('getFilterObjectByLocationSearching', () => {
  it('should correctly update variantsFilter based on geneLocationSearchText with chromosome, start, and end', () => {
    const geneLocationSearchText = 'chr1:100-200';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 50 },
      end: { $lte: 300 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr1',
      start: { $gte: 100 },
      end: { $lte: 200 },
    });
  });

  it('should correctly update variantsFilter based on geneLocationSearchText with chromosome and start', () => {
    const geneLocationSearchText = 'chrX:50-';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chrX',
      start: { $gte: 50 },
    });
  });

  it('should correctly update variantsFilter based on geneLocationSearchText with chromosome and end', () => {
    const geneLocationSearchText = 'chr3:-200';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr3',
      start: { $gte: 0 },
      end: { $lte: 200 },
    });
  });

  it('should correctly update variantsFilter based on geneLocationSearchText with chromosome only', () => {
    const geneLocationSearchText = 'chr4';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr4',
    });
  });

  it('should correctly update variantsFilter based on geneLocationSearchText with gene names', () => {
    const geneLocationSearchText = 'GENE1, GENE2, GENE3';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      'gene_objs.gene_filter': { $in: ['GENE1', 'GENE2', 'GENE3'] },
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText is empty', () => {
    const geneLocationSearchText = '';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({});
  });

  it('should correctly update variantsFilter when geneLocationSearchText contains line breaks', () => {
    const geneLocationSearchText = 'chr5\n:50-100';
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr5',
      start: { $gte: 50 },
      end: { $lte: 100 },
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText only have start point', () => {
    const geneLocationSearchText = 'chr5:5';
    const variantsFilter = {};

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr5',
      start: { $gte: 5 }
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText have chr but not valid start/end point', () => {
    const geneLocationSearchText = 'chr5:abc';
    const variantsFilter = {};

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr5'
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText have chrom but not start/end point', () => {
    const geneLocationSearchText = 'chr5:';
    const variantsFilter = {
      start: { $gte: 50 },
      end: { $lte: 100 }
    };

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr5'
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText have capital letter and small letter', () => {
    const geneLocationSearchText = 'cHR6';
    const variantsFilter = {};

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      chrom: 'chr6'
    });
  });

  it('should correctly update variantsFilter when geneLocationSearchText do not contain "chr" string', () => {
    const geneLocationSearchText = 'cHY6';
    const variantsFilter = {};

    const result = getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter);

    expect(result).toEqual({
      'gene_objs.gene_filter': { $in: ['cHY6'] }
    });
  });
});


describe('removeLocationTextSearchFilter', () => {
  it('should remove start, end, chrom, and gene_objs.gene_filter properties from variantsFilter', () => {
    const variantsFilter = {
      'gene_objs.gene_filter': 'ABC',
      chrom: 'chr2',
      start: { $gte: 100 },
      end: { $lte: 200 },
      additionalProperty: 'value',
    };

    const result = removeLocationTextSearchFilter(variantsFilter);

    expect(result).toEqual({
      additionalProperty: 'value',
    });
  });

  it('should remain unchanged for other properties', () => {
    const variantsFilter = {
      highest_af: {
        "$lte": 0.01
      },
      aaaaa : 'aaaa',
      bbbbb : ['a','b','c']
    };

    const result = removeLocationTextSearchFilter(variantsFilter);

    expect(result).toEqual({
      highest_af: {
        "$lte": 0.01
      },
      aaaaa : 'aaaa',
      bbbbb : ['a','b','c']
    });
  });

  it('should return an empty object when variantsFilter does not have any properties', () => {
    const variantsFilter = {};

    const result = removeLocationTextSearchFilter(variantsFilter);

    expect(result).toEqual({});
  });
});