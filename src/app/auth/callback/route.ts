import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/supabase";
export async function GET(request: NextRequest) {
 const code = new URL(request.url).searchParams.get("code");
 if(!code) return NextResponse.redirect(new URL("/login?error=missing_code",request.url));
 const supabase=await serverDb();
 const {error}=await supabase.auth.exchangeCodeForSession(code);
 return NextResponse.redirect(new URL(error?"/login?error=auth_failed":"/dashboard",request.url));
}
