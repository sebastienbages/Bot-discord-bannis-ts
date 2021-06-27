import { MessageEmbed, TextChannel } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class SurveyCommand implements ICommand {

    public readonly name = "survey";
    public readonly aliases = [ "question", "sondage" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Créé un sondage dans le salon des sondages";
    public readonly usage = "<question>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'ADMINISTRATOR';

    async run(commandContext: CommandContext): Promise<void> {

        const message = commandContext.message;
        const args = commandContext.args;

        try {
            const sondageChannel = message.guild.channels.cache.find(channel => channel.id === Config.surveyChannelId) as TextChannel;

            if (!sondageChannel) {
                const response = await message.reply('le channel des sondages est introuvable');
                response.delete({ timeout: 5000 });
                return undefined;
            }

            const messageToSend = args.join(' ');

            const messageEmbed = new MessageEmbed()
                .setTitle('SONDAGE')
                .attachFiles(['./Images/point-d-interrogation.jpg'])
                .setThumbnail('attachment://point-d-interrogation.jpg')
                .setDescription(messageToSend)
                .setColor(Config.color)
                .setFooter('Répondez en cliquant sur les réactions ci-dessous :');

            const survey = await sondageChannel.send(messageEmbed)
            await survey.react('✅');
            await survey.react('❌');
        }
        catch (error) {
            throw error;
        }
    }
}