import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { WebhookClient } from "discord.js";
import { Config } from "../../Config/Config";

export class RestartCommand implements ICommand {

    public readonly name = "restart";
    public readonly aliases = [];
    public readonly argumentIsNecessary = false;
    public readonly description = "Envoi un message d\'alerte de restart du serveur en utilisant le Webhook Gardien du serveur";
    public readonly usage = "[nom de la commande]";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'ADMINISTRATOR';

    async run(commandContext: CommandContext): Promise<void> {
        try {
            const webhook = new WebhookClient(Config.serverKeeperId, Config.serverKeeperToken);
            const msg = ':warning: @everyone Nous allons redémarrer le serveur, veuillez vous déconnecter :warning:';
            webhook.send(msg)
        }
        catch (error) {
            throw error;
        }
    }
}