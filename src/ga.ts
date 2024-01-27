import { v4 } from "uuid";
import { UAParser } from "ua-parser-js";

import { Env } from "./external";


function getDeviceType(userAgent: string): string {
  const ua = new UAParser(userAgent)
  return ua.getDevice().type || 'NA';
}


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
				firstUserSource: headers.get('referrer') || 'NA',
				firstUserMedium: 'referral',
				deviceCategory: getDeviceType(headers.get('user-agent') || ''),
				countryId: cf !== undefined ? cf.country : 'NA',
        continentId: cf !== undefined? cf.continent : 'NA',
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
