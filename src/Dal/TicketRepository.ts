import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

// noinspection SpellCheckingInspection
export class TicketRepository {
	private readonly table = "tickets";

	/**
	 * Sauvegarde un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicket(userId: string, number: number): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (userid, number) VALUES (?, ?)`, [ userId, number ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Récupère un ticket selon son numéro
	 * @param number {number} - Numéro du ticket
	 */
	public async getTicketByNumber(number: number): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE number = ?`, [ number ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Récupère un ticket selon l'utilisateur
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async getTicketByUserId(userId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE userid = ?`, [ userId ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Clotûre un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async closeTicket(userId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "1" WHERE (userid = ?)`, [ userId ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Ouvre un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async openTicket(userId: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "0" WHERE (userid = ?)`, [ userId ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Supprime un ticket
	 * @param number {number} - Numéro du ticket
	 */
	public async deleteTicket(number: number): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (number = ?)`, [ number ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}
}