import Mysql, { Pool, PoolConnection } from "mysql2/promise";

class Context {
	private pool: Pool;

	constructor() {
		this.pool = Mysql.createPool({
			connectionLimit: 10,
			host: process.env.BDD_HOST,
			user: process.env.BDD_USERNAME,
			password: process.env.BDD_PASS,
			database: process.env.BDD_DATABASE,
		});
	}

	/**
	 * Retourne une connexion du Pool
	 */
	public async getConnection(): Promise<PoolConnection> {
		return await this.pool.getConnection();
	}
}

export class SingletonContext {
	private static context: Context;

	public static getInstance(): Context {
		if (!SingletonContext.context) {
			SingletonContext.context = new Context();
		}

		return SingletonContext.context;
	}
}
