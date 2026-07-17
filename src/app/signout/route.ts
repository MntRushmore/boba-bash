import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL("/goodbye", request.nextUrl.origin));
}
