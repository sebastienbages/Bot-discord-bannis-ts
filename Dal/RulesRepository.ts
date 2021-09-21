import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

export class RulesRepository {
	private readonly table = "messages";

	/**
	 * Récupère le message de choix des serveurs
	 */
	public async getMessageServerChoice(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE name = "server"`, (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Sauvegarde le message d'appel aux votes
	 * @param messageId
	 */
	public async saveMessageServerChoice(messageId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET message_id = ? WHERE (name = "server")`, [ messageId ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}
}