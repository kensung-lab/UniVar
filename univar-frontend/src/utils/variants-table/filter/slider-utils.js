/**
 * @description
 *  modifies the variantsFilter object based on the newValue parameter and returns the updated filter object.
 *  *ONLY for SV Length filter*
 *
 * @param {Object} variantsFilter : object representing the filter conditions for variants.
 * @param {String} newValue : representing the new value for filtering variants based on length.
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 *
 */
export function getFilterObjectSVLength(variantsFilter,newValue) {

    switch (parseInt(newValue)) {
      case 1:
        variantsFilter.len = {
          '$lte' : 1
        }
        break;
      case 2:
        variantsFilter.len = {
          '$lte' : 1000000
        }
        break;
      default:
        if( variantsFilter.len ) {
          delete variantsFilter.len
        }
        break;
    }

  return variantsFilter
}



/**
 * @description
 *  modifies the variantsFilter object based on the provided fieldName, filterValue, and sliderObject. It returns the updated filter object.
 *
 * @param {Object} variantsFilter : object representing the filter conditions for variants.
 * @param {String} fieldName : A string representing the field name for the slider element in variantsFilter.
 * @param {String} filterValue : A number representing the selected filter value. (step value)
 * @param {Object} sliderObject  : An object containing markerList and conditions for filtering variants.
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 *
 */
export function getFilterObjectNormal(variantsFilter, fieldName, filterValue, sliderObject) {

  let dbValue = sliderObject?.markerList ? (sliderObject.markerList)[filterValue - 1]['db_value'] : filterValue;
  let conditions = sliderObject.conditions

  if(dbValue !== null) {
    variantsFilter[fieldName] = {
      [conditions]: +dbValue
    }
  } else {
    if(variantsFilter[fieldName]){
      delete variantsFilter[fieldName]
    }
  }

  return variantsFilter
}



/**
 * @description
 *  modifies the variantsFilter object based on the provided fieldName, filterValue, and sliderObject. It returns the updated filter object.
 *
 * @param {Object} variantsFilter : object representing the filter conditions for variants.
 * @param {String} fieldName : A string representing the field name for the slider element in variantsFilter.
 * @param {String} filterValue : A number representing the selected filter value. (step value)
 * @param {Object} sliderObject  : An object containing markerList and conditions for filtering variants.
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 *
 */
export function getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject) {

  let conditions = sliderObject.conditions
  if(!conditions){
    throw new TypeError("conditions not defined properly in the sliderObject model")
  }

  if(filterValue !== null && filterValue !== '') {
    variantsFilter[fieldName] = {
      [conditions]: +filterValue
    }
  } else {
    if(variantsFilter[fieldName]){
      delete variantsFilter[fieldName]
    }
  }

  return variantsFilter
}



/**
 * @description
 *  modifies the variantsFilter object based on the provided fieldName, filterValue, and sliderObject. It returns the updated filter object.
 *  example : Quality score filter
 *
 * @param {Object} variantsFilter  : object representing the filter conditions for variants.
 * @param {String} type  : A string representing the type of filter.
 * @param {String} filterValue  : A number representing the selected filter value. (step value)
 * @param {String} conditions   : A string representing the condition to be applied for the filter. ($lte,$gte....)
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 */
export function getFilterObjectNoStep(variantsFilter, type, filterValue, conditions) {

  if(parseInt(filterValue) !== 0) {
    variantsFilter[type] = {
      [conditions]: +filterValue
    }
  } else {
    if(variantsFilter[type]){
      delete variantsFilter[type]
    }
  }

  return variantsFilter
}

export function getImageSrc(conditions, gte, lte) {
  return conditions === '$gte' ? gte : lte;
}