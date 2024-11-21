/**
 * @description
 *  modifies the state of the current column configuration based on the frozen and display column values obtained from the URL query parameters.
 *  It returns an updated column configuration.
 *
 * @param {Object} url_query : object containing query parameters from the URL.
 * @param {Array} currentColumn : An array representing the current column configuration from current variant type.
 *
 * @returns {Object} newCurrentColumn : An array representing the updated column configuration based on the URL query parameters.
 *
 * @remark : Load columns from URL will ONLY load the variant type that defined in the same URL in the same time.
 *
 */
export function getDisplayColumnsFromURL(url_query, currentColumn){

  if(!url_query){
    return currentColumn
  }

  let frozenCols = [];
  let displayCols = [];
  if(url_query['frozen']){
    frozenCols = url_query['frozen'].split(",");
  }

  if(url_query['display']){
    displayCols = url_query['display'].split(",");
  }

  if(!url_query['display'] && !url_query['frozen'] ){
    return currentColumn
  }

  let newCurrentColumn = [];
  let tempFrozenCols = [];
  let tempDisplayCols = [];
  let tempHiddenCols = [];

  //If URL have both frozen & display query
  if( url_query['frozen'] && url_query['display'] ){
    currentColumn.forEach((el) => {
      if (displayCols.includes(el.name)) {
        el.isShow = true
        tempDisplayCols.push(el)
      } else {
        el.isShow = false
      }
      if (frozenCols.includes(el.name)) {
        el.isFrozen = true
        el.isShow = true
        tempFrozenCols.push(el)
      } else {
        el.isFrozen = false
      }
      if(!el.isFrozen && !el.isShow){
        tempHiddenCols.push(el)
      }
    });
  }

  //If URL have frozen but NO display
  if( url_query['frozen'] && !url_query['display'] ){
    currentColumn.forEach((el) => {
      if (frozenCols.includes(el.name)) {
        el.isFrozen = true
        el.isShow = true
        tempFrozenCols.push(el)
      } else {
        el.isFrozen = false
        tempHiddenCols.push(el)
      }
    })
  }

  //If URL have display but NO frozen
  if( url_query['display'] && !url_query['frozen'] ){
    currentColumn.forEach((el) => {
      el.isFrozen = false
      if (displayCols.includes(el.name)) {
        el.isShow = true
        tempDisplayCols.push(el)
      } else {
        el.isShow = false
        tempHiddenCols.push(el)
      }
    })
  }

  //sort tempFrozenCols based on the ordering from frozenCols
  tempFrozenCols.sort((a, b) => {
    const indexA = frozenCols.indexOf(a.name);
    const indexB = frozenCols.indexOf(b.name);
    return indexA - indexB;
  });

  tempDisplayCols.sort((a, b) => {
    const indexA = displayCols.indexOf(a.name);
    const indexB = displayCols.indexOf(b.name);
    return indexA - indexB;
  });

  newCurrentColumn = tempFrozenCols.concat(tempDisplayCols).concat(tempHiddenCols)

  return newCurrentColumn;
}



/**
 * @description
 * retrieves URL query parameters and returns an object containing the frozen and display column values
 *
 * @param {Object} url_query : object containing query parameters from the URL.
 *
 * @returns {Object} savedColumns : An object containing the frozen and display column values extracted from the URL query parameters.
 *
 *
 */
export function getDisplayColumnsObjectFromURL(url_query){

  let savedColumns = {}
  if(url_query['frozen']){
    savedColumns['frozen'] = (url_query['frozen']).split(',');
  }
  if(url_query['display']){
    savedColumns['display'] = (url_query['display']).split(',');
  }

  return savedColumns
}



/**
 * @description
 * extracts sorting information from URL query parameters and updates the sortingColumns array based on the currently displayed columns.
 *
 * @param {Object} url_query : object containing query parameters from the URL.
 * @param {Array} sortingColumns : An array of objects representing the current sorting configuration
 * @param {Array} currentColumn  : An array of objects representing the currently displayed columns.
 *
 * @returns {String} dbFromURL : The selected database value from the URL query parameters.
 *                               Returns null if no database value is found or if the value doesn't match any available options.
 *
 */
export function getSortingFromURL(url_query, sortingColumns, currentColumn){

  let tempFrozenCols = [];
  let tempDisplayCols = [];
  currentColumn.forEach((el) => {
    if(el.isFrozen){
      tempFrozenCols.push(el.name)
    } else if(el.isShow){
      tempDisplayCols.push(el.name)
    }
  });

  if(url_query['sort']){
    let sortColumns = url_query['sort'].split(",");
    sortColumns.forEach((el) => {
      let tempSortObj = {}
      const [column, sort] = el.split(":");
      if(tempFrozenCols.includes(column) || tempDisplayCols.includes(column) ) {
        tempSortObj["column"] = column
        tempSortObj["sort"] = sort
        sortingColumns.push(tempSortObj)
      }
    });
  }
}



/**
 * @description
 * retrieves the selected database value from the URL query parameters by matching it with the available database options and returns the selected database value.
 *
 * @param {String} url_query : string from url query.
 * @param {Array} database_options : An array of objects representing the available database options.
 *
 * @returns {String} dbFromURL : The selected database value from the URL query parameters.
 *                               Returns null if no database value is found or if the value doesn't match any available options.
 *
 */
export function getSelectedDBFromURL(url_query,database_options){

  let dbFromURL = null
  if(url_query['db']){
    database_options.forEach((el) => {
      if ( el.value ===  url_query['db'] ){
        dbFromURL =  el.value
      }
    });
  }

  return dbFromURL
}



/**
 * @description
 * updates the status and group of samples in the variantsSamples array based on the values provided in the url_query object.
 *
 * @param {String} url_query : string from url query.
 * @param {Array} variantsSamples : array of sample objects representing variants.
  *
 * @returns {Array} None (The variantsSamples array is modified in-place.)
 *
 */
export function getSamplesStatusFromURL(url_query,variantsSamples){

  let affected = [];
  let not_affected = [];
  let active = [];
  let not_active = [];
  if(url_query['affected']){
    affected = url_query['affected'].split(",");
  }
  if(url_query['not_affected']){
    not_affected = url_query['not_affected'].split(",");
  }
  if(url_query['active']){
    active = url_query['active'].split(",");
  }
  if(url_query['not_active']){
    not_active = url_query['not_active'].split(",");
  }

  //If URL contains affect & not_affected samples, change the status if match the samples from URL
  variantsSamples.forEach((el) => {
    if ( active.includes(el.name) ){
      el.active = true
    }
    if ( not_active.includes(el.name) ){
      el.active = false
    }
    if ( affected.includes(el.name) ){
      el.group = "affected"
    }
    if ( not_affected.includes(el.name) ){
      el.group = "not_affected"
    }
  });

}



/**
 * @description
 * Get gene panel string from url query if 'panels' existed, return array that split from the query
 *
 * @param {String} url_query : The string from url query.
 *
 * @returns {Array} array split from url query
 *
 */
export function getPanelsFromURL(url_query){

  if(url_query['panels']){
    return  (decodeURIComponent(url_query['panels'])).split(",");
  }

  return []
}



/**
 * @description
 * Generates a URL based on different elements from the variant table.
 * The URL is constructed by appending query parameters for filters, database, variants samples, current columns, sorting columns, and panels.
 *
 * @param {Object} variantsFilter - An object containing filter conditions for variants. Each key represents a filter field, and the corresponding value represents the filter value.
 * @param {String} database : The name of the database.
 * @param {Array} variantsSamples:  An array of variant samples, each containing a name, group, and active status.
 * @param {Array} currentColumn: An array of column objects representing the current columns.
 * @param {Array}	sortingColumns: An array of sorting column objects, each containing a column name and sort direction(asc or desc)
 * @param {Array} panels : An array of panel names.
 *
 * @returns {String} url : The generated URL based on the input variables.
 *
 * @remark :
 * Only filters separate value by "@" , samples,sorting,columns,panel separate value by ","
 *
 */
export function getURLFromAllConditions(variantsFilter, database, variantsSamples, currentColumn, sortingColumns, panels){
  let url = window.location.href;
  url = url + "?q=1"

  //Filters
  if(Object.keys(variantsFilter).length > 0) {

    Object.keys(variantsFilter).forEach(key => {

      let value = variantsFilter[key];
      if(value === "" || value === undefined || value === null){
        return;
      }

      url = url + "&"

      if(typeof value === 'boolean') {
        if(value){
          url = url + key + "=" + 1
        } else {
          url = url + key + "=" + 0
        }
      } else if(typeof value === "number" || typeof value === "string" ){
        url = url + key + "=" + value
      } else {
        if (Array.isArray(value)){
          if(value.length > 0){
            value = value.join('@');
          } else {
            value = ""
          }
        } else {
          value = Object.values(value)[0]
        }
        url = url + key + "=" + encodeURIComponent(value)
      }

    });
  }

  //Database
  url = url + "&db=" + database

  //variantsSamples
  let tempAffected = [];
  let tempNotAffected = [];
  let tempActive = []
  let tempNotActive = []
  variantsSamples.forEach((el) => {
    if(el.group === "affected"){
      tempAffected.push(el.name)
    }
    if(el.group === "not_affected"){
      tempNotAffected.push(el.name)
    }
    if(el.active){
      tempActive.push(el.name)
    } else {
      tempNotActive.push(el.name)
    }
  });

  if(tempAffected.length > 0) {
    url = url + "&affected=" + tempAffected.join(",");
  }
  if(tempNotAffected.length > 0) {
    url = url + "&not_affected=" + tempNotAffected.join(",");
  }
  if(tempActive.length > 0) {
    url = url + "&active=" + tempActive.join(",");
  }
  if(tempNotActive.length > 0) {
    url = url + "&not_active=" + tempNotActive.join(",");
  }


  //Columns
  let frozenArr = []
  let displayArr = []

  currentColumn.forEach((el) => {
    if(el.isFrozen){
      frozenArr.push(el.name)
    }
    if(!el.isFrozen && el.isShow){
      displayArr.push(el.name)
    }
  });

  if(frozenArr.length > 0) {
    url = url + "&frozen=" + frozenArr.join(",");
  }
  if(displayArr.length > 0) {
    url = url + "&display=" + displayArr.join(",");
  }

  //Sorting
  let sortingArr = []

  if(sortingColumns && sortingColumns.length > 0){
    sortingColumns.forEach((el) => {
      if(el) {
        sortingArr.push(el.column + ":" + el.sort)
      }
    });
  }

  if(sortingArr.length > 0) {
    url = url + "&sort=" + sortingArr.join(",");
  }

  if(panels && panels.length >0){
    let panelArr =  panels.join(",");
    url = url + "&panels=" + encodeURIComponent(panelArr)
  }


  return url;
}