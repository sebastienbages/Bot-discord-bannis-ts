import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { ServiceProvider } from "../src/ServiceProvider";

export class GuildMemberAddEvent {

	constructor() { }

    public async run(member: GuildMember) {
        try {
            console.log(`Détection de l'arrivée du joueur "${member.displayName}"`);

            const roleStart = await ServiceProvider.getRoleService().getStartRole();
			const role = member.guild.roles.cache.find(r => r.id === roleStart.discordId);

			if (role) {
				await member.roles.add(role);
				console.log(`Attribution du role "${role.name}" effectué`);
			}
			else {
				console.log('Echec de l\'attribution du role');
				const adminsId = await ServiceProvider.getAdminService().getAdminsId();
				adminsId.map(id => {
					const admin = member.guild.members.cache.find(user => user.id === id);
					if (admin) {
						admin.send(`Je n'ai pas réussi à attribuer le role d'entrée à \`${member.user.username}\``);
					}
				});
			}

			const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === process.env.CHA_WELCOME) as TextChannel;

			const welcomeEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setThumbnail(member.user.displayAvatarURL())
				.setTitle(`:inbox_tray: ${member.user.username} a rejoins notre communauté`)
				.setDescription('Nous te souhaitons la bienvenue !')
				.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

			await welcomeChannel.send(welcomeEmbed);
			console.log('Traitement de l\'arrivée effectuée');
        } 
        catch (error) {
            throw error;    
        }
    }
}