import { MessageEmbed } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../Services/ServiceProvider";
import { Player } from "../../Models/TopServerModel";
import { Config } from "../../Config/Config";

export class TopServerCommand implements ICommand {

    public readonly name = "topserveur";
    public readonly aliases = [ "classement" ];
    public readonly argumentIsNecessary = false;
    public readonly description = "Envoi le classement des votes de Top serveur du mois dernier ou courant";
    public readonly usage = "[last] (option facultative)";
    public readonly guildOnly = false;
    public readonly cooldown = 30;
    public readonly permission = 'ADMINISTRATOR';

    async run(commandContext: CommandContext): Promise<void> {

        const args = commandContext.args;
        const message = commandContext.message;
        const TopServerService = ServiceProvider.getTopServerService();

        try {
            let title: string;
            let players: Array<Player>;

            const option = args[0];

            if (option === 'last') {
                players = await TopServerService.getPlayersRanking(false);
                title = 'Classement Top Serveur du mois dernier';
            }
            else {
                players = await TopServerService.getPlayersRanking(true);
                title = 'Classement Top Serveur du mois en cours';
            }

            const messageEmbed = new MessageEmbed()
                .attachFiles(['./Images/topServeur.png'])
                .setThumbnail('attachment://topServeur.png')
                .setTitle(title || 'Classement Top Serveur')
                .setColor(Config.color)
                .setTimestamp();

            players.map(p => {
                if (p.name === '') {
                    messageEmbed.addField('Sans pseudo', `${p.votes.toString()}`, false);
                }
                else {
                    messageEmbed.addField(`${p.name}`, `${p.votes.toString()}`, false);
                }
            });

            if (messageEmbed.length > 6000) {
                message.author.send('Le résulat est trop volumineux pour être affiché')
            }
            else {
                message.author.send(messageEmbed)
            }
        } 
        catch (error) {
            throw error;
        }
    }
}