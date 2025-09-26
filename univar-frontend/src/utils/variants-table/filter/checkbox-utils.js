/**
 * @description
 *  updates checkboxes fieldName inside variantsFilter object based on checkbox values.
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {String} fieldName : A string representing the field name for the checkbox element in variantsFilter.
 * @param {Array} checkboxValue :  value of the checkbox input
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 * @remark : Replace the value from variantsFilter by checkboxValue
 */
export function getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue) {
  if(!checkboxValue){
    return variantsFilter
  }

  const searchValue = [...checkboxValue];

  if( searchValue.includes(null) ){
    searchValue.push('')
  }

  if(Object.keys(searchValue).length > 0 ){
    variantsFilter[fieldName] = searchValue
  } else {
    if(variantsFilter[fieldName] && variantsFilter[fieldName] != []){
        delete variantsFilter[fieldName]
    }
  }

  return variantsFilter
}



/**
 * @description
 *  update impact checkboxes value when click/unclick an element or click all-click/all-unclick button
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {Array} checkboxValue :  value of the checkbox input
 * @param {Boolean} allClickButton: A flag indicating whether all checkboxes for the impact filter type are clicked (true) or not (false).
 * @param {String} type : A string representing the type of impact filter.
 * @param {Array} currentOptions  : An array of objects representing the current options for the impact filter.
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 * @remark : *** LOGIC Only for Impact checkboxes ***
 *
 */
export function getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions){

    // console.log("Is clicked : "+ allClickButton)
    // console.log((variantsFilter['impact']))

    let searchValue = [...checkboxValue];

    if(allClickButton === true){
      if(variantsFilter['impact'] ) {

        let notClick = []
        currentOptions.forEach(el => {
          if(!searchValue.includes(el.value)){
            notClick.push(el.value)
          } else {
            (variantsFilter['impact']).push(el.value)
          }
        });

        //console.log('notClick : ' + notClick)
        //console.log('selected : ' + (variantsFilter['impact']['$in']) );

        let selected =  variantsFilter['impact'];
        selected = selected.filter(elem => !notClick.includes(elem));
        const uniqueSelected = [...new Set(selected)];
        //console.log('final selected : ' +uniqueSelected);

        variantsFilter['impact'] = uniqueSelected
      } else {
        //Create 'impact' attribute if not existed(first time click impact filters)
        variantsFilter['impact'] = searchValue
      }
    } else {
      //Remove all uncheck values from the specific type, eg impactHigh
      if(variantsFilter['impact']) {
        let selected = variantsFilter['impact'];
        const filterOptions = currentOptions.map(item => item.value);

        let searchValue = selected.filter(elem => !filterOptions.includes(elem));

        if (searchValue.length > 0) {
          variantsFilter['impact'] = searchValue
        } else {
          //Delete "impact" in variantsFilter if no values found

          delete variantsFilter['impact']

        }
      }
    }

  //console.log(variantsFilter['impact']['$in'])

  return variantsFilter
}