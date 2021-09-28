import {
	CategoryChannel,
	HexColorString,
	Message,
	MessageEmbed,
	MessageReaction, Permissions,
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
import { DiscordHelper } from "../Helper/DiscordHelper";

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
	private readonly _warningColor = "FF0000" as HexColorString;

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
		if (lastNumber === 1000) {
			lastNumber = 0;
			this._logService.log("Nombre de ticket max atteint (1000), remise à zéro du nombre effectué");
		}

		const channelName: string[] = [];
		channelName.push("ticket");
		channelName.push(" ");
		const newTicketNumber: number = lastNumber + 1;
		let newTicketNumberToString: string = newTicketNumber.toString();
		newTicketNumberToString = newTicketNumberToString.padStart(4, "0");
		channelName.push(newTicketNumberToString);
		return channelName.join("");
	}

	/**
	 * Mise à jour de configuration des tickets en cache
	 */
	private async updateTicketConfig(): Promise<void> {
		if (Config.nodeEnv != "production") {
			this._ticketConfig = new TicketConfigModel();
			this._ticketConfig.ChannelId = Config.ticketChannel;
			this._ticketConfig.CategoryId = Config.categoryTicketChannel;
			this._ticketConfig.LastNumber = 100;
			this._ticketConfig.MessageId = Config.ticketMessage;
		}
		else {
			this._ticketConfig = await this.getConfig();
		}
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
		const nameArray: string[] = targetChannel.name.split("-");
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
			return;
		}

		const channelName: string = this.getChannelName(this._ticketConfig.LastNumber);
		const ticketChannel: TextChannel = await messageReaction.message.guild.channels.create(channelName, {
			type: "GUILD_TEXT",
			parent: category,
			permissionOverwrites: [
				{
					id: user.id,
					allow: [ Permissions.FLAGS.VIEW_CHANNEL ],
					deny: [ Permissions.FLAGS.ADD_REACTIONS ],
				},
				{
					id: everyoneRole.id,
					deny: [ Permissions.FLAGS.VIEW_CHANNEL ],
				},
			],
		}
		);

		for (const role of this._ticketRoles) {
			const ticketRole: Role = messageReaction.message.guild.roles.cache.find(r => r.id === role.discordId);
			if (ticketRole) {
				await ticketChannel.permissionOverwrites.set([ {
					id: ticketRole,
					deny: [ Permissions.FLAGS.ADD_REACTIONS ],
					allow: [ Permissions.FLAGS.VIEW_CHANNEL ],
				} ]);
			}
		}

		const rolesMentions: string[] = [];

		this._ticketRoles.forEach(role => {
			if (messageReaction.message.guild.roles.cache.has(role.discordId)) {
				rolesMentions.push(`<@&${role.discordId}>`);
			}
		});

		rolesMentions.push(`<@${user.id}>`);
		await ticketChannel.send(rolesMentions.join(" "));

		const newTicketNumber: number = this._ticketConfig.LastNumber + 1;

		if (Config.nodeEnv === "production") {
			await this.saveTicketConfigNumber(newTicketNumber.toString());
		}

		this._ticketConfig.LastNumber++;

		const messageWelcomeTicket: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bienvenue sur ton ticket <@${user.id}> \n 
							Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
							Une fois résolu, tu peux fermer le ticket avec le ${TicketService.closeReaction}`);

		const ticket: Message = await ticketChannel.send({ embeds: [ messageWelcomeTicket ] });
		await ticket.react(TicketService.closeReaction);
		await this.saveTicket(user, newTicketNumber);
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
		await targetChannel.permissionOverwrites.edit(userTicket.userId, {
			VIEW_CHANNEL: false,
		});

		const closeMessage: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Ticket fermé par <@${user.id}> \n
							Ré-ouvrir le ticket : ${TicketService.reOpenTicketReaction} \n
							Supprimer le ticket : ${TicketService.deleteTicketReaction}`);

		const messageBeforeClose: Message = await messageReaction.message.channel.send({ embeds: [ closeMessage ] });
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

		await targetChannel.send({ embeds: [ message ] });
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
		await targetChannel.permissionOverwrites.edit(userTicket.userId, {
			VIEW_CHANNEL: true,
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

		await targetChannel.send({ embeds: [ deleteMessage ] });
		setTimeout(async () => targetChannel.delete(), 5000);
		const nameArray: string[] = targetChannel.name.split("-");
		const number: number = parseInt(nameArray[1]);
		await this._ticketRepository.deleteTicket(number);
		this._logService.log(`Suppression d'un ticket : ${targetChannel.name}`);
	}

	/**
	 * Envoi le message pilote pour la création des tickets
	 * @param message
	 */
	public async sendTicketMessage(message: Message): Promise<void> {
		const channel = message.guild.channels.cache.find(c => c.id === this._ticketConfig.ChannelId) as TextChannel;

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail("https://www.lesbannis.fr/img/logo.png")
			.setTitle("BESOIN D'AIDE ?")
			.setDescription("Rien de plus simple, clique sur la réaction :ticket: pour créer ton ticket. \n \n Un salon sera créé rien que pour toi afin de discuter avec l'équipe des Bannis :wink: \n")
			.setFooter("Un seul ticket autorisé par utilisateur");

		if (channel) {
			const messageSend: Message = await channel.send({ embeds: [ messageEmbed ] });
			await messageSend.react(TicketService.createReaction);

			if (Config.nodeEnv === "production") {
				await this.saveTicketConfigMessageId(messageSend.id);
			}

			this._ticketConfig.MessageId = messageSend.id;
		}
		else {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Salon des tickets introuvable");
			await DiscordHelper.deleteMessage(response, 5000);
		}
	}
}