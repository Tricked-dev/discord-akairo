class AkairoMessage {
	/**
	 *
	 * @param {AkairoClient} client - AkairoClient
	 * @param {CommandInteraction} interaction - CommandInteraction
	 * @param {boolean} param2 - any
	 */
	constructor(client, interaction, { slash, replied }) {
		this.author = interaction.user;
		this.channel = interaction.channel;
		this.client = client;
		this.content = `/${interaction.commandName}`;
		this.createdAt = interaction.createdAt;
		this.createdTimestamp = interaction.createdTimestamp;
		this.guild = interaction.guild;
		this.id = interaction.id;
		this.interaction = interaction;
		this.member = interaction.member;
		this.replied = replied;
		this.util = { parsed: { slash } };
		for (const option of interaction.options.values()) {
			if (option.member) {
				this.content += ` ${option.name}: ${option.member}`;
			} else if (option.channel) {
				this.content += ` ${option.name}: ${option.channel}`;
			} else if (option.role) {
				this.content += ` ${option.name}: ${option.role}`;
			} else {
				this.content += ` ${option.name}: ${option.value}`;
			}
		}
	}

	/**
	 * Replies or edits the reply of the slash command.
	 * @param {string | InteractionReplyOptions} options The options to edit the reply.
	 * @returns {Promise<void>}
	 */
	reply(options) {
		return this.util.reply(options);
	}

	/**
	 * Deletes the reply to the command.
	 * @returns {Promise<void>}
	 */
	delete() {
		return this.interaction.deleteReply();
	}
}
module.exports = AkairoMessage;
