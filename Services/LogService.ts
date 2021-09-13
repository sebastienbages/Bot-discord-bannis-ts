import * as fs from "fs/promises";
import date from "date-and-time";

export class LogService {

	private readonly _logPath = "Logs/";
	private readonly _fileName = "Bot-log-" + this.now() + ".txt";

	public log(message: string): void {
		message = this.now() + " - " + message;
		console.log(message);
		this.writeLog(message);
	}

	public error(error: any): void {
		console.error(this.now(), error);
		this.writeLog(this.now() + error + "\n");
	}

	private now(): string {
		return date.format(new Date(), "DD.MM.YYYY-HH.mm.ss");
	}

	private writeLog(message: string): void {
		fs.appendFile(this._logPath + this._fileName, message + "\n")
			.catch(err => this.error(err));
	}
}