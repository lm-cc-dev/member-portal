import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

console.log('[Auth Route] Module loaded');

const handler = toNextJsHandler(auth);

console.log('[Auth Route] Handler created');

export const GET = handler.GET;
export const POST = handler.POST;
