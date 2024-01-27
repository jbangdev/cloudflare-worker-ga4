import { Env } from "./external";

import { v4 } from "uuid";


export async function sendToGA(headers: Headers, env: Env) {
	const mpGAURL=`www.google-analytics.com/mp/collect?measurement_id=${env.GA_ID}&api_secret=${env.GA_MP_API_KEY}`;

	// Details about all attributes available at
	// https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
	const payload = {
		client_id: v4(),
		events: [
			{
				name: 'pageview',
				landingPage: '',
				firstUserSource: '',
				firstUserMedium: '',
				deviceCategory: '',
				countryId: '',
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
		console.log(`Failed to send data to GA: ${err}`);
	}
}
