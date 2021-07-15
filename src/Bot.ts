import { Client } from "discord.js";
import { Events } from "./Events";

export class Bot {
	public client: Client;
	private readonly token: string;
	private events: Events;

	constructor(token: string) {
		this.client = new Client();
		this.events = new Events();
		this.token = token;
	}

	start(): void {
		this.events.ready().run(this.client);
		this.client.login(this.token).then(() => console.log("Le bot est en ligne"));
	}
}