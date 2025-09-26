import { describe, it ,expect, beforeEach} from 'vitest';
import {
  sortCurrentColumnByFrozenAndShow,
  getColumnsDisplayOnSelect,
  convertCurrentColumnsToSavedFormat,
  getDisplayColumns,
  getSortingOnloadBookmark,
  convertDefaultColumnsToBookmarkFormat,
  onColumnMoveFromSelection,
  onColumnSortFromVariantTable,
  styleForAF,
  styleForSpliceAI
} from '@/utils/variants-table/columns/columns-utils'
import { Dark } from 'quasar'

/*
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

let currentColumn;

beforeEach(() => {
  currentColumn = {
    all: [
      { name: 'start', isShow: false, isFrozen: false },
      { name: 'end', isShow: true, isFrozen: true },
      { name: 'chr', isShow: true, isFrozen: false },
      { name: 'alt', isShow: false, isFrozen: true }
    ],
    small: [
      { name: 'ref', isShow: false, isFrozen: false },
      { name: 'location', isShow: false, isFrozen: true },
      { name: 'alt', isShow: false, isFrozen: true },
      { name: 'end', isShow: true, isFrozen: true },
      { name: 'start', isShow: false, isFrozen: false },
      { name: 'chr', isShow: true, isFrozen: false }
    ],
    structural: [
      { name: 'highest_af', isShow: false, isFrozen: false },
      { name: 'mane_select', isShow: true, isFrozen: true },
      { name: 'constraint_pli', isShow: true, isFrozen: false },
      { name: 'source', isShow: false, isFrozen: true }
    ],
  }
});

describe('sortCurrentColumnByFrozenAndShow', () => {

  it('should sort the columns that passed into the method begin with isFrozen,isShow', async () => {

    let newCurrentColumn = sortCurrentColumnByFrozenAndShow(currentColumn['all']);

    const expectedColumn = [
      { name: 'end', isShow: true, isFrozen: true },
      { name: 'alt', isShow: false, isFrozen: true },
      { name: 'chr', isShow: true, isFrozen: false },
      { name: 'start', isShow: false, isFrozen: false }
    ];
    
    expect(newCurrentColumn).toEqual(expectedColumn);
  });

  // it('should remove caller column if roles not inside s-team', async () => {
  //
  //   let currentColumn = [
  //     { name: 'start', isShow: false, isFrozen: false },
  //     { name: 'end', isShow: true, isFrozen: true },
  //     { name: 'chr', isShow: true, isFrozen: false },
  //     { name: 'alt', isShow: false, isFrozen: true },
  //     { name: 'caller', isShow: true, isFrozen: true }
  //   ]
  //
  //   let roles = []
  //   let newCurrentColumn = sortCurrentColumnByFrozenAndShow(currentColumn, roles);
  //
  //   const expectedColumn = [
  //     { name: 'end', isShow: true, isFrozen: true },
  //     { name: 'alt', isShow: false, isFrozen: true },
  //     { name: 'chr', isShow: true, isFrozen: false },
  //     { name: 'start', isShow: false, isFrozen: false }
  //   ];
  //
  //   expect(newCurrentColumn).toEqual(expectedColumn);
  // });


});

describe('getColumnsDisplayOnSelect', () => {
  it('should replace currentColumn and order as expected when selectedColumn is provided', async () => {

    const selectedColumn = {
      all: {
        frozen: ['chr'],
        display: ['end', 'start', 'chr']
      },
      small: {
        frozen: ['location'],
        display: ['ref', 'start', 'end', 'chr', 'location']
      },
      structural: {
        display: ['constraint_pli', 'mane_select', 'highest_af', 'source'],
      },
    };

    await getColumnsDisplayOnSelect(selectedColumn, currentColumn);

    expect(currentColumn).toEqual({
      all: [
        { name: 'chr', isShow: true, isFrozen: true },
        { name: 'end', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: false },
        { name: 'alt', isShow: false, isFrozen: false }
      ],
      small: [
        { name: 'location', isShow: true, isFrozen: true },
        { name: 'ref', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: false },
        { name: 'end', isShow: true, isFrozen: false },
        { name: 'chr', isShow: true, isFrozen: false },
        { name: 'alt', isShow: false, isFrozen: false }
      ],
      structural: [
        { name: 'constraint_pli', isShow: true, isFrozen: false },
        { name: 'mane_select', isShow: true, isFrozen: false },
        { name: 'highest_af', isShow: true, isFrozen: false },
        { name: 'source', isShow: true, isFrozen: false }
      ],
    });
  });

  it('should handle empty selected column passed into method', async () => {
    const selectedColumn = {
      all: {
        frozen: ['chr']
      },
      small: {
        frozen: [],
        display: ['ref', 'start', 'end', 'chr', 'location']
      },
      structural: {},
    };

    await getColumnsDisplayOnSelect(selectedColumn, currentColumn);
    expect(currentColumn['all']).toEqual(
       [
          { name: 'chr', isShow: true, isFrozen: true },
          { name: 'start', isShow: false, isFrozen: false },
          { name: 'end', isShow: false, isFrozen: false },
          { name: 'alt', isShow: false, isFrozen: false }
        ]
    );
    expect(currentColumn['small']).toEqual(
      [
        { name: 'ref', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: false },
        { name: 'end', isShow: true, isFrozen: false },
        { name: 'chr', isShow: true, isFrozen: false },
        { name: 'location', isShow: true, isFrozen: false },
        { name: 'alt', isShow: false, isFrozen: false }
      ]
    );
    expect(currentColumn['structural']).toEqual(
      [
        { name: 'highest_af', isShow: false, isFrozen: false },
        { name: 'mane_select', isShow: false, isFrozen: false },
        { name: 'constraint_pli', isShow: false, isFrozen: false },
        { name: 'source', isShow: false, isFrozen: false }
      ]
    );
  });

  it('should not affected current columns if no variant type provided', async () => {
    const selectedColumn = {
      all: {
        frozen: ['chr']
      },
      structural: {},
    };

    await getColumnsDisplayOnSelect(selectedColumn, currentColumn);
    expect(currentColumn['small']).toEqual(
      [
        { name: 'ref', isShow: false, isFrozen: false },
        { name: 'location', isShow: false, isFrozen: true },
        { name: 'alt', isShow: false, isFrozen: true },
        { name: 'end', isShow: true, isFrozen: true },
        { name: 'start', isShow: false, isFrozen: false },
        { name: 'chr', isShow: true, isFrozen: false }
      ]
    );

  });
});

describe('convertCurrentColumnsToSavedFormat', () => {
  it('should convert currentColumn to saved format when all columns are hidden', () => {
    const currentColumn = {
      all: [{ name: 'chr', isShow: false, isFrozen: false }],
      small: [{ name: 'start', isShow: false, isFrozen: false }],
      structural: [{ name: 'end', isShow: false, isFrozen: false }],
    };

    const savedColumns = {
      all: { frozen: [], display: [] },
      small: { frozen: [], display: [] },
      structural: { frozen: [], display: [] },
    };

    expect(convertCurrentColumnsToSavedFormat(currentColumn)).toEqual(savedColumns);
  });

  it('should convert currentColumn to saved format when some columns are shown and frozen', () => {
    const currentColumn = {
      all: [
        { name: 'end',    isShow: true,   isFrozen: true },
        { name: 'start',  isShow: true,   isFrozen: true },
        { name: 'chr',    isShow: true,   isFrozen: false },
        { name: 'alt',    isShow: false,  isFrozen: false },
        { name: 'ref',    isShow: false,  isFrozen: true },
      ],
      small: [
        { name: 'end', isShow: true, isFrozen: true },
        { name: 'start', isShow: false, isFrozen: false },
      ],
      structural: [],
    };

    const savedColumns = {
      all: { frozen: ['end', 'start'], display: ['chr'] },
      small: { frozen: ['end'], display: [] },
      structural: { frozen: [], display: [] },
    };

    expect(convertCurrentColumnsToSavedFormat(currentColumn)).toEqual(savedColumns);
  });

  it('should convert currentColumn to saved format when all columns are shown and unfrozen', () => {
    const currentColumn = {
      all: [
        { name: 'chr', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: false },
        { name: 'end', isShow: true, isFrozen: false },
      ],
      small: [
        { name: 'end', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: false },
      ],
      structural: [
        { name: 'ref', isShow: true, isFrozen: false },
        { name: 'source', isShow: true, isFrozen: false },
      ],
    };

    const savedColumns = {
      all: { frozen: [], display: ['chr', 'start', 'end'] },
      small: { frozen: [], display: ['end', 'start'] },
      structural: { frozen: [], display: ['ref', 'source'] },
    };

    expect(convertCurrentColumnsToSavedFormat(currentColumn)).toEqual(savedColumns);
  });
});



describe('getDisplayColumns', () => {
  it('should return an empty object when no columns are frozen or shown', () => {
    const currentColumn = [
      { name: 'start', isShow: false, isFrozen: false },
      { name: 'end', isShow: false, isFrozen: false },
      { name: 'chr', isShow: false, isFrozen: false },
      { name: 'alt', isShow: false, isFrozen: false },
    ];

    expect(getDisplayColumns(currentColumn)).toEqual({});
  });

  it('should return an object with frozen and shown columns', () => {
    const currentColumn = [
      { name: 'start', isShow: false, isFrozen: false },
      { name: 'end', isShow: true, isFrozen: true },
      { name: 'chr', isShow: true, isFrozen: false },
      { name: 'alt', isShow: false, isFrozen: true },
    ];

    expect(getDisplayColumns(currentColumn)).toEqual({
      end: 1,
      chr: 1,
    });
  });

  it('should return an object with all shown columns when none are frozen', () => {
    const currentColumn = [
      { name: 'start', isShow: true, isFrozen: false },
      { name: 'end', isShow: true, isFrozen: false },
      { name: 'chr', isShow: true, isFrozen: false },
      { name: 'alt', isShow: true, isFrozen: false },
    ];

    expect(getDisplayColumns(currentColumn)).toEqual({
      start: 1,
      end: 1,
      chr: 1,
      alt: 1,
    });
  });
});


describe('getSortingOnloadBookmark', () => {
  it('should return an empty array when the selectedSorting object is empty', () => {
    const selectedSorting = {};
    const sortingColumns = [];

    expect(getSortingOnloadBookmark(selectedSorting, sortingColumns)).toEqual([]);
  });

  it('should return an array of objects with the correct column and sort properties', () => {
    const selectedSorting = {
      chr: 1,
      start: -1,
      end: 1,
      entrez_gene_id: -1,
      mane_select: 1,
    };
    const sortingColumns = [];

    expect(getSortingOnloadBookmark(selectedSorting, sortingColumns)).toEqual([
      { column: 'chr', sort: 'asc' },
      { column: 'start', sort: 'desc' },
      { column: 'end', sort: 'asc' },
      { column: 'entrez_gene_id', sort: 'desc' },
      { column: 'mane_select', sort: 'asc' },
    ]);
  });
});


describe('convertDefaultColumnsToBookmarkFormat', () => {
  it('should return an empty object when the tempDefaultColumns object is empty', () => {
    const tempDefaultColumns = {};

    expect(convertDefaultColumnsToBookmarkFormat(tempDefaultColumns)).toEqual({});
  });

  it('should return an object with frozen and display arrays for each column', () => {
    const tempDefaultColumns = {
      all: [
        { name: 'chr', isShow: true, isFrozen: false },
        { name: 'start', isShow: true, isFrozen: true },
        { name: 'end', isShow: false, isFrozen: false },
        { name: 'ref', isShow: false, isFrozen: true },
      ],
      small: [
        { name: 'entrez_gene_id', isShow: true, isFrozen: true },
        { name: 'symbol', isShow: true, isFrozen: false },
      ],
    };

    expect(convertDefaultColumnsToBookmarkFormat(tempDefaultColumns)).toEqual({
      all: {
        frozen: ['start'],
        display: ['chr']
      },
      small: {
        frozen: ['entrez_gene_id'],
        display: ['symbol']
      },
    });
  });
});


describe('onColumnMoveFromSelection', () => {

  it('should update the element properties based on the group is display and event is added', () => {
    const event = { added: { element: { name: 'chr', isFrozen: false, isShow: false } } };
    const group = 'display';
    const frozen_list = [];
    const display_list = [{ name: 'start', isFrozen: false, isShow: true }];
    const hidden_list = [];
    const selectionVariantType = 'small';
    const currentColumn = { small: [] };

    onColumnMoveFromSelection(event, group, frozen_list, display_list, hidden_list, selectionVariantType, currentColumn);

    expect(event).toEqual({ added: { element: { name: 'chr', isFrozen: false, isShow: true } } } );
    expect(frozen_list).toEqual([]);
    expect(display_list).toEqual([ { name: 'start', isFrozen: false, isShow: true } ]);
    expect(hidden_list).toEqual([]);
    expect(currentColumn).toEqual({ small: [ { name: 'start', isFrozen: false, isShow: true } ] });
  });

  it('should update the element properties based on the group is frozen and event is added', () => {
    const event = { added: { element: { name: 'chr', isFrozen: false, isShow: false } } };
    const group = 'frozen';
    const frozen_list = [{ name: 'start', isFrozen: false, isShow: false }];
    const display_list = [];
    const hidden_list = [];
    const selectionVariantType = 'small';
    const currentColumn = { small: [] };

    onColumnMoveFromSelection(event, group, frozen_list, display_list, hidden_list, selectionVariantType, currentColumn);

    expect(event).toEqual({ added: { element: { name: 'chr', isFrozen: true, isShow: true } } });
    expect(frozen_list).toEqual([{ name: 'start', isFrozen: false, isShow: false }]);
    expect(display_list).toEqual([]);
    expect(hidden_list).toEqual([]);
    expect(currentColumn).toEqual({ small: [{ name: 'start', isFrozen: false, isShow: false }] });

    /***** chr will automatically add into frozen_list when user drag into frozen list, before executing this method *****/
  });

  it('should update the removed element properties based on the group is frozen and event is remove', () => {
    const event = { removed: { element: { name: 'chr', isFrozen: true, isShow: true } } };
    const group = 'frozen';
    const frozen_list = [
      { name: 'start', isFrozen: true, isShow: true },
      { name: 'chr', isFrozen: false, isShow: true }
    ];
    const display_list = [];
    const hidden_list = [];
    const selectionVariantType = 'structural';
    const currentColumn = { structural: [] };

    onColumnMoveFromSelection(event, group, frozen_list, display_list, hidden_list, selectionVariantType, currentColumn);

    expect(event).toEqual({ removed: { element: { name: 'chr', isFrozen: false, isShow: true } } });
    expect(frozen_list).toEqual([
      { name: 'start', isFrozen: true, isShow: true },
      { name: 'chr', isFrozen: false, isShow: true }]);
    expect(display_list).toEqual([]);
    expect(hidden_list).toEqual([]);
    expect(currentColumn).toEqual({ structural: [
      { name: 'start', isFrozen: true, isShow: true } ,
      { name: 'chr', isFrozen: false, isShow: true }
      ]
    });

    /***** chr will automatically remove from frozen_list when user drag away from frozen list, before executing this method *****/
  });

  it('should update the element properties based on the group is hidden', () => {
    const event = { added: { element: { name: 'chr', isFrozen: true, isShow: true } } };
    const group = 'hidden';
    const frozen_list = [];
    const display_list = [];
    const hidden_list = [];
    const selectionVariantType = '';
    const currentColumn = { small: [] };

    onColumnMoveFromSelection(event, group, frozen_list, display_list, hidden_list, selectionVariantType, currentColumn);

    expect(event).toEqual({ added: { element: { name: 'chr', isFrozen: true, isShow: false } } });
    expect(frozen_list).toEqual([]);
    expect(display_list).toEqual([]);
    expect(hidden_list).toEqual([]);
    expect(currentColumn).toEqual({ small: [], all: [] });
  });

});


describe('styleForAF', () => {
  it('should return the expected style object when afValue is less than or equal to 0.001', () => {

    const afValue = 0.001;
    const result = styleForAF(afValue);

    expect(result).toEqual({ color: '#FF5050', 'font-weight': 'bold' });
  });

  it('should return the expected style object when afValue is greater than 0.001', () => {

    const afValue = 0.002;
    const result = styleForAF(afValue);

    expect(result).toEqual(Dark.isActive ? { color: 'white' } : { color: 'black' });
  });

  it('should return the expected style object when afValue is falsy', () => {

    const afValue = null;
    const result = styleForAF(afValue);

    expect(result).toEqual(Dark.isActive ? { color: 'white' } : { color: 'black' });
  });

  it('should return the expected style object when afValue is falsy and dark mode is true', () => {

    const afValue = 0.002;
    const darkMode = true
    const result = styleForAF(afValue, darkMode);

    expect(result).toEqual( { color: 'white' } );
  });
});



describe('styleForSpliceAI', () => {
  it('should return the expected style object when spliceAI is greater than or equal to 0.2', () => {

    const spliceAI = 0.2;
    const result = styleForSpliceAI(spliceAI);

    expect(result).toEqual({ color: 'red', 'font-weight': 'bold' });
  });

  it('should return the expected style object when spliceAI is less than 0.2', () => {

    const spliceAI = 0.1;
    const result = styleForSpliceAI(spliceAI);

    expect(result).toEqual({ color: 'black' });
  });

  it('should return the expected style object when spliceAI is falsy', () => {

    const spliceAI = null;
    const result = styleForSpliceAI(spliceAI);

    expect(result).toEqual({ color: 'black' });
  });
});



describe('onColumnSortFromVariantTable', () => {
  it('should add the column with sort "asc" if sortingColumns is empty', () => {
    const columnName = 'column1';
    const sortingColumns = [];

    onColumnSortFromVariantTable(columnName, sortingColumns);

    expect(sortingColumns).toEqual([
      {
        column: 'column1',
        sort: 'asc'
      }
    ]);
  });

  it('should toggle the sort direction if the column already exists in sortingColumns', () => {
    const columnName = 'column2';
    const sortingColumns = [
      {
        column: 'column1',
        sort: 'asc'
      },
      {
        column: 'column2',
        sort: 'desc'
      }
    ];

    onColumnSortFromVariantTable(columnName, sortingColumns);

    expect(sortingColumns).toEqual([
      {
        column: 'column1',
        sort: 'asc'
      },
      {
        column: 'column2',
        sort: 'asc'
      }
    ]);
  });

  it('should add the column with sort "asc" if the column does not exist in sortingColumns', () => {
    const columnName = 'column3';
    const sortingColumns = [
      {
        column: 'column1',
        sort: 'asc'
      }
    ];

    onColumnSortFromVariantTable(columnName, sortingColumns);

    expect(sortingColumns).toEqual([
      {
        column: 'column1',
        sort: 'asc'
      },
      {
        column: 'column3',
        sort: 'asc'
      }
    ]);
  });


  it('should add the column with sort "desc" if the column does not exist in sortingColumns', () => {
    const columnName = 'column4';
    const sortingColumns = [
      {
        column: 'column4',
        sort: 'asc'
      }
    ];

    onColumnSortFromVariantTable(columnName, sortingColumns);

    expect(sortingColumns).toEqual([
      {
        column: 'column4',
        sort: 'desc'
      }
    ]);
  });
});