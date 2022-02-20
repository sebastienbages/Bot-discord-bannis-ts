import { SingletonContext } from "./Context";
import { MessageModel } from "../Models/MessageModel";

export class VoteRepository {
	private readonly table = "messages";

	/**
	 * Récupère le message d'appel aux votes
	 */
	public async getMessageVote(): Promise<MessageModel> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE name = "vote"`);
		connection.release();
		return Object.assign(new MessageModel(), result[0][0]);
	}

	/**
	 * Sauvegarde le message d'appel aux votes
	 * @param messageId
	 */
	public async saveMessage(messageId: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET message_id = ? WHERE (name = "vote")`, [ messageId ]);
		connection.release();
	}
}
