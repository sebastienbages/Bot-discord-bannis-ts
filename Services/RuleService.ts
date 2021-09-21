import { RoleService } from "./RoleService";
import { RoleModel } from "../Models/RoleModel";
import { Collection, Guild, Message, RoleManager, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { RulesRepository } from "../Dal/RulesRepository";
import { MessageModel } from "../Models/MessageModel";
import { AutoMapper } from "./AutoMapper";

// noinspection JSIgnoredPromiseFromCall
export class RuleService {

	private _roleService: RoleService;
	private _rulesRepository: RulesRepository;
	private _serverChoiceMessageId: string;

	constructor() {
		this._roleService = new RoleService();
		this._rulesRepository = new RulesRepository();
		this.updateServerChoiceMessageId();
	}

	/**
	 * MAJ du cache de l'ID du message de choix du serveur
	 * @private
	 */
	private async updateServerChoiceMessageId(): Promise<void> {
		const messageModel = await this.getMessageServerChoice();
		this._serverChoiceMessageId = messageModel.messageId;
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
	 * @param roleManager
	 * @param guild
	 * @param message
	 */
	public async addReactForServeurChoice(roleManager: RoleManager, guild: Guild, message: Message): Promise<void> {
		if (!this.serveurRolesExist(roleManager)) {
			throw new Error("Il manque un ou plusieurs rôles correspondants aux différents serveurs");
		}

		const rulesChannel = await message.client.channels.fetch(Config.rulesChannelId) as TextChannel;

		if (!rulesChannel) {
			throw new Error("Le channel du règlement est introuvable");
		}

		const channelMessages: Collection<string, Message> = await rulesChannel.messages.fetch();
		const lastMessage: Message = channelMessages.last();

		if (!lastMessage) {
			throw new Error("Il n'y a pas de messages dans le channel");
		}

		if (lastMessage.reactions.cache.has(RoleService.serveurOneReaction) || lastMessage.reactions.cache.has(RoleService.serveurTwoReaction)) {
			const response = await message.reply("une ou plusieurs réactions sont déjà présentes");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		await lastMessage.react(RoleService.serveurOneReaction);
		await lastMessage.react(RoleService.serveurTwoReaction);

		if (this._serverChoiceMessageId != lastMessage.id) {
			this._serverChoiceMessageId = lastMessage.id;
			await this._rulesRepository.saveMessageServerChoice(lastMessage.id);
		}
	}

	/**
	 * Vérifie la présence des rôles correspondants aux serveurs
	 * @param roleManager
	 * @private
	 */
	private serveurRolesExist(roleManager: RoleManager): boolean {
		const roleModels: RoleModel[] = this._roleService.getServerRoles();

		roleModels.map(r => {
			if (!roleManager.cache.has(r.discordId)) {
				return false;
			}
		});

		return true;
	}
}