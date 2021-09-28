import { Client } from "discord.js";
import { ServiceProvider } from "../src/ServiceProvider";

export class ReadyEvent {

	run(client: Client): void {
		client.once("ready", async () => {
			client.user.setActivity("le discord | !help", { type: "WATCHING" });
			setInterval(async () => ServiceProvider.getVoteService().sendMessage(), 4 * 60 * 60 * 1000);
		});
	}
}