import { Client, Guild } from "discord.js";
import { ServicesProvider } from "../src/ServicesProvider";
import { Config } from "../Config/Config";
import { ActivityTypes } from "discord.js/typings/enums";

export class ReadyEvent {

	run(client: Client): void {
		client.once("ready", async () => {
			client.user.setActivity("le discord 🤖", { type: ActivityTypes.WATCHING });
			const guild: Guild = await client.guilds.fetch(Config.guildId);
			setInterval(async () => ServicesProvider.getVoteService().sendMessage(guild), 4 * 60 * 60 * 1000);
		});
	}
}