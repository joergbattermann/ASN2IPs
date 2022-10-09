import { BGPViewApiResponse, BGPViewMetaInformation, ASNPrefixes, IpPrefix } from "./bgpView";

const bgpViewEndpoint = 'https://api.bgpview.io'

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext): Promise<Response> {
		if (request.method !== "GET") {
			return new Response(null, { status: 400 })
		}

		const { searchParams } = new URL(request.url)
		const asNumbers = searchParams.get('asns')?.split(/[ ,]+/).map(Number)

		const ipv4RequestedParameter = searchParams.get('ipv4')?.toLowerCase().trim()
		const ipv6RequestedParameter = searchParams.get('ipv6')?.toLowerCase().trim()

		const ipv4Requested = (
			!!ipv4RequestedParameter
			&& (ipv4RequestedParameter == "true".toLowerCase()
				|| ipv4RequestedParameter == "yes".toLowerCase()
				|| ipv4RequestedParameter == "y".toLowerCase()))

		const ipv6Requested = (
			!!ipv6RequestedParameter
			&& (ipv6RequestedParameter == "true".toLowerCase()
				|| ipv6RequestedParameter == "yes".toLowerCase()
				|| ipv6RequestedParameter == "y".toLowerCase()))

		const bothIpVsRequested = (!(!!ipv4RequestedParameter) && !(!!ipv6Requested)) || (ipv4Requested && ipv6Requested)

		let responseString = ""
		if (!!asNumbers) {
			for (let asNumber of asNumbers) {
				let bgpViewResponse = await fetch(bgpViewEndpoint + '/asn/' + asNumber + '/prefixes')
				let bgpViewJson = JSON.stringify(await bgpViewResponse.json())
				const bgpViewApiResponse: BGPViewApiResponse = JSON.parse(bgpViewJson)

				if (bgpViewResponse.ok) {
					if ((ipv4Requested || bothIpVsRequested) && !!bgpViewApiResponse?.data?.ipv4_prefixes) {
						for (let ipv4Prefix of bgpViewApiResponse.data.ipv4_prefixes) {
							responseString += ipv4Prefix.prefix + " ; AS" + asNumber + "\n"
						}
					}

					if ((ipv6Requested || bothIpVsRequested) && !!bgpViewApiResponse?.data?.ipv6_prefixes) {
						for (let ipv6Prefix of bgpViewApiResponse.data.ipv6_prefixes) {
							responseString += ipv6Prefix.prefix + " ; AS" + asNumber + "\n"
						}
					}
				}
			}
		}
		else {
			return new Response(null, { status: 400, })
		}

		return new Response(responseString)
	},
};
