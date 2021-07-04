import { MessageEmbed, WebhookClient } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../Services/ServiceProvider";
import { Config, WebHookConfig } from "../../Config/Config";
import { TopServerModel } from "../../Models/TopServerModel";

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
            const TopServerService = ServiceProvider.getTopServerService();
            const webhook = new WebhookClient(WebHookConfig.voteKeeperId, WebHookConfig.voteKeeperToken);

            const topServerModel = await TopServerService.getSlugTopServer();
			const numberOfVotes = await TopServerService.GetNumberOfVotes();
			const topServeurUrl = "https://top-serveurs.net/conan-exiles/vote/" + topServerModel.slug;

            const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle('VOTEZ POUR LE SERVEUR')
				.setURL(topServeurUrl)
				.attachFiles(['./images/topServeur.png'])
				.setThumbnail('attachment://topServeur.png')
				.setDescription('N\'hésitez pas à donner un coup de pouce au serveur en votant. Merci pour votre participation :thumbsup:')
				.addField('LIEN TOP SERVEUR', topServeurUrl)
				.setFooter(`Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci`);

			webhook.send(messageEmbed);
        } 
        catch (error) {
            throw error;
        }
    }
}