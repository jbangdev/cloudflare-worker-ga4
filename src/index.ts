import { Env } from "./external";
import { sendToGA } from "./ga";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
    await sendToGA(request, env);

		console.log("tracking ", request.url);
		return fetch(request);
	},
};
