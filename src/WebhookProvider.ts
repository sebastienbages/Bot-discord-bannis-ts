import { WebhookClient } from "discord.js";

export class WebhookProvider {
	private static _voteKeeper: WebhookClient;
	private static _serverKeeper: WebhookClient;

	public static initializeWebHook(): void {
		this._voteKeeper = new WebhookClient(process.env.WH_VK_ID, process.env.WH_VK_TOKEN);
		this._serverKeeper = new WebhookClient(process.env.WH_SK_ID, process.env.WH_SK_TOKEN);
	}

	public static getVoteKeeper(): WebhookClient {
		return this._voteKeeper;
	}

	public static getServerKeeper(): WebhookClient {
		return this._serverKeeper;
	}
}