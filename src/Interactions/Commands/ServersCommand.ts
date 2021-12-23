import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ServicesProvider } from "../../ServicesProvider";
import { RuleService } from "../../Services/RuleService";
import { ApplicationCommandOptionType } from "discord-api-types";

export class ServersCommand implements ISlashCommand {
	public readonly name: string = "serveurs";
	public readonly description: string = "Je peux envoyer le message qui permet aux utilisateurs de choisir leur serveur";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Que veux-tu faire ?",
			isRequired: true,
			choices: [
				[
					"Envoyer message",
					"send",
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
	readonly subCommandsOptions: SubCommandOptions[] = [];

	private _ruleService: RuleService;

	constructor() {
		this._ruleService = ServicesProvider.getRuleService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("option") as string;

		if (option === "send") {
			await this._ruleService.sendServerMessage(commandInteraction);
		}
	}
}
