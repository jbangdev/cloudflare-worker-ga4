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
    const uaRegex = /JBang\/(?<jbangVersion>\d+\.\d+\.\d+) \((?<osName>[^\/]+)\/(?<osVersion>[^\/]+)\/(?<osArch>[^)]+)\) Java\/(?<javaVersion>[^\/]+)\/(?<javaVendor>.+)/;
    const match = ua.match(uaRegex);

    var ip = request.headers.get('CF-Connecting-IP') || '';

    var jbangVersion = '';
    var osName = '';
    var osVersion = '';
    var osArch = '';
    var javaVersion = '';
    var javaVendor = '';

    if (match && match.groups) {
        jbangVersion = match.groups.jbangVersion;
        osName = match.groups.osName;
        osVersion = match.groups.osVersion;
        osArch = match.groups.osArch;
        javaVersion = match.groups.javaVersion;
        javaVendor = match.groups.javaVendor;
    }

    const index = `${cfProperties.country}-${cfProperties.city}-${cfProperties.postalCode}`;
    const dataPoint = {
        'blobs': [
            request.url, // 1
            cfProperties.city as string, // 2
            cfProperties.country as string, // 3
            cfProperties.continent as string, // 4
            cfProperties.region as string, // 5
            cfProperties.regionCode as string, // 6
            cfProperties.timezone as string, // 7
            jbangVersion as string, // 8
            osName as string, // 9
            osVersion as string, // 10
            osArch as string, // 11
            javaVersion as string, // 12
            javaVendor as string, // 13
            ip as string, // 14
            cfProperties.asOrganization as string, // 15
            ua as string // 16
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
