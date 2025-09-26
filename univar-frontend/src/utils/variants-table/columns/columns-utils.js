import { Dark } from 'quasar'
/**
* comment about columns ordering in variant table:
*   If a column is a frozen column, then its properties must be isShow: true, isFrozen: true, order sensitive
*   If a column is a display column ONLY, then its properties must be isShow: true, isFrozen: false, order sensitive
*   Any others columns that isShow = false, should be considered as hidden column, order non-sensitive
*
*   Display priority : isShow > isFrozen
*   Logic handle : frozen columns > other display columns (because frozen column must isShow,isFrozen = true )
*   PS: isShow=false + isFrozen=true also considered as hidden column and will not display in table
*
* */


/**
 * @description
 *  updates the display and frozen status of columns based on the selected columns. Then sort all the columns according to selected column
 *
 * @param {Object} selectedColumn  : object containing selected columns name eg: highest_af , from selected preset/bookmark/localStorage
 * @param {Object} currentColumn   : object representing the current column configuration with all variant type
 *
 * @returns {Object} None : currentColumn will update based on the variant type inside selectedColumn
 *
 * @remark : Run this function when select preset/bookmark , load localStorage, reset columns
 * @remark : load URL query function run getDisplayColumnsFromURL function in url-control-utils.js, not here
 *
 */
export function getColumnsDisplayOnSelect(selectedColumn, currentColumn){

  //console.log(selectedColumn)
  //console.log(currentColumn)

  let allType = ["all", "small", "structural"];

  allType.forEach((TypeEle) => {
    if (selectedColumn[TypeEle]) {

      if(!(selectedColumn[TypeEle]['frozen'])){
        selectedColumn[TypeEle]['frozen'] = []
      }
      if(!(selectedColumn[TypeEle]['display'])){
        selectedColumn[TypeEle]['display'] = []
      }

      /* Step1: Change all isShow & isFrozen status from the default columns list (because DB bookmark table only stored field name) */
      currentColumn[TypeEle].forEach((el) => {
        if ((selectedColumn[TypeEle]['display']).includes(el.name) ||
          (selectedColumn[TypeEle]['frozen']).includes(el.name)
        ) {
          el.isShow = true
        } else {
          el.isShow = false
        }
        if ((selectedColumn[TypeEle]['frozen']).includes(el.name)) {
          el.isFrozen = true
        } else {
          el.isFrozen = false
        }
      });

      /* Step2: Sort current column list(this.columns['frozen'] && this.columns['display']) according to selected column list (eg: ["highest_af","location","source"]) */
      currentColumn[TypeEle] = currentColumn[TypeEle].sort((a, b) => {
        const frozenOrder = selectedColumn[TypeEle]['frozen'];
        const displayOrder = selectedColumn[TypeEle]['display'];
        const aFrozenIndex = frozenOrder.indexOf(a.name);
        const bFrozenIndex = frozenOrder.indexOf(b.name);
        const aDisplayIndex = displayOrder.indexOf(a.name);
        const bDisplayIndex = displayOrder.indexOf(b.name);

        if (aFrozenIndex !== -1 || bFrozenIndex !== -1) {
          return aFrozenIndex - bFrozenIndex;
        }

        return aDisplayIndex - bDisplayIndex;
      });


      /* Step3: Sort the columns list again to make sure the isFrozen column in the beginning of the list */
      currentColumn[TypeEle] = sortCurrentColumn(currentColumn[TypeEle])
    }
  });

  //console.log(currentColumn)
}



/**
 * @description
 *  converts the current column format to a saved format by extracting the frozen and display columns for each column type
 *
 * @param {Object} currentColumn   : object representing the current column configuration with all variant type
 *
 * @returns {Object} savedColumns : object representing the saved format of the columns.
 *
 * @remark : Run when save bookmark
 *
 */
export function convertCurrentColumnsToSavedFormat(currentColumn){

  let savedColumns = { all : {}, small: {}, structural: {} }
  let columnType = ["all","small","structural"]

  columnType.forEach((type) => {
    let frozenArr = []
    let displayArr = []

    if(currentColumn[type]) {
      currentColumn[type].forEach((el) => {
        if (el.isFrozen && el.isShow) {
          frozenArr.push(el.name)
        }
        if (el.isShow && !el.isFrozen) {
          displayArr.push(el.name)
        }
      });
    }

    savedColumns[type]['frozen'] = frozenArr
    savedColumns[type]['display'] = displayArr
  });

  return savedColumns
}



/**
 * @description
 *  sorts the currentColumn array of objects based on the isFrozen and isShow properties in descending order.
 *  ordering : isFrozen >> isShow >> all hidden columns
 *
 * @param {Object} currentColumn  : object representing the current column configuration with all variant type
 * @param {Array} roles : some specific roles defined from keycloak may handle the display/hide logic in currentColumn
 *
 * @returns {Object} newCurrentColumn : An array representing the updated column configuration based on the URL query parameters.
 *
 * @remark : Run when init variant table, sort all orderless columns , so that the order display in variant table is correct (Frozen columns >> other non-frozen columns)
 *
 */
export function sortCurrentColumnByFrozenAndShow(currentColumn,roles){
  return sortCurrentColumn(currentColumn,roles);
}

function sortCurrentColumn(currentColumn,roles){
  //Sort the column object by isFrozen desc & isShow desc

  let newCurrentColumn = [...currentColumn]

  newCurrentColumn.sort((a, b) => {
    if (a.isFrozen < b.isFrozen) {
      return 1;
    } else if (a.isFrozen > b.isFrozen) {
      return -1;
    } else {
      if (a.isShow < b.isShow) {
        return 1;
      } else if (a.isShow > b.isShow) {
        return -1;
      } else {
        return 0;
      }
    }
  });


  return newCurrentColumn
}



/**
 * @description
 *  Get all display columns from currentColumn
 *
 * @param {Object} currentColumn  : object representing the current column configuration with current variant type
 *
 * @returns {Object} displayColumns : object representing all displayed columns from variant table
 *
 * @remark : Run when export tsv
 *
 */
export function getDisplayColumns(currentColumn){
  //console.log( currentColumn )

  let displayColumns = {}
  currentColumn.forEach((el) => {
      if(el.isShow){
        displayColumns[el.name] = 1
      }
  });

  return displayColumns
}



/**
 * @description
 *  converts the selectedSorting object into an array of sorting columns. Each sorting column object contains the column name and the corresponding sort direction.
 *  Then replace current sortingColumns from the new sortingColumns made from selectedSorting object
 *
 * @param {Object} selectedSorting   : object representing the selected sorting options.
 * @param {Object} sortingColumns    : current sortingColumns, will replace from bookmark object
 *
 * @returns {Object} sortingColumns : new sortingColumns Object made from selectedSorting object
 *
 * @remark : Run when load bookmark
 *
 */
export function getSortingOnloadBookmark(selectedSorting, sortingColumns){

  sortingColumns = [];
  Object.keys(selectedSorting).forEach(key => {
    let tempSortObj = {}
    tempSortObj["column"] = key
    tempSortObj["sort"] = selectedSorting[key] === 1 ? "asc" : "desc"
    sortingColumns.push(tempSortObj)
  });

  return sortingColumns
}



/**
 * @description
 *  converts the tempDefaultColumns object into a bookmark format so that can be loaded by getColumnsDisplayOnSelect
 *
 * @param {Object} tempDefaultColumns   : An object representing the default column configuration made when init variant table.
 *
 * @returns {Object} defaultColumns : An object representing the converted default column configuration
 *
 * @remark : Run when reset columns triggered from resetDefaultColumns
 *
 */
export function convertDefaultColumnsToBookmarkFormat(tempDefaultColumns){

  let defaultColumns = {}
  Object.keys(tempDefaultColumns).forEach(key => {
    let tempFrozenArr = []
    let tempDisplayArr = []
    tempDefaultColumns[key].forEach((el) => {
      if( el.isFrozen && el.isShow ){
        tempFrozenArr.push(el.name)
      }
      if( !el.isFrozen && el.isShow ){
        tempDisplayArr.push(el.name)
      }
    });
    defaultColumns[key] = {
      frozen : tempFrozenArr,
      display: tempDisplayArr
    }
  });

  return defaultColumns
}



/**
 * @description
 *  his function handles the column movement event from a selection area to different column groups (frozen, display, or hidden).
 *  It updates the properties of the column based on the group it is moved to and updates the column list based on the selection variant type.
 *
 * @param {Object}   event      : object representing the column movement event. It contains information about the added and removed columns.
 * @param {String}   group      : string indicating the target column group ("frozen", "display", or "hidden") that the column is moved to.
 * @param {Array} frozen_list   : An array representing the columns in the frozen group.
 * @param {Array} display_list  : An array representing the columns in the display group.
 * @param {Array} hidden_list   : An array representing the columns in the hidden group.
 * @param {String} selectionVariantType : indicating the selection variant type ("small", "structural", or any other value) for determining the column list to update.
 * @param {Object}  currentColumn : object representing the current column configuration with all variant type
 *
 * @returns  None : currentColumn will update based on the variant type and the move event from ColumnSelection.vue
 *
 * @remark : Some data management has been done by the vue-draggable-next plugin itself
 *
 */
export function onColumnMoveFromSelection(event, group, frozen_list, display_list, hidden_list, selectionVariantType,currentColumn){

  // console.log('onColumnMove')
  // console.log(event)
  // console.log(group)

  if(event['added']){
    if( group === "frozen"){
      event['added'].element.isFrozen = true
      event['added'].element.isShow= true
    }
    if( group === "display"){
      event['added'].element.isShow = true
    }
    if( group === "hidden"){
      event['added'].element.isShow= false
    }
  }

  if(event['removed'] && group === "frozen"){
      event['removed'].element.isFrozen = false
  }
  //console.log(event)
  //console.log(frozen_list)

  const list = [];
  list.push(...frozen_list);
  list.push(...display_list);
  list.push(...hidden_list);

  if( selectionVariantType === "small" ){
    currentColumn.small = list;
  } else if (  selectionVariantType  === "structural" ){
    currentColumn.structural = list;
  } else {
    currentColumn.all = list;
  }

   let savedColumns = convertCurrentColumnsToSavedFormat(currentColumn);
   localStorage.setItem(selectionVariantType+"_columns", JSON.stringify(savedColumns[selectionVariantType]));
}

export function styleForAF(afValue, darkMode = false) {
  if (afValue && afValue <= 0.001) {
    return { color: '#FF5050', 'font-weight': 'bold' };
  } else if (Dark.isActive || darkMode === true) {
    return { color: 'white' };
  } else {
    return { color: 'black' };
  }
}

export function styleForSpliceAI(spliceAI) {
  return spliceAI && spliceAI >= 0.2 ? {color: 'red', 'font-weight': 'bold'} : {color: 'black'};
}

export function onColumnSortFromVariantTable(columnName, sortingColumns){
  //console.log('onColumnSortFromVariantTable :',columnName)

  let newSort = true;

  if ( (sortingColumns).length === 0){
    (sortingColumns).push(
      {
        column : columnName,
        sort : "asc"
      }
    )
  } else {
    (sortingColumns).forEach((el, key) => {
      if (el.column === columnName) {
        if ((sortingColumns)[key]['sort'] === 'asc') {
          (sortingColumns)[key]['sort'] = 'desc';
        } else {
          (sortingColumns)[key]['sort'] = 'asc';
        }
        newSort = false
      }
    });

    if (newSort) {
      (sortingColumns).push(
        {
          column: columnName,
          sort: "asc"
        }
      )
    }
  }
}
export function valueForAF(afValue) {
  return afValue == null || afValue == undefined || afValue == -1 ? '' : typeof afValue == 'number' ? afValue : afValue[0]
}

export function columnForAF(name, label, isShow = false) {
  return {
    name: name,
    required: true,
    label: label,
    align: 'center',
    field: row => valueForAF(row[name]),
    format: val => `${val}`,
    style: row => styleForAF(row[name]),
    sortable: true,
    category: "frequency",
    isShow: isShow,
    cellRenderer: 'formatFrequency',
    width: 160
  };
}