/**
 * @description
 *  modifies a filter object based on the value of a radio button.
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {String} fieldName : A string representing the field name for the checkbox element in variantsFilter.
 * @param {String} radioValue : A string representing the value of the radio button
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 * @remark : Replace the value from variantsFilter by checkboxValue
 */
export function getFilterObjectByRadioButton(variantsFilter, fieldName, radioValue) {

  if(radioValue === 'all' || radioValue === null || radioValue === 'any' || radioValue === 'none') {
    delete variantsFilter[fieldName]
  } else {
    variantsFilter[fieldName] = radioValue
  }

  return variantsFilter
}



/**
 * @description
 *  modifies a filter object based on the value of a radio button, specifically for the "scenario" field.
 *
 * @param {Object} variantsFilter : object representing the filter configuration.
 * @param {String} fieldName : A string representing the field name for the checkbox element in variantsFilter.
 * @param {String} radioValue : A string representing the value of the radio button
 * @param {Object} variantsSamples:  It is used to derive the scenario search string
 *
 * @returns {Object} variantsFilter : An updated object representing the filter conditions.
 *
 */
export function getFilterObjectByScenario(variantsFilter, fieldName, radioValue, variantsSamples = null) {
  if(radioValue === 'all' || radioValue === null || radioValue === 'none') {
    delete variantsFilter[fieldName]
  } else {

    if(radioValue === "any"){
      variantsFilter['scenario'] = "any"
    } else {
      variantsFilter['scenario'] = getScenarioSearchStr(radioValue, variantsSamples)
    }

    return variantsFilter
  }

  return variantsFilter
}




/**
 * @description
 *  modifies a filter object based on the value of a radio button, specifically for the "scenario" field.
 *
 * @param {String} scenarioValue : A string representing the value of the radio button
 * @param {Object} variantsSamples:  It is used to derive the scenario search string
 *
 * @returns {String} scenarioStr : An updated object representing the filter conditions.
 *
 * @remark : temporary logic for scenario radio box in phase1 :
 *            - none : remove scenario key from variantsFilter
 *            - any scenario : pass "any"
 *            - dominant :     scenarioValue = 0 + string from variantsSamples
 *            - recessive :    scenarioValue = 1 + string from variantsSamples
 *            - de novo :      scenarioValue = 2 + string from variantsSamples
 *            - compound het : scenarioValue = 3 + string from variantsSamples
 *            - x linked :     scenarioValue = 4 + string from variantsSamples
 *
 *            variantsSamples string logic:
 *            - For each element in variantsSamples,
 *              - if active = true && group = true , return 1 else return 0
 *              - if active = false , return 2
 *              - If all elements inactive in variantsSamples, each sample return -1
 *
 */
export function getScenarioSearchStr(scenarioValue, variantsSamples){

  let scenarioStr = ''

  scenarioStr += scenarioValue;

  let allInactive = true;
  let inactiveStr = "";

  let tempVariantsSamples = JSON.parse(JSON.stringify(variantsSamples));
  (tempVariantsSamples).sort((a, b) => a.i - b.i);

  tempVariantsSamples.forEach((el) => {
    if(el.active) {
      if (el.group === 'affected') {
        scenarioStr += 1;
      } else  {
        scenarioStr += 0;
      }
      allInactive = false
    } else {
      scenarioStr += 2;
      inactiveStr += "-1"
    }
  });

  if(allInactive){
    scenarioStr = scenarioValue + inactiveStr
  }

  return scenarioStr;
}