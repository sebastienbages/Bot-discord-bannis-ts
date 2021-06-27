import { MessageEmbed, TextChannel } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class ClearCommand implements ICommand {

    public readonly name = "clear";
    public readonly aliases = [ "effacer", "nettoyer" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Efface le nombre de message spécifié dans le salon visé";
    public readonly usage = "<nombre>";
    public readonly guildOnly = true;
    public readonly cooldown = 5;
    public readonly permission = 'MANAGE_MESSAGES';

    async run(commandContext: CommandContext): Promise<void> {

        const message = commandContext.message;
        const channel = message.channel as TextChannel;
        const args = commandContext.args;

        try {
            await channel.bulkDelete(parseInt(args[0]), true)

            const messageEmbed = new MessageEmbed()
                .setColor(Config.color)
                .setDescription(`J'ai supprimé ***${args[0]} message(s)***`);

            const response = await message.channel.send(messageEmbed);
            response.delete({ timeout: 10000 });
        } 
        catch (error) {
            message.reply('je ne peux pas effacer ce nombre de messages');
            throw error;
        }
    }
}