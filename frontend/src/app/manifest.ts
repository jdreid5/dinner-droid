import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Dinner Droid",
		short_name: "Dinner Droid",
		description: "Plan meals, browse recipes, generate shopping lists",
		start_url: "/",
		display: "standalone",
		background_color: "#faf7f2",
		theme_color: "#faf7f2",
		icons: [
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/icons/icon-512-maskable.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
