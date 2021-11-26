import { WebhookClient } from "discord.js";
import { Config } from "../Config/Config";

export class WebhookProvider {
	private static _serverKeeperOne: WebhookClient;
	private static _serverKeeperTwo: WebhookClient;

	public static initializeWebHook(): void {
		this._serverKeeperOne = new WebhookClient({ url: Config.webhookServerKeeper1 });
		this._serverKeeperTwo = new WebhookClient({ url: Config.webhookServerKeeper2 });
	}

	public static getServerKeeperOne(): WebhookClient {
		return this._serverKeeperOne;
	}

	public static getServerKeeperTwo(): WebhookClient {
		return this._serverKeeperTwo;
	}
}