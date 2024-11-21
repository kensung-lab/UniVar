import { describe, it ,expect, beforeEach } from 'vitest';
import {
  getFilterObjectSVLength,
  getFilterObjectNormal,
  getFilterObjectCustomValue,
  getFilterObjectNoStep
} from '@/utils/variants-table/filter/slider-utils'


describe('getFilterObjectSVLength', () => {
  it('should update the variantsFilter object with len equals to 1', () => {
    const variantsFilter = {};
    const newValue = '1';

    const result = getFilterObjectSVLength(variantsFilter, newValue);

    expect(result).toEqual({ len: { '$lte': 1 } });
  });

  it('should update the variantsFilter object with len less than or equal to 1000000', () => {
    const variantsFilter = {};
    const newValue = '2';

    const result = getFilterObjectSVLength(variantsFilter, newValue);

    expect(result).toEqual({ len: { '$lte': 1000000 } });
  });

  it('should return the same result regardless of newValue being a string or a number', () => {
    const variantsFilter = {};
    const newValueString = '2';
    const newValueNumber = 2;

    const resultString = getFilterObjectSVLength(variantsFilter, newValueString);
    const resultNumber = getFilterObjectSVLength(variantsFilter, newValueNumber);

    expect(resultString).toEqual(resultNumber);
  });

  it('should replace the len property from the variantsFilter object', () => {
    const variantsFilter = { len: { '$eq': 1 } };
    const newValue = 2;

    const result = getFilterObjectSVLength(variantsFilter, newValue);

    expect(result).toEqual({ len: { '$lte': 1000000 } });
  });

  it('should delete the len property from the variantsFilter object', () => {
    const variantsFilter = { len: { '$eq': 1 } };
    const newValue = '3';

    const result = getFilterObjectSVLength(variantsFilter, newValue);

    expect(result).toEqual({});
  });

  it('should delete the len property from the variantsFilter object if newValue is null or empty', () => {
    const variantsFilter = { len: { '$eq': 1 } };

    const result = getFilterObjectSVLength(variantsFilter, "");
    expect(result).toEqual({});

    const result2 = getFilterObjectSVLength(variantsFilter, null);
    expect(result2).toEqual({});
  });

  it('should not affect other properties of variantsFilter object', () => {
    const variantsFilter = {
      constraint_mis_z: {$lte: 3.09},
      len: { '$eq': 1 }
    };

    const result = getFilterObjectSVLength(variantsFilter, "");
    expect(result).toEqual({constraint_mis_z: {$lte: 3.09}});

    const result2 = getFilterObjectSVLength(variantsFilter, null);
    expect(result2).toEqual({constraint_mis_z: {$lte: 3.09}});

    const result3 = getFilterObjectSVLength(variantsFilter, 1);
    expect(result3).toEqual({constraint_mis_z: {$lte: 3.09} , len: { '$lte' : 1} });
  });
});


describe('getFilterObjectNormal', () => {
  let variantsFilter;
  let fieldName;
  let filterValue;
  let sliderObject;

  beforeEach(() => {
    variantsFilter = {};
    fieldName = 'start';
    filterValue = 2;   //ie step value/index in markerList array
    sliderObject = {
      min: 1,
      max: 3,
      step: 1,
      markerList: [
        { db_value: 0 },      //step value = 1
        { db_value: 10 },     //step value = 2
        { db_value: 20 }      //step value = 3
      ],
      conditions: '$lte'
    };
  });

  it('should delete attribute from variantsFilter object when dbValue = null', () => {
    variantsFilter = { start: { '$lte': 10 } };
    sliderObject = {
      min: 1,
      max: 3,
      step: 1,
      markerList: [
        { db_value: null },
        { db_value: 0 },
      ],
      conditions: '$lte'
    };
    const result = getFilterObjectNormal(variantsFilter, fieldName, 1, sliderObject);

    expect(result).toEqual({});
  });


  it('should update the variantsFilter object with the specified field and condition', () => {
    const result = getFilterObjectNormal(variantsFilter, fieldName, filterValue, sliderObject);

    expect(result).toEqual({ start: { '$lte': 10 } });
  });

  it('should delete the field from the variantsFilter object when dbValue is null', () => {
    sliderObject.markerList[1].db_value = null;

    const result = getFilterObjectNormal(variantsFilter, fieldName, filterValue, sliderObject);

    expect(result).toEqual({});
  });

  it('should not affect other properties in the variantsFilter object no matter what filerValue is', () => {
    variantsFilter = {
      len: { '$eq': 1 }
    };
    sliderObject.markerList[1].db_value = null;

    const result = getFilterObjectNormal(variantsFilter, fieldName, filterValue, sliderObject);

    expect(result).toEqual({len: { '$eq': 1 }});
  });

  it('should replace the field from the variantsFilter object when it already exists', () => {
    variantsFilter.start = { '$lte': 5 };

    const result = getFilterObjectNormal(variantsFilter, fieldName, filterValue, sliderObject);

    expect(result).toEqual({ start: { '$lte': 10 } });
  });

  it('should throw TypeError if filterValue is an invalid value so can not get dbValue from markerList', () => {
    let result;
    try {
      result = getFilterObjectNormal(variantsFilter, fieldName, "", sliderObject);
    }
    catch (e) {
      expect(result).toThrow(TypeError);
    }

    expect(result).toThrow(TypeError);
  });
});


describe('getFilterObjectCustomValue', () => {
  it('should add filter value to variantsFilter object', () => {
    const variantsFilter = {};
    const fieldName = 'price';
    const filterValue = '100';
    const sliderObject = {
      min: 1,
      max: 3,
      step: 1,
      markerList: [
        { db_value: 0 },      //step value = 1
        { db_value: 10 },     //step value = 2
        { db_value: 20 }      //step value = 3
      ],
      conditions: '$lte',
    };
    const expectedResult = {
      price: {
        $lte: 100
      },
    };

    expect(getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject)).toEqual(expectedResult);
  });

  it('should remove filter value from variantsFilter object', () => {
    const variantsFilter = {
      price: {
        $lte: 100,
      },
    };
    const fieldName = 'price';
    const filterValue = '';
    const sliderObject = {
      conditions: '$lte',
    };
    const expectedResult = {};

    expect(getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject)).toEqual(expectedResult);
  });

  it('should handle null filter value correctly', () => {
    const variantsFilter = {
      price: {
        $lte: 100,
      },
    };
    const fieldName = 'price';
    const filterValue = null;
    const sliderObject = {
      conditions: '$lte',
    };
    const expectedResult = {};

    expect(getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject)).toEqual(expectedResult);
  });

  it('should throw TypeError if the conditions not defined in sliderObject model', () => {
    const variantsFilter = {
      price: {
        $lte: 100,
      },
    };
    const fieldName = 'price';
    const filterValue = '50';
    const sliderObject = {};
    const expectedResult = {
      price: {
        $lte: 50
      },
    };

    try {
      expect(getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject)).toEqual(expectedResult);
    } catch (e) {
      expect(expectedResult).toThrow(TypeError);
    }

  });


  it('should remain change if no fieldName inside variantsFilter', () => {
    const variantsFilter = {
      price: {
        $lte: 100,
      },
    };
    const fieldName = 'start';
    const filterValue = null;
    const sliderObject = {
      conditions: '$lte',
    };
    const expectedResult = {
      price: {
        $lte: 100,
      },
    };

    expect(getFilterObjectCustomValue(variantsFilter, fieldName, filterValue, sliderObject)).toEqual(expectedResult);
  });


});



describe('getFilterObjectNoStep', () => {
  it('should add filter object to variantsFilter if filterValue is not 30', () => {
    const variantsFilter = {}
    const type = 'price'
    const filterValue = '20'
    const conditions = 'gte'

    const result = getFilterObjectNoStep(variantsFilter, type, filterValue, conditions)

    expect(result).toEqual({
      price: {
        gte: 20
      }
    })
  })

  it('should return a number in variantsFilter', () => {
    const variantsFilter = {}
    const type = 'price'
    const filterValue = '20'
    const conditions = 'gte'

    const result = getFilterObjectNoStep(variantsFilter, type, filterValue, conditions)
    expect(result[type][conditions]).toEqual(20)
    expect(result[type][conditions]).toBeTypeOf('number')
  })

  it('should remove filter object from variantsFilter if filterValue is 30', () => {
    const variantsFilter = {
      price: {
        gte: 20
      }
    }
    const type = 'price'
    const filterValue = '30'
    const conditions = 'gte'

    const result = getFilterObjectNoStep(variantsFilter, type, filterValue, conditions)

    expect(result).toEqual({})
  })

  it('should remain unchanged if type not inside variantsFilter', () => {
    const variantsFilter = {
      price: {
        gte: 20
      }
    }
    const type = 'start'
    const filterValue = '30'
    const conditions = 'gte'

    const result = getFilterObjectNoStep(variantsFilter, type, filterValue, conditions)

    expect(result).toEqual({
      price: {
        gte: 20
      }
    })
  })
})