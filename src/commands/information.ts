import { EmbedBuilder } from '@oceanicjs/builders';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes, ButtonStyles, ComponentTypes } from 'oceanic.js';
import { client } from '../client/client.js';
import { CreateCommand } from '../cmd/command.js';
import ms from 'ms';
import config, { isCanary } from '../config/config.js';
import constants from '../utils/constants.js';
import { GlobalStatistics, GlobalStatsModel } from '../database/schemas/statistics.js';
import os from 'node:os';

export default CreateCommand({
	trigger: 'information',
	description: 'View information about the bot and its services',
	type: ApplicationCommandTypes.CHAT_INPUT,
	register: isCanary ? 'guild' : 'global',
	requiredBotPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
	requiredUserPermissions: ['SEND_MESSAGES'],
	options: (opts) => {
		opts.addOption('option', ApplicationCommandOptionTypes.STRING, (option) => {
			option
				.setName('type')
				.setDescription('The type of statistics to show')
				.addChoice('Bot', 'bot')
				.addChoice('Company', 'company')
				.setRequired(true);
		}).setDMPermission(false);
	},
	run: async (instance, interaction) => {
		const type = interaction.data.options.getStringOption('type', true);

		let embed = new EmbedBuilder();

		if (type.value === 'company') {
			embed.setTitle('Company Statistics');
			embed.setDescription('About the developers of Whisper Room');
			embed.addField('Us', constants.strings.commands.info.company.bio, true);
			embed.addField('Bot', constants.strings.commands.info.bot.bio, true);
			embed.setColor(constants.numbers.colors.primary);

			await interaction.createMessage({
				embeds: [embed.toJSON()],
				components: [
					{
						type: ComponentTypes.ACTION_ROW,
						components: [
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Invite Bot',
								url: config.BotClientOAuth2Url
							},
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Code Repository',
								url: config.GithubRepository
							},
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Website',
								url: config.whisper_room.url
							}
						]
					}
				]
			});
		} else if (type.value === 'bot') {
			let statusCode = instance.database.network_status();
			const global = (await GlobalStatsModel.findOne({ id: 'global' })) as GlobalStatistics;

			embed.setTitle('Bot Statistics');
			embed.setDescription('Displaying current data below');
			embed.setColor(constants.numbers.colors.primary);

			// Get the CPU usage
			const cpuUsage = process.cpuUsage();

			// Calculate the CPU usage in percentage
			const cpuUsageInPercent = (cpuUsage.user + cpuUsage.system) / os.cpus().length / 1000;

			// Get the memory usage
			const memoryUsage = process.memoryUsage();

			// Calculate the memory usage in percentage
			const totalMemory = os.totalmem();
			const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
			const memoryUsageInPercent = (usedMemory / totalMemory) * 100;

			embed.addField('CPU Usage', `${cpuUsageInPercent}`, true);
			embed.addField('Memory Usage', `${memoryUsageInPercent}`, true);

			embed.addField('Uptime', ms(client.uptime, { long: true }), true);

			embed.addField('Guilds Cached', `${client.guilds.size}`, true);
			embed.addField('Guilds Joined', `${global.guilds_joined}`, true);
			embed.addField('Guilds Left', `${global.guilds_left}`, true);

			embed.addField('Users Cached', `${client.users.size}`, true);

			embed.addField('Discord API Library', `[Oceanic.js-v1.4.0](https://oceanic.ws)`, true);
			embed.addField('Database State', `${statusCode ? 'Online' : 'Offline'}`, true);

			embed.addField('Total Commands', `${instance.collections.commands.commandStoreMap.size}`, true);
			embed.addField('Commands Executed', `${global.commands_executed}`, true);
			embed.addField('Commands Failed', `${global.commands_failed}`, true);

			await interaction.createMessage({
				embeds: [embed.toJSON()],
				components: [
					{
						type: ComponentTypes.ACTION_ROW,
						components: [
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Invite Bot',
								url: config.BotClientOAuth2Url
							},
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Code Repository',
								url: config.GithubRepository
							},
							{
								type: ComponentTypes.BUTTON,
								style: ButtonStyles.LINK,
								label: 'Website',
								url: config.whisper_room.url
							}
						]
					}
				]
			});
		}
	}
});
