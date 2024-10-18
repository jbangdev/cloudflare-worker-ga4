import { Env } from "./external";
import { sendToGA, sendToAnalytics } from "./ga";

export default {

	

	async fetch(request: Request, env: Env): Promise<Response> {
		await sendToGA(request, env);

		await sendToAnalytics(request, env);

		

		console.log("tracking: ", request.url);
		return fetch(request);
	},
};
