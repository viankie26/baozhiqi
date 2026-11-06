/** Minimal APNs (token-based) sender using WebCrypto; runs on Workers (fetch is HTTP/2). */
function b64url(bytes: ArrayBuffer | Uint8Array | string): string {
  const arr = typeof bytes === "string" ? new TextEncoder().encode(bytes) : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function apnsJwt(teamId: string, keyId: string, p8: string): Promise<string> {
  const pem = p8.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const unsigned = `${b64url(JSON.stringify({ alg: "ES256", kid: keyId }))}.${b64url(
    JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }),
  )}`;
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

export async function sendApns(opts: {
  jwt: string; token: string; topic: string; production: boolean; title: string; body: string; threadId: string;
}): Promise<number> {
  const host = opts.production ? "api.push.apple.com" : "api.sandbox.push.apple.com";
  const res = await fetch(`https://${host}/3/device/${opts.token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${opts.jwt}`,
      "apns-topic": opts.topic,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    },
    body: JSON.stringify({ aps: { alert: { title: opts.title, body: opts.body }, sound: "default", "thread-id": opts.threadId } }),
  });
  return res.status;
}
