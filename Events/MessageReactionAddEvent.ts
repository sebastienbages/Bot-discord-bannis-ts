import { CategoryChannel, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js"
import { Config } from "../Config/Config";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { ServiceProvider } from "../src/ServiceProvider";
import { TicketService } from "../Services/TicketService";
import { TicketModel } from "../Models/TicketModel";

export class MessageReactionAddEvent {

	private _delayIsActive: boolean;
	private readonly _cooldown: number = 10 * 60 * 1000;
	private dateCooldown: number;
	private _requests: number;

	constructor() {
		this._delayIsActive = false;
		this._requests = 0;
	}

    public async run(messageReaction: MessageReaction, user: User): Promise<void> {
        try {
			if (user.bot) return undefined;
			if (messageReaction.emoji.name != TicketService.createReaction && messageReaction.emoji.name != TicketService.closeReaction && messageReaction.emoji.name != TicketService.reOpenTicketReaction && messageReaction.emoji.name != TicketService.deleteTicketReaction) return undefined;

			await messageReaction.users.remove(user);

            const ticketService = ServiceProvider.getTicketService();
			const ticketConfig = ticketService.getTicketConfig();
			const targetChannel = messageReaction.message.channel as TextChannel;
			let userTicket;

			if (targetChannel.id === ticketConfig.ChannelId) {
				userTicket = await ticketService.getTicketByUserId(user);
			}
			else {
				userTicket = await ticketService.getTicketByNumber(targetChannel);
			}
			
			if (messageReaction.message.id === ticketConfig.MessageId) {

				if (userTicket.userId === user.id && userTicket) {
					const response = await messageReaction.message.channel.send(`<@${user.id}>, tu possèdes déjà un ticket ouvert : numéro ${userTicket.number.toString()}`);
					response.delete({ timeout: 10 * 1000 });
					return undefined;
				}

				return await this.createTicket(messageReaction, ticketConfig, ticketService, user);
			}

			if (messageReaction.emoji.name === TicketService.closeReaction && targetChannel.parentID === ticketConfig.CategoryId) {

				if (userTicket.isClosed) {
					const response = await messageReaction.message.channel.send(`<@${user.id}>, le ticket est déjà fermé :face_with_raised_eyebrow:`);
					response.delete({ timeout: 10 * 1000 });
					return undefined;
				}

				return await this.closeTicket(user, messageReaction, targetChannel, ticketService, userTicket);
			}

			if (messageReaction.emoji.name === TicketService.reOpenTicketReaction && messageReaction.message.author.bot) {
				return await this.reOpenTicket(messageReaction, targetChannel, ticketService, userTicket);
			}

			if (messageReaction.emoji.name === TicketService.deleteTicketReaction && messageReaction.message.author.bot) {
				return await this.deleteTicket(targetChannel, ticketService);
			}
		}
		catch (error) {
			throw error;
		}
    }

	private async createTicket(messageReaction: MessageReaction, ticketConfig: TicketConfigModel, ticketService: TicketService, user: User): Promise<void> {
		try {

			const category = messageReaction.message.guild.channels.cache.find(c => c.id === ticketConfig.CategoryId) as CategoryChannel;
			const everyoneRole = messageReaction.message.guild.roles.cache.find(r => r.name === '@everyone');

			if (!category || !everyoneRole) {
				messageReaction.remove()
				messageReaction.message.channel.send('La création de ticket est indisponible, veuillez contacter un admin');
				return undefined;
			}

			const ticketRoles = ticketService.getTicketRoles();
			const channelName = ticketService.getChannelName(ticketConfig.LastNumber);

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
						},
						{
							id: messageReaction.client.user.id,
							allow: [ "VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_MESSAGES", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "ADD_REACTIONS" ], 
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
							ADD_REACTIONS: false,
							SEND_MESSAGES: true,
							EMBED_LINKS: true,
							READ_MESSAGE_HISTORY: true,
							ATTACH_FILES: true
						}
					);
				}
			});

			const rolesMentions = new Array<String>();
			
			ticketRoles.map(role => {
				rolesMentions.push(`<@&${role.discordId}>`);
			});

			rolesMentions.push(`<@${user.id}>`);
			await ticketChannel.send(rolesMentions.join(' '));

			const newTicketNumber = ticketConfig.LastNumber + 1;
			await ticketService.saveTicketConfigNumber(newTicketNumber.toString());
			ticketService.updateTicketConfig();

			const messageWelcomeTicket = new MessageEmbed()
				.setColor(Config.color)
				.setDescription(`Bienvenue sur ton ticket <@${user.id}> \n 
								Ecris-nous le(s) motif(s) de ton ticket et un membre du staff reviendra vers toi dès que possible :wink: \n 
								Une fois résolu, tu peux fermer le ticket avec le ${TicketService.closeReaction}`);

			const ticket = await ticketChannel.send(messageWelcomeTicket);
			ticket.react(TicketService.closeReaction);
			ticketService.saveTicket(user, newTicketNumber);
			return undefined;
		} 
		catch (error) {
			throw error;	
		}
	}

	private async closeTicket(user: User, messageReaction: MessageReaction, targetChannel: TextChannel, ticketService: TicketService, userTicket: TicketModel): Promise<void> {
		try {
			await targetChannel.updateOverwrite(userTicket.userId, {
				VIEW_CHANNEL: false,
				SEND_MESSAGES: false
			});

			const closeMessage = new MessageEmbed()
				.setColor(Config.color)
				.setDescription(`Ticket fermé par <@${user.id}> \n
								Ré-ouvrir le ticket : ${TicketService.reOpenTicketReaction} \n
								Supprimer le ticket : ${TicketService.deleteTicketReaction}`);
	
			const messageBeforeClose = await messageReaction.message.channel.send(closeMessage);
			await messageBeforeClose.react(TicketService.reOpenTicketReaction);
			await messageBeforeClose.react(TicketService.deleteTicketReaction);

			if (!this._delayIsActive) {
				this.addRequest()
				const newName = targetChannel.name.replace("ticket", "fermé");
				await targetChannel.setName(newName);
			}
			else {
				this.sendCooldownMessage(targetChannel);
			}

			ticketService.closeTicket(userTicket);
			return undefined;
		} 
		catch (error) {
			throw error;	
		}
	}

	private async reOpenTicket(messageReaction: MessageReaction, targetChannel: TextChannel, ticketService: TicketService, userTicket: TicketModel): Promise<void> {
		try {
			await messageReaction.message.delete();

			await targetChannel.updateOverwrite(userTicket.userId, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true
			});

			if (!this._delayIsActive) {
				this.addRequest();
				const newName = targetChannel.name.replace("fermé", "ticket");
				await targetChannel.setName(newName);
			}
			else {
				this.sendCooldownMessage(targetChannel);
			}

			messageReaction.message.channel.send(`Hey <@${userTicket.userId}>, ton ticket a été ré-ouvert :face_with_monocle:`);
			ticketService.openTicket(userTicket);
			return undefined;
		} 
		catch (error) {
			throw error;	
		}
	}

	private async deleteTicket(targetChannel: TextChannel, ticketService: TicketService): Promise<void> {
		try {
			const deleteMessage = new MessageEmbed()
				.setColor("#FF0000")
				.setDescription("Supression du ticket dans quelques secondes");

			await targetChannel.send(deleteMessage);
			const deleteChannel = async () => await targetChannel.delete();
			setTimeout(async () => deleteChannel(), 5000);
			ticketService.deleteTicket(targetChannel);
			return undefined;
		} 
		catch (error) {
			throw error;	
		}
	}

	private startDelay(): void {
		this._delayIsActive = true;
		this.dateCooldown = Date.now() + this._cooldown;
		setTimeout(() => this.resetCooldown(), this._cooldown);
	}

	private resetCooldown(): void {
		this._delayIsActive = false;
		this._requests = 0;
	}

	private getTimeLeft(): number {
		const now = Date.now();
		return ((this.dateCooldown - now) / 60) / 1000;
	}

	private async sendCooldownMessage(targetChannel: TextChannel): Promise<void> {
		const timeLeft = this.getTimeLeft();
		const message = new MessageEmbed()
			.setDescription(":exclamation: Le ticket ne peut pas changer de nom trop souvent")
			.setFooter(`Cela sera à nouveau possible dans ${timeLeft.toFixed(0)} minute(s)`)
			.setColor("#FF0000");

		await targetChannel.send(message);
	}

	private addRequest(): void {
		this._requests++;
		if (this._requests === 2) this.startDelay();
	}
}