import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

export class RoleRepository {

	private readonly table = "roles";

	public async getStartRole(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT role_id FROM f1mtb0ah6rjbwawm.${this.table} WHERE name = "start"`, (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}

	public async getTicketRoles(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT role_id FROM f1mtb0ah6rjbwawm.${this.table} WHERE ticket = "1"`, (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}
}