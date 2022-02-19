import { RoleRepository } from "../Dal/RoleRepository";
import { ButtonInteraction, GuildMember, MessageAttachment } from "discord.js";
import { LogService } from "./LogService";
import { Config } from "../Config/Config";
import util from "util";

export class RoleService {

	private _roleRepository: RoleRepository;
	private _logService: LogService;

	constructor() {
		this._roleRepository = new RoleRepository();
		this._logService = new LogService();
	}

	/**
	 * Vérifie la possession du rôle pour l'utilisateur
	 * @param user
	 * @param roleId
	 * @private
	 */
	public userHasRole(roleId: string, user: GuildMember): boolean {
		return user.roles.cache.has(roleId);
	}

	/**
	 * Attribue un rôle au membre de la guild
	 * @param guildMember
	 * @param roleId
	 */
	public async setRole(roleId: string, guildMember: GuildMember): Promise<GuildMember> {
		return await guildMember.roles.add(roleId);
	}

	/**
	 * Supprime un rôle pour le membre de la guild
	 * @param roleId
	 * @param guildMember
	 */
	public async removeRole(roleId: string, guildMember: GuildMember): Promise<GuildMember> {
		return await guildMember.roles.remove(roleId);
	}

	/**
	 * Assigne le rôle de départ pour accéder à la totalité du discord
	 * @param buttonInteraction
	 */
	public async assignStartRole(buttonInteraction: ButtonInteraction): Promise<void> {
		const guildMember = buttonInteraction.member as GuildMember;
		const wait = util.promisify(setTimeout);
		const teleportationImage = new MessageAttachment(Config.imageDir + "/teleportation.gif");
		await buttonInteraction.editReply({ content: "Ok c'est parti ! Accroche ta ceinture ça va secouer :rocket:", files: [ teleportationImage ] });
		await wait(8000);
		await this.setRole(Config.roleStart, guildMember);
		await this.removeRole(Config.roleFrontiere, guildMember);
	}
}
