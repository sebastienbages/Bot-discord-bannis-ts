import { CategoryChannel, Client, Guild, TextChannel, User } from "discord.js";
import { Config } from "../Config/Config";
import { TicketConfigRepository } from "../Dal/TicketConfigRepository";
import { TicketRepository } from "../Dal/TicketRepository";
import { RoleModel } from "../Models/RoleModel";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { TicketModel } from "../Models/TicketModel";
import { RoleRepository } from "../Dal/RoleRepository";
import { AutoMapper } from "./AutoMapper";

export class TicketService {
	private _ticketConfigRepository: TicketConfigRepository;
	private _roleRepository: RoleRepository;
	private _ticketRepository: TicketRepository;
	private _ticketConfig: TicketConfigModel;
	private _ticketRoles: Array<RoleModel>;

	public static createReaction = "🎫";
	public static closeReaction = "🔒";
	public static reOpenTicketReaction = "🔓";
	public static deleteTicketReaction = "❌";

	constructor() {
		this._ticketConfigRepository = new TicketConfigRepository();
		this._ticketRepository = new TicketRepository();
		this._roleRepository = new RoleRepository();
		this.updateTicketRoles();
		this.updateTicketConfig();
	}

	private async getConfig(): Promise<TicketConfigModel> {
		const results: unknown = await this._ticketConfigRepository.getConfigData();
		return AutoMapper.mapTicketConfigModel(results);
	}

	public async fetchTicketsMessages(client: Client): Promise<void> {
		const ticketConfigModel: TicketConfigModel = await this.getConfig();
		const guild = await client.guilds.fetch(Config.guildId) as Guild;
		const categoryChannel = guild.channels.cache.get(ticketConfigModel.CategoryId) as CategoryChannel;

		if (categoryChannel) {
			categoryChannel.children.each(c => {
				const targetChannel = guild.channels.cache.get(c.id) as TextChannel;
				targetChannel.messages.fetch();
			});
			console.log("Tickets récupérés avec succès");
		}
		else {
			console.log("Echec récupération des tickets");
		}
	}

	public async saveTicketConfigMessageId(id: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigMessageId(id);
	}

	public async saveTicketConfigNumber(number: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigNumber(number);
	}

	public getChannelName(lastNumber: number): string {
		const newTicketNumber: number = lastNumber + 1;
		const channelName: string[] = new Array<string>();
		channelName.unshift(newTicketNumber.toString());

		while (channelName.length < 4) {
			channelName.unshift("0");
		}

		channelName.unshift(" ");
		channelName.unshift("ticket");
		return channelName.join("");
	}

	public async updateTicketConfig(): Promise<void> {
		this._ticketConfig = await this.getConfig();
	}

	public async updateTicketRoles(): Promise<void> {
		const results = await this._roleRepository.getTicketRoles();
		this._ticketRoles = AutoMapper.mapArrayRoleModel(results);
	}

	public getTicketConfig(): TicketConfigModel {
		return this._ticketConfig;
	}

	public getTicketRoles(): Array<RoleModel> {
		return this._ticketRoles;
	}

	public async saveTicket(user: User, number: number): Promise<void> {
		await this._ticketRepository.saveTicket(user.id, number);
	}

	public async getTicketByNumber(targetChannel: TextChannel): Promise<TicketModel> {
		const channelName: string = targetChannel.name;
		const nameArray: string[] = channelName.split("-");
		const number: number = parseInt(nameArray[1]);
		const result: unknown = await this._ticketRepository.getTicketByNumber(number);
		return AutoMapper.mapTicketModel(result);
	}

	public async getTicketByUserId(user: User): Promise<TicketModel> {
		const result: unknown = await this._ticketRepository.getTicketByUserId(user.id);
		return AutoMapper.mapTicketModel(result);
	}

	public async closeTicket(user: TicketModel): Promise<void> {
		await this._ticketRepository.closeTicket(user.userId);
	}

	public async openTicket(user: TicketModel): Promise<void> {
		await this._ticketRepository.openTicket(user.userId);
	}

	public async deleteTicket(targetChannel: TextChannel): Promise<void> {
		const channelName: string = targetChannel.name;
		const nameArray: string[] = channelName.split("-");
		const number: number = parseInt(nameArray[1]);
		await this._ticketRepository.deleteTicket(number);
	}
}