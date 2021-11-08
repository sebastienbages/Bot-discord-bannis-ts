import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import {
	CategoryChannel,
	Message,
	MessageEmbed,
	PermissionResolvable,
	TextChannel,
} from "discord.js";
import { Config } from "../../Config/Config";
import { TicketService } from "../../Services/TicketService";
import { TicketConfigModel } from "../../Models/TicketConfigModel";

export class TicketCommand implements ICommand {
	public readonly name: string = "ticket";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Outils de gestion des tickets";
	public readonly usage: string = "[config] / [msg] / [category] <category_id> / [channel] <channel_id>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	private _ticketService: TicketService;

	constructor() {
		this._ticketService = ServiceProvider.getTicketService();
	}

	async run(commandContext: CommandContext): Promise<void> {
		const option: string = commandContext.args[0].toLowerCase();
		const message: Message = commandContext.message;
		const ticketConfig: TicketConfigModel = this._ticketService.getTicketConfig();

		const channel = message.guild.channels.cache.find(c => c.id === ticketConfig.ChannelId) as TextChannel;

		if (option === "config") {
			const category = message.guild.channels.cache.find(c => c.id === ticketConfig.CategoryId) as CategoryChannel;

			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle("PARAMETRES DES TICKETS")
				.setTimestamp();

			if (category) {
				messageEmbed.addField("NOM DE LA CATEGORIE", `<#${category.id}>`);
			}
			else {
				messageEmbed.addField("NOM DE LA CATEGORIE", "Catégorie non enregistrée");
			}

			if (channel) {
				messageEmbed.addField("CHANNEL CREATION DES TICKETS", `<#${channel.id}>`);
			}
			else {
				messageEmbed.addField("CHANNEL CREATION DES TICKETS", "Salon non enregistré");
			}

			messageEmbed.addField("NOMBRE DE TICKET(S)", ticketConfig.LastNumber.toString());
			await message.reply({ embeds: [ messageEmbed ] });
			return;
		}

		if (option === "msg") {
			const oldMessage: Message = channel.messages.cache.get(ticketConfig.MessageId);
			if (oldMessage) await oldMessage.delete();
			return await this._ticketService.sendTicketMessage(message);
		}
	}
}