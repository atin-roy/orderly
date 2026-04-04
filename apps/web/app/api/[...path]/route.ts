import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL || "http://localhost:8080/api";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
]);

function forwardHeaders(incoming: Headers): Headers {
  const out = new Headers();

  for (const [key, value] of incoming.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase()) || key.toLowerCase() === "host") {
      continue;
    }
    out.set(key, value);
  }

  return out;
}

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const target = `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const upstream = await fetch(target, {
    method: req.method,
    headers: forwardHeaders(req.headers),
    body: hasBody ? req.body : undefined,
    // @ts-expect-error -- required for streaming request bodies in Node
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  HOP_BY_HOP.forEach((h) => responseHeaders.delete(h));

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
