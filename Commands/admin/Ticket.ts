import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../Services/ServiceProvider";
import { MessageEmbed, TextChannel } from "discord.js";
import { Config } from "../../Config/Config";
import { TicketService } from "../../Services/TicketService";

export class TicketCommand implements ICommand {

    public readonly name = "ticket";
    public readonly aliases = [];
    public readonly argumentIsNecessary = true;
    public readonly description = "Outils de gestion des tickets";
    public readonly usage = "[config] / [msg] / [category] <category_id> / [channel] <channel_id>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = "ADMINISTRATOR";

    async run(commandContext: CommandContext): Promise<void> {

        const option = commandContext.args[0].toLowerCase();
        const message = commandContext.message;
        const ticketService = ServiceProvider.getTicketService();
		const ticketMessage = await ticketService.getAllData();

		const category = message.guild.channels.cache.find(c => c.id === ticketMessage.CategoryId);
		const channel = message.guild.channels.cache.find(c => c.id === ticketMessage.ChannelId) as TextChannel;

		if (option === 'config') {

			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle('PARAMETRES DES TICKETS')
				.setTimestamp();

			if (category) {
				messageEmbed.addField('NOM DE LA CATEGORIE', `<#${category.id}>`);
			}
			else {
				messageEmbed.addField('NOM DE LA CATEGORIE', 'Catégorie non enregistrée');
			}

			if (channel) {
				messageEmbed.addField('CHANNEL DES TICKET', `<#${channel.id}>`);
			}
			else {
				messageEmbed.addField('SALON CREATION DES TICKET', 'Salon non enregistré');
			}

			messageEmbed.addField('NOMBRE DE TICKET(S)', ticketMessage.LastNumber);

			message.reply(messageEmbed)
		}
		else if (option === 'msg') {

			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle('Creation d\'un ticket')
				.setDescription('Bienvenue dans le gestionnaire de ticket des Bannis. \n Pour créer un ticket, clique sur la réaction :ticket:');

			if (channel) {
				const messageSend = await channel.send(messageEmbed)
                messageSend.react(TicketService.createReaction);
                ticketService.saveTicketMessageId(messageSend.id);
			}
			else {
				const response = await message.reply('Salon des tickets introuvable')
                response.delete({ timeout: 5000 });
			}
		}
    }
}