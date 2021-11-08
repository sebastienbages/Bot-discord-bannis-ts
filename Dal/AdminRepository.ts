import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

// noinspection SpellCheckingInspection
export class AdminRepository {
	private readonly table = "admins";

	/**
	 * Recupère les administrateurs du serveur
	 */
	public async getAdminsData(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table}`, (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Création d'un nouvel administrateur
	 * @param id {string} - Identifiant discord
	 * @param name {string} - Nom utilisateur
	 */
	public async createAdmin(id: string, name: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (discord_id, name) VALUES (?, ?)`, [ id, name ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}

	/**
	 * Supprime un administrateur
	 * @param id {string} - Identifiant discord
	 */
	public async removeAdmin(id: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ], (error: MysqlError | null, result: unknown) => {
				connection.release();
				if (error) return rejects(error);
				return resolve(result);
			});
		});
	}
}