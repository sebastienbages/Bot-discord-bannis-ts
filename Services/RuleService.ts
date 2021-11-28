import { RoleService } from "./RoleService";
import { Collection, CommandInteraction, Guild, Message, MessageReaction, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { RulesRepository } from "../Dal/RulesRepository";
import { MessageModel } from "../Models/MessageModel";
import { AutoMapper } from "./AutoMapper";
import { LogService } from "./LogService";

export class RuleService {

	private _roleService: RoleService;
	private _rulesRepository: RulesRepository;
	private _serverChoiceMessageId?: string;
	private _logService: LogService;

	public static serveurReactions: string[] = [ "1️⃣", "2️⃣"];

	constructor() {
		this._roleService = new RoleService();
		this._rulesRepository = new RulesRepository();
		this._logService = new LogService();
		(async () => {
			await this.updateServerChoiceMessageId();
		})();
	}

	/**
	 * MAJ du cache de l'ID du message de choix du serveur
	 * @private
	 */
	private async updateServerChoiceMessageId(): Promise<void> {
		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			const messageModel = await this.getMessageServerChoice();
			this._serverChoiceMessageId = messageModel.messageId;
		}
		else {
			this._serverChoiceMessageId = Config.serverChoiceMsg;
		}
	}

	/**
	 * Récupère les informations concernant le message de choix du serveur
	 * @private
	 */
	private async getMessageServerChoice(): Promise<MessageModel> {
		const result: unknown = await this._rulesRepository.getMessageServerChoice();
		return AutoMapper.mapMessageModel(result);
	}

	/**
	 * Ajoute les réactions correspondantes au choix des serveurs sur le dernier message du channel règlements
	 * @param commandInteraction
	 */
	public async addReactForServeurChoice(commandInteraction: CommandInteraction): Promise<void> {
		const lastMessage = await this.getLastMessageInChannel(commandInteraction.guild);

		if (this.reactServeurChoiceExist(lastMessage)) {
			return await commandInteraction.reply({ content: "Une ou plusieurs réactions sont déjà présentes :face_with_monocle:", ephemeral: true, fetchReply: false });
		}

		for (const react of RuleService.serveurReactions) {
			await lastMessage.react(react);
		}

		if (this._serverChoiceMessageId != lastMessage.id) {
			this._serverChoiceMessageId = lastMessage.id;
		}

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			await this._rulesRepository.saveMessageServerChoice(lastMessage.id);
		}

		return await commandInteraction.reply({ content: "J'ai bien ajouté les réactions :mechanical_arm:", ephemeral: true, fetchReply: false });
	}

	/**
	 * Vérifie la présence des réactions concernant le choix des serveurs sur le message
	 * @param message
	 * @private
	 */
	private reactServeurChoiceExist(message: Message): boolean {
		RuleService.serveurReactions.forEach(react => {
			if (message.reactions.cache.has(react)) {
				return true;
			}
		});

		return false;
	}

	/**
	 * Supprime les réactions liées aux choix du serveur sur le message
	 * @param commandInteraction
	 */
	public async removeReactForServeurChoice(commandInteraction: CommandInteraction): Promise<void> {
		const rulesChannel = await commandInteraction.guild.channels.fetch(Config.rulesChannelId) as TextChannel;
		const lastMessage: Message = await rulesChannel.messages.fetch(this._serverChoiceMessageId);
		for (const react of RuleService.serveurReactions) {
			if (lastMessage.reactions.cache.has(react)) {
				const messageReaction: MessageReaction = lastMessage.reactions.cache.find(r => r.emoji.name === react);
				await messageReaction.remove();
			}
		}

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			await this.removeMessageServerChoice();
		}

		return await commandInteraction.reply({ content: "J'ai bien supprimé les réactions :mechanical_arm:", ephemeral: true, fetchReply: false });
	}

	/**
	 * Récupère le dernier message dans le channel dédié au règlement
	 * @private
	 * @param guild
	 */
	private async getLastMessageInChannel(guild: Guild): Promise<Message> {
		const rulesChannel = await guild.channels.fetch(Config.rulesChannelId) as TextChannel;

		if (!rulesChannel) {
			throw new Error("Le channel du règlement est introuvable");
		}

		const channelMessages: Collection<string, Message> = await rulesChannel.messages.fetch();
		const lastMessage: Message = channelMessages.first();

		if (!lastMessage) {
			throw new Error("Il n'y a pas de messages dans le channel");
		}

		return lastMessage;
	}

	/**
	 * Supprime l'enregistrement du message qui possède les réactions correspondantes au choix du serveur
	 * @private
	 */
	private async removeMessageServerChoice(): Promise<void> {
		await this._rulesRepository.removeMessageServerChoice();
		this._serverChoiceMessageId = null;
	}

	/**
	 * Retourne la valeur de l'ID du message de choix du serveur
	 */
	public getServerChoiceMessageId(): string {
		return this._serverChoiceMessageId;
	}
}