import { Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";
import { AutoMapper } from "./AutoMapper";

// noinspection JSIgnoredPromiseFromCall
export class AdminService {

	private _adminRepository: AdminRepository;
	private _admins: AdminModel[];

	constructor() {
		this._adminRepository = new AdminRepository();
		this.updateAdmins();
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
	public async adminIsExist(id: string): Promise<boolean> {
		let result = false;
		this._admins.forEach(admin => {
			if (admin.discordId === id) result = true;
		});
		return result;
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

		this._admins.map(admin => {
			const user = message.client.users.cache.find(a => a.id === admin.discordId);
			if (user) {
				user.send(messageEmbed);
			}
		});
	}

	/**
	 * Création d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 * @param name {string} - Nom de l'utilisateur
	 */
	public async createAdmin(id: string, name: string): Promise<void> {
		await this._adminRepository.createAdmin(id, name);
		await this.updateAdmins();
	}

	/**
	 * Suppression d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 */
	public async removeAdmin(id: string): Promise<void> {
		await this._adminRepository.removeAdmin(id);
		await this.updateAdmins();
	}

	/**
	 * Mise à jour de la liste des administrateurs en cache
	 * @private
	 */
	private async updateAdmins(): Promise<void> {
		this._admins = await this.getAdminsData();
	}
}