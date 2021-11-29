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
					"Serveur 1",
					"serveur_1",
				],
				[
					"Serveur 2",
					"serveur_2",
				],
				[
					"Tous les serveurs",
					"serveur_tous",
				],
			],
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const option = commandInteraction.options.getString("option") as string;

		if (option === "serveur_tous") {
			await WebhookProvider.getServerKeeperOne().send(`:warning: <@&${Config.serverRoleOne}> Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:`);
			await WebhookProvider.getServerKeeperTwo().send(`:warning: <@&${Config.serverRoleTwo}> Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:`);
		}

		if (option === "serveur_1") {
			await WebhookProvider.getServerKeeperOne().send(`:warning: <@&${Config.serverRoleOne}> Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:`);
		}

		if (option === "serveur_2") {
			await WebhookProvider.getServerKeeperTwo().send(`:warning: <@&${Config.serverRoleTwo}> Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:`);
		}

		return await commandInteraction.reply({ content: "C'est bon, les utilisateurs sont avertis :mega:", ephemeral: true, fetchReply: false });
	}
}
