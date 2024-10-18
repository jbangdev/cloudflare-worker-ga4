import { v4 } from "uuid";

import { Env } from "./external";


export async function sendToGA(request: Request, env: Env) {
  const cf = request.cf;
  const headers = request.headers;

  if (cf === undefined) {
    console.error('Cloudflare properties are not available');
  }

  const mpGAURL=`https://www.google-analytics.com/mp/collect?measurement_id=${env.GA_ID}&api_secret=${env.GA_MP_API_KEY}`;
  const debugmpGAURL=`https://www.google-analytics.com/debug/mp/collect?measurement_id=${env.GA_ID}&api_secret=${env.GA_MP_API_KEY}`;

  // Location information is currently not tracked by the Measurement Protocol
	// https://developers.google.com/analytics/devguides/collection/protocol/ga4#geographic_information

  // The alternative would be to send the location information as part of the event and then create a custom dashboard
  // that uses these events
	const payload = {
		client_id: v4(),
    non_personalized_ads: true,
    // user_properties: {
    //   language: {
    //     value: headers.get('accept-language')
    //   },
    //   country: {
    //     value: cf !== undefined ? cf.country : 'NA'
    //   },
    //   city: {
    //     value: cf !== undefined ? cf.city : 'NA'
    //   },
    //   continent: {
    //     value: cf !== undefined ? cf.continent : 'NA'
    //   }
    // },
		events: [
			{
				name: 'page_view',
        params: {
          page_location: request.url.trim(),
          source: headers.get('referrer') || 'NA',
          medium: 'referral',
          user_agent: headers.get('user-agent') || '',
          country: cf !== undefined ? cf.country : 'NA',
          city: cf !== undefined ? cf.city : 'NA',
          ip_override: headers.get('cf-connecting-ip') || headers.get('x-real-ip'),
          engagement_time_msec: 5,
        }
			}
		]
	};

	try {
    console.log("Sending to GA", payload);
		const resp = await fetch(mpGAURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		console.log(`GA Response: ${(await resp.text())}`);
    const dbresp = await fetch(debugmpGAURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		console.log(`DebugGA Response: ${(await dbresp.text())}`);
	} catch (err) {
		console.error(`Failed to send data to GA: ${err}`);
	}
}
