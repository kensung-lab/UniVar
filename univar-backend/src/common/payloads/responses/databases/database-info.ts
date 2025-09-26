import { Databases } from 'src/applicationInfo';
import { BRAND_UNIVAR_DEFAULT_ACCESS_GROUP } from 'src/common';

export class DatabaseInfo {
  database_name: string;

  display_name: string;

  create_time: Date;

  finished_time: Date;

  // 0 - processing, 1 - completed, 2 - error
  status: number;

  is_example: boolean;

  is_error: boolean;

  constructor(databases: Databases) {
    this.create_time = databases.create_time;
    this.database_name = databases.database_name;
    this.display_name = databases.display_name;

    this.status = databases.is_ready ? 1 : 0;

    this.is_error = databases.is_error;

    this.is_example = databases.access_group.includes(
      BRAND_UNIVAR_DEFAULT_ACCESS_GROUP,
    );

    if (databases.is_ready) {
      this.finished_time = JSON.parse(
        JSON.stringify(databases.tool_complete_infos),
      ).pop().completed_time;
    }
  }
}
