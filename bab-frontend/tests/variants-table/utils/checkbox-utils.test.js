import { describe, it ,expect } from 'vitest';

import {
  getFilterObjectByCheckBox,
  getFilterImpactObjectByCheckBox,
} from '@/utils/variants-table/filter/checkbox-utils'

describe('getFilterObjectByCheckBox', () => {
  it('should return and replace the updated variantsFilter object', () => {

    const variantsFilter = {
      fieldName: ['value1', 'value2']
    };
    const fieldName = 'fieldName';
    const checkboxValue = ['value3'];
    const result = getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue);

    expect(result).toEqual({
      fieldName: ['value3'],
    });
  });

  it('should return the variantsFilter object with the fieldName property removed when searchValue is empty', () => {

    const variantsFilter = {
      fieldName: ['value1', 'value2']
    };
    const fieldName = 'fieldName';
    const checkboxValue = [];

    const result = getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue);

    expect(result).toEqual({});
  });

  it('should return the variantsFilter object with the fieldName property removed when searchValue is not provided', () => {

    const variantsFilter = {
      fieldName: ['value1', 'value2'],
    };
    const fieldName = 'fieldName';
    const checkboxValue = undefined;

    const result = getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue);

    expect(result).toEqual({
      fieldName: ['value1', 'value2']
    });
  });

  it('should push empty value into checkbox if null existed', () => {

    const variantsFilter = {
      fieldName: ['value1', 'value2'],
    };
    const fieldName = 'fieldName';
    const checkboxValue = ['value3',null];

    const result = getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue);

    expect(result).toEqual({
      fieldName: ['value3', null, '']
    });
  });

  it('should delete fieldName from variantsFilter and others remain unchanged', () => {

    const variantsFilter = {
      fieldNameB: ['value1', 'value2'],
    };
    const fieldName = 'fieldName';
    const checkboxValue = [];

    const result = getFilterObjectByCheckBox(variantsFilter, fieldName, checkboxValue);

    expect(result).toEqual( {
      fieldNameB: ['value1', 'value2'],
    });
  });

});



describe('getFilterImpactObjectByCheckBox', () => {
  it('should return the updated variantsFilter object when allClickButton is true and variantsFilter has existing impact values', () => {
    // Mock data
    const variantsFilter = {
      impact: ['impact1', 'impact2'],
    };
    const checkboxValue = ['impact2', 'impact3'];
    const allClickButton = true;
    const type = 'impact';
    const currentOptions = [
      { value: 'impact1' },
      { value: 'impact2' },
      { value: 'impact3' },
    ];

    const result = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(result).toEqual({
      impact: ['impact2', 'impact3']
    });
  });

  it('should return the updated variantsFilter object when allClickButton is true and variantsFilter does not have existing impact values', () => {

    const variantsFilter = {};
    const checkboxValue = ['impact2', 'impact3'];
    const allClickButton = true;
    const type = 'impact';
    const currentOptions = [
      { value: 'impact1' },
      { value: 'impact2' },
      { value: 'impact3' },
    ];

    const result = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(result).toEqual({
      impact: ['impact2', 'impact3'],
    });
  });

  it('should return the updated variantsFilter object when allClickButton is false and there are remaining impact values', () => {

    const variantsFilter = {
      impact: ['impact1', 'impact2', 'impact3'],
    };
    const checkboxValue = ['impact3'];
    const allClickButton = false;
    const type = 'impact';
    const currentOptions = [
      { value: 'impact1' },
      { value: 'impact2' },
      { value: 'impact3' },
    ];

    const result = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(result).toEqual({});
  });

  it('should return the updated variantsFilter object when allClickButton is false and there are no remaining impact values', () => {

    const variantsFilter = {
      impact: ['impact1'],
    };
    const checkboxValue = ['impact1'];
    const allClickButton = false;
    const type = 'impact';
    const currentOptions = [
      { value: 'impact1' },
      { value: 'impact2' },
      { value: 'impact3' },
    ];

    const result = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(result).toEqual({});
  });


  it('should only uncheck selected impact values and others remain unchanged', () => {

    const variantsFilter = {
      impact: ['inframe_deletion', 'missense_variant', 'downstream_gene_variant'],
    };
    const checkboxValue = [];
    const allClickButton = false;
    const type = 'impactHigh';
    const currentOptions = [
      {
        "label": "frameshift",
        "value": "frameshift_variant"
      },
      {
        "label": "splice acceptor",
        "value": "splice_acceptor_variant"
      },
      {
        "label": "splice donor",
        "value": "splice_donor_variant"
      },
      {
        "label": "start lost",
        "value": "start_lost"
      },
      {
        "label": "start retained",
        "value": "start_retained_variant"
      },
      {
        "label": "stop gained",
        "value": "stop_gained"
      },
      {
        "label": "stop lost",
        "value": "stop_lost"
      }
    ]

    const newVriantsFilter = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(newVriantsFilter.impact).toEqual([
      "inframe_deletion",
      "missense_variant",
      "downstream_gene_variant"
    ]);
  });


  it('should delete checkboxes from variantsFilter and others value in variantsFilter remain unchanged', () => {

    const variantsFilter = {
      chrom : 'ABC'
    };
    const checkboxValue = ['impact1'];
    const allClickButton = false;
    const type = 'impact';
    const currentOptions = [
      { value: 'impact1' },
      { value: 'impact2' },
      { value: 'impact3' },
    ];

    const result = getFilterImpactObjectByCheckBox(variantsFilter, checkboxValue, allClickButton, type, currentOptions);

    expect(result).toEqual({
      chrom : 'ABC'
    });
  });

});