import * as fs from "fs/promises";
import date from "date-and-time";
import { Client, User } from "discord.js";
import { Config } from "../Config/Config";
import { AppError } from "../Error/AppError";

export class LogService {

	private readonly logPath = "Logs/";
	private fileName: string;

	constructor() {
		this.fileName = "Bot-log-" + this.now() + ".txt";
	}

	public info(message: string): void {
		message = this.now() + " - " + message;
		console.log(message);

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			this.writeLog(message);
		}
	}

	public error(error: Error): void {
		const message: string = this.now() + " - ";
		console.error(message, error);

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			this.writeLog(message + error + "\n");
		}
	}

	private now(): string {
		return date.format(new Date(), "DD.MM.YYYY-HH.mm.ss");
	}

	private async writeLog(message: string): Promise<void> {
		try {
			await fs.appendFile(this.logPath + this.fileName, message + "\n");
		}
		catch (error) {
			console.error(error);
		}
	}

	public async toDeveloper(client: Client, message: string): Promise<void> {
		try {
			const dev = client.users.cache.get(Config.devId) as User
				|| await client.users.fetch(Config.devId) as User;

			await dev.send({ content: message });
		}
		catch (error) {
			this.error(error);
		}
	}

	public async handlerError(error: Error, client: Client): Promise<void> {
		if (error.name === "DiscordAPIError") {
			await this.toDeveloper(client, `**Une erreur api discord s'est produite :** \n${error.message}`);
		}
		else {
			await this.toDeveloper(client, `**Une erreur inattendue s'est produite :** \n${error.message}`);
		}

		await this.error(error);
	}

	public async handlerAppError(error: Error, client: Client): Promise<void> {
		if (error instanceof AppError) {
			await this.toDeveloper(client, `**Une erreur d'application s'est produite :**\n${error.name}\n${error.message}`);
			return this.error(error);
		}

		await this.handlerError(error, client);
	}

	public getLogFileName(): string {
		return `./${this.logPath}${this.fileName}`;
	}
}
