import { SingletonContext } from "./Context";
import { TicketModel } from "../Models/TicketModel";

export class TicketRepository {
	private readonly table = "tickets";

	/**
	 * Sauvegarde un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicket(userId: string, number: number): Promise<TicketModel> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (userid, number) VALUES (?, ?)`, [ userId, number ]);
		connection.release();
		return Object.assign(new TicketModel(), result[0][0]);
	}

	/**
	 * Récupère un ticket selon son numéro
	 * @param number {number} - Numéro du ticket
	 */
	public async getTicketByNumber(number: number): Promise<TicketModel> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE number = ?`, [ number ]);
		connection.release();
		return Object.assign(new TicketModel(), result[0][0]);
	}

	/**
	 * Récupère un ticket selon l'utilisateur
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async getTicketByUserId(userId: string): Promise<TicketModel> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE userid = ?`, [ userId ]);
		connection.release();
		return Object.assign(new TicketModel(), result[0][0]);
	}

	/**
	 * Cloture un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async closeTicket(userId: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "1" WHERE (userid = ?)`, [ userId ]);
		connection.release();
	}

	/**
	 * Ouvre un ticket
	 * @param userId {string} - Identifiant discord de l'utilisateur
	 */
	public async openTicket(userId: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "0" WHERE (userid = ?)`, [ userId ]);
		connection.release();
	}

	/**
	 * Supprime un ticket
	 * @param number {number} - Numéro du ticket
	 */
	public async deleteTicket(number: number): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (number = ?)`, [ number ]);
		connection.release();
	}
}
