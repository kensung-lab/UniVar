export class DataUpdateLog {
  actionType: string;

  actionName: string;

  trackNumber: string;

  username: string;

  original_data?: any;

  modified_data?: any;

  database: string;

  collection: string;

  customObject?: any;

  constructor(username: string = null, trackNumber: string = null) {
    this.username = username;
    this.trackNumber = trackNumber;
  }
}
