import { Client } from "discord.js"
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";

export class ReadyEvent {
    
    constructor() { }
    
    run(client: Client) {
        client.once("ready", async () => {

            const TicketService = ServiceProvider.getTicketService() as TicketService;
            await TicketService.fetchTicketsMessages(client);

            console.log("Le bot est en ligne");
		    client.user.setActivity("le discord | !help", { type: "WATCHING" });

            setInterval(async () => ServiceProvider.getVoteService().sendMessage(), 4 * 60 * 60 * 1000);
        });
    }
}