// www.bayheatguide.com -> https://bayheatguide.com, keeping path and query. The main site is an assets-only
// Worker (../../wrangler.jsonc), which can't redirect by hostname, so www gets this one-line Worker instead
// (same pattern as the company's other sites). Free plan: 100,000 requests/day, far above www traffic.
const worker = {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(`https://bayheatguide.com${url.pathname}${url.search}`, 301);
  },
};

export default worker;
