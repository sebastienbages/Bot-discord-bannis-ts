import {
	ButtonInteraction,
	CategoryChannel,
	CommandInteraction,
	Guild,
	GuildMember,
	HexColorString,
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageEmbed,
	Permissions,
	Role,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { TicketConfigRepository } from "../Dal/TicketConfigRepository";
import { TicketRepository } from "../Dal/TicketRepository";
import { RoleModel } from "../Models/RoleModel";
import { TicketConfig } from "../Models/TicketConfigModel";
import { TicketModel } from "../Models/TicketModel";
import { RoleRepository } from "../Dal/RoleRepository";
import { LogService } from "./LogService";
import { ReOpenTicketButton } from "../Interactions/Buttons/ReOpenTicketButton";
import { DeleteTicketButton } from "../Interactions/Buttons/DeleteTicketButton";
import { CloseTicketButton } from "../Interactions/Buttons/CloseTicketButton";
import { CreateTicketButton } from "../Interactions/Buttons/CreateTicketButton";
import { InteractionError } from "../Error/InteractionError";

declare type TimeLeftType = {
	minutes: string;
	seconds: string;
}

export class TicketService {
	private ticketConfigRepository: TicketConfigRepository;
	private roleRepository: RoleRepository;
	private ticketRepository: TicketRepository;
	private ticketConfigModel: TicketConfig;
	private roleModels: RoleModel[];
	private logService: LogService;

	private delayIsActive: boolean;
	private cooldown: number = 10 * 60 * 1000;
	private datesCooldown: number[];
	private requests: number;
	private warningColor = "FF0000" as HexColorString;

	constructor() {
		this.ticketConfigRepository = new TicketConfigRepository();
		this.ticketRepository = new TicketRepository();
		this.roleRepository = new RoleRepository();
		this.logService = new LogService();
		this.delayIsActive = false;
		this.requests = 0;
		this.datesCooldown = [];
		this.roleModels = [];
		(async () => {
			await this.updateTicketRoles();
			await this.updateTicketConfig();
		})();
	}

	/**
	 * Retourne la configuration du système des tickets
	 * @private
	 */
	private async getConfig(): Promise<TicketConfig> {
		return await this.ticketConfigRepository.getConfigData();
	}

	/**
	 * Sauvegarde le numéro du ticket
	 * @param number {number} - Numéro du ticket
	 */
	private async saveTicketConfigNumber(number: string): Promise<void> {
		await this.ticketConfigRepository.saveTicketConfigNumber(number);
	}

	/**
	 * Retourne le nom du prochain salon textuel à créer pour un ticket
	 * @param lastNumber {number} - Dernier numéro de ticket ouvert
	 */
	private getChannelName(lastNumber: number): string {
		if (lastNumber === 1000) {
			lastNumber = 0;
			this.logService.info("Nombre de ticket max atteint (1000), remise à zéro du nombre effectué");
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
			this.ticketConfigModel = {
				channel_id: Config.ticketChannelId,
				category_id: Config.categoryTicketChannelId,
				last_number: 100,
				message_id: Config.ticketMessageId,
			};
		}
		else {
			this.ticketConfigModel = await this.getConfig();
		}
	}

	/**
	 * Mise à jour des Roles autorisé pour l'administration des tickets en cache
	 */
	private async updateTicketRoles(): Promise<void> {
		this.roleModels = await this.roleRepository.getTicketRoles();
	}

	/**
	 * Sauvegarde un ticket
	 * @param guildMember {User} - Utilisateur discord
	 * @param number {number} - Numéro du ticket
	 */
	private async saveTicket(guildMember: GuildMember, number: number): Promise<void> {
		await this.ticketRepository.saveTicket(guildMember.id, number);
	}

	/**
	 * Retourne un ticket selon son numéro
	 * @param targetChannel {TextChannel} - Salon textuel discord du ticket
	 */
	private async getTicketByNumber(targetChannel: TextChannel): Promise<TicketModel> {
		const nameArray: string[] = targetChannel.name.split("-");
		const number: number = parseInt(nameArray[1]);
		return await this.ticketRepository.getTicketByNumber(number);
	}

	/**
	 * Retourne un ticket selon l'utilisateur
	 * @param userId {string} - Utilisateur discord
	 */
	public async getTicketByUserId(userId: string): Promise<TicketModel> {
		return await this.ticketRepository.getTicketByUserId(userId);
	}

	/**
	 * Ouvre le ticket
	 * @param user {User} - Utilisateur discord
	 */
	private async openTicket(user: TicketModel): Promise<void> {
		await this.ticketRepository.openTicket(user.userid);
	}

	/**
	 * Création d'un nouveau ticket
	 * @param buttonInteraction
	 */
	public async createTicket(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ ephemeral: true, fetchReply: false });

		const guildMember = buttonInteraction.member as GuildMember;
		const userTicket = await this.getTicketByUserId(guildMember.id);

		if (!guildMember.roles.cache.has(Config.roleStartId)) {
			const actionRow = new MessageActionRow().addComponents(
				new MessageButton()
					.setStyle("LINK")
					.setLabel("Valider le règlement")
					.setURL(`https://discord.com/channels/${Config.guildId}/${Config.rulesChannelId}/`)
			);
			const roleStart = buttonInteraction.guild.roles.cache.get(Config.roleStartId);
			await buttonInteraction.editReply({
				content: `Tu ne possède pas le rôle ${roleStart.toString()} :scream: \nUtilise ce bouton pour consulter le règlement et le valider :wink:`,
				components: [ actionRow ],
			});
			return;
		}

		if (userTicket.userid) {
			throw new InteractionError(
				`<@${guildMember.id}>, tu possèdes déjà un ticket ouvert : numéro ${userTicket.number.toString()}`,
				"createTicket",
				"Ticket déjà ouvert"
			);
		}

		const guild = buttonInteraction.guild as Guild;
		const category = guild.channels.cache.get(this.ticketConfigModel.category_id) as CategoryChannel;
		const everyoneRole: Role = guild.roles.cache.find(r => r.name === "@everyone");

		if (!category || !everyoneRole) {
			throw Error("Il semble que la création des tickets soit indisponible :weary:");
		}

		const channelName: string = this.getChannelName(this.ticketConfigModel.last_number);
		const ticketChannel: TextChannel = await guild.channels.create(channelName, {
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

		for (const role of this.roleModels) {
			const ticketRole: Role = guild.roles.cache.get(role.role_id);
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

		const newTicketNumber: number = this.ticketConfigModel.last_number + 1;

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			await this.saveTicketConfigNumber(newTicketNumber.toString());
		}

		this.ticketConfigModel.last_number += 1;
		const row = new MessageActionRow().addComponents(CloseTicketButton.button);
		const messageWelcomeTicket: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bienvenue sur ton ticket <@${guildMember.id}> \n 
							Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
							Une fois résolu, tu peux fermer le ticket avec le bouton ci-dessous`);

		const welcomeMessage = await ticketChannel.send({ embeds: [ messageWelcomeTicket ], components: [ row ] });
		await this.saveTicket(guildMember, newTicketNumber);

		const actionRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setStyle("LINK")
				.setLabel("Vers mon Ticket")
				.setURL(`https://discord.com/channels/${Config.guildId}/${ticketChannel.id}/${welcomeMessage.id}`)
		);
		await buttonInteraction.editReply({
			content: "Ton ticket est prêt et il n'attend plus que toi :ok_hand:",
			components: [ actionRow ],
		});

		return this.logService.info(`Création du ticket N°${newTicketNumber.toString()} pour ${guildMember.displayName}`);
	}

	/**
	 * Fermeture d'un ticket
	 * @param buttonInteraction
	 */
	public async closeTicket(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ fetchReply: false });

		const message = buttonInteraction.message as Message;
		const components = message.components as MessageActionRow[];
		components[0].components[0].setDisabled();
		await message.edit({ components: components });

		const targetChannel = buttonInteraction.channel as TextChannel;
		const userTicket = await this.getTicketByNumber(targetChannel);
		const guildMember = buttonInteraction.member as GuildMember;
		await targetChannel.permissionOverwrites.edit(userTicket.userid, {
			VIEW_CHANNEL: false,
			SEND_MESSAGES: false,
		});

		const closeMessage: MessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Ticket fermé par <@${guildMember.id}>`);

		const row = new MessageActionRow()
			.addComponents(
				ReOpenTicketButton.button,
				DeleteTicketButton.button
			);

		await buttonInteraction.editReply({ embeds: [ closeMessage ], components: [ row ] });

		if (!this.delayIsActive) {
			this.addRequest();
			const newName: string = targetChannel.name.replace("ticket", "fermé");
			await targetChannel.setName(newName);
		}
		else {
			await this.sendCooldownMessage(targetChannel);
		}

		await this.ticketRepository.closeTicket(guildMember.id);
		this.logService.info(`Fermeture d'un ticket : N°${userTicket.number} par le membre ${guildMember.displayName} (${guildMember.id})`);
	}

	/**
	 * Ajoute une requête ticket au compteur, initialise et démarre son minuteur de recharge
	 * @private
	 */
	private addRequest(): void {
		if (this.requests < 2) {
			this.datesCooldown.push(Date.now());
			setTimeout(() => this.substractRequest(), this.cooldown);
			this.requests++;
			if (this.requests === 2) this.startDelay();
		}
	}

	/**
	 * Bloquage des requêtes des tickets
	 * @private
	 */
	private startDelay(): void {
		this.delayIsActive = true;
	}

	/**
	 * Supprime une requête et son minuteur de recharge
	 * @private
	 */
	private substractRequest(): void {
		this.requests--;
		this.datesCooldown.shift();
		if (this.requests < 2) this.delayIsActive = false;
	}

	/**
	 * Envoi le message d'information de bloquage des requêtes de tickets
	 * @param targetChannel
	 * @private
	 */
	private async sendCooldownMessage(targetChannel: TextChannel): Promise<void> {
		const timeLeft = this.getTimeLeft();
		const message: MessageEmbed = new MessageEmbed()
			.setDescription(":exclamation: Le ticket ne peut pas changer de nom trop souvent")
			.setFooter({ text: `Cela sera à nouveau possible dans ${timeLeft.minutes} minute(s) et ${timeLeft.seconds} seconde(s)` })
			.setColor(this.warningColor);

		await targetChannel.send({ embeds: [ message ] });
	}

	/**
	 * Retourne le temps restant de la requête la plus ancienne
	 * @private
	 */
	private getTimeLeft(): TimeLeftType {
		const now: number = Date.now();
		const cooldown: number = this.datesCooldown[0];
		const minutes: number = ((now - cooldown) / 60) / 1000;
		const seconds: number = (now - cooldown) / 1000;
		return { minutes: minutes.toFixed(0), seconds: seconds.toFixed(0) };
	}

	/**
	 * Ré-ouverture d'un ticket
	 * @param buttonInteraction
	 */
	public async reOpenTicket(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ fetchReply: false });

		const targetChannel = buttonInteraction.channel as TextChannel;
		const userTicket = await this.getTicketByNumber(targetChannel);
		const message = buttonInteraction.message as Message;
		await message.delete();

		await targetChannel.permissionOverwrites.edit(userTicket.userid, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
		});

		if (!this.delayIsActive) {
			this.addRequest();
			const newName: string = targetChannel.name.replace("fermé", "ticket");
			await targetChannel.setName(newName);
		}
		else {
			await this.sendCooldownMessage(targetChannel);
		}

		const row = new MessageActionRow().addComponents(CloseTicketButton.button);
		await buttonInteraction.editReply({ content: `Hey <@${userTicket.userid}>, ton ticket a été ré-ouvert :face_with_monocle:`, components: [ row ] });
		await this.openTicket(userTicket);
		this.logService.info(`Ré-ouverture d'un ticket : N°${userTicket.number}`);
	}

	/**
	 * Supprimer un ticket
	 * @param buttonInteraction
	 */
	public async deleteTicket(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ fetchReply: false });

		const deleteMessage: MessageEmbed = new MessageEmbed()
			.setColor(this.warningColor)
			.setDescription("Suppression du ticket dans quelques secondes");
		await buttonInteraction.editReply({ embeds: [ deleteMessage ] });

		const targetChannel = buttonInteraction.channel as TextChannel;
		setTimeout(async () => {
			await targetChannel.delete();
		}, 5000);
		const nameArray: string[] = targetChannel.name.split("-");
		const number: number = parseInt(nameArray[1]);
		await this.ticketRepository.deleteTicket(number);
		this.logService.info(`Suppression d'un ticket : ${targetChannel.name}`);
	}

	/**
	 * Envoi le message pilote pour la création des tickets
	 * @param commandInteraction
	 */
	public async sendTicketMessage(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true });
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;

		if (channel.type !== "GUILD_TEXT") {
			throw new InteractionError(
				"Choisi un channel textuel voyons :grin:",
				commandInteraction.commandName,
				`Le channel ${channel.name} ne possede pas le bon type`
			);
		}

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail("attachment://logo-bannis.png")
			.setTitle("BESOIN D'AIDE ?")
			.setDescription("Rien de plus simple, utilise le bouton ci-dessous pour créer ton ticket. \n \n Un salon sera créé rien que pour toi afin de discuter avec l'équipe des Bannis :wink: \n")
			.setFooter({ text: "Un seul ticket autorisé par utilisateur" });

		const logo = new MessageAttachment(Config.imageDir + "/logo-bannis.png");
		const actionRow = new MessageActionRow().addComponents(CreateTicketButton.button);
		await channel.send({ embeds: [ messageEmbed ], components: [ actionRow ], files: [ logo ] });
		await commandInteraction.editReply({ content: "J'ai bien envoyé le message :ticket:" });
		return this.logService.info(`Message ticket pilote envoye dans le salon ${channel.name}`);
	}
}
