"use client";
import Link from "next/link";
import {useState} from "react";
import {browserDb,supabaseConfigured} from "@/lib/supabase";
export default function Login() {
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[mode,setMode]=useState<"signin"|"signup"|"reset">("signin"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");
  try {const db=browserDb();
   if(mode==="reset"){const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/auth/callback"});if(error)throw error;setMessage("If the address is registered, a reset email has been sent.");}
   else if(mode==="signup"){const {error}=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+"/auth/callback"}});if(error)throw error;setMessage("Check your email to verify your account before signing in.");}
   else {const {error}=await db.auth.signInWithPassword({email,password});if(error)throw error;location.assign("/dashboard");}
  }catch(err){setMessage(err instanceof Error?err.message:"Authentication failed.");}finally{setBusy(false)}
 }
 async function google(){try {const {error}=await browserDb().auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+"/auth/callback"}});if(error)throw error;}catch(err){setMessage(err instanceof Error?err.message:"Google login failed.")}}
 return <main className="main" style={{maxWidth:540}}><div className="brand">⚡ Study<span>Forge</span> AI</div><h1>{mode==="signup"?"Create your account":mode==="reset"?"Reset password":"Welcome back"}</h1><p>Save your courses and pick up right where you left off.</p><section className="card"><form onSubmit={submit} style={{display:"grid",gap:14}}><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:7}}/></label>{mode!=="reset"&&<label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:7}}/></label>}<button className="btn primary" disabled={busy||!supabaseConfigured()}>{busy?"Working…":mode==="signup"?"Sign up":mode==="reset"?"Send reset link":"Log in"}</button></form>{mode!=="reset"&&<button className="btn" style={{marginTop:12,width:"100%"}} disabled={!supabaseConfigured()} onClick={google}>Continue with Google</button>}{message&&<p role="status">{message}</p>}{!supabaseConfigured()&&<p role="alert">Account services are not configured yet. The owner must connect Supabase in Vercel.</p>}<div className="actions" style={{marginTop:16}}><button className="btn" onClick={()=>setMode(mode==="signup"?"signin":"signup")}>{mode==="signup"?"Log in instead":"Create account"}</button><button className="btn" onClick={()=>setMode("reset")}>Forgot password?</button></div></section><p><Link href="/">Back to home</Link></p></main>
}
