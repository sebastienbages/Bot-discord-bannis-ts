import { GuildMember, Message } from "discord.js";

export class DiscordHelper {

	/**
	 * Retourne le membre selon la mention contenue dans le message
	 * @param message
	 */
	static async getUserByMention(message: Message): Promise<GuildMember> {
		if (message.mentions) {
			return await message.guild.members.fetch(message.mentions.users.first());
		}
	}

	/**
	 * Répond au message
	 * @param message
	 * @param content
	 * @return Message de réponse
	 */
	static async replyToMessageAuthor(message: Message, content: string): Promise<Message> {
		return await message.channel.send(`<@${message.author.id}>, ${content}`);
	}

	/**
	 * Efface le message après le temps spécifié
	 * @param message
	 * @param ms
	 */
	static deleteMessage(message: Message, ms: number): void {
		setTimeout(() => message.delete(), ms);
	}
}