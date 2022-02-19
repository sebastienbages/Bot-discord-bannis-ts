import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ServicesProvider } from "../../ServicesProvider";
import { RuleService } from "../../Services/RuleService";
import { ApplicationCommandOptionType } from "discord-api-types";

export class RuleCommand implements ISlashCommand {
	public readonly name: string = "reglement";
	public readonly description: string = "Je peux envoyer le message qui permet aux utilisateurs de valider le règlement";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.Channel,
			name: "channel",
			description: "Dans quel channel veux-tu l'envoyer ?",
			isRequired: true,
		},
	];
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private _ruleService: RuleService;

	constructor() {
		this._ruleService = ServicesProvider.getRuleService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await this._ruleService.sendServerMessage(commandInteraction);
	}
}
