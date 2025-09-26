/**
 * @description
 *  converts an array of panel values to an array of corresponding panel names.
 *
 * @param {Array} panels : Array of panel values.
 * @param {Array} panelOptions : An array of objects representing panel options
 *
 * @returns {Array} newPanelArr : An array of panel names converted from the given panel values.
 *
 * @remark : Use this function to find panels display name from panels id from a panels array, Usage: FilteredBox, bookmark preview.
 */
export function convertPanelFromValueToName(panels, panelOptions){

  let newPanelObj = []
  if(panelOptions.length > 0) {
    panelOptions.forEach(el => {
      if (panels != null && Array.isArray(panels) && panels.includes(el.value)) {
        newPanelObj.push(
          {
            label : el.label,
            value : el.value
          }
        )
      }
    })
  }

  return newPanelObj;
}