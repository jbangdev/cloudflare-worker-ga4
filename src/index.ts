import { Env } from "./external";
import { sendToGA } from "./ga";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
    await sendToGA(request, env);

		return Response.redirect(env.APP_REDIRECT_URL, 302);
	},
};
