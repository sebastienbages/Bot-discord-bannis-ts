import { CategoryChannel, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js"
import { Config } from "../Config/Config";
import { ServiceProvider } from "../Services/ServiceProvider";
import { TicketService } from "../Services/TicketService";

export class MessageReactionAddEvent {
    
    public async run(messageReaction: MessageReaction, user: User): Promise<void> {
        try {

			if (user.bot || (messageReaction.emoji.name != TicketService.createReaction && messageReaction.emoji.name != TicketService.closeReaction && messageReaction.emoji.name != TicketService.reOpenTicketReaction && messageReaction.emoji.name != TicketService.deleteTicketReaction)) return undefined;

			messageReaction.users.remove(user);

            const ticketService = ServiceProvider.getTicketService();
			const ticketMessage = await ticketService.getAllData();
			const targetChannel = messageReaction.message.channel as TextChannel;

			if (messageReaction.message.id === ticketMessage.MessageId) {

				const category = messageReaction.message.guild.channels.cache.find(c => c.id === ticketMessage.CategoryId) as CategoryChannel;
				const everyoneRole = messageReaction.message.guild.roles.cache.find(r => r.name === '@everyone');

				if (!category || !everyoneRole) {
					messageReaction.remove()
					messageReaction.message.channel.send('La création de ticket est indisponible, veuillez contacter un admin');
                    return undefined;
				}

                const roleService = ServiceProvider.getRoleService();
				const ticketRoles = await roleService.getTicketRoles();
				
				const channelName = ticketService.getChannelName(ticketMessage.LastNumber);

				const ticketChannel = await messageReaction.message.guild.channels.create(channelName, { 
						type: "text",
						parent: category,
						permissionOverwrites: [
							{
								id: user.id,
								allow: [ "VIEW_CHANNEL", "SEND_MESSAGES" ],
								deny: [ "ADD_REACTIONS" ] 
							},
							{
								id: everyoneRole.id,
								deny: ["VIEW_CHANNEL"],
							}
						]
					}
				);

				ticketRoles.forEach(async role => {
					const ticketRole = messageReaction.message.guild.roles.cache.find(r => r.id === role.discordId);
					if (ticketRole) {
						await ticketChannel.createOverwrite(ticketRole, 
							{
								VIEW_CHANNEL: true,
								ADD_REACTIONS: false
							}
						);
					}
				});

				const rolesMentions = new Array<String>();
				
				ticketRoles.map(role => {
					rolesMentions.push('<@&' + role.discordId + '>');
				});

				await ticketChannel.send(rolesMentions.join(' '));

				const newTicketNumber = parseInt(ticketMessage.LastNumber) + 1;
				ticketService.saveTicketNumber(newTicketNumber.toString());

				const messageWelcomeTicket = new MessageEmbed()
					.setColor(Config.color)
					.setDescription(`Bienvenue sur ton ticket <@${user.id}> \n 
									 Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
									 Tu peux fermer le ticket avec le ${TicketService.closeReaction}`);

				const ticket = await ticketChannel.send(messageWelcomeTicket);
				ticket.react(TicketService.closeReaction);
			}

			if (messageReaction.emoji.name === TicketService.closeReaction && targetChannel.parentID === ticketMessage.CategoryId) {
				
				const closeMessage = new MessageEmbed()
					.setColor(Config.color)
					.setDescription(`Message fermé par <@${user.id}> \n
									 ${TicketService.reOpenTicketReaction} Ré-ouvrir le ticket
									 ${TicketService.deleteTicketReaction} Supprimer le ticket`);

				const messageBeforeClose = await messageReaction.message.channel.send(closeMessage);
				await messageBeforeClose.react(TicketService.reOpenTicketReaction);
				await messageBeforeClose.react(TicketService.deleteTicketReaction);

				const newName = targetChannel.name.replace("ticket", "ferme");
				await targetChannel.setName(newName);
			}

			if (messageReaction.emoji.name === TicketService.reOpenTicketReaction && messageReaction.message.author.bot) {

				await messageReaction.message.delete();

				const newName = targetChannel.name.replace("ferme", "ticket");
				await targetChannel.setName(newName);
			}

			if (messageReaction.emoji.name === TicketService.deleteTicketReaction && messageReaction.message.author.bot) {

				const deleteMessage = new MessageEmbed()
					.setColor(Config.color)
					.setDescription("Supression du ticket dans 5 secondes");
				
				await targetChannel.send(deleteMessage);
				setTimeout(async () => await targetChannel.delete(), 5000);
			}
		}
		catch (error) {
			throw error;
		}
    }
}