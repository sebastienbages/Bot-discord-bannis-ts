import {
	CategoryChannel, CommandInteraction, GuildMember,
	HexColorString,
	Message, MessageActionRow, MessageAttachment, MessageButton,
	MessageEmbed,
	Permissions,
	Role,
	TextChannel,
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

export class TicketService {
	private _ticketConfigRepository: TicketConfigRepository;
	private _roleRepository: RoleRepository;
	private _ticketRepository: TicketRepository;
	private _ticketConfig: TicketConfigModel;
	private _ticketRoles: Array<RoleModel>;
	private _logService: LogService;
	public static readonly createTicket: string = "createTicket";
	public static readonly closeTicket: string = "closeTicket";
	public static readonly reOpenTicket: string = "reOpenTicket";
	public static readonly deleteTicket: string = "deleteTicket";
	public static readonly labelCloseTicket: string = "Fermer";
	public static readonly labelCreateTicket: string = "Créer ticket";
	public static readonly labelReOpenTicket: string = "Ré-ouvrir";
	public static readonly labelDeleteTicket: string = "Supprimer";
	public static readonly emojiCreateTicket: string = "🎫";
	public static readonly emojiCloseTicket: string = "🔒";
	public static readonly emojiReOpenTicket: string = "🔓";
	public static readonly emojiDeleteTicket: string = "🧹";

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
		if (Config.nodeEnv != Config.nodeEnvValues.production) {
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
	 * @param guildMember {User} - Utilisateur discord
	 * @param number {number} - Numéro du ticket
	 */
	private async saveTicket(guildMember: GuildMember, number: number): Promise<void> {
		await this._ticketRepository.saveTicket(guildMember.id, number);
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
	 * @param userId {string} - Utilisateur discord
	 */
	public async getTicketByUserId(userId: string): Promise<TicketModel> {
		const result: unknown = await this._ticketRepository.getTicketByUserId(userId);
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
	 * @param message {Message} - MessageReaction discord
	 * @param guildMember {User} - Utilisateur discord concerné
	 */
	public async createTicket(message: Message, guildMember: GuildMember): Promise<void> {
		const category = message.guild.channels.cache.get(this._ticketConfig.CategoryId) as CategoryChannel;
		const everyoneRole: Role = message.guild.roles.cache.find(r => r.name === "@everyone");

		if (!category || !everyoneRole) {
			await message.channel.send("La création de ticket est indisponible, veuillez contacter un admin");
			return;
		}

		const channelName: string = this.getChannelName(this._ticketConfig.LastNumber);
		const ticketChannel: TextChannel = await message.guild.channels.create(channelName, {
			type: "GUILD_TEXT",
			parent: category,
			permissionOverwrites: [
				{
					id: guildMember.id,
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

		const rolesMentions: string[] = [];

		for (const role of this._ticketRoles) {
			const ticketRole: Role = message.guild.roles.cache.get(role.discordId);
			if (ticketRole) {
				rolesMentions.push(`<@&${ticketRole.id}>`);
				await ticketChannel.permissionOverwrites.create(ticketRole, {
					ADD_REACTIONS: false,
					VIEW_CHANNEL: true,
				});
			}
		}

		rolesMentions.push(`<@${guildMember.id}>`);
		await ticketChannel.send(rolesMentions.join(" "));

		const newTicketNumber: number = this._ticketConfig.LastNumber + 1;

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			await this.saveTicketConfigNumber(newTicketNumber.toString());
		}

		this._ticketConfig.LastNumber++;

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(TicketService.closeTicket)
					.setLabel(TicketService.labelCloseTicket)
					.setStyle("DANGER")
					.setEmoji(TicketService.emojiCloseTicket)
			);

		const messageWelcomeTicket: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bienvenue sur ton ticket <@${guildMember.id}> \n 
							Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
							Une fois résolu, tu peux fermer le ticket avec le bouton ci-dessous`);

		await ticketChannel.send({ embeds: [ messageWelcomeTicket ], components: [ row ] });
		await this.saveTicket(guildMember, newTicketNumber);
	}

	/**
	 * Fermeture d'un ticket
	 * @param guildMember {User} - Utilisateur discord concerné
	 * @param message {Message} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 */
	public async closeTicket(guildMember: GuildMember, message: Message, targetChannel: TextChannel, userTicket: TicketModel): Promise<void> {
		await targetChannel.permissionOverwrites.edit(userTicket.userId, {
			VIEW_CHANNEL: false,
		});

		const closeMessage: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Ticket fermé par <@${guildMember.id}>`);

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(TicketService.reOpenTicket)
					.setLabel(TicketService.labelReOpenTicket)
					.setStyle("SUCCESS")
					.setEmoji(TicketService.emojiReOpenTicket),
				new MessageButton()
					.setCustomId(TicketService.deleteTicket)
					.setLabel(TicketService.labelDeleteTicket)
					.setStyle("DANGER")
					.setEmoji(TicketService.emojiDeleteTicket)
			);

		await message.channel.send({ embeds: [ closeMessage ], components: [ row ] });

		if (!this._delayIsActive) {
			this.addRequest();
			const newName: string = targetChannel.name.replace("ticket", "fermé");
			await targetChannel.setName(newName);
		}
		else {
			await this.sendCooldownMessage(targetChannel);
		}

		await this._ticketRepository.closeTicket(guildMember.id);
		this._logService.log(`Fermeture d'un ticket : N°${userTicket.number} par le membre ${guildMember.displayName} (${guildMember.id})`);
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
	 * @param message {Message} - MessageReaction discord
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
	 * @param userTicket {TicketModel} - Ticket de l'utilisateur
	 */
	public async reOpenTicket(message: Message, targetChannel: TextChannel, userTicket: TicketModel): Promise<void> {
		await message.delete();
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

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(TicketService.closeTicket)
					.setLabel(TicketService.labelCloseTicket)
					.setStyle("DANGER")
					.setEmoji(TicketService.emojiCloseTicket)
			);

		await message.channel.send({ content: `Hey <@${userTicket.userId}>, ton ticket a été ré-ouvert :face_with_monocle:`, components: [ row ] });
		await this.openTicket(userTicket);
		this._logService.log(`Ré-ouverture d'un ticket : N°${userTicket.number}`);
	}

	/**
	 * Supprimer un ticket
	 * @param targetChannel {TextChannel} - Salon textuel discord concerné
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
	 * @param commandInteraction
	 */
	public async sendTicketMessage(commandInteraction: CommandInteraction): Promise<void> {
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;
		const logo = new MessageAttachment("./Images/logo-bannis.png");

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail("attachment://logo-bannis.png")
			.setTitle("BESOIN D'AIDE ?")
			.setDescription("Rien de plus simple, utilise le bouton ci-dessous pour créer ton ticket. \n \n Un salon sera créé rien que pour toi afin de discuter avec l'équipe des Bannis :wink: \n")
			.setFooter("Un seul ticket autorisé par utilisateur");

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(TicketService.createTicket)
					.setLabel(TicketService.labelCreateTicket)
					.setStyle("PRIMARY")
					.setEmoji(TicketService.emojiCreateTicket),
			);

		try {
			await channel.send({ embeds: [ messageEmbed ], components: [ row ], files: [ logo ] });
			return commandInteraction.reply({ content: "J'ai bien envoyé le message :ticket:", ephemeral: true, fetchReply: false });
		}
		catch (error) {
			throw Error("On dirait que le format du channel n'est pas correct :thinking:");
		}
	}
}