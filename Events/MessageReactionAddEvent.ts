import {
	GuildMember,
	MessageReaction,
	User,
} from "discord.js";
import { ServicesProvider } from "../src/ServicesProvider";
import { TicketService } from "../Services/TicketService";
import { LogService } from "../Services/LogService";
import { RoleService } from "../Services/RoleService";
import { RuleService } from "../Services/RuleService";

export class MessageReactionAddEvent {
	private _logService: LogService;
	private _roleService: RoleService;
	private _ruleService: RuleService;
	private _ticketService: TicketService;

	constructor() {
		this._logService = new LogService();
		this._roleService = ServicesProvider.getRoleService();
		this._ruleService = ServicesProvider.getRuleService();
		this._ticketService = ServicesProvider.getTicketService();
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
	}
}