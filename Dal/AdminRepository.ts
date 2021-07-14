import { MysqlError } from "mysql";
import { SingletonContext } from "./Context";

export class AdminRepository {

	private readonly table = "admins";

	public async getAdminsData(): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table}`, (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}

	public async getAdmin(id: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ], (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}

	public async createAdmin(id: string, name: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (discord_id, name) VALUES (?, ?)`, [ id, name ], (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}

	public async removeAdmin(id: string): Promise<unknown> {
		const connection = await SingletonContext.getInstance().getConnection();
		return new Promise((resolve, rejects) => {
			connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ], (error: MysqlError | null, result: unknown) => {
				if (error) return rejects(error);
				connection.release();
				return resolve(result);
			});
		});
	}
}