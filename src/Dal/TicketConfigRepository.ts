import { SingletonContext } from "./Context";
import { TicketConfig } from "../Models/TicketConfigModel";

export class TicketConfigRepository {
	private table = "ticketconfig";

	/**
	 * Retourne la configuration du gestionnaire des tickets
	 */
	public async getConfigData(): Promise<TicketConfig> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE (id = 1)`);
		connection.release();
		return Object.assign(new TicketConfig(), result[0][0]);
	}

	/**
	 * Sauvegarde le numéro du ticket dans la configuration
	 * @param number {number} - Numéro du ticket
	 */
	public async saveTicketConfigNumber(number: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET last_number = ? WHERE (id = 1)`, [ number ]);
		connection.release();
	}
}
