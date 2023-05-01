import { Server } from "http/server";

type Teardown = () => void;

export type MockHandler = {
  match?: (req: Request) => boolean;
  respond: (req: Request) => Response;
};

export function setupServer(
  ...handlers: MockHandler[]
): [string, Teardown] {
  const handler = async (req: Request) => {
    for (const handler of handlers) {
      if (handler.match && !handler.match(req)) {
        continue;
      }
      return handler.respond(req);
    }

    let body = "null";
    if (req.body !== null) {
      body = JSON.stringify(await req.json(), null, 2);
    }
    throw new Error(`no matched mock handler:
- url: ${req.url} 
- method: ${req.method}
- body: ${body}
`);
  };

  const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const server = new Server({ handler });
  server.serve(listener);

  const addr = listener.addr as Deno.NetAddr;
  const url = `http://${addr.hostname}:${addr.port}`;

  const teardown = () => {
    listener.close();
    server.close();
  };

  return [url, teardown];
}
