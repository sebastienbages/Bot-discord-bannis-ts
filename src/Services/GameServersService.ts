import { createSocket } from "dgram";
import { SmartBuffer } from "smart-buffer";
import * as Buffer from "buffer";
import { PlayerModel } from "../Models/PlayerModel";
import fs from "fs/promises";
import date from "date-and-time";

export class GameServersService {
	private readonly _ip = "213.246.45.68";
	private readonly _portMainServer = 27016;

	/** https://developer.valvesoftware.com/wiki/Server_queries#A2S_PLAYER */

	/**
	 * Construis le code dans le buffer
	 * @param code
	 * @private
	 */
	private buildCode(code: string): Buffer {
		return new SmartBuffer()
			.writeInt32BE(-1)
			.writeString(code)
			.writeInt32BE(-1)
			.toBuffer();
	}

	/**
	 * Construis la clé dans le buffer
	 * @param buffer
	 * @private
	 */
	private buildKey(buffer: Buffer): number {
		const reader = SmartBuffer.fromBuffer(buffer);
		reader.readUInt32BE();
		reader.readString(1);
		return reader.readInt32LE();
	}

	/**
	 * Retourne la durée en heure(s), minute(s) et seconde(s)
	 * @param seconds
	 * @private
	 */
	private getTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		seconds %= 3600;
		const minutes = Math.floor(seconds / 60);
		const sec = Math.floor(seconds % 60);
		return hours + "h" + minutes + "min" + sec + "s";
	}

	/**
	 * Construis la liste des joueurs depuis le buffer
	 * @param buffer
	 * @private
	 */
	private buildPlayer(buffer: Buffer): PlayerModel[] {
		const reader = SmartBuffer.fromBuffer(buffer);
		reader.readInt32LE();
		reader.readString(1);
		const numberOfPlayers = reader.readInt8();
		const players = [];

		if (numberOfPlayers === 0) {
			return players;
		}

		for (let i = 0; i < numberOfPlayers; i++) {
			const index = reader.readInt8();
			const name = [];

			// eslint-disable-next-line no-constant-condition
			while (true) {
				const charCode = reader.readInt8();

				if (charCode === 0) {
					break;
				}

				const char = String.fromCharCode(charCode);
				name.push(char);
			}

			const score = reader.readInt32LE();
			const time = reader.readFloatLE();
			players.push(new PlayerModel(index, name.join(""), score, this.getTime(time)));
		}
		reader.clear();
		return players;
	}

	/**
	 * Retourne le message du serveur contenant la clé
	 * @param code
	 * @param port
	 * @private
	 */
	private async getChallenge(code: string, port: number): Promise<number> {
		return new Promise((resolve, reject) => {
			const client = createSocket("udp4");

			client.on("error", err => reject(err));

			client.on("message", msg => {
				client.close();
				return resolve(this.buildKey(msg));
			});

			client.send(this.buildCode(code), port, this._ip);
		});
	}

	/**
	 * Retourne la liste des joueurs connectés au serveur
	 */
	public async getPlayers(): Promise<PlayerModel[]> {
		const key = await this.getChallenge("U", this._portMainServer);

		return new Promise((resolve, reject) => {
			const client = createSocket("udp4");

			client.on("error", err => reject(err));

			client.on("message", msg => {
				client.close();
				return resolve(this.buildPlayer(msg));
			});

			const packet = new SmartBuffer()
				.writeInt32BE(-1)
				.writeString("U")
				.writeInt32LE(key)
				.toBuffer();

			client.send(packet, this._portMainServer, this._ip);
		});
	}

	/**
	 * Créé le fichier avec la liste des joueurs
	 * @param players
	 * @param fileName
	 */
	public async createFile(players: PlayerModel[], fileName: string): Promise<void> {
		let number = 1;
		await fs.appendFile(fileName, `${players.length.toString()} JOUEUR(S) CONNECTE(S)\n`);
		await fs.appendFile(fileName, "(Nom - Temps de connexion)\n\n");
		for (const player of players) {
			await fs.appendFile(fileName, `${number.toString()} - ${player.name} - ${player.duration}\n`);
			number++;
		}
		await fs.appendFile(fileName, `\n${date.format(new Date(), "DD/MM/YYYY HH:mm:ss")}`);
	}
}
