import { Env } from "./external";
import { sendToGA } from "./ga";
import { sendToAnalytics } from "./analytics";
export default {

	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			await sendToGA(request, env);
		} catch (error) {
			console.error("Error in sendToGA:", error);
		}

		try {
			await sendToAnalytics(request, env);
		} catch (error) {
			console.error("Error in sendToAnalytics:", error);
		}

		//console.log("tracking: ", request.url);
		return fetch(request);
	},
};
