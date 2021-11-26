import { LogService } from "../Services/LogService";
import {
	ButtonInteraction, Collection, CommandInteraction,
	GuildMember,
	Interaction,
	Message,
	MessageActionRow,
	TextChannel,
} from "discord.js";
import { TicketService } from "../Services/TicketService";
import { ServicesProvider } from "../src/ServicesProvider";
import { SlashCommandService } from "../Services/SlashCommandService";
import { ISlashCommand } from "../Commands/ISlashCommand";

export class InteractionCreateEvent {

	private _logService: LogService;
	private _ticketService: TicketService;
	private _slashCommandService: SlashCommandService;
	private _commands: Collection<string, ISlashCommand>;

	constructor() {
		this._logService = new LogService();
		this._ticketService = ServicesProvider.getTicketService();
		this._slashCommandService = ServicesProvider.getSlashCommandService();
		this._commands = new Collection<string, ISlashCommand>();
		this._slashCommandService._commandsInstances.forEach(cmd => {
			this._commands.set(cmd.name, cmd);
		});
	}

	public async run(interaction: Interaction): Promise<void> {
		if (interaction.isCommand()) {
			const commandInteraction = interaction as CommandInteraction;
			const slashCommand: ISlashCommand = this._commands.get(commandInteraction.commandName);
			const member = commandInteraction.member as GuildMember;
			try {
				await slashCommand.executeInteraction(commandInteraction);
				return this._logService.log(`L'utilisateur ${member.displayName} a utilisé la commande "${commandInteraction.commandName}"`);
			}
			catch (error) {
				this._logService.error(error);
				if (!error.message) {
					error.message = "Oups ! Une erreur s'est produite :thermometer_face:";
				}
				return await interaction.reply({ content: error.message, ephemeral: true });
			}
		}

		if (interaction.isButton()) {
			const buttonInteraction = interaction as ButtonInteraction;
			const message = buttonInteraction.message as Message;
			const guildMember: GuildMember = buttonInteraction.member as GuildMember;
			const customId: string = buttonInteraction.customId;
			const targetChannel = message.channel as TextChannel;

			if (customId === TicketService.createTicket) {
				const userTicket = await this._ticketService.getTicketByUserId(guildMember.id);
				if (!userTicket.userId) {
					await buttonInteraction.update({});
					return await this._ticketService.createTicket(message, guildMember);
				}
				else {
					return await buttonInteraction.reply({ content: `<@${guildMember.id}>, tu possèdes déjà un ticket ouvert : numéro ${userTicket.number.toString()}`, ephemeral: true });
				}
			}

			if (customId === TicketService.closeTicket) {
				const userTicket = await this._ticketService.getTicketByNumber(targetChannel);
				if (userTicket.isClosed) {
					return await buttonInteraction.reply({ content: "Le ticket est déjà fermé", ephemeral: true });
				}
				else {
					await this._ticketService.closeTicket(guildMember, message, targetChannel, userTicket);
					const components = buttonInteraction.message.components as MessageActionRow[];
					components[0].components[0].setDisabled();
					return buttonInteraction.update({ components: components });
				}
			}

			if (customId === TicketService.reOpenTicket) {
				await buttonInteraction.update({});
				const userTicket = await this._ticketService.getTicketByNumber(targetChannel);
				return await this._ticketService.reOpenTicket(message, targetChannel, userTicket);
			}

			if (customId === TicketService.deleteTicket) {
				await buttonInteraction.update({});
				return await this._ticketService.deleteTicket(targetChannel);
			}
		}
	}
}