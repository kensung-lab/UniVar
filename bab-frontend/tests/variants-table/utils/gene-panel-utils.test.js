import { describe, it, expect } from 'vitest'

import {
  convertPanelFromValueToName
} from '@/utils/variants-table/filter/gene-panel-utils'


describe('convertPanelFromValueToName', () => {
  it('should convert panel values to corresponding panel names', () => {
    const panelOptions = [
      { value: 'panel1', label: 'Panel 1' },
      { value: 'panel2', label: 'Panel 2' },
      { value: 'panel3', label: 'Panel 3' },
    ];
    const panels = ['panel1', 'panel3'];

    const result = convertPanelFromValueToName(panels, panelOptions);

    expect(result).toEqual( [
      { label: 'Panel 1', value: 'panel1' },
      { label: 'Panel 3', value: 'panel3' }
    ]);
  });

  it('should return an empty array if panels array is empty', () => {
    const panelOptions = [
      { value: 'panel1', label: 'Panel 1' },
      { value: 'panel2', label: 'Panel 2' },
      { value: 'panel3', label: 'Panel 3' },
    ];
    const panels = [];

    const result = convertPanelFromValueToName(panels, panelOptions);

    expect(result).toEqual([]);
  });

  it('should return an empty array if panels array is null', () => {
    const panelOptions = [
      { value: 'panel1', label: 'Panel 1' },
      { value: 'panel2', label: 'Panel 2' },
      { value: 'panel3', label: 'Panel 3' },
    ];
    const panels = null;

    const result = convertPanelFromValueToName(panels, panelOptions);

    expect(result).toEqual([]);
  });

  it('should return an empty array if panelOptions array is empty', () => {
    const panelOptions = [];
    const panels = ['panel1', 'panel3'];

    const result = convertPanelFromValueToName(panels, panelOptions);

    expect(result).toEqual([]);
  });


  it('should return an empty array if both panels and panelOptions arrays are empty', () => {
    const panelOptions = [];
    const panels = [];

    const result = convertPanelFromValueToName(panels, panelOptions);

    expect(result).toEqual([]);
  });
});