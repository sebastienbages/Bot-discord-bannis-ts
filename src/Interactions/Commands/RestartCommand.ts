import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import { WebhookProvider } from "../../WebhookProvider";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types";

export class RestartCommand implements ISlashCommand {
	public readonly name: string = "restart";
	public readonly description: string = "Envoi un message d'alerte de restart du serveur";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Pour quel(s) serveur(s) ?",
			isRequired: true,
			choices: [
				[
					"Serveur principal",
					"main_server",
				],
			],
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("option") as string;

		if (option === "main_server") {
			await WebhookProvider.getServerKeeperOne().send(`:warning: <@&${Config.roleStart}> Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:`);
		}

		return await commandInteraction.reply({ content: "Les utilisateurs sont avertis :mega:", ephemeral: true, fetchReply: false });
	}
}
