import { Client, Guild } from "discord.js";
import { ServiceProvider } from "../src/ServiceProvider";
import { Config } from "../Config/Config";

export class ReadyEvent {

	run(client: Client): void {
		client.once("ready", async () => {
			client.user.setActivity("le discord | !help", { type: "WATCHING" });
			const guild: Guild = await client.guilds.fetch(Config.guildId);
			setInterval(async () => ServiceProvider.getVoteService().sendMessage(guild), 4 * 60 * 60 * 1000);
		});
	}
}