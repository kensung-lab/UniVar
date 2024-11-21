export class ActionLog {
  actionType: string;

  actionName: string;

  trackNumber: string;

  username: string;

  customObject?: any;

  constructor(
    username: string = null,
    trackNumber: string = null,
    actionType: string,
    actionName: string,
    customObject: any = null,
  ) {
    this.username = username;
    this.trackNumber = trackNumber;
    this.actionType = actionType;
    this.actionName = actionName;
    this.customObject = customObject;
  }
}
