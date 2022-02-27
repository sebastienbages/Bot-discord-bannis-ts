import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { ServicesProvider } from "../../ServicesProvider";
import { RuleService } from "../../Services/RuleService";

export class ValidationRulesButton implements IButton {
	public static readonly id: string = "validation_rules";
	public static readonly label: string = "Valider le règlement et commencer l'aventure";
	public static readonly style: MessageButtonStyleResolvable = "SUCCESS";
	public static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style)
		.setEmoji("🚀");

	public readonly customId: string;
	private ruleService: RuleService;

	constructor() {
		this.customId = ValidationRulesButton.id;
		this.ruleService = ServicesProvider.getRuleService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return this.ruleService.validateRules(buttonInteraction);
	}
}
