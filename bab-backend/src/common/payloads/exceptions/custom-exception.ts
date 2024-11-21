import { ExceptionCode } from '.';

export class CustomException extends Error {
  errorCode: number;
  errorLevel: string;
  errorType: string;
  status: number;
  addtionalInformation: any;

  constructor(
    exceptionCode: ExceptionCode,
    addtionalInformation: any = undefined,
  ) {
    super(exceptionCode.errorMessage);
    this.name = exceptionCode.errorName;
    this.errorCode = exceptionCode.errorCode;
    this.errorLevel = exceptionCode.errorLevel;
    this.errorType = exceptionCode.errorType;
    this.status = exceptionCode.errorStatus;
    this.addtionalInformation = addtionalInformation;
  }
}
