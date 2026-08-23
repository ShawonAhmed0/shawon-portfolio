import { NextResponse } from "next/server";
import { endSession } from "@/lib/admin/auth";

export async function POST(request: Request) {
  await endSession();
  // 303 so the browser follows with a GET. A 307 would repeat the POST
  // against /login, which does not accept one.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
