import { Env } from "./external";

import { v4 } from "uuid";


export async function sendToGA(request: Request, env: Env) {
  const cf = request.cf;
  const headers = request.headers;

  if (cf === undefined) {
    console.error('Cloudflare properties are not available');
  }

  const mpGAURL=`https://www.google-analytics.com/mp/collect?measurement_id=${env.GA_ID}&api_secret=${env.GA_MP_API_KEY}`;

	// Details about all attributes available at
	// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
	const payload = {
		client_id: v4(),
		events: [
			{
				name: 'pageview',
				landingPage: request.url.trim(),
				firstUserSource: headers.get('referrer') || '',
				firstUserMedium: 'referral',
				deviceCategory: '',
				countryId: cf !== undefined ? cf.country : '',
			}
		]
	};

	try {
		const resp = await fetch(mpGAURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		console.log(`GA Response: ${(await resp.text())}`);
	} catch (err) {
		console.error(`Failed to send data to GA: ${err}`);
	}
}
