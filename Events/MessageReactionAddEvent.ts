import {
	CategoryChannel,
	Channel,
	GuildMember,
	Message,
	MessageEmbed,
	MessageReaction,
	Role,
	TextChannel,
	User,
} from "discord.js";
import { Config } from "../Config/Config";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";
import { TicketModel } from "../Models/TicketModel";
import { RoleModel } from "../Models/RoleModel";
import { LogService } from "../Services/LogService";
import { RoleService } from "../Services/RoleService";
import { RuleService } from "../Services/RuleService";

export class MessageReactionAddEvent {
	private _delayIsActive: boolean;
	private readonly _cooldown: number = 10 * 60 * 1000;
	private readonly _datesCooldown: number[];
	private _requests: number;
	private readonly _warningColor: string = "#FF0000";
	private _logService: LogService;
	private _roleService: RoleService;

	constructor() {
		this._delayIsActive = false;
		this._requests = 0;
		this._datesCooldown = new Array<number>();
		this._logService = new LogService();
		this._roleService = ServiceProvider.getRoleService();
	}

	public async run(messageReaction: MessageReaction, user: User): Promise<void> {
		if (user.bot) return undefined;

		if (RuleService.serveurReactions.includes(messageReaction.emoji.name)) {
			const guildMember: GuildMember = await messageReaction.message.guild.members.fetch(user);
			await this._roleService.assignServerRole(messageReaction, guildMember);
		}

		if (messageReaction.emoji.name != TicketService.createReaction
			&& messageReaction.emoji.name != TicketService.closeReaction
			&& messageReaction.emoji.name != TicketService.reOpenTicketReaction
			&& messageReaction.emoji.name != TicketService.deleteTicketReaction) {
			return undefined;
		}

		await messageReaction.users.remove(user);

		const ticketService: TicketService = ServiceProvider.getTicketService();
		const ticketConfig: TicketConfigModel = ticketService.getTicketConfig();
		const targetChannel = messageReaction.message.channel as TextChannel;
		let userTicket: TicketModel;

		if (targetChannel.id === ticketConfig.ChannelId) {
			userTicket = await ticketService.getTicketByUserId(user);
		}
		else {
			userTicket = await ticketService.getTicketByNumber(targetChannel);
		}

		if (messageReaction.message.id === ticketConfig.MessageId) {

			if (userTicket.userId === user.id && userTicket) {
				const response: Message = await messageReaction.message.channel.send(`<@${user.id}>, tu possèdes déjà un ticket ouvert : numéro ${userTicket.number.toString()}`);
				await response.delete({ timeout: 10 * 1000 });
				return undefined;
			}

			await this.createTicket(messageReaction, ticketConfig, ticketService, user);
			return undefined;
		}

		if (messageReaction.emoji.name === TicketService.closeReaction && targetChannel.parentID === ticketConfig.CategoryId) {

			if (userTicket.isClosed) {
				const response: Message = await messageReaction.message.channel.send(`<@${user.id}>, le ticket est déjà fermé :face_with_raised_eyebrow:`);
				await response.delete({ timeout: 10 * 1000 });
				return undefined;
			}

			await this.closeTicket(user, messageReaction, targetChannel, ticketService, userTicket);
			return undefined;
		}

		if (messageReaction.emoji.name === TicketService.reOpenTicketReaction && messageReaction.message.author.bot) {
			await this.reOpenTicket(messageReaction, targetChannel, ticketService, userTicket);
			return undefined;
		}

		if (messageReaction.emoji.name === TicketService.deleteTicketReaction && messageReaction.message.author.bot) {
			await this.deleteTicket(targetChannel, ticketService);
			return undefined;
		}
	}

	/**
	 * Création d'un nouveau ticket
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param ticketConfig {TicketConfigModel} - Configuration des tickets
	 * @param ticketService {TicketService} - Service des tickets
	 * @param user {User} - Utilisateur discord concerné
	 * @private
	 */
	private async createTicket(messageReaction: MessageReaction, ticketConfig: TicketConfigModel, ticketService: TicketService, user: User): Promise<void> {
		const category = messageReaction.message.guild.channels.cache.find(c => c.id === ticketConfig.CategoryId) as CategoryChannel;
		const everyoneRole: Role = messageReaction.message.guild.roles.cache.find(r => r.name === "@everyone");

		if (!category || !everyoneRole) {
			await messageReaction.message.channel.send("La création de ticket est indisponible, veuillez contacter un admin");
			return undefined;
		}

		const ticketRoles: RoleModel[] = ticketService.getTicketRoles();
		const channelName: string = ticketService.getChannelName(ticketConfig.LastNumber);

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

		const newTicketNumber: number = ticketConfig.LastNumber + 1;
		await ticketService.saveTicketConfigNumber(newTicketNumber.toString());
		await ticketService.updateTicketConfig();

		const messageWelcomeTicket: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bienvenue sur ton ticket <@${user.id}> \n 
							Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
							Une fois résolu, tu peux fermer le ticket avec le ${TicketService.closeReaction}`);

		const ticket: Message = await ticketChannel.send(messageWelcomeTicket);
		await ticket.react(TicketService.closeReaction);
		await ticketService.saveTicket(user, newTicketNumber);
		return undefined;
	}

	/**
	 * Fermeture d'un ticket
	 * @param user {User} - Utilisateur discord concerné
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param ticketService {TicketService} - Service des tickets
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 * @private
	 */
	private async closeTicket(user: User, messageReaction: MessageReaction, targetChannel: TextChannel, ticketService: TicketService, userTicket: TicketModel): Promise<void> {
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

		await ticketService.closeTicket(userTicket);
		this._logService.log(`Fermeture d'un ticket : N°${userTicket.number} par le membre ${user.username} (${user.id})`);
		return undefined;
	}

	/**
	 * Ré-ouverture d'un ticket
	 * @param messageReaction {MessageReaction} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param ticketService {TicketService} - Service des tickets
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 * @private
	 */
	private async reOpenTicket(messageReaction: MessageReaction, targetChannel: TextChannel, ticketService: TicketService, userTicket: TicketModel): Promise<void> {
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
		await ticketService.openTicket(userTicket);
		this._logService.log(`Ré-ouverture d'un ticket : N°${userTicket.number}`);
		return undefined;
	}

	/**
	 * Supprimer un ticket
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param ticketService {TicketService} - Service des tickets
	 * @private
	 */
	private async deleteTicket(targetChannel: TextChannel, ticketService: TicketService): Promise<void> {
		const deleteMessage: MessageEmbed = new MessageEmbed()
			.setColor(this._warningColor)
			.setDescription("Suppression du ticket dans quelques secondes");

		await targetChannel.send(deleteMessage);
		const deleteChannel = async (): Promise<Channel> => await targetChannel.delete();
		setTimeout(async () => deleteChannel(), 5000);
		await ticketService.deleteTicket(targetChannel);
		this._logService.log(`Suppression d'un ticket : ${targetChannel.name}`);
		return undefined;
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
}