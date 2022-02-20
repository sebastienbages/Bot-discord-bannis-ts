import { Client, Guild } from "discord.js";
import { ServicesProvider } from "../ServicesProvider";
import { Config } from "../Config/Config";
import { ActivityTypes } from "discord.js/typings/enums";
import { LogService } from "../Services/LogService";
import { VoteService } from "../Services/VoteService";

export class ReadyEvent {
	private logService: LogService;
	private voteService: VoteService;

	constructor() {
		this.logService = ServicesProvider.getLogService();
		this.voteService = ServicesProvider.getVoteService();
	}

	public async run(client: Client): Promise<void> {
		try {
			client.user.setActivity("le discord 🤖", { type: ActivityTypes.WATCHING });

			const guild: Guild = client.guilds.cache.get(Config.guildId) as Guild
				|| await client.guilds.fetch(Config.guildId) as Guild;

			const delayMessageVote = 4 * 60 * 60 * 1000;

			setInterval(
				async () => {
					await this.voteService.sendMessage(guild, false);
					return this.logService.info("Message automatique des votes envoye");
				}, delayMessageVote
			);
		}
		catch (error) {
			await this.logService.handlerError(error, client);
		}
	}
}
