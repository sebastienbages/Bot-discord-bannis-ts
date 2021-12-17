import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { ServicesProvider } from "../../src/ServicesProvider";
import { LogService } from "../../Services/LogService";
import { RuleService } from "../../Services/RuleService";

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

	constructor() {
		this.customId = ValidationRulesButton.id;
		this._ruleService = ServicesProvider.getRuleService();
		this._logService = new LogService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		return Promise.resolve();
	}
}
