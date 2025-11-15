javascript: (async () => {
	const d = document;

	// --- Small helpers -------------------------------------------------------

	const S = (el, compress = true) => {
		if (!el) return "";
		const t = el.innerText || "";
		return compress ? t.trim().replace(/\s+/g, " ") : t.trim();
	};

	const findHeading = (re) =>
		[...d.querySelectorAll("h1,h2,h3")].find((h) =>
			re.test((h.textContent || "").toLowerCase().trim())
		);

	const toNum = (s) => {
		if (s == null) return null;
		let t = s.trim();

		const frac = { "¼": 0.25, "½": 0.5, "¾": 0.75 };
		if (frac[t] != null) return frac[t];

		if (/^\d+\/\d+$/.test(t)) {
			const [a, b] = t.split("/").map(Number);
			return a / b;
		}

		t = t.replace(",", ".");
		const n = parseFloat(t);
		return Number.isFinite(n) ? n : null;
	};

	const parseIng = (line) => {
		const units = [
			"g",
			"kg",
			"ml",
			"l",
			"tbsp",
			"tsp",
			"clove",
			"pack",
			"tin",
			"pc",
			"slice",
			"bunch"
		];

		const re = new RegExp(
			String.raw`^(\d+(?:[.,]\d+)?|\d+\/\d+|[¼½¾])\s*(?:(${units.join(
				"|"
			)}))?\b\s*(.+)$`,
			"i"
		);

		const m = re.exec(line.trim());
		if (!m) return null;

		return {
			qty: toNum(m[1]),
			unit: (m[2] || "").toLowerCase() || null,
			name: (m[3] || "").trim().toLowerCase(),
			altText: null
		};
	};

	const slug = (s) =>
		s
			.toLowerCase()
			.replace(/recipes?$/i, "")
			.replace(/[^\p{Letter}\p{Number}]+/gu, "-")
			.replace(/^-+|-+$/g, "");

	// --- Title ---------------------------------------------------------------

	const title =
		S(d.querySelector("h1.css-11h84nx")) ||
		S(d.querySelector("h1,[data-test=recipe-title]"));

	if (!title) {
		alert("Could not find title");
		return;
	}

	// --- Hero image ----------------------------------------------------------

	let imageUrl = null;
	const heroImg = d.querySelector("img.RecipeHero_image__tMmE5");

	if (heroImg) {
		const srcset = heroImg.getAttribute("srcset") || "";
		if (srcset) {
			const candidates = srcset.split(",").map((s) => s.trim());
			let bestUrl = null;
			let bestWidth = 0;

			for (const c of candidates) {
				const parts = c.split(/\s+/);
				const url = parts[0];
				const size = parts[1] || "";
				const m = /(\d+)w/.exec(size);
				const w = m ? parseInt(m[1], 10) : 0;

				if (w >= bestWidth) {
					bestWidth = w;
					bestUrl = url;
				}
			}

			imageUrl = bestUrl || heroImg.src || null;
		} else {
			imageUrl = heroImg.src || null;
		}
	}

	// --- Servings (“Ingredients for X people”) -------------------------------

	let servings = null;
	const servingsHeading = [...d.querySelectorAll("h2")].find((h) =>
		/ingredients\s+for\s+\d+\s+people/i.test(h.textContent || "")
	);

	if (servingsHeading) {
		const m = servingsHeading.textContent.match(
			/ingredients\s+for\s+(\d+)\s+people/i
		);
		if (m) servings = parseInt(m[1], 10);
	}

	// --- Ingredients ---------------------------------------------------------

	const ingLis = [
		...d.querySelectorAll('ul[data-test="ingredients-list"] li')
	];

	const rawLines = ingLis
		.map((li) => {
			const div = li.querySelector("div");
			return S(div);
		})
		.filter(Boolean);

	const parsed = rawLines.map(parseIng).filter(Boolean);

	const dedup = new Map();
	for (const it of parsed) {
		const key = `${it.name}|${it.unit || ""}`;

		if (!dedup.has(key)) {
			dedup.set(key, it);
		} else {
			const prev = dedup.get(key);

			if (prev.qty != null && it.qty != null && prev.unit === it.unit) {
				prev.qty += it.qty;
			} else {
				prev.altText = prev.altText
					? prev.altText + "; " + (it.altText || "")
					: it.altText || null;
				prev.unit = null;
				prev.qty = null;
			}

			dedup.set(key, prev);
		}
	}

	// Pantry Ingredients (found in "you'll also need:")

	const basicsDiv = d.querySelector('[data-test="ingredients-basics"]');
	if (basicsDiv) {
		const firstSpan = basicsDiv.querySelector("span");
		if (firstSpan) {
			// e.g. "olive oil, pepper, salt"
			const basicsText = S(firstSpan).toLowerCase();

			// Normalise separators: turn "x, y and z" into "x, y, z"
			const parts = basicsText
				.replace(/\band\b/gi, ",")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);

			for (const name of parts) {
				// See if we already have this ingredient (any unit)
				let found = null;
				for (const it of dedup.values()) {
					if (it.name === name) {
						found = it;
						break;
					}
				}

				if (found) {
					// Mark existing ingredient as pantry
					found.isPantry = true;
				} else {
					// Add a new pantry-only ingredient with no qty/unit
					const pantryObj = {
						name,
						qty: null,
						unit: null,
						altText: null,
						isPantry: true
					};
					// use name with empty unit as key to avoid clashes
					dedup.set(`${name}|`, pantryObj);
				}
			}
		}
	}

	const ingredients = [...dedup.values()];

	if (ingredients.length === 0) {
		alert("No ingredients detected – selectors may need updating");
		return;
	}

	// --- Steps (“Cooking instructions”) --------------------------------------

	let steps = [];
	const stepList = d.querySelector('ol[data-test="cooking-instructions"]');

	if (stepList) {
		const liSteps = [...stepList.querySelectorAll("li")];

		steps = liSteps
			.map((li, i) => {
				const bodyNode =
					li.querySelector(".StepListItem_instruction__mqRz2") || li;
				const body = S(bodyNode, false);
				return { n: i + 1, body: body.trim() };
			})
			.filter((s) => s.body.length > 0);
	} else {
		const instHeading = findHeading(/^cooking\s+instructions\b/);
		const root = instHeading ? instHeading.parentElement : d.body;

		steps = [...root.querySelectorAll("p")]
			.map((p, i) => ({ n: i + 1, body: S(p, false) }))
			.filter((s) => s.body.length > 40);
	}

	// --- Cook time (minutes, from clock meta) --------------------------------

	let cookMinutes = null;
	const clockSvg = d.querySelector(
		'.RecipeHero_metaItem__PHAyB svg[alt="clock"]'
	);

	if (clockSvg) {
		const wrapper =
			clockSvg.closest(".RecipeHero_metaItem__PHAyB,.MetaInfo_wrapper__G+vaU") ||
			clockSvg.parentElement;

		if (wrapper) {
			const text = wrapper.textContent || "";
			const m = /(\d{1,3})\s*mins?/i.exec(text);
			if (m) cookMinutes = parseInt(m[1], 10);
		}
	}

	// --- Nutrition (per serving: kcal + macros) ------------------------------

	let calories = null;
	let protein = null;
	let carbohydrate = null;
	let fat = null;
	let fibre = null;
	let salt = null;

	const nutriButton = d.getElementById("nutritional-informationAccordionButton");
	const nutriSection = d.getElementById("nutritional-informationAccordionSection");

	if (
		nutriButton &&
		nutriSection &&
		(nutriSection.getAttribute("aria-hidden") === true ||
		nutriSection.hasAttribute("hidden"))
	) {
		// open nutrition accordion that's closed on load
		nutriButton.click();

		await new Promise(resolve => setTimeout(resolve, 300));
	}

	let nutriTable =
		d.querySelector('[data-test="nutritional-information"] table') ||
		d.querySelector('table.NutritionalInformationPanel_table__g8bvk');

	if (nutriTable) {
		const rows = [...nutriTable.querySelectorAll("tbody tr, tr")];

		for (const row of rows) {
			const cells = [...row.querySelectorAll("th,td")];
			if (!cells.length) continue;

			const rowText = row.textContent || "";

			// Calories per serving (row that actually contains "kcal")
			if (calories == null && /kcal/i.test(rowText)) {
				const perServingCell = cells[cells.length - 1];
				const m = /(\d{2,4})\s*kcal/i.exec(
					(perServingCell.textContent || "").trim()
				);
				if (m) {
					calories = parseInt(m[1], 10);
					// don't return; other rows may still contain macros
				}
			}

			const label = (cells[0].textContent || "")
				.trim()
				.toLowerCase();

			const perServingCell = cells[cells.length - 1];
			const valText = (perServingCell.textContent || "").trim();
			const numMatch = valText.match(/([\d.,]+)/);
			const val =
				numMatch != null
					? parseFloat(numMatch[1].replace(",", "."))
					: null;

			if (!Number.isFinite(val)) continue;

			if (label.startsWith("fat")) {
				fat = val;
			} else if (label.startsWith("carbohydrate")) {
				carbohydrate = val;
			} else if (label.startsWith("fibre") || label.startsWith("fiber")) {
				fibre = val;
			} else if (label.startsWith("protein")) {
				protein = val;
			} else if (label.startsWith("salt")) {
				salt = val;
			}
		}
	}

	// --- Tags ----------------------------------------------------------------

	const tagSet = new Set();

	const cuisineItem = [...d.querySelectorAll(".RecipeHero_metaItem__PHAyB")].find(
		(item) => item.querySelector('svg[alt="location icon"]')
	);

	if (cuisineItem) {
		const cuisineText = S(cuisineItem);
		if (cuisineText) tagSet.add(slug(cuisineText));
	}

	const orderLink = d.querySelector('a[href*="/menu?"]');
	if (orderLink) {
		try {
			const url = new URL(orderLink.href, location.origin);
			const collection = url.searchParams.get("collection");
			if (collection) tagSet.add(slug(collection));
		} catch {
			// ignore URL parsing errors
		}
	}

	const tags = [...tagSet];

	// --- Build payload & POST to your API -----------------------------------

	const payload = {
		title,
		sourceUrl: location.href,
		imageUrl,
		servings,
		tags,
		steps,
		ingredients,
		calories,      // per serving
		protein,       // grams per serving
		carbohydrate,  // grams per serving
		fat,           // grams per serving
		fibre,         // grams per serving
		salt,          // grams per serving
		cookMinutes    // total time in minutes
	};

	console.log("Gousto Payload: ", payload);

	try {
		const res = await fetch("http://localhost:3001/api/import", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});

		const json = await res.json();

		if (json.ok) {
			alert("Imported: " + title);
		} else {
			alert("Import failed: " + (json.error || "unknown error"));
		}
	} catch (err) {
		console.error(err);
		alert("Bookmarklet error: " + err.message);
	}
})();