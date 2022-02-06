import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ServicesProvider } from "../../ServicesProvider";
import { RuleService } from "../../Services/RuleService";
import { ApplicationCommandOptionType } from "discord-api-types";

export class ServersCommand implements ISlashCommand {
	public readonly name: string = "choix-serveurs";
	public readonly description: string = "Je peux envoyer le message qui permet aux utilisateurs de choisir leur serveur";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Quel(s) serveurs sont ouverts ?",
			isRequired: true,
			choices: [
				[
					"Uniquement serveur 1",
					"s1",
				],
				[
					"Uniquement serveur 2",
					"s2",
				],
				[
					"Les deux serveurs",
					"all",
				],
			],
		},
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
