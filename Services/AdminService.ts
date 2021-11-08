import { Message, MessageEmbed, User } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";
import { AutoMapper } from "./AutoMapper";
import { LogService } from "./LogService";

// noinspection JSIgnoredPromiseFromCall
export class AdminService {

	private _adminRepository: AdminRepository;
	private _admins: AdminModel[];
	private _logService: LogService;

	constructor() {
		this._adminRepository = new AdminRepository();
		this._logService = new LogService();
		(async () => {
			await this.updateAdmins();
		})();
	}

	/**
	 * Récupère la liste des administrateurs du serveur en BDD
	 */
	private async getAdminsData(): Promise<AdminModel[]> {
		const results: unknown = await this._adminRepository.getAdminsData();
		return AutoMapper.mapArrayAdminModel(results);
	}

	/**
	 * Retourne la liste des administrateurs du serveur
	 */
	public getAdmins(): AdminModel[] {
		return this._admins;
	}

	/**
	 * Vérifie l'existence d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 */
	public adminIsExist(id: string): boolean {
		return this._admins.some(admin => admin.discordId === id);
	}

	/**
	 * Transfert les messages privé reçu par le bot à l'ensemble des administrateurs
	 * @param message {Message} - Message discord
	 */
	public async transfertPrivateMessage(message: Message): Promise<void> {
		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("MESSAGE PRIVE RECU")
			.setThumbnail(message.author.displayAvatarURL())
			.addField("AUTEUR", message.author.username)
			.addField("MESSAGE", message.content)
			.setTimestamp();

		if (Config.nodeEnv === "production") {
			for (const admin of this._admins) {
				const user: User = message.client.users.cache.get(admin.discordId);
				if (user) {
					await user.send({ embeds: [ messageEmbed ] });
				}
			}
		}
		else {
			const user: User = message.client.users.cache.get(Config.devId);
			if (user) {
				await user.send({ embeds: [ messageEmbed ] });
			}
		}

		this._logService.log(`Message privé reçu de la part de ${message.author.username} : ${message.content}`);
	}

	/**
	 * Création d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 * @param name {string} - Nom de l'utilisateur
	 */
	public async createAdmin(id: string, name: string): Promise<void> {
		await this._adminRepository.createAdmin(id, name);
		await this.updateAdmins();
		this._logService.log(`Nouvel administrateur créé : ${name} (${id})`);
	}

	/**
	 * Suppression d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 */
	public async removeAdmin(id: string): Promise<void> {
		const admin: AdminModel = this._admins.find(a => a.discordId === id);
		await this._adminRepository.removeAdmin(id);
		await this.updateAdmins();
		this._logService.log(`Administrateur supprimé : ${admin.name} (${admin.discordId})`);
	}

	/**
	 * Mise à jour de la liste des administrateurs en cache
	 * @private
	 */
	private async updateAdmins(): Promise<void> {
		this._admins = await this.getAdminsData();
	}

	/**
	 * Envoi la liste des administrateurs en privé à l'émetteur du message
	 * @param message
	 */
	public async sendAdminList(message: Message): Promise<void> {
		const admins: AdminModel[] = this.getAdmins();
		const adminsNames: string[] = [];
		admins.forEach(admin => adminsNames.push(admin.name));
		const data: string[] = [];
		data.push("__LISTE DES ADMINISTRATEURS :__");
		data.push(`\`${adminsNames.join(", ")}\``);
		for (const element of data) {
			await message.author.send(element);
		}
	}
}