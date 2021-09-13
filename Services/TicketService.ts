import { CategoryChannel, Client, Guild, TextChannel, User } from "discord.js";
import { Config } from "../Config/Config";
import { TicketConfigRepository } from "../Dal/TicketConfigRepository";
import { TicketRepository } from "../Dal/TicketRepository";
import { RoleModel } from "../Models/RoleModel";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { TicketModel } from "../Models/TicketModel";
import { RoleRepository } from "../Dal/RoleRepository";
import { AutoMapper } from "./AutoMapper";
import { LogService } from "./LogService";

// noinspection JSIgnoredPromiseFromCall
export class TicketService {
	private _ticketConfigRepository: TicketConfigRepository;
	private _roleRepository: RoleRepository;
	private _ticketRepository: TicketRepository;
	private _ticketConfig: TicketConfigModel;
	private _ticketRoles: Array<RoleModel>;
	private _logService: LogService;

	public static createReaction = "🎫";
	public static closeReaction = "🔒";
	public static reOpenTicketReaction = "🔓";
	public static deleteTicketReaction = "❌";

	constructor() {
		this._ticketConfigRepository = new TicketConfigRepository();
		this._ticketRepository = new TicketRepository();
		this._roleRepository = new RoleRepository();
		this._logService = new LogService();
		this.updateTicketRoles();
		this.updateTicketConfig();
	}

	/**
	 * Retourne la configuration du système des tickets
	 * @private
	 */
	private async getConfig(): Promise<TicketConfigModel> {
		const results: unknown = await this._ticketConfigRepository.getConfigData();
		return AutoMapper.mapTicketConfigModel(results);
	}

	/**
	 * Ajoute au cache de la Guild les tickets
	 * @param client {Client} - Client discord
	 */
	public async fetchTicketsMessages(client: Client): Promise<void> {
		const ticketConfigModel: TicketConfigModel = await this.getConfig();
		const guild = await client.guilds.fetch(Config.guildId) as Guild;
		const categoryChannel = guild.channels.cache.get(ticketConfigModel.CategoryId) as CategoryChannel;

		if (categoryChannel) {
			categoryChannel.children.each(c => {
				const targetChannel = guild.channels.cache.get(c.id) as TextChannel;
				targetChannel.messages.fetch();
			});
			this._logService.log("Tickets récupérés avec succès");
		}
		else {
			this._logService.log("Echec récupération des tickets");
		}
	}

	/**
	 * Sauvegarde le message de création des tickets
	 * @param id {string} - Identifiant du message
	 */
	public async saveTicketConfigMessageId(id: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigMessageId(id);
	}

	/**
	 * Sauvegarde le numéro du ticket
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicketConfigNumber(number: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigNumber(number);
	}

	/**
	 * Retourne le nom du prochain salon textuel à créer pour un ticket
	 * @param lastNumber {number} - Dernier numéro de ticket ouvert
	 */
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

	/**
	 * Mise à jour de configuration des tickets en cache
	 */
	public async updateTicketConfig(): Promise<void> {
		this._ticketConfig = await this.getConfig();
	}

	/**
	 * Mise à jour des Roles autorisé pour l'administration des tickets en cache
	 */
	public async updateTicketRoles(): Promise<void> {
		const results = await this._roleRepository.getTicketRoles();
		this._ticketRoles = AutoMapper.mapArrayRoleModel(results);
	}

	/**
	 * Retourne la configuration du gestionnaire des tickets
	 */
	public getTicketConfig(): TicketConfigModel {
		return this._ticketConfig;
	}

	/**
	 * Retourne les roles autorisés pour l'administration des tickets
	 */
	public getTicketRoles(): Array<RoleModel> {
		return this._ticketRoles;
	}

	/**
	 * Sauvegarde un ticket
	 * @param user {User} - Utilisateur discord
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicket(user: User, number: number): Promise<void> {
		await this._ticketRepository.saveTicket(user.id, number);
	}

	/**
	 * Retourne un ticket selon son numéro
	 * @param targetChannel {TextChannel} - Salon textuel discord du ticket
	 */
	public async getTicketByNumber(targetChannel: TextChannel): Promise<TicketModel> {
		const channelName: string = targetChannel.name;
		const nameArray: string[] = channelName.split("-");
		const number: number = parseInt(nameArray[1]);
		const result: unknown = await this._ticketRepository.getTicketByNumber(number);
		return AutoMapper.mapTicketModel(result);
	}

	/**
	 * Retourne un ticket selon l'utilisateur
	 * @param user {User} - Utilisateur discord
	 */
	public async getTicketByUserId(user: User): Promise<TicketModel> {
		const result: unknown = await this._ticketRepository.getTicketByUserId(user.id);
		return AutoMapper.mapTicketModel(result);
	}

	/**
	 * Ferme le ticket
	 * @param user {User} - Utilisateur discord
	 */
	public async closeTicket(user: TicketModel): Promise<void> {
		await this._ticketRepository.closeTicket(user.userId);
	}

	/**
	 * Ouvre le ticket
	 * @param user {User} - Utilisateur discord
	 */
	public async openTicket(user: TicketModel): Promise<void> {
		await this._ticketRepository.openTicket(user.userId);
	}

	/**
	 * Supprime le ticket
	 * @param targetChannel {TextChannel} - Salon textuel discord du ticket
	 */
	public async deleteTicket(targetChannel: TextChannel): Promise<void> {
		const channelName: string = targetChannel.name;
		const nameArray: string[] = channelName.split("-");
		const number: number = parseInt(nameArray[1]);
		await this._ticketRepository.deleteTicket(number);
	}
}