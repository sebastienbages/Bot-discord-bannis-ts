import { RoleService } from "./RoleService";
import { Collection, Message, MessageReaction, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { RulesRepository } from "../Dal/RulesRepository";
import { MessageModel } from "../Models/MessageModel";
import { AutoMapper } from "./AutoMapper";
import { LogService } from "./LogService";
import { DiscordHelper } from "../Helper/DiscordHelper";

// noinspection JSIgnoredPromiseFromCall
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
		if (Config.nodeEnv === "production") {
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
	 * @param message
	 */
	public async addReactForServeurChoice(message: Message): Promise<void> {
		const lastMessage = await this.getLastMessageInChannel(message);

		if (this.reactServeurChoiceExist(lastMessage)) {
			const response = await DiscordHelper.replyToMessageAuthor(message, "Une ou plusieurs réactions sont déjà présentes");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		for (const react of RuleService.serveurReactions) {
			await lastMessage.react(react);
		}

		if (this._serverChoiceMessageId != lastMessage.id) {
			this._serverChoiceMessageId = lastMessage.id;
			await this._rulesRepository.saveMessageServerChoice(lastMessage.id);
		}
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
	 * @param message
	 */
	public async removeReactForServeurChoice(message: Message): Promise<void> {
		const lastMessage: Message = await message.channel.messages.fetch(this._serverChoiceMessageId);
		for (const react of RuleService.serveurReactions) {
			if (lastMessage.reactions.cache.has(react)) {
				const messageReaction: MessageReaction = lastMessage.reactions.cache.find(r => r.emoji.name === react);
				await messageReaction.remove();
				await this.removeMessageServerChoice();
			}
		}
	}

	/**
	 * Récupère le dernier message dans le channel dédié au règlement
	 * @param message
	 * @private
	 */
	private async getLastMessageInChannel(message: Message): Promise<Message> {
		const rulesChannel = await message.client.channels.fetch(Config.rulesChannelId) as TextChannel;

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