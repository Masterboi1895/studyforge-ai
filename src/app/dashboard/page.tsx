import Link from "next/link";
import {redirect} from "next/navigation";
import {serverDb,supabaseConfigured} from "@/lib/supabase";
export default async function Dashboard() {
 if(!supabaseConfigured()) return <main className="main"><h1>Account setup required</h1><p>Supabase must be configured before students can log in and save their courses.</p><Link href="/">Return home</Link></main>;
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)redirect("/login");
 const {data:profile}=await db.from("profiles").select("display_name,onboarded").eq("id",user.id).maybeSingle();
 if(!profile?.onboarded)redirect("/onboarding");
 const {data:courses,error}=await db.from("courses").select("id,name,subject,grade").eq("user_id",user.id).order("created_at",{ascending:false});
 return <main className="main"><div className="eyebrow">Your learning space</div><h1>Welcome back, {profile.display_name||"student"}!</h1><p>Your courses and learning materials are saved to your account.</p><div className="actions"><Link className="btn primary" href="/courses">Manage courses</Link><Link className="btn" href="/visuals">Visual math lesson</Link><form action="/auth/signout" method="post"><button className="btn">Log out</button></form></div><div className="grid">{error?<section className="card"><p>Courses are unavailable: {error.message}. Check database migrations.</p></section>:courses?.length?courses.map(c=><section className="card" key={c.id}><h2>{c.name}</h2><p>{c.subject} · Grade {c.grade||"Any"}</p><Link href={`/courses?id=${c.id}`}>Open course →</Link></section>):<section className="card"><h2>Start with your first course</h2><p>Add a course to organize notes, lessons and practice.</p><Link className="btn primary" href="/courses">Add course</Link></section>}</div></main>;
}
