import { LogService } from "../Services/LogService";
import {
	BaseCommandInteraction,
	ButtonInteraction, Collection, CommandInteraction,
	GuildMember,
	Interaction,
	SelectMenuInteraction,
	Snowflake,
} from "discord.js";
import { TicketService } from "../Services/TicketService";
import { ServicesProvider } from "../ServicesProvider";
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
	private _lockInteraction: Snowflake[];

	constructor() {
		this._logService = ServicesProvider.getLogService();
		this._ticketService = ServicesProvider.getTicketService();
		this._slashCommandService = ServicesProvider.getSlashCommandService();
		this._buttonService = ServicesProvider.getButtonService();
		this._selectMenuService = ServicesProvider.getSelectMenuService();
		this._commands = new Collection<string, ISlashCommand>();
		this._slashCommandService._commandsInstances.forEach(cmd => {
			this._commands.set(cmd.name, cmd);
		});
		this._lockInteraction = [];
	}

	public async run(interaction: Interaction): Promise<void> {
		const guildMember = interaction.member as GuildMember;

		try {
			if (this.userIsLocked(guildMember.id)) {
				return;
			}

			this.lockUser(guildMember.id);

			if (interaction.isCommand()) {
				const commandInteraction = interaction as CommandInteraction;
				const slashCommand: ISlashCommand = this._commands.get(commandInteraction.commandName);
				const member = commandInteraction.member as GuildMember;
				await slashCommand.executeInteraction(commandInteraction);
				this._logService.log(`${member.displayName} a utilise la commande "${commandInteraction.commandName}"`);
			}

			if (interaction.isSelectMenu()) {
				const selectMenuInteraction = interaction as SelectMenuInteraction;
				const selectMenuInstance = this._selectMenuService.getInstance(selectMenuInteraction.customId);
				await selectMenuInstance.executeInteraction(selectMenuInteraction);
			}

			if (interaction.isButton()) {
				const buttonInteraction = interaction as ButtonInteraction;
				const instanceButton: IButton = this._buttonService.getInstance(buttonInteraction.customId);
				await instanceButton.executeInteraction(buttonInteraction);
			}
		}
		catch (error) {
			const baseInteraction = interaction as BaseCommandInteraction;
			this._logService.error(error);
			await baseInteraction.reply({ content: "Oups ! Une erreur s'est produite, veuillez avertir un admin" + error.message ? ` : ${error.message}` : "", ephemeral: true });
		}
		finally {
			this.unlockUser(guildMember.id);
		}
	}

	/**
	 * Vérifie si un utilisateur est verrouillé
	 * @param userSnowflake
	 */
	private userIsLocked(userSnowflake: Snowflake): boolean {
		return this._lockInteraction.includes(userSnowflake);
	}

	/**
	 * Verrouille l'utilisateur
	 * @param userSnowflake
	 * @private
	 */
	private lockUser(userSnowflake: Snowflake): void {
		this._lockInteraction.push(userSnowflake);
	}

	/**
	 * Déverrouille l'utilisateur
	 * @param userSnowflake
	 * @private
	 */
	private unlockUser(userSnowflake: Snowflake): void {
		if (this.userIsLocked(userSnowflake)) {
			const userIndex = this._lockInteraction.indexOf(userSnowflake);
			this._lockInteraction.splice(userIndex, 1);
		}
	}
}
