import { v4 } from "uuid";

import { Env } from "./external";


// see https://medium.com/@mailtoankitgupta/taking-cloudflare-worker-analytics-engine-for-a-spin-bf193c6a25e4

export async function sendToAnalytics(request: Request, env: Env) {
    // request.url contains the short original url
    const cfProperties = request.cf
    if (!cfProperties) {
        console.error("Cloudflare properties were not available");
        return Promise.resolve()
    }

    console.log("Cloudflare properties", cfProperties);

    let headersObject = Object.fromEntries(request.headers);
    let requestHeaders = JSON.stringify(headersObject, null, 2);
    console.log(`Request headers: ${requestHeaders}`);



    // parse user agent that should have a format like:
    // JBang/0.117.1 (Linux/5.10.201-191.748.amzn2.x86_64/amd64) Java/17.0.12/Eclipse Adoptium
    const ua = request.headers.get('user-agent') || ''
    // use regex to check if ua is JBang and grab the jbang version, os info and java version with named groups
    const uaRegex = /JBang\/(\d+\.\d+\.\d+)\s*\(([^)]+)\)\s*Java\/(\d+\.\d+\.\d+)\/(\w+)/;
    const uaMatch = ua.match(uaRegex);

    var ip = request.headers.get('CF-Connecting-IP') || '';

    var jbangVersion = '';
    var osInfo = '';
    var javaVersion = '';
    var javaVendor = '';

    if (uaMatch) {
        jbangVersion = uaMatch[1];
        osInfo = uaMatch[2];
        javaVersion = uaMatch[3];
        javaVendor = uaMatch[4];
    }

    const index = `${cfProperties.country}-${cfProperties.city}-${cfProperties.postalCode}`;
    const dataPoint = {
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
            javaVendor as string,
            ip as string,
            cfProperties.asOrganization as string,
            ua as string
        ],
        'doubles': [
            cfProperties.metroCode as number,
            cfProperties.longitude as number,
            cfProperties.latitude as number
        ],
        'indexes': [
            index as string
        ]
    };

    env.ANALYTICS.writeDataPoint(dataPoint)

    console.log("Sent to Analytics", dataPoint);
    return Promise.resolve()
}
