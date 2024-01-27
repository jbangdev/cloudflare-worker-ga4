import { v4 } from "uuid";

import { Env } from "./external";


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
    non_personalized_ads: true,
    user_properties: {
      language: {
        value: headers.get('accept-language')
      },
      country: {
        value: cf !== undefined ? cf.country : 'NA'
      },
      city: {
        value: cf !== undefined ? cf.city : 'NA'
      },
      continent: {
        value: cf !== undefined ? cf.continent : 'NA'
      }
    },
		events: [
			{
				name: 'page_view',
        params: {
          page_location: request.url.trim(),
          source: headers.get('referrer') || 'NA',
          medium: 'referral',
          user_agent: headers.get('user-agent') || '',
          ip_override: headers.get('cf-connecting-ip') || headers.get('x-real-ip'),
          engagement_time_msec: 5,
        }
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
