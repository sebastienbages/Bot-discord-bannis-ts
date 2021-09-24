import { Client } from "discord.js";
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";
import { RuleService } from "../Services/RuleService";

export class ReadyEvent {

	run(client: Client): void {
		client.once("ready", async () => {
			const ticketService: TicketService = ServiceProvider.getTicketService();
			await ticketService.fetchTicketsMessages(client);
			const ruleService: RuleService = ServiceProvider.getRuleService();
			await ruleService.fetchServerChoiceMessage(client);
			await client.user.setActivity("le discord | !help", { type: "WATCHING" });
			setInterval(async () => ServiceProvider.getVoteService().sendMessage(), 4 * 60 * 60 * 1000);
		});
	}
}