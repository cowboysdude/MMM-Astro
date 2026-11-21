/* MagicMirror² Module: MMM-Astro
 * By cowboysdude
 *
 * Shows today's horoscope for your star sign, plus this week's (optional)
 * and a lucky color, mood, match and numbers for the day.
 */
Module.register("MMM-Astro", {
	defaults: {
		sign: "",               // e.g. "pisces"
		iconset: "1",           // 1, 2, 3 or 4
		extend: true,           // also show this week's horoscope
		showLucky: true,        // lucky color, mood, match and numbers
		maxWidth: "300px",
		updateInterval: 60 * 60 * 1000, // check once an hour (the reading changes once a day)
		retryDelay: 5 * 60 * 1000,      // try again after 5 minutes if it fails
		animationSpeed: 1000
	},

	signs: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
		"Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],

	// Traditional matches: same element plus the friendly element (fire+air, earth+water)
	matches: {
		Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
		Taurus: ["Virgo", "Capricorn", "Cancer", "Pisces"],
		Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
		Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
		Leo: ["Aries", "Sagittarius", "Gemini", "Libra"],
		Virgo: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
		Libra: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
		Scorpio: ["Cancer", "Pisces", "Virgo", "Capricorn"],
		Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
		Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
		Aquarius: ["Gemini", "Libra", "Aries", "Sagittarius"],
		Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"]
	},

	moods: ["Cheerful", "Calm", "Confident", "Curious", "Thoughtful", "Playful",
		"Focused", "Relaxed", "Hopeful", "Creative", "Determined", "Grateful"],

	colors: ["Red", "Orange", "Gold", "Green", "Teal", "Blue", "Navy", "Purple",
		"Pink", "Silver", "White", "Lavender", "Turquoise", "Coral"],

	getStyles () {
		return [this.file("MMM-Astro.css")];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		this.daily = null;
		this.weekly = null;
		this.error = null;
		this.starSign = this.findSign(this.config.sign);
		this.iconset = String(this.config.iconSet || this.config.iconset || "1");
		if (!this.starSign) return;
		this.request();
		setInterval(() => this.request(), this.config.updateInterval);
	},

	findSign (name) {
		const n = String(name || "").trim().toLowerCase();
		return this.signs.find((s) => s.toLowerCase() === n) || null;
	},

	request () {
		this.sendSocketNotification("ASTRO_GET", {
			id: this.identifier,
			sign: this.starSign.toLowerCase(),
			weekly: this.config.extend !== false
		});
	},

	socketNotificationReceived (notification, payload) {
		if (!payload || payload.id !== this.identifier) return;
		if (notification === "ASTRO_DATA") {
			this.daily = payload.daily;
			this.weekly = payload.weekly;
			this.error = null;
		} else if (notification === "ASTRO_ERROR") {
			this.error = payload.message;
			clearTimeout(this.retryTimer);
			this.retryTimer = setTimeout(() => this.request(), this.config.retryDelay);
		}
		this.updateDom(this.config.animationSpeed);
	},

	// Same answer all day for the same sign, new answer tomorrow
	seeded (dateText) {
		let h = 2166136261;
		for (const ch of `${this.starSign}|${dateText}`) {
			h ^= ch.charCodeAt(0);
			h = Math.imul(h, 16777619);
		}
		return () => {
			h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
			return (h >>> 0) / 4294967296;
		};
	},

	lucky (dateText) {
		const rnd = this.seeded(dateText);
		const pick = (list) => list[Math.floor(rnd() * list.length)];
		const numbers = new Set();
		while (numbers.size < 6) numbers.add(1 + Math.floor(rnd() * 49));
		return {
			color: pick(this.colors),
			mood: pick(this.moods),
			match: pick(this.matches[this.starSign]),
			numbers: [...numbers].sort((a, b) => a - b)
		};
	},

	niceDate (iso) {
		const [y, m, d] = String(iso).split("-").map(Number);
		if (!y || !m || !d) return "";
		return new Date(y, m - 1, d).toLocaleDateString(config.language || "en",
			{ weekday: "long", month: "long", day: "numeric" });
	},

	el (tag, cls, text) {
		const e = document.createElement(tag);
		if (cls) e.className = cls;
		if (text !== undefined) e.textContent = text;
		return e;
	},

	getDom () {
		const wrap = this.el("div", "astro");
		wrap.style.maxWidth = this.config.maxWidth;

		if (!this.starSign) {
			wrap.appendChild(this.el("div", "small dimmed",
				`MMM-Astro: set "sign" in config.js (for example sign: "pisces").`));
			return wrap;
		}

		const head = this.el("div", "astro-head bright");
		const icon = this.el("img", "astro-icon");
		icon.src = this.file(`icons/${this.iconset}/${this.starSign}.svg`);
		icon.alt = this.starSign;
		head.appendChild(icon);
		const names = this.el("div", "astro-names");
		names.appendChild(this.el("div", "astro-sign medium", this.starSign));
		names.appendChild(this.el("div", "astro-date xsmall dimmed",
			this.daily ? this.niceDate(this.daily.date) : ""));
		head.appendChild(names);
		wrap.appendChild(head);

		if (!this.daily) {
			wrap.appendChild(this.el("div", "xsmall dimmed",
				this.error ? "Horoscope not available right now. Trying again soon." : "Loading horoscope…"));
			return wrap;
		}

		wrap.appendChild(this.el("div", "astro-text xsmall", this.daily.horoscope));

		if (this.weekly && this.weekly.horoscope) {
			wrap.appendChild(this.el("div", "astro-label xsmall", "This week"));
			wrap.appendChild(this.el("div", "astro-text astro-week xsmall", this.weekly.horoscope));
		}

		if (this.config.showLucky !== false) {
			const l = this.lucky(this.daily.date);
			const table = this.el("table", "astro-lucky xsmall");
			for (const [label, value] of [
				["Mood", l.mood], ["Color", l.color], ["Best match", l.match],
				["Lucky numbers", l.numbers.join("  ")]
			]) {
				const tr = this.el("tr");
				tr.appendChild(this.el("td", "dimmed", label));
				tr.appendChild(this.el("td", "bright", value));
				table.appendChild(tr);
			}
			wrap.appendChild(table);
		}
		return wrap;
	}
});
