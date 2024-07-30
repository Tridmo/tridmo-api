import { LocalizedString } from 'typesafe-i18n';

export default class ErrorResponse extends Error {
  public status: number;
  public message: string;
  public reason: string;

  constructor(status: number, message: string, reason?: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.reason = reason;
  }
}
