import * as fs from "fs/promises";
import date from "date-and-time";

export class LogService {

	private readonly _logPath = "Logs/";
	private _fileName: string;

	constructor() {
		this._fileName = "Bot-log-" + this.now() + ".txt";
	}

	public log(message: string): void {
		message = this.now() + " - " + message;
		console.log(message);
		this.writeLog(message);
	}

	public error(error: Error): void {
		const message: string = this.now() + " - ";
		console.error(message, error);
		this.writeLog(message + error + "\n");
	}

	private now(): string {
		return date.format(new Date(), "DD.MM.YYYY-HH.mm.ss");
	}

	private writeLog(message: string): void {
		fs.appendFile(this._logPath + this._fileName, message + "\n")
			.catch(err => this.error(err));
	}
}
