import { SingletonContext } from "./Context";
import { AdminModel } from "../Models/AdminModel";

export class AdminRepository {
	private readonly table = "admins";

	/**
	 * Récupère les administrateurs du serveur
	 */
	public async getAdminsData(): Promise<AdminModel[]> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table}`);
		connection.release();
		const admins = JSON.parse(JSON.stringify(result[0])) as object[];
		return admins.map((admin) => Object.assign(new AdminModel(), admin));
	}

	/**
	 * Création d'un nouvel administrateur
	 * @param id {string} - Identifiant discord
	 * @param name {string} - Nom utilisateur
	 */
	public async createAdmin(id: string, name: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (discord_id, name) VALUES (?, ?)`, [ id, name ]);
		connection.release();
	}

	/**
	 * Supprime un administrateur
	 * @param id {string} - Identifiant discord
	 */
	public async removeAdmin(id: string): Promise<void> {
		const connection = await SingletonContext.getInstance().getConnection();
		await connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ]);
		connection.release();
	}
}
