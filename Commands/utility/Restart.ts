import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { PermissionResolvable, WebhookClient } from "discord.js";
import { WebHookConfig } from "../../Config/Config";

export class RestartCommand implements ICommand {
	public readonly name: string = "restart";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Envoi un message d'alerte de restart du serveur en utilisant le Webhook Gardien du serveur";
	public readonly usage: string = "[nom de la commande]";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async run(commandContext: CommandContext): Promise<void> {
		const webhook = new WebhookClient(WebHookConfig.serverKeeperId, WebHookConfig.serverKeeperToken);
		const msg = ":warning: @everyone Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:";
		webhook.send(msg);
	}
}