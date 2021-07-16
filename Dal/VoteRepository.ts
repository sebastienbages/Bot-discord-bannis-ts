import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

// noinspection SpellCheckingInspection
export class VoteRepository {
	private readonly table = "messages";

	/**
	 * Récupère le message d'appel aux votes
	 */
	public async getMessageVote(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE name = "vote"`, (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}

	/**
	 * Sauvegarde le message d'appel aux votes
	 * @param messageId
	 */
	public async saveMessage(messageId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET message_id = ? WHERE (name = "vote")`, [ messageId ], (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}
}