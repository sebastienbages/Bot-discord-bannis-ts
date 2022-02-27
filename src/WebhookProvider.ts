import { WebhookClient } from "discord.js";
import { Config } from "./Config/Config";

export class WebhookProvider {
	private static serverKeeperOne: WebhookClient;
	private static serverKeeperTwo: WebhookClient;

	public static initializeWebHook(): void {
		this.serverKeeperOne = new WebhookClient({ url: Config.webhookServerKeeper1 });
		this.serverKeeperTwo = new WebhookClient({ url: Config.webhookServerKeeper2 });
	}

	public static getServerKeeperOne(): WebhookClient {
		return this.serverKeeperOne;
	}
}
