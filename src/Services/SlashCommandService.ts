import { CommandOptions, ISlashCommand, SubCommandOptions } from "../Interfaces/ISlashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
	ApplicationCommandOptionType,
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { Config } from "../Config/Config";
import { SurveyCommand } from "../Interactions/Commands/SurveyCommand";
import { AdminCommand } from "../Interactions/Commands/AdminCommand";
import { TicketCommand } from "../Interactions/Commands/TicketCommand";
import { VoteCommand } from "../Interactions/Commands/VoteCommand";
import { RoleCommand } from "../Interactions/Commands/RoleCommand";
import { ClearCommand } from "../Interactions/Commands/ClearCommand";
import { SayCommand } from "../Interactions/Commands/SayCommand";
import { SayPrivCommand } from "../Interactions/Commands/SayPrivCommand";
import { RestartCommand } from "../Interactions/Commands/RestartCommand";
import { TopServerCommand } from "../Interactions/Commands/TopServerCommand";
import { RuleCommand } from "../Interactions/Commands/RuleCommand";
import { GameServersCommand } from "../Interactions/Commands/GameServersCommand";
import { Client, Collection, GuildApplicationCommandPermissionData } from "discord.js";
import { LogCommand } from "../Interactions/Commands/LogCommand";

export class SlashCommandService {
	/**
	 * Liste des commandes à enregistrer
	 * @private
	 */
	private readonly commands = [
		SurveyCommand,
		AdminCommand,
		TicketCommand,
		VoteCommand,
		RoleCommand,
		ClearCommand,
		SayCommand,
		SayPrivCommand,
		RestartCommand,
		TopServerCommand,
		RuleCommand,
		GameServersCommand,
		LogCommand,
	];

	private commandsInstances: Collection<string, ISlashCommand>;

	constructor() {
		this.commandsInstances = new Collection<string, ISlashCommand>();
		this.commands.forEach(commandClass => {
			const instance = new commandClass();
			this.commandsInstances.set(instance.name, instance);
		});
	}

	/**
	 * Enregistre les slashs commandes dans l'application
	 */
	public async registerSlashCommand(): Promise<void> {
		const rest = new REST({ version: "9" }).setToken(Config.token);
		await rest.put(
			Routes.applicationGuildCommands(Config.applicationId, Config.guildId),
			{ body: this.getSlashCommandsToJson() },
		);
	}

	/**
	 * Retourne le build des slashs commandes au format JSON
	 * @private
	 */
	private getSlashCommandsToJson(): RESTPostAPIApplicationCommandsJSONBody[] {
		const slashCommandBuilders = this.buildSlashCommands();
		return slashCommandBuilders.map(cmd => cmd.toJSON());
	}

	/**
	 * Fabrique les slashs commandes de l'application
	 * @private
	 */
	private buildSlashCommands(): SlashCommandBuilder[] {
		const commands = [];
		this.commandsInstances.forEach((cmd) => {
			const slashCommand = new SlashCommandBuilder()
				.setName(cmd.name)
				.setDescription(cmd.description)
				.setDefaultPermission(false);

			if (cmd.commandOptions.length > 0) {
				this.buildCommandOptions(slashCommand, cmd.commandOptions);
			}

			if (cmd.subCommandsOptions.length > 0) {
				this.buildSubCommands(slashCommand, cmd.subCommandsOptions);
			}

			commands.push(slashCommand);
		});

		return commands;
	}

	/**
	 * Fabrique les options d'une commande slash
	 * @param slashCommand
	 * @param commandsOptions
	 * @private
	 */
	private buildCommandOptions(slashCommand: SlashCommandBuilder, commandsOptions: CommandOptions[]): void {
		for (const opt of commandsOptions) {
			if (opt.type === ApplicationCommandOptionType.String && opt.choices) {
				slashCommand.addStringOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
						.addChoices(opt.choices)
				);
				continue;
			}

			if (opt.type === ApplicationCommandOptionType.String) {
				slashCommand.addStringOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
				);
				continue;
			}

			if (opt.type === ApplicationCommandOptionType.User) {
				slashCommand.addUserOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
				);
				continue;
			}

			if (opt.type === ApplicationCommandOptionType.Role) {
				slashCommand.addRoleOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
				);
				continue;
			}

			if (opt.type === ApplicationCommandOptionType.Number) {
				slashCommand.addNumberOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
				);
				continue;
			}

			if (opt.type === ApplicationCommandOptionType.Channel) {
				slashCommand.addChannelOption(option =>
					option.setName(opt.name)
						.setDescription(opt.description)
						.setRequired(opt.isRequired)
				);
			}
		}
	}

	/**
	 * Fabrique-les sous commandes dans une commande slash
	 * @param slashCommand
	 * @param subCommandsOptions
	 * @private
	 */
	private buildSubCommands(slashCommand: SlashCommandBuilder, subCommandsOptions: SubCommandOptions[]) {
		for (const sco of subCommandsOptions) {
			if (!sco.option) {
				slashCommand.addSubcommand(subCommand =>
					subCommand
						.setName(sco.name)
						.setDescription(sco.description)
				);
				continue;
			}

			if (sco.option.type === ApplicationCommandOptionType.User) {
				slashCommand.addSubcommand(subCommand =>
					subCommand
						.setName(sco.name)
						.setDescription(sco.description)
						.addUserOption(option =>
							option
								.setName(sco.option.name)
								.setDescription(sco.option.description)
								.setRequired(sco.option.isRequired)
						)
				);
				continue;
			}

			if (sco.option.type === ApplicationCommandOptionType.String) {
				slashCommand.addSubcommand(subCommand =>
					subCommand
						.setName(sco.name)
						.setDescription(sco.description)
						.addStringOption(option =>
							option
								.setName(sco.option.name)
								.setDescription(sco.option.description)
								.setRequired(sco.option.isRequired)
						)
				);
				continue;
			}

			if (sco.option.type === ApplicationCommandOptionType.Channel) {
				slashCommand.addSubcommand(subCommand =>
					subCommand
						.setName(sco.name)
						.setDescription(sco.description)
						.addChannelOption(option =>
							option
								.setName(sco.option.name)
								.setDescription(sco.option.description)
								.setRequired(sco.option.isRequired)
						)
				);
			}
		}
	}

	/**
	 * Autorise les commandes de l'application au rôle mentionné
	 * @param roleId
	 * @param client
	 */
	public async setCommandsPermission(roleId: string, client: Client): Promise<void> {
		const guild = await client.guilds.fetch(Config.guildId);
		const guildCommands = await guild.commands.fetch();
		const botCommands = guildCommands.filter((cmd) => cmd.applicationId === Config.applicationId);
		const permissions = [];

		botCommands.forEach((cmd, key) => {
			const permission: GuildApplicationCommandPermissionData = {
				id: key,
				permissions: [{
					id: roleId,
					type: "ROLE",
					permission: true,
				}],
			};
			permissions.push(permission);
		});

		await guild.commands.permissions.set({ fullPermissions: permissions });
	}

	/**
	 * Retourne la commande
	 * @param name
	 */
	public getInstance(name: string): ISlashCommand {
		return this.commandsInstances.get(name);
	}
}
