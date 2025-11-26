javascript: (async () => {
	// Detect whether on recipe page or recipe list page
	const isRecipePage = !!document.querySelector('[data-test="recipe-hero"]');
	const isRecipeList = !!document.querySelector('[data-test="recipe-groups"]');

	// CORE SCRAPER: main logic to scrape recipe page
	async function scrapeRecipeDocument(doc, sourceUrl, opts = {}) {
		const { showAlert = true } = opts;
		const d = doc;

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
				"bunch",
				"cup",
			];
			const unitsPattern = units.join("|");
			const qtyPattern = String.raw`(\d+(?:[.,]\d+)?|\d+\/\d+|[¼½¾])`;

			const trimmed = line.trim();

			// Pattern 1: Qty-first (e.g., "200g beef mince", "2 clove garlic")
			const qtyFirstRe = new RegExp(
				String.raw`^${qtyPattern}\s*(?:(${unitsPattern}))?\b\s*(.+)$`,
				"i"
			);

			// Pattern 2: Name (qty+unit) with optional x-multiplier
			// e.g., "Cherry tomatoes (125g)" or "Balsamic vinegar (15ml) x2"
			const parenQtyRe = new RegExp(
				String.raw`^(.+?)\s*\(${qtyPattern}\s*(${unitsPattern})?\)(?:\s*x(\d+))?$`,
				"i"
			);

			// Pattern 3: Name x-count only (e.g., "Red onion x2")
			const xCountRe = new RegExp(
				String.raw`^(.+?)\s*x(\d+)$`,
				"i"
			);

			let m;

			// Try qty-first pattern
			m = qtyFirstRe.exec(trimmed);
			if (m) {
				return {
					qty: toNum(m[1]),
					unit: (m[2] || "").toLowerCase() || null,
					name: (m[3] || "").trim().toLowerCase(),
					altText: null
				};
			}

			// Try parenthesized qty with optional multiplier
			m = parenQtyRe.exec(trimmed);
			if (m) {
				let qty = toNum(m[2]);
				const multiplier = m[4] ? parseInt(m[4], 10) : 1;
				if (qty != null) qty *= multiplier;

				return {
					qty,
					unit: (m[3] || "").toLowerCase() || null,
					name: (m[1] || "").trim().toLowerCase(),
					altText: null
				};
			}

			// Try x-count only pattern
			m = xCountRe.exec(trimmed);
			if (m) {
				return {
					qty: parseInt(m[2], 10),
					unit: null,
					name: (m[1] || "").trim().toLowerCase(),
					altText: null
				};
			}

			return null;
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
			if (showAlert) alert("Could not find title");
			throw new Error ("Could not find title");
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
			if (showAlert) alert("No ingredients detected – selectors may need updating");
			throw new Error("No ingredients detected");
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
	
			if (!json.ok) {
				const msg = "Import failed: " + (json.error || "unknown error");
				if (showAlert) alert(msg);
				throw new Error(msg);
			}

			if (showAlert) {
				alert("Imported: " + title);
			} else {
				console.log("Imported:", title);
			}
		} catch (err) {
			console.error(err);
			if (showAlert) alert("Bookmarklet error: " + err.message);
			throw err;
		}
	}

	// Recipe list page helpers

	function extractRecipeLinksFromCurrentPage() {
		const links = [
			...document.querySelectorAll(
				'.RecipeList_recipes__hGtfW a[href^="/cookbook/"]'
			)
		];

		return links.map((a) => {
			const href = a.getAttribute("href") || a.href;
			return new URL(href, window.location.href).href;
		});
	}

	// Wait for popup to finish loading (checks for recipe-hero element)
	function waitForPopupLoad(popup, timeout = 30000) {
		return new Promise((resolve, reject) => {
			const start = Date.now();

			const check = () => {
				try {
					// Check if popup is closed
					if (popup.closed) {
						reject(new Error("Popup was closed"));
						return;
					}

					// Check if document is ready and has recipe content
					const doc = popup.document;
					if (doc.readyState === "complete" && doc.querySelector('[data-test="recipe-hero"]')) {
						resolve(doc);
						return;
					}
				} catch (e) {
					// Cross-origin error - page still loading
				}

				if (Date.now() - start > timeout) {
					reject(new Error("Timeout waiting for page to load"));
					return;
				}

				setTimeout(check, 500);
			};

			check();
		});
	}

	// ENTRY POINT LOGIC
	if (isRecipePage && !isRecipeList) {
		await scrapeRecipeDocument(document, window.location.href, {
			showAlert: true
		});
		return;
	}

	if (isRecipeList) {
		const recipeLinks = extractRecipeLinksFromCurrentPage();

		if (!recipeLinks.length) {
			alert("No recipe links found on this page.\n\nNote: Only recipes visible on the current page will be imported. Scroll down to load more recipes first if needed.");
			return;
		}

		if (!confirm(`Found ${recipeLinks.length} recipes on this page.\n\nThis will open a popup window and import each recipe. Keep this page open!\n\nProceed?`)) {
			return;
		}

		// Open popup window
		const popup = window.open("about:blank", "gousto_import", "width=800,height=600");
		if (!popup) {
			alert("Popup blocked! Please allow popups for this site and try again.");
			return;
		}

		let ok = 0;
		let failed = 0;

		for (let i = 0; i < recipeLinks.length; i++) {
			const url = recipeLinks[i];
			console.log(`[${i + 1}/${recipeLinks.length}] Importing: ${url}`);

			try {
				// Navigate popup to recipe page
				popup.location.href = url;

				// Wait for page to fully load
				const doc = await waitForPopupLoad(popup);

				// Scrape the rendered page
				await scrapeRecipeDocument(doc, url, { showAlert: false });
				ok++;
				console.log(`[${i + 1}/${recipeLinks.length}] Success!`);
			} catch (err) {
				console.error(`[${i + 1}/${recipeLinks.length}] Failed:`, err);
				failed++;
			}

			// Small delay between requests to be nice to the server
			if (i < recipeLinks.length - 1) {
				await new Promise(r => setTimeout(r, 1000));
			}
		}

		// Close popup and show results
		popup.close();
		alert(`Bulk import complete!\n\nSuccess: ${ok}\nFailed: ${failed}`);
		return;
	}

	alert("Could not detect a Gousto recipe page or recipe list on this URL.");
})();