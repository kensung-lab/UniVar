import { Databases } from 'src/applicationInfo';
import { BRAND_UNIVAR_DEFAULT_ACCESS_GROUP } from 'src/common';

export class DatabaseData {
  database_name: string;

  display_name: string;

  proband_id: string;

  brand: string;

  is_example: boolean;

  is_error: boolean;

  is_standalone: boolean;

  constructor(databases: Databases) {
    this.database_name = databases.database_name;

    this.display_name = databases.display_name;

    this.proband_id = databases.proband_id;

    this.brand = databases.brand;

    this.is_error = databases.is_error;

    this.is_standalone =
      databases.access_group.length === 1 &&
      databases.access_group[0].split('-').length == 2 &&
      databases.access_group[0].split('-')[0].length == 13 &&
      databases.access_group[0].split('-')[1].length == 12;

    this.is_example = databases.access_group.includes(
      BRAND_UNIVAR_DEFAULT_ACCESS_GROUP,
    );
  }
}
