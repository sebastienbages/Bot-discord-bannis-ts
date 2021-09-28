import {
	GuildMember,
	Message,
	MessageReaction,
	TextChannel,
	User,
} from "discord.js";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";
import { TicketModel } from "../Models/TicketModel";
import { LogService } from "../Services/LogService";
import { RoleService } from "../Services/RoleService";
import { RuleService } from "../Services/RuleService";
import { DiscordHelper } from "../Helper/DiscordHelper";

export class MessageReactionAddEvent {
	private _logService: LogService;
	private _roleService: RoleService;
	private _ruleService: RuleService;
	private _ticketService: TicketService;

	constructor() {
		this._logService = new LogService();
		this._roleService = ServiceProvider.getRoleService();
		this._ruleService = ServiceProvider.getRuleService();
		this._ticketService = ServiceProvider.getTicketService();
	}

	public async run(messageReaction: MessageReaction, user: User): Promise<void> {
		if (user.bot) return undefined;

		const emoji: string = messageReaction.emoji.name;
		const messageServerChoiceId: string = this._ruleService.getServerChoiceMessageId();

		// CHOIX DU SERVEUR
		if (RuleService.serveurReactions.includes(emoji) && messageReaction.message.id === messageServerChoiceId) {
			let guildMember: GuildMember = await messageReaction.message.guild.members.cache.get(user.id);

			if (!guildMember) {
				guildMember = await messageReaction.message.guild.members.fetch(user);
			}
			await this._roleService.assignServerRole(messageReaction, guildMember);
			return undefined;
		}

		const ticketConfig: TicketConfigModel = this._ticketService.getTicketConfig();
		const targetChannel = messageReaction.message.channel as TextChannel;

		// TICKET
		if (emoji == TicketService.createReaction || emoji == TicketService.closeReaction || emoji == TicketService.reOpenTicketReaction || emoji == TicketService.deleteTicketReaction) {
			await messageReaction.users.remove(user);
			let userTicket: TicketModel;

			if (targetChannel.id === ticketConfig.ChannelId) {
				userTicket = await this._ticketService.getTicketByUserId(user);
			}
			else {
				userTicket = await this._ticketService.getTicketByNumber(targetChannel);
			}

			if (messageReaction.message.id === ticketConfig.MessageId) {

				if (userTicket.userId === user.id && userTicket) {
					const response: Message = await messageReaction.message.channel.send(`<@${user.id}>, tu possèdes déjà un ticket ouvert : numéro ${userTicket.number.toString()}`);
					return DiscordHelper.deleteMessage(response, 5000);
				}

				return await this._ticketService.createTicket(messageReaction, user);
			}

			if (messageReaction.emoji.name === TicketService.closeReaction && targetChannel.parentId === ticketConfig.CategoryId) {

				if (userTicket.isClosed) {
					const response: Message = await messageReaction.message.channel.send(`<@${user.id}>, le ticket est déjà fermé :face_with_raised_eyebrow:`);
					return DiscordHelper.deleteMessage(response, 5000);
				}

				return await this._ticketService.closeTicket(user, messageReaction, targetChannel, userTicket);
			}

			if (messageReaction.emoji.name === TicketService.reOpenTicketReaction && messageReaction.message.author.bot) {
				return await this._ticketService.reOpenTicket(messageReaction, targetChannel, userTicket);
			}

			if (messageReaction.emoji.name === TicketService.deleteTicketReaction && messageReaction.message.author.bot) {
				return await this._ticketService.deleteTicket(targetChannel);
			}

			return;
		}
	}
}