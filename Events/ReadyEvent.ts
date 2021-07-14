import { Client } from "discord.js";
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";

export class ReadyEvent {

	run(client: Client): void {
		client.once("ready", async () => {
			const ticketService: TicketService = ServiceProvider.getTicketService();
			await ticketService.fetchTicketsMessages(client);

			console.log("Le bot est en ligne");
			client.user.setActivity("le discord | !help", { type: "WATCHING" });

			setInterval(async () => ServiceProvider.getVoteService().sendMessage(), 4 * 60 * 60 * 1000);
		});
	}
}