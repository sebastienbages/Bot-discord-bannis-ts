import { CategoryChannel, Client, Guild, TextChannel, User } from "discord.js";
import { Config } from "../Config/Config";
import { TicketConfigRepository } from "../Dal/TicketConfigRepository";
import { TicketRepository } from "../Dal/TicketRepository";
import { RoleModel } from "../Models/RoleModel";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { TicketModel } from "../Models/TicketModel";
import { ServiceProvider } from "../src/ServiceProvider";

export class TicketService {

    private _ticketConfigRepository: TicketConfigRepository;
    private _ticketRepository: TicketRepository;
    private _ticketConfig: TicketConfigModel;
    private _ticketRoles: Array<RoleModel>;

    public static createReaction = "🎫";
    public static closeReaction = "🔒";
    public static reOpenTicketReaction = "🔓";
    public static deleteTicketReaction = "🗑";

    constructor() {
        this._ticketConfigRepository = new TicketConfigRepository();
        this._ticketRepository = new TicketRepository();
        this.updateTicketConfig();
        this.updateTicketRoles();
    }

    private async getConfig(): Promise<TicketConfigModel> {
        try {
            const results = await this._ticketConfigRepository.getConfigData();
            const ticketModel = this.mapTicketConfigModel(results);
            return ticketModel;
        } 
        catch (error) {
            throw error;
        }
    }

    public async fetchTicketsMessages(client: Client): Promise<void> {
        try {

            const ticketModel = await this.getConfig();

            const guild = await client.guilds.fetch(Config.guildId) as Guild;
            const categoryChannel = guild.channels.cache.get(ticketModel.CategoryId) as CategoryChannel;

            if (categoryChannel) {
                categoryChannel.children.each(c => {
                    const targetChannel = guild.channels.cache.get(c.id) as TextChannel;
                    targetChannel.messages.fetch();
                })
    
                console.log("Tickets récupérés avec succès");
            }
            else {
                console.log("Echec récupération des tickets");
            }

        } 
        catch (error) {
            throw error
        }
    }

    public async saveTicketConfigMessageId(id: string): Promise<void> {
        try {
            await this._ticketConfigRepository.saveTicketConfigMessageId(id);
        } 
        catch (error) {
            throw error;    
        }
    }

    public async saveTicketConfigNumber(number: string): Promise<void> {
        try {
            await this._ticketConfigRepository.saveTicketConfigNumber(number);
        } 
        catch (error) {
            throw error;    
        }
    }

    public getChannelName(lastNumber: number): string {

		const newTicketNumber = lastNumber + 1;
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
            this._ticketConfig = await this.getConfig();
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

    public async saveTicket(user: User, number: number): Promise<void> {
        try {
            await this._ticketRepository.saveTicket(user.id, number);
        } 
        catch (error) {
            throw error;    
        }
    }

    public async getTicketByNumber(targetChannel: TextChannel): Promise<TicketModel> {
        try {
            const channelName = targetChannel.name;
            const nameArray = channelName.split('-');
            const number = parseInt(nameArray[1]);
            const result = await this._ticketRepository.getTicketByNumber(number);
            const ticketModel = this.mapTicketModel(result);
            return ticketModel;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async getTicketByUserId(user: User): Promise<TicketModel> {
        try {
            const result = await this._ticketRepository.getTicketByUserId(user.id);
            const ticketModel = this.mapTicketModel(result);
            return ticketModel;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async closeTicket(user: TicketModel): Promise<void> {
        try {
            await this._ticketRepository.closeTicket(user.userId);
        } 
        catch (error) {
            throw error;    
        }
    }

    public async openTicket(user: TicketModel): Promise<void> {
        try {
            await this._ticketRepository.openTicket(user.userId);
        } 
        catch (error) {
            throw error;    
        }
    }

    public async deleteTicket(targetChannel: TextChannel): Promise<void> {
        try {
            const channelName = targetChannel.name;
            const nameArray = channelName.split('-');
            const number = parseInt(nameArray[1]);
            await this._ticketRepository.deleteTicket(number);
        } 
        catch (error) {
            throw error;    
        }
    }

    private mapTicketConfigModel(data): TicketConfigModel {

        const model = new TicketConfigModel();

        data.map(e => {
            model.LastNumber = e.last_number;
            if (e.category_id) model.CategoryId = e.category_id;
            if (e.channel_id) model.ChannelId = e.channel_id;
            if (e.message_id) model.MessageId = e.message_id;
        });

        return model;
    }

    private mapTicketModel(data): TicketModel {
        
        const model = new TicketModel();

        data.map(e => {
            if (e.userid) model.userId = e.userid;
            model.number = e.number;
            if (e.isclosed === 0) model.isClosed = false;
            if (e.isclosed === 1) model.isClosed = true;
        });

        return model;
    }
}