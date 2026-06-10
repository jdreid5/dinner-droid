import Typesense from "typesense";

type TypesenseClient = InstanceType<typeof Typesense.Client>;

let client: TypesenseClient | null = null;

export function getTypesenseClient(): TypesenseClient {
	if (!client) {
		const host = process.env.TYPESENSE_HOST ?? "localhost";
		const port = Number(process.env.TYPESENSE_PORT ?? 8108);
		const protocol = process.env.TYPESENSE_PROTOCOL ?? "http";
		const apiKey = process.env.TYPESENSE_API_KEY ?? "dev-typesense-key";

		client = new Typesense.Client({
			nodes: [{ host, port, protocol }],
			apiKey,
			connectionTimeoutSeconds: 5,
		});
	}
	return client;
}
