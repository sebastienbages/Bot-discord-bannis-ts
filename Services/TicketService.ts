import { Client, Guild, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { TicketRepository } from "../Dal/TicketRepository";
import { TicketModel } from "../Models/TicketModel";


export class TicketService {

    private _ticketRepository: TicketRepository;

    constructor() {
        this._ticketRepository = new TicketRepository();
    }

    public async fetchLastTicketMessage(client: Client): Promise<void> {
        try {

            const results = await this._ticketRepository.getAllData();
            const ticketModel = this.MapTicketModel(results);

            const guild = await client.guilds.fetch(Config.guildId) as Guild;
            const textChannel = guild.channels.cache.get(ticketModel.ChannelId) as TextChannel;

            textChannel.messages.fetch(ticketModel.MessageId);
            console.log('Message des tickets récupéré');
        } 
        catch (error) {
            throw error
        }
    }

    private MapTicketModel(data): TicketModel {

        const model = new TicketModel();

        data.map(e => {
            if (e.last_number) model.LastNumber = e.last_number;
            if (e.category_id) model.CategoryId = e.category_id;
            if (e.channel_id) model.ChannelId = e.channel_id;
            if (e.message_id) model.MessageId = e.message_id;
        });

        return model;
    }
}