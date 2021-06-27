import { rejects } from 'assert/strict';
import Mysql, { Pool, PoolConnection } from 'mysql';
import { resolve } from 'path/posix';

class Context {

    private _pool: Pool;

    constructor() {
        this._pool = Mysql.createPool({
            connectionLimit: 10,
			host: process.env.BDD_HOST,
			user: process.env.BDD_USERNAME,
			password: process.env.BDD_PASS,
			database: process.env.BDD_DATABASE,
        });
    }

    public getConnection(): Promise<PoolConnection> {
        return new Promise((resolve, rejects) => {
            this._pool.getConnection((err, connection) => {
                if (err) return rejects(err)
                return resolve(connection)
            });
        });
    }
}

export class SingletonContext {

    private static _instance: Context;

    constructor() { }

    public static getInstance(): Context {
        if (!SingletonContext._instance) {
            SingletonContext._instance = new Context()
        }

        return SingletonContext._instance;
    }
}