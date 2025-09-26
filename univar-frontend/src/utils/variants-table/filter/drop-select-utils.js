/**
 * @description
 *  modifies variantsFilter based on the selected value (selectedValue) for a specified field (fieldName)
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {String} fieldName : A string representing the field name for the checkbox element in variantsFilter.
 * @param {Array} selectedValue  : A string representing the value of the radio button
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 * @remark : Replace the value from variantsFilter by selectedValue
 */
export function getFilterObjectBySelected(variantsFilter, fieldName, selectedValue) {
  if (selectedValue === null || selectedValue.length === 0) {
    delete variantsFilter[fieldName];
  } else {
    variantsFilter[fieldName] = selectedValue;
  }

  return variantsFilter;
}



/**
 * @description
 *  modifies variantsFilter based on the selected values for two specific fields related to ClinGen impact
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {Array} clinGenHISelected : selected value from ClinGen HI from Pathogenicity section
 * @param {Array} clinGenTSSelected  : selected value from ClinGen TS from Pathogenicity section
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 * @remark : Replace the value from variantsFilter by clinGenHISelected or clinGenTSSelected
 */
export function getFilterObjectBySelectedClinGen(variantsFilter, clinGenHISelected, clinGenTSSelected) {

  if (clinGenHISelected && clinGenHISelected.length !== 0) {
    variantsFilter.clingen_hi = clinGenHISelected;
  } else {
    delete variantsFilter['clingen_hi'];
  }

  if (clinGenTSSelected && clinGenTSSelected.length !== 0 ) {
    variantsFilter.clingen_ts = clinGenTSSelected;
  } else {
    delete variantsFilter['clingen_ts'];
  }

  return variantsFilter;
}