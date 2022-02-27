import { CommandInteraction, Message, MessageEmbed, User } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";
import { LogService } from "./LogService";
import { ServicesProvider } from "../ServicesProvider";

export class AdminService {

	private adminRepository: AdminRepository;
	private adminModels: AdminModel[];
	private logService: LogService;

	constructor() {
		this.adminRepository = new AdminRepository();
		this.logService = ServicesProvider.getLogService();
		(async () => {
			await this.updateAdmins();
		})();
	}

	/**
	 * Récupère la liste des administrateurs du serveur en BDD
	 */
	private async getAdminsData(): Promise<AdminModel[]> {
		return await this.adminRepository.getAdminsData();
	}

	/**
	 * Retourne la liste des administrateurs du serveur
	 */
	public getAdmins(): AdminModel[] {
		return this.adminModels;
	}

	/**
	 * Vérifie l'existence d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 */
	public adminIsExist(id: string): boolean {
		return this.adminModels.some(admin => admin.discord_id === id);
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

		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			for (const admin of this.adminModels) {
				const user: User = message.client.users.cache.get(admin.discord_id);
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

		this.logService.info(`Message prive reçu de la part de ${message.author.username} : ${message.content}`);
	}

	/**
	 * Création d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 * @param name {string} - Nom de l'utilisateur
	 */
	public async createAdmin(id: string, name: string): Promise<void> {
		await this.adminRepository.createAdmin(id, name);
		await this.updateAdmins();
	}

	/**
	 * Suppression d'un administrateur
	 * @param id {string} - Identifiant discord de l'utilisateur
	 */
	public async removeAdmin(id: string): Promise<void> {
		await this.adminRepository.removeAdmin(id);
		await this.updateAdmins();
	}

	/**
	 * Mise à jour de la liste des administrateurs en cache
	 * @private
	 */
	private async updateAdmins(): Promise<void> {
		this.adminModels = await this.getAdminsData();
	}

	/**
	 * Envoi la liste des administrateurs en privé à l'émetteur du message
	 * @param commandInteraction
	 */
	public async sendAdminList(commandInteraction: CommandInteraction): Promise<void> {
		const admins: AdminModel[] = this.getAdmins();
		const adminsNames: string[] = admins.map(a => a.name);
		await commandInteraction.editReply({ content: `LISTE DES ADMINISTRATEURS : \n \`\`${adminsNames.join(", ")}\`\`` });
	}
}
