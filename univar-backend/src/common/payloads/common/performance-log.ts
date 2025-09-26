export class PerformanceLog {
  start: Date;

  end: Date;

  actionType: string;

  actionName: string;

  trackNumber: string;

  username: string;

  filters: any;

  sort: any;

  project: any;

  skip: number;

  limit: number;

  database: string;

  collection: string;

  constructor(
    username: string = null,
    trackNumber: string = null,
    is_start = true,
  ) {
    this.username = username;
    this.trackNumber = trackNumber;
    if (is_start) {
      this.start = new Date();
    }
  }

  startLog() {
    this.start = new Date();
  }

  endLog() {
    this.end = new Date();
  }
}
