import { WebhookClient } from "discord.js";
import { Config } from "../Config/Config";

export class WebhookProvider {
	private static _voteKeeper: WebhookClient;
	private static _serverKeeper: WebhookClient;

	public static initializeWebHook(): void {
		this._voteKeeper = new WebhookClient({ url: Config.webhookVoteKeeper });
		this._serverKeeper = new WebhookClient({ url: Config.webhookServerKeeper });
	}

	public static getVoteKeeper(): WebhookClient {
		return this._voteKeeper;
	}

	public static getServerKeeper(): WebhookClient {
		return this._serverKeeper;
	}
}