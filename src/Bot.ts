import { Client } from "discord.js";
import { Config } from "../Config/Config";
import { Events } from "./Events";

export class Bot {
	public client: Client;
	private token: string;
	private events: Events;

	constructor() {
		this.client = new Client();
		this.events = new Events();
		this.token = Config.token;
	}

	start(): void {
		this.events.ready().run(this.client);
		this.client.login(this.token);
	}
}