import { LogService } from "../Services/LogService";
import {
	BaseCommandInteraction,
	ButtonInteraction, Collection, CommandInteraction,
	GuildMember,
	Interaction,
	SelectMenuInteraction,

} from "discord.js";
import { TicketService } from "../Services/TicketService";
import { ServicesProvider } from "../src/ServicesProvider";
import { SlashCommandService } from "../Services/SlashCommandService";
import { ISlashCommand } from "../Interfaces/ISlashCommand";
import { ButtonService } from "../Services/ButtonService";
import { IButton } from "../Interfaces/IButton";
import { SelectMenuService } from "../Services/SelectMenuService";

export class InteractionCreateEvent {

	private _logService: LogService;
	private _ticketService: TicketService;
	private _slashCommandService: SlashCommandService;
	private _buttonService: ButtonService;
	private _selectMenuService: SelectMenuService;
	private _commands: Collection<string, ISlashCommand>;

	constructor() {
		this._logService = new LogService();
		this._ticketService = ServicesProvider.getTicketService();
		this._slashCommandService = ServicesProvider.getSlashCommandService();
		this._buttonService = ServicesProvider.getButtonService();
		this._selectMenuService = ServicesProvider.getSelectMenuService();
		this._commands = new Collection<string, ISlashCommand>();
		this._slashCommandService._commandsInstances.forEach(cmd => {
			this._commands.set(cmd.name, cmd);
		});
	}

	public async run(interaction: Interaction): Promise<void> {
		try {
			if (interaction.isCommand()) {
				const commandInteraction = interaction as CommandInteraction;
				const slashCommand: ISlashCommand = this._commands.get(commandInteraction.commandName);
				const member = commandInteraction.member as GuildMember;
				await slashCommand.executeInteraction(commandInteraction);
				return this._logService.log(`L'utilisateur ${member.displayName} a utilisé la commande "${commandInteraction.commandName}"`);
			}

			if (interaction.isSelectMenu()) {
				const selectMenuInteraction = interaction as SelectMenuInteraction;
				const selectMenuInstance = this._selectMenuService.getInstance(selectMenuInteraction.customId);
				return await selectMenuInstance.executeInteraction(selectMenuInteraction);
			}

			if (interaction.isButton()) {
				const buttonInteraction = interaction as ButtonInteraction;
				const instanceButton: IButton = this._buttonService.getInstance(buttonInteraction.customId);
				return await instanceButton.executeInteraction(buttonInteraction);
			}
		}
		catch (error) {
			const baseInteraction = interaction as BaseCommandInteraction;
			this._logService.error(error);
			if (!error.message) {
				error.message = "Oups ! Une erreur s'est produite :thermometer_face:";
			}
			return await baseInteraction.reply({ content: "Oups ! Une erreur s'est produite : " + error.message, ephemeral: true });
		}
	}
}
