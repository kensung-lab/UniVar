export class ExceptionCode {
  errorName: string;
  errorCode: number;
  errorMessage: string;
  errorType: string;
  errorLevel: string;
  errorStatus: number;

  constructor(
    errorName: string,
    errorCode: number,
    errorMessage: string,
    errorType: string,
    errorLevel: string,
    errorStatus: number = 500,
  ) {
    this.errorName = errorName;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorType = errorType;
    this.errorLevel = errorLevel;
    this.errorStatus = errorStatus;
  }
}
