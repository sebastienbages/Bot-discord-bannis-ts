import { CommandOptions, ISlashCommand, SubCommandOptions } from "../ISlashCommand";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ServicesProvider } from "../../src/ServicesProvider";
import { RuleService } from "../../Services/RuleService";
import { ApplicationCommandOptionType } from "discord-api-types";

export class ServersCommand implements ISlashCommand {
	public readonly name: string = "serveurs";
	public readonly description: string = "Je peux envoyer le message qui permet aux utilisateurs de choisir leur serveur";
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Que veux-tu faire ?",
			isRequired: true,
			choices: [
				[
					"Envoyer message",
					"add",
				],
				[
					"Supprimer message",
					"remove",
				],
			],
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	private _ruleService: RuleService;

	constructor() {
		this._ruleService = ServicesProvider.getRuleService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("option") as string;

		if (option === "add") {
			await this._ruleService.addReactForServeurChoice(commandInteraction);
		}

		if (option === "remove") {
			await this._ruleService.removeReactForServeurChoice(commandInteraction);
		}
	}
}