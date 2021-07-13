import { CategoryChannel, Client, Guild, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { TicketRepository } from "../Dal/TicketRepository";
import { RoleModel } from "../Models/RoleModel";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { ServiceProvider } from "../src/ServiceProvider";

export class TicketService {

    private _ticketRepository: TicketRepository;
    private _ticketConfig: TicketConfigModel;
    private _ticketRoles: Array<RoleModel>;

    public static createReaction = "🎫";
    public static closeReaction = "🔒";
    public static reOpenTicketReaction = "🔓";
    public static deleteTicketReaction = "❌";

    constructor() {
        this._ticketRepository = new TicketRepository();
        this.updateTicketConfig();
        this.updateTicketRoles();
    }

    private async getAllData(): Promise<TicketConfigModel> {
        try {
            const results = await this._ticketRepository.getAllData();
            const ticketModel = this.mapTicketModel(results);
            return ticketModel;
        } 
        catch (error) {
            throw error;
        }
    }

    public async fetchTicketsMessages(client: Client): Promise<void> {
        try {

            const ticketModel = await this.getAllData();

            const guild = await client.guilds.fetch(Config.guildId) as Guild;
            const categoryChannel = guild.channels.cache.get(ticketModel.CategoryId) as CategoryChannel;

            categoryChannel.children.each(c => {
                const channel = guild.channels.cache.get(c.id) as TextChannel;
                channel.messages.fetch();
            })

            console.log("Messages des tickets récupérés");
        } 
        catch (error) {
            throw error
        }
    }

    public async saveTicketMessageId(id: string): Promise<void> {
        try {
            await this._ticketRepository.saveTicketMessageId(id);
        } 
        catch (error) {
            throw error;    
        }
    }

    public async saveTicketNumber(number: string): Promise<void> {
        try {
            await this._ticketRepository.saveTicketNumber(number);
        } 
        catch (error) {
            throw error;    
        }
    }

    public getChannelName(lastNumber: string): string {

		const lastNumberTicket = parseInt(lastNumber);
		const newTicketNumber = lastNumberTicket + 1;
		let channelName = new Array<string>();
		channelName.unshift(newTicketNumber.toString());

		while (channelName.length < 4) {
			channelName.unshift("0");
		}

		channelName.unshift(" ");
		channelName.unshift("ticket");
		return channelName.join("");
	}

    public async updateTicketConfig(): Promise<void> {
        try {
            this._ticketConfig = await this.getAllData();
        } 
        catch (error) {
            throw error;    
        }
    }

    public async updateTicketRoles(): Promise<void> {
        try {
            this._ticketRoles = await ServiceProvider.getRoleService().getTicketRoles();
        } 
        catch (error) {
            throw error;    
        }
    }

    public getTicketConfig(): TicketConfigModel {
        return this._ticketConfig;
    }

    public getTicketRoles(): Array<RoleModel> {
        return this._ticketRoles;
    }

    private mapTicketModel(data): TicketConfigModel {

        const model = new TicketConfigModel();

        data.map(e => {
            if (e.last_number) model.LastNumber = e.last_number;
            if (e.category_id) model.CategoryId = e.category_id;
            if (e.channel_id) model.ChannelId = e.channel_id;
            if (e.message_id) model.MessageId = e.message_id;
        });

        return model;
    }
}