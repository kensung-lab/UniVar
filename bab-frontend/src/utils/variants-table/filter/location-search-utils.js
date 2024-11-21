/**
 * @description
 *  process a geneLocationSearchText and update the variantsFilter object based on the provided search criteria
 *
 * @param {string} geneLocationSearchText : Input from UI search location input text box
 * @param {Object} variantsFilter : object representing the filter configuration.
 *
 * @returns {Object} variantsFilter : Updated object representing the filter configuration.
 *
 * @example : Accepted searching
 *            - chr1:1000-2023   (chr1 start:1 - end:2023)
 *            - chr5:5           (chr5 start:5)
 *            - chrY             (chrY all)
 *            - PKD1,TCF12       (gene_objs contains PKD1,TCF12)
 *
 *            Some testing string (please refer to unit test file)
 *            - chrX:50- | chr3:-200 | chr5:abc | chr5: | cHR6  | cHY6
 */
export function getFilterObjectByLocationSearching(geneLocationSearchText, variantsFilter) {

    const cleanedSearchText = geneLocationSearchText.replace(/\s/g, '').replace(/,/g, '').replace(/\n/g, "");

    if (cleanedSearchText.toLowerCase().includes('chr') && cleanedSearchText.toLowerCase().includes(':')) {

      delete variantsFilter['gene_objs.gene_filter']

      let [chrom, location] = cleanedSearchText.split(':');
      chrom = 'chr' + chrom.slice(3);

      if (location !== '') {
        const [start, end] = location.split('-');

        if (end !== '') {
          if (!isNaN(Number(start)) && !isNaN(Number(end))) {
            variantsFilter['chrom'] = chrom
            variantsFilter['start'] = { '$gte': +start }
            variantsFilter['end'] = { '$lte': +end }
          } else {
            if (!isNaN(Number(start))) {
              variantsFilter['chrom'] = chrom
              variantsFilter['start'] = { '$gte': +start }
              delete variantsFilter['end']
            } else {
              variantsFilter['chrom'] = chrom
              delete variantsFilter['start']
              delete variantsFilter['end']
            }
          }
        } else {
          variantsFilter['chrom'] = chrom
          variantsFilter['start'] = { '$gte': +start }
          delete variantsFilter['end']
        }
      } else {
        variantsFilter['chrom'] = chrom
        delete variantsFilter['start']
        delete variantsFilter['end']
      }
    } else {
      if (cleanedSearchText.toLowerCase().includes('chr')) {

        let chrom = 'chr' + cleanedSearchText.slice(3);

        delete variantsFilter['gene_objs.gene_filter']
        variantsFilter['chrom'] = chrom
        delete variantsFilter['start']
        delete variantsFilter['end']
      } else {
        delete variantsFilter['chrom']
        delete variantsFilter['start']
        delete variantsFilter['end']

        geneLocationSearchText = geneLocationSearchText.replace(/\n/g, ",");
        const geneTextArr = geneLocationSearchText.split(',');

        const filteredArr = geneTextArr.map((el) => el.trim()).filter((el) => el !== '');

        if (filteredArr.length > 0) {
          variantsFilter['gene_objs.gene_filter'] = { "$in": filteredArr }
        } else {
          delete variantsFilter['gene_objs.gene_filter']
        }
      }
    }

  return variantsFilter;
}

/**
 * @description
 *  remove start,end,chrom,gene_objs.gene_filter properties from variantsFilter when click reset button in UI
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 *
 * @returns {Object} variantsFilter : Updated object representing the filter configuration.

 */
export function removeLocationTextSearchFilter(variantsFilter){

  delete variantsFilter['start']
  delete variantsFilter['end']
  delete variantsFilter['chrom']
  delete variantsFilter['gene_objs.gene_filter']

  return variantsFilter;
}