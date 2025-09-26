import { ExceptionCode } from '.';

export class CustomException extends Error {
  errorCode: number;
  errorLevel: string;
  errorType: string;
  status: number;
  additionalInformation: any;

  constructor(
    exceptionCode: ExceptionCode,
    additionalInformation: any = undefined,
    customErrorMessage: string = undefined,
  ) {
    super(customErrorMessage ? customErrorMessage : exceptionCode.errorMessage);
    this.name = exceptionCode.errorName;
    this.errorCode = exceptionCode.errorCode;
    this.errorLevel = exceptionCode.errorLevel;
    this.errorType = exceptionCode.errorType;
    this.status = exceptionCode.errorStatus;
    this.additionalInformation = additionalInformation;
  }
}
