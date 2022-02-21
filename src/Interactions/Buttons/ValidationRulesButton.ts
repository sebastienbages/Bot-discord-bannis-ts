import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction, GuildMember,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { ServicesProvider } from "../../ServicesProvider";
import { LogService } from "../../Services/LogService";
import { RuleService } from "../../Services/RuleService";
import { Config } from "../../Config/Config";
import { RoleService } from "../../Services/RoleService";

export class ValidationRulesButton implements IButton {
	static readonly id: string = "validation_rules";
	static readonly label: string = "Valider le règlement";
	static readonly style: MessageButtonStyleResolvable = "SUCCESS";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji("🖱");

	public readonly customId: string;
	private _ruleService: RuleService;
	private _logService: LogService;
	private _roleService: RoleService;

	constructor() {
		this.customId = ValidationRulesButton.id;
		this._ruleService = ServicesProvider.getRuleService();
		this._logService = ServicesProvider.getLogService();
		this._roleService = ServicesProvider.getRoleService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const guildMember = buttonInteraction.member as GuildMember;

		if (this._roleService.userHasRole(Config.roleStart, guildMember)) {
			await buttonInteraction.editReply({ content: "Tu as déjà validé le règlement :nerd:" });
			return;
		}

		await this._roleService.assignStartRole(buttonInteraction);
		await buttonInteraction.editReply({ content: "Te voilà arrivé :partying_face: \nProfite bien de l'aventure des bannis :thumbsup:", attachments: [] });
		this._logService.log(`${guildMember.displayName} a commence l'aventure`);
	}
}
