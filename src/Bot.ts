import { Client } from "discord.js";
import { Events } from "./Events";
import { LogService } from "../Services/LogService";

export class Bot {
	public client: Client;
	private readonly token: string;
	private events: Events;
	private _logService: LogService;

	constructor(token: string) {
		this.client = new Client();
		this.events = new Events();
		this._logService = new LogService();
		this.token = token;
	}

	start(): void {
		this.events.ready().run(this.client);
		this.client.login(this.token).then(() => this._logService.log("Le Bot est en ligne"));
	}
}