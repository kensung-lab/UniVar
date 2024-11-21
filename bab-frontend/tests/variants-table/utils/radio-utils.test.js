import { describe, it, expect, beforeEach } from 'vitest'

import {
  getFilterObjectByRadioButton,
  getFilterObjectByScenario,
  getScenarioSearchStr
} from '@/utils/variants-table/filter/radio-utils'

describe('getFilterObjectByRadioButton', () => {
  it('should delete field from variantsFilter if radioValue is "all", null, "any", or "none"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2'
    };
    const fieldName = 'field1';
    const radioValue = 'all';

    const result = getFilterObjectByRadioButton(variantsFilter, fieldName, radioValue);

    expect(result).toEqual({ field2: 'value2' });
  });

  it('should update variantsFilter with fieldName and radioValue if radioValue is not "all", null, "any", or "none"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2'
    };
    const fieldName = 'field3';
    const radioValue = 'value3';

    const result = getFilterObjectByRadioButton(variantsFilter, fieldName, radioValue);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      field3: 'value3'
    });
  });
});

let variantsSamples;

beforeEach(() => {
  variantsSamples = [
    {
      "i": 0,
      "name": "sample1",
      "sample_id": 1,
      "family_id": "family_duopat_20230105-152056",
      "mother_id": "-9",
      "father_id": "family_duopat_20230105-152056",
      "sex": "F",
      "phenotype": "2",
      "group": "affected",
      "active": true
    },
    {
      "i": 1,
      "name": "sample2",
      "sample_id": 2,
      "family_id": "family_duopat_20230105-152056",
      "mother_id": "-9",
      "father_id": "family_duopat_20230105-152056",
      "sex": "M",
      "phenotype": "1",
      "group": "not_affected",
      "active": true
    }
  ];
});

describe('getFilterObjectByScenario', () => {
  it('should delete field from variantsFilter if radioValue is "all", null, or "none"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2'
    };
    const fieldName = 'field1';
    const radioValue = 'all';

    const result = getFilterObjectByScenario(variantsFilter, fieldName, radioValue);

    expect(result).toEqual({ field2: 'value2' });
  });

  it('should update variantsFilter with scenario search string if radioValue is not "all", null, or "none"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2'
    };
    const fieldName = 'scenario';
    const radioValue = 1;

    const result = getFilterObjectByScenario(variantsFilter, fieldName, radioValue, variantsSamples);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      scenario: '110'
    });
  });

  it('should delete the "scenario" field if radioValue is "none"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
      scenario: 'scenarioValue'
    };
    const fieldName = 'scenario';
    const radioValue = 'none';

    const result = getFilterObjectByScenario(variantsFilter, fieldName, radioValue);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2'
    });
  });

  it('should set the "scenario" field to "any" if radioValue is "any"', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2'
    };
    const fieldName = 'scenario';
    const radioValue = 'any';

    const result = getFilterObjectByScenario(variantsFilter, fieldName, radioValue);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      scenario: 'any'
    });
  });
});


describe('getScenarioSearchStr', () => {
  it('should return the scenario search string based on the given scenarioValue and variantsSamples', () => {
    const scenarioValue = '0';

    const result = getScenarioSearchStr(scenarioValue, variantsSamples);

    expect(result).toEqual('010');
  });

  it('should return the scenario search string with inactive indicators if all variantsSamples are inactive', () => {
    const scenarioValue = '1';

    const result = getScenarioSearchStr(scenarioValue, variantsSamples);

    expect(result).toEqual('110');
  });

  it('should return correct scenario search string with some element not active in variantsSamples', () => {
    const scenarioValue = '2';

    variantsSamples[1]['active'] = false

    const result = getScenarioSearchStr(scenarioValue,
      variantsSamples
    );

    expect(result).toEqual('212');
  });

  it('should return correct scenario search string with all elements is inactive in variantsSamples', () => {
    const scenarioValue = '3';

    variantsSamples[0]['active'] = false
    variantsSamples[1]['active'] = false

    const result = getScenarioSearchStr(scenarioValue,
      variantsSamples
    );

    expect(result).toEqual('3-1-1');
  });

});