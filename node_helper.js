/* MagicMirror² Module: MMM-Astro
 * By cowboysdude
 *
 * Gets the daily (and weekly) horoscope from freehoroscopeapi.com.
 * No API key and no npm install needed (uses the fetch built into Node 18+).
 */
const NodeHelper = require("node_helper");
const Log = require("logger");

const API = "https://freehoroscopeapi.com/api/v1/get-horoscope";

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
		this.cache = {}; // "pisces|daily" -> { day, data }
	},

	today () {
		const d = new Date();
		return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
	},

	async get (sign, period) {
		const key = `${sign}|${period}`;
		const hit = this.cache[key];
		if (hit && hit.day === this.today()) return hit.data;

		const res = await fetch(`${API}/${period}?sign=${encodeURIComponent(sign)}`, {
			headers: { "User-Agent": "MagicMirror MMM-Astro" },
			signal: AbortSignal.timeout(15000)
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		const data = json && json.data;
		if (!data || !data.horoscope) throw new Error("No horoscope in the answer");
		this.cache[key] = { day: this.today(), data };
		return data;
	},

	async socketNotificationReceived (notification, payload) {
		if (notification !== "ASTRO_GET") return;
		const { id, sign, weekly } = payload;
		try {
			const daily = await this.get(sign, "daily");
			let week = null;
			if (weekly) {
				try {
					week = await this.get(sign, "weekly");
				} catch (e) {
					Log.warn(`[MMM-Astro] Weekly horoscope not available: ${e.message}`);
				}
			}
			this.sendSocketNotification("ASTRO_DATA", { id, daily, weekly: week });
		} catch (e) {
			Log.error(`[MMM-Astro] Could not get the horoscope for ${sign}: ${e.message}`);
			this.sendSocketNotification("ASTRO_ERROR", { id, message: e.message });
		}
	}
});
