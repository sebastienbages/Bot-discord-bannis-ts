import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

// noinspection SpellCheckingInspection
export class TicketConfigRepository {
	private readonly table = "ticketconfig";

	/**
	 * Retourne la configuration du gestionnaire des tickets
	 */
	public async getConfigData(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE (id = 1)`, (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Sauvegarde le message de création des tickets
	 * @param messageId {string} - Identifiant discord du message
	 */
	public async saveTicketConfigMessageId(messageId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET message_id = ? WHERE (id = 1)`, [ messageId ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Sauvegarde le numéro du ticket dans la configuration
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicketConfigNumber(number: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET last_number = ? WHERE (id = 1)`, [ number ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}
}