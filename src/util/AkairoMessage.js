class AkairoMessage {
	/**
	 *
	 * @param {AkairoClient} client - AkairoClient
	 * @param {CommandInteraction} interaction - CommandInteraction
	 * @param {boolean} param2 - any
	 */
	constructor(client, interaction, { slash, replied }) {
		this.interaction = interaction;
		this._message = null;
		this.channel = interaction.channel;
		this.guild = interaction.guild;
		this.member = interaction.member;
		this.author = interaction.user;
		this.replied = replied;
		this.client = client;
		this.content = `/${interaction.commandName}`;
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
		this.util = { parsed: { slash } };
		this.id = interaction.id;
		this.createdAt = interaction.createdAt;
		this.createdTimestamp = interaction.createdTimestamp;
	}

	/**
	 * Replies or edits the reply of the slash command.
	 * @param {...any} options a
	 * @returns {Promise<void>} a
	 */
	async reply(...options) {
		if (options[0].embed) {
			options[0].embeds = [options[0].embed];
			delete options[0].embed;
			delete options[0].allowedMentions;
		}
		if (this._message) {
			return this._message.edit(...options);
		}
		if (this.replied) {
			await this.interaction.editReply(options[0], options[1]);
			this._message = await this.interaction.fetchReply();
			return this._message;
		}
		this.interaction.reply(...options);
		this._message = await this.interaction.fetchReply();
		return this._message;
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
