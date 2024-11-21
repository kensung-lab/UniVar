import { describe, it, expect } from 'vitest'

import {
  getFilterObjectBySelected,
  getFilterObjectBySelectedClinGen
} from '@/utils/variants-table/filter/drop-select-utils'


describe('getFilterObjectBySelected', () => {
  it('should delete the field from variantsFilter if selectedValue is null or empty', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
    };
    const fieldName = 'field1';
    const selectedValue = null;

    const result = getFilterObjectBySelected(variantsFilter, fieldName, selectedValue);

    expect(result).toEqual({ field2: 'value2' });
  });

  it('should update the field in variantsFilter with selectedValue', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
    };
    const fieldName = 'field2';
    const selectedValue = 'newvalue';

    const result = getFilterObjectBySelected(variantsFilter, fieldName, selectedValue);

    expect(result).toEqual({ field1: 'value1', field2: 'newvalue' });
  });

  it('should return the same variantsFilter if selectedValue is neither null nor empty', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
    };
    const fieldName = 'field3';
    const selectedValue = 'value3';

    const result = getFilterObjectBySelected(variantsFilter, fieldName, selectedValue);

    expect(result).toEqual({ field1: 'value1', field2: 'value2', field3: 'value3' });
  });
});


describe('getFilterObjectBySelectedClinGen', () => {
  it('should update the variantsFilter with impactSVClinGenHISelected and impactSVClinGenTSSelected', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
    };
    const impactSVClinGenHISelected = 'HI1';
    const impactSVClinGenTSSelected = 'TS2';

    const result = getFilterObjectBySelectedClinGen(variantsFilter, impactSVClinGenHISelected, impactSVClinGenTSSelected);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      clingen_hi: 'HI1',
      clingen_ts: 'TS2',
    });
  });

  it('should delete clingen_hi field from variantsFilter if impactSVClinGenHISelected is null', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
      clingen_hi: 'HI1',
    };
    const impactSVClinGenHISelected = null;
    const impactSVClinGenTSSelected = 'TS2';

    const result = getFilterObjectBySelectedClinGen(variantsFilter, impactSVClinGenHISelected, impactSVClinGenTSSelected);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      clingen_ts: 'TS2',
    });
  });

  it('should delete clingen_ts field from variantsFilter if impactSVClinGenTSSelected is null', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
      clingen_ts: 'TS2',
    };
    const impactSVClinGenHISelected = 'HI1';
    const impactSVClinGenTSSelected = null;

    const result = getFilterObjectBySelectedClinGen(variantsFilter, impactSVClinGenHISelected, impactSVClinGenTSSelected);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
      clingen_hi: 'HI1',
    });
  });

  it('should delete clingen_hi and clingen_ts fields from variantsFilter if both impactSVClinGenHISelected and impactSVClinGenTSSelected are null', () => {
    const variantsFilter = {
      field1: 'value1',
      field2: 'value2',
      clingen_hi: 'HI1',
      clingen_ts: 'TS2',
    };
    const impactSVClinGenHISelected = null;
    const impactSVClinGenTSSelected = null;

    const result = getFilterObjectBySelectedClinGen(variantsFilter, impactSVClinGenHISelected, impactSVClinGenTSSelected);

    expect(result).toEqual({
      field1: 'value1',
      field2: 'value2',
    });
  });
});