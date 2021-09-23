import {
	CategoryChannel, Channel,
	Client,
	Guild,
	Message,
	MessageEmbed,
	MessageReaction,
	Role,
	TextChannel,
	User,
} from "discord.js";
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

	private _delayIsActive: boolean;
	private readonly _cooldown: number = 10 * 60 * 1000;
	private readonly _datesCooldown: number[];
	private _requests: number;
	private readonly _warningColor: string = "#FF0000";

	constructor() {
		this._ticketConfigRepository = new TicketConfigRepository();
		this._ticketRepository = new TicketRepository();
		this._roleRepository = new RoleRepository();
		this._logService = new LogService();
		this._delayIsActive = false;
		this._requests = 0;
		this._datesCooldown = new Array<number>();
		(async () => {
			await this.updateTicketRoles();
			await this.updateTicketConfig();
		})();
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
	private async saveTicketConfigMessageId(id: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigMessageId(id);
	}

	/**
	 * Sauvegarde le numéro du ticket
	 * @param number {number} - Numéro du ticket
	 */
	private async saveTicketConfigNumber(number: string): Promise<void> {
		await this._ticketConfigRepository.saveTicketConfigNumber(number);
	}

	/**
	 * Retourne le nom du prochain salon textuel à créer pour un ticket
	 * @param lastNumber {number} - Dernier numéro de ticket ouvert
	 */
	private getChannelName(lastNumber: number): string {
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
	private async updateTicketConfig(): Promise<void> {
		this._ticketConfig = await this.getConfig();
	}

	/**
	 * Mise à jour des Roles autorisé pour l'administration des tickets en cache
	 */
	private async updateTicketRoles(): Promise<void> {
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
	private getTicketRoles(): Array<RoleModel> {
		return this._ticketRoles;
	}

	/**
	 * Sauvegarde un ticket
	 * @param user {User} - Utilisateur discord
	 * @param number {number} - Numéro du ticket
	 */
	private async saveTicket(user: User, number: number): Promise<void> {
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
	 * Ouvre le ticket
	 * @param user {User} - Utilisateur discord
	 */
	private async openTicket(user: TicketModel): Promise<void> {
		await this._ticketRepository.openTicket(user.userId);
	}

	/**
	 * Création d'un nouveau ticket
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param user {User} - Utilisateur discord concerné
	 * @private
	 */
	public async createTicket(messageReaction: MessageReaction, user: User): Promise<void> {
		const category = messageReaction.message.guild.channels.cache.find(c => c.id === this._ticketConfig.CategoryId) as CategoryChannel;
		const everyoneRole: Role = messageReaction.message.guild.roles.cache.find(r => r.name === "@everyone");

		if (!category || !everyoneRole) {
			await messageReaction.message.channel.send("La création de ticket est indisponible, veuillez contacter un admin");
			return undefined;
		}

		const ticketRoles: RoleModel[] = this.getTicketRoles();
		const channelName: string = this.getChannelName(this._ticketConfig.LastNumber);

		const ticketChannel = await messageReaction.message.guild.channels.create(channelName, {
			type: "text",
			parent: category,
			permissionOverwrites: [
				{
					id: user.id,
					allow: [ "VIEW_CHANNEL", "SEND_MESSAGES" ],
					deny: [ "ADD_REACTIONS" ],
				},
				{
					id: everyoneRole.id,
					deny: ["VIEW_CHANNEL"],
				},
				{
					id: messageReaction.client.user.id,
					allow: [ "VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_MESSAGES", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "ADD_REACTIONS" ],
				},
			],
		}
		);

		for (const role of ticketRoles) {
			const ticketRole: Role = messageReaction.message.guild.roles.cache.find(r => r.id === role.discordId);
			if (ticketRole) {
				await ticketChannel.createOverwrite(ticketRole,
					{
						VIEW_CHANNEL: true,
						ADD_REACTIONS: false,
						SEND_MESSAGES: true,
						EMBED_LINKS: true,
						READ_MESSAGE_HISTORY: true,
						ATTACH_FILES: true,
					}
				);
			}
		}

		const rolesMentions: string[] = new Array<string>();

		ticketRoles.map(role => {
			if (messageReaction.message.guild.roles.cache.has(role.discordId)) {
				rolesMentions.push(`<@&${role.discordId}>`);
			}
		});

		rolesMentions.push(`<@${user.id}>`);
		await ticketChannel.send(rolesMentions.join(" "));

		const newTicketNumber: number = this._ticketConfig.LastNumber + 1;
		await this.saveTicketConfigNumber(newTicketNumber.toString());
		await this.updateTicketConfig();

		const messageWelcomeTicket: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bienvenue sur ton ticket <@${user.id}> \n 
							Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
							Une fois résolu, tu peux fermer le ticket avec le ${TicketService.closeReaction}`);

		const ticket: Message = await ticketChannel.send(messageWelcomeTicket);
		await ticket.react(TicketService.closeReaction);
		await this.saveTicket(user, newTicketNumber);
		return undefined;
	}

	/**
	 * Fermeture d'un ticket
	 * @param user {User} - Utilisateur discord concerné
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 * @private
	 */
	public async closeTicket(user: User, messageReaction: MessageReaction, targetChannel: TextChannel, userTicket: TicketModel): Promise<void> {
		await targetChannel.updateOverwrite(userTicket.userId, {
			VIEW_CHANNEL: false,
			SEND_MESSAGES: false,
		});

		const closeMessage: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Ticket fermé par <@${user.id}> \n
							Ré-ouvrir le ticket : ${TicketService.reOpenTicketReaction} \n
							Supprimer le ticket : ${TicketService.deleteTicketReaction}`);

		const messageBeforeClose: Message = await messageReaction.message.channel.send(closeMessage);
		await messageBeforeClose.react(TicketService.reOpenTicketReaction);
		await messageBeforeClose.react(TicketService.deleteTicketReaction);

		if (!this._delayIsActive) {
			this.addRequest();
			const newName: string = targetChannel.name.replace("ticket", "fermé");
			await targetChannel.setName(newName);
		}
		else {
			await this.sendCooldownMessage(targetChannel);
		}

		await this._ticketRepository.closeTicket(user.id);
		this._logService.log(`Fermeture d'un ticket : N°${userTicket.number} par le membre ${user.username} (${user.id})`);
		return undefined;
	}

	/**
	 * Ajoute un requête ticket au compteur, initialise et démarre son minuteur de recharge
	 * @private
	 */
	private addRequest(): void {
		if (this._requests < 2) {
			this._datesCooldown.push(Date.now());
			setTimeout(() => this.substractRequest(), this._cooldown);
			this._requests++;
			if (this._requests === 2) this.startDelay();
		}
	}

	/**
	 * Bloquage des requêtes des tickets
	 * @private
	 */
	private startDelay(): void {
		this._delayIsActive = true;
	}

	/**
	 * Supprime une requête et son minuteur de recharge
	 * @private
	 */
	private substractRequest(): void {
		this._requests--;
		this._datesCooldown.shift();
		if (this._requests < 2) this._delayIsActive = false;
	}

	/**
	 * Envoi le message d'information de bloquage des requêtes de tickets
	 * @param targetChannel
	 * @private
	 */
	private async sendCooldownMessage(targetChannel: TextChannel): Promise<void> {
		const timeLeft: any = this.getTimeLeft();
		const message: MessageEmbed = new MessageEmbed()
			.setDescription(":exclamation: Le ticket ne peut pas changer de nom trop souvent")
			.setFooter(`Cela sera à nouveau possible dans ${timeLeft.minutes} minute(s) et ${timeLeft.seconds} seconde(s)`)
			.setColor(this._warningColor);

		await targetChannel.send(message);
	}

	/**
	 * Retourne le temps restant de la requête la plus ancienne
	 * @private
	 */
	private getTimeLeft(): any {
		const now: number = Date.now();
		const cooldown: number = this._datesCooldown[0];
		const minutes: number = ((now - cooldown) / 60) / 1000;
		const seconds: number = (now - cooldown) / 1000;
		return { minutes: minutes.toFixed(0), seconds: seconds.toFixed(0) };
	}

	/**
	 * Ré-ouverture d'un ticket
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 * @private
	 */
	public async reOpenTicket(messageReaction: MessageReaction, targetChannel: TextChannel, userTicket: TicketModel): Promise<void> {
		await messageReaction.message.delete();
		await targetChannel.updateOverwrite(userTicket.userId, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
		});

		if (!this._delayIsActive) {
			this.addRequest();
			const newName: string = targetChannel.name.replace("fermé", "ticket");
			await targetChannel.setName(newName);
		}
		else {
			await this.sendCooldownMessage(targetChannel);
		}

		await messageReaction.message.channel.send(`Hey <@${userTicket.userId}>, ton ticket a été ré-ouvert :face_with_monocle:`);
		await this.openTicket(userTicket);
		this._logService.log(`Ré-ouverture d'un ticket : N°${userTicket.number}`);
		return undefined;
	}

	/**
	 * Supprimer un ticket
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @private
	 */
	public async deleteTicket(targetChannel: TextChannel): Promise<void> {
		const deleteMessage: MessageEmbed = new MessageEmbed()
			.setColor(this._warningColor)
			.setDescription("Suppression du ticket dans quelques secondes");

		await targetChannel.send(deleteMessage);
		const deleteChannel = async (): Promise<Channel> => await targetChannel.delete();
		setTimeout(async () => deleteChannel(), 5000);

		const channelName: string = targetChannel.name;
		const nameArray: string[] = channelName.split("-");
		const number: number = parseInt(nameArray[1]);
		await this._ticketRepository.deleteTicket(number);

		this._logService.log(`Suppression d'un ticket : ${targetChannel.name}`);
		return undefined;
	}

	/**
	 * Envoi le message pilote pour la création des tickets
	 * @param message
	 */
	public async sendTicketMessage(message: Message): Promise<void> {
		const channel = message.guild.channels.cache.find(c => c.id === this._ticketConfig.ChannelId) as TextChannel;

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.attachFiles(["Images/logo-les-bannis-discord.png"])
			.setThumbnail("attachment://logo-les-bannis-discord.png")
			.setTitle("BESOIN D'AIDE ?")
			.setDescription("Rien de plus simple, clique sur la réaction :ticket: pour créer ton ticket. \n \n Un salon sera créé rien que pour toi afin de discuter avec l'équipe des Bannis :wink: \n")
			.setFooter("Un seul ticket autorisé par utilisateur");

		if (channel) {
			const messageSend: Message = await channel.send(messageEmbed);
			await messageSend.react(TicketService.createReaction);
			await this.saveTicketConfigMessageId(messageSend.id);
			await this.updateTicketConfig();
		}
		else {
			const response: Message = await message.reply("Salon des tickets introuvable");
			await response.delete({ timeout: 5000 });
		}
	}
}