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

// see https://medium.com/@mailtoankitgupta/taking-cloudflare-worker-analytics-engine-for-a-spin-bf193c6a25e4
		
export async function sendToAnalytics(request: Request, env: Env) {
  // request.url contains the short original url
		const cfProperties = request.cf
		if (!cfProperties) {
			return Promise.resolve()
		}

    // parse user agent that should have a format like:
    // JBang/0.117.1 (Linux/5.10.201-191.748.amzn2.x86_64/amd64) Java/17.0.12/Eclipse Adoptium
   const ua = request.headers.get('user-agent') || ''
   // use regex to check if ua is JBang and grab the jbang version, os info and java version with named groups
   const uaRegex = /JBang\/(\d+\.\d+\.\d+)\s*\(([^)]+)\)\s*Java\/(\d+\.\d+\.\d+)\/(\w+)/;
   const uaMatch = ua.match(uaRegex);

   var jbangVersion = '';
   var osInfo = '';
   var javaVersion = '';
   var javaVendor = '';

   if(uaMatch) {
    jbangVersion = uaMatch[1];
    osInfo = uaMatch[2];
    javaVersion = uaMatch[3];
    javaVendor = uaMatch[4];
   }

		env.ANALYTICS.writeDataPoint({
			'blobs': [
				request.url,
				cfProperties.city as string,
				cfProperties.country as string,
				cfProperties.continent as string,
				cfProperties.region as string,
				cfProperties.regionCode as string,
				cfProperties.timezone as string,
        jbangVersion as string,
        osInfo as string,
        javaVersion as string,
        javaVendor as string
			],
			'doubles': [
				cfProperties.metroCode as number,
				cfProperties.longitude as number,
				cfProperties.latitude as number
			],
			'indexes': [
				cfProperties.postalCode as string
			]
		})
		return Promise.resolve()
	}
