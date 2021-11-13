import { WebhookClient } from "discord.js";
import { Config } from "../Config/Config";

export class WebhookProvider {
	private static _serverKeeper: WebhookClient;

	public static initializeWebHook(): void {
		this._serverKeeper = new WebhookClient({ url: Config.webhookServerKeeper });
	}

	public static getServerKeeper(): WebhookClient {
		return this._serverKeeper;
	}
}