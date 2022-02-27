import { SingletonContext } from "./Context";
import { RoleModel } from "../Models/RoleModel";

export class RoleRepository {
	private table = "roles";

	/**
	 * Retourne-les roles autorisé pour l'administration des tickets
	 */
	public async getTicketRoles(): Promise<RoleModel[]> {
		const connection = await SingletonContext.getInstance().getConnection();
		const result = await connection.query(`SELECT role_id FROM f1mtb0ah6rjbwawm.${this.table} WHERE ticket = "1"`);
		connection.release();
		const roles = JSON.parse(JSON.stringify(result[0])) as object[];
		return roles.map((role) => Object.assign(new RoleModel(), role));
	}
}
