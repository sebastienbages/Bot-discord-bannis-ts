import {
	Guild,
	Message,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageEmbed,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { VoteRepository } from "../Dal/VoteRepository";
import { TopServerModel } from "../Models/TopServerModel";
import { MessageModel } from "../Models/MessageModel";
import { TopServerService } from "./TopServerService";
import { AutoMapper } from "./AutoMapper";
import { LogService } from "./LogService";

export class VoteService {

	private _voteRepository: VoteRepository;
	private _topServerService: TopServerService;
	private _messageModel: MessageModel;
	private _logService: LogService;

	constructor() {
		this._voteRepository = new VoteRepository();
		this._topServerService = new TopServerService();
		this._logService = new LogService();
		(async () => {
			await this.updateMessageId();
		})();
	}

	/**
	 * Retourne la configuration du message d'appel aux votes
	 * @private
	 */
	private async getMessage(): Promise<MessageModel> {
		const result: unknown = await this._voteRepository.getMessageVote();
		return AutoMapper.mapMessageModel(result);
	}

	/**
	 * Sauvegarde le message
	 * @param message {Message} - Message discord
	 */
	public async saveMessage(message: Message): Promise<void> {
		await this.deleteLastMessage(this._messageModel, message);
		await this._voteRepository.saveMessage(message.id);
		await this.updateMessageId();
	}

	/**
	 * Supprime le dernier message
	 * @param voteModel {MessageModel} - Configuration du message des votes
	 * @param message {Message} - Message à supprimer
	 * @private
	 */
	private async deleteLastMessage(voteModel: MessageModel, message: Message): Promise<void> {
		const channel = message.channel as TextChannel;

		if (channel) {
			const targetMessage: Message = await channel.messages.fetch(this._messageModel.messageId);
			if (targetMessage) {
				await targetMessage.delete();
			}
		}
	}

	/**
	 * Envoi le message d'appel aux votes
	 */
	public async sendMessage(guild: Guild): Promise<void> {
		const topServerModel: TopServerModel = await this._topServerService.getSlugTopServer();
		const numberOfVotes: number = await this._topServerService.getNumberOfVotes();
		const topServeurUrl: string = "https://top-serveurs.net/conan-exiles/vote/" + topServerModel.slug;

		const logo = new MessageAttachment("./Assets/logo-topserver.png");
		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("SUPPORTEZ NOTRE COMMUNAUTE")
			.setURL(topServeurUrl)
			.setThumbnail("attachment://logo-topserver.png")
			.setDescription("N'hésitez pas à donner un coup de pouce au serveur en votant sur Top Serveurs. Merci pour votre soutien :thumbsup:")
			.setFooter(`Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci`);

		const components = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setStyle("LINK")
					.setLabel("LIEN TOP SERVEURS")
					.setEmoji("🔗")
					.setURL(topServeurUrl)
			);

		const voteChannel = guild.channels.cache.get(Config.voteChannelId) as TextChannel;

		if (voteChannel) {
			const voteMessage = await voteChannel.send({ embeds: [ messageEmbed ], files: [ logo ], components: [ components ] });

			if (Config.nodeEnv === Config.nodeEnvValues.production) {
				await this.saveMessage(voteMessage);
			}

			return this._logService.log("Message des votes envoye");
		}
		else {
			throw new Error("Je ne trouve pas la taverne :weary:");
		}
	}

	/**
	 * MAJ du cache contenant les informations du dernier message
	 * @private
	 */
	private async updateMessageId(): Promise<void> {
		this._messageModel = await this.getMessage();
	}
}
