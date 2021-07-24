// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoClient")} AkairoClient
 * @typedef {import("../AkairoHandler").AkairoHandlerOptions} AkairoHandlerOptions
 */

const AkairoError = require("../../util/AkairoError");
const AkairoHandler = require("../AkairoHandler");
const Task = require("./Task");

/**
 * Loads tasks.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class TaskHandler extends AkairoHandler {
	/**
	 * @param {AkairoClient} client - The Akairo client.
	 * @param {AkairoHandlerOptions} options - Options.
	 */
	constructor(
		client,
		{
			directory,
			classToHandle = Task,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = {}
	) {
		if (!(classToHandle.prototype instanceof Task || classToHandle === Task)) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Task.name
			);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});
	}

	startAll() {
		this.client.on("ready", () => {
			this.modules.forEach(module => {
				if (!(module instanceof Task)) return;
				if (module.runOnStart) module.exec();
				if (module.delay) {
					setInterval(() => {
						module.exec();
					}, Number(module.delay));
				}
			});
		});
	}
}
module.exports = TaskHandler;
