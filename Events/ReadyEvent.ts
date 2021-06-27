import { Client } from "discord.js"
import { ServiceProvider } from "../Services/ServiceProvider";
import { TicketService } from "../Services/TicketService";

export class ReadyEvent {
    
    run(client: Client) {
        client.once("ready", async () => {

            const TicketService = ServiceProvider.getTicketService() as TicketService;
            await TicketService.fetchLastTicketMessage(client);

            console.log("Le bot est en ligne");
		    client.user.setActivity("Conan Exiles");
        });
    }
}