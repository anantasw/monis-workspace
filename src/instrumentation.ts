// Runs once when a server instance starts. Loading the env module here makes a wrong
// environment variable stop the server right away, with a clear Zod error.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./server/env");
  }
}
