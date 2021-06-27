import { MessageEmbed } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class SayCommand implements ICommand {

    public readonly name = "say";
    public readonly aliases = [ "dire", "embed" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Envoi un message enrichi avec le bot dans le salon utilisé";
    public readonly usage = "<text>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'MANAGE_MESSAGES';

    async run(commandContext: CommandContext): Promise<void> {
        try {
            const messageEmbed = new MessageEmbed()
                .setDescription(commandContext.args.join(' '))
                .setColor(Config.color);

            commandContext.message.channel.send(messageEmbed);
        } 
        catch (error) {
            throw error;
        }
    }
}