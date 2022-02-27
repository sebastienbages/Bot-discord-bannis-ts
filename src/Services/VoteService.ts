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
import { MessageModel } from "../Models/MessageModel";
import { TopServerService } from "./TopServerService";
import { LogService } from "./LogService";
import { ServicesProvider } from "../ServicesProvider";
import { AppError } from "../Error/AppError";

export class VoteService {

	private voteRepository: VoteRepository;
	private topServerService: TopServerService;
	private logService: LogService;

	constructor() {
		this.voteRepository = new VoteRepository();
		this.topServerService = ServicesProvider.getTopServerService();
		this.logService = ServicesProvider.getLogService();
	}

	/**
	 * Retourne la configuration du message d'appel aux votes
	 * @private
	 */
	private async getMessage(): Promise<MessageModel> {
		return await this.voteRepository.getMessageVote();
	}

	/**
	 * Sauvegarde le message
	 * @param message {Message} - Message discord
	 */
	private async saveMessage(message: Message): Promise<void> {
		const lastMessage = await this.getMessage();
		await this.deleteLastMessage(lastMessage, message.channel as TextChannel);
		await this.voteRepository.saveMessage(message.id);
	}

	/**
	 * Supprime le dernier message
	 * @param message
	 * @param channel
	 * @private
	 */
	private async deleteLastMessage(message: MessageModel, channel: TextChannel): Promise<void> {
		const targetMessage = channel.messages.cache.get(message.message_id)
				|| await channel.messages.fetch(message.message_id);

		if (!targetMessage) {
			throw new AppError("deleteMessageVote", "Dernier message des votes introuvable");
		}

		await targetMessage.delete();
	}

	/**
	 * Envoi le message d'appel aux votes
	 */
	public async sendMessage(guild: Guild, interaction = true): Promise<void> {
		try {
			const topServerInfos = await this.topServerService.getSlugTopServer();
			const numberOfVotes: number = await this.topServerService.getNumberOfVotes();
			const topServeurUrl: string = "https://top-serveurs.net/conan-exiles/vote/" + topServerInfos.server.slug;

			const logo = new MessageAttachment(Config.imageDir + "/logo-topserver.png");
			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle("SUPPORTEZ NOTRE COMMUNAUTE")
				.setURL(topServeurUrl)
				.setThumbnail("attachment://logo-topserver.png")
				.setDescription("N'hésitez pas à donner un coup de pouce au serveur en votant sur Top Serveurs. Merci pour votre soutien :thumbsup:")
				.setFooter({ text: `Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci` });

			const components = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setStyle("LINK")
						.setLabel("LIEN TOP SERVEURS")
						.setEmoji("🔗")
						.setURL(topServeurUrl)
				);

			const voteChannel = guild.channels.cache.get(Config.voteChannelId) as TextChannel
				|| await guild.channels.fetch(Config.voteChannelId) as TextChannel;

			if (!voteChannel) {
				throw new AppError("voteChannel", "Je ne trouve pas le channel textuel pour le message des votes");
			}

			const voteMessage = await voteChannel.send({ embeds: [ messageEmbed ], files: [ logo ], components: [ components ] });

			if (Config.nodeEnv === Config.nodeEnvValues.production) {
				await this.saveMessage(voteMessage);
			}

			return this.logService.info("Message des votes envoye");
		}
		catch (error) {
			if (interaction) {
				throw error;
			}

			await this.logService.handlerAppError(error, guild.client);
		}
	}
}
