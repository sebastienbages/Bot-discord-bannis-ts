import { MessageEmbed, WebhookClient } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { Config, WebHookConfig } from "../../Config/Config";

export class VoteCommand implements ICommand {

    public readonly name = "vote";
    public readonly aliases = [];
    public readonly argumentIsNecessary = false;
    public readonly description = "Envoi un message d\'appel aux votes en utilisant le WebHook Gardien des votes";
    public readonly usage = "[nom de la commande]";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'ADMINISTRATOR';

    async run(commandContext: CommandContext): Promise<void> {        
        try {
            await ServiceProvider.getVoteService().sendMessage();
        } 
        catch (error) {
            throw error;
        }
    }
}