import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {z} from "zod";
import {serverDb,supabaseConfigured} from "@/lib/supabase";
const requestSchema=z.object({conversationId:z.string().uuid().optional(),courseId:z.string().uuid().optional(),message:z.string().trim().min(1).max(4000)});
export async function POST(req:NextRequest){
 if(!supabaseConfigured())return NextResponse.json({error:"Supabase is not configured"},{status:503});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"AI provider is not configured. The owner must add OPENAI_API_KEY in Vercel."},{status:503});
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"Sign in to use the tutor"},{status:401});
 const parsed=requestSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid input"},{status:400});
 const {message,courseId}=parsed.data;let conversationId=parsed.data.conversationId;
 if(courseId){const {data:course}=await db.from("courses").select("id,name,subject").eq("id",courseId).eq("user_id",user.id).single();if(!course)return NextResponse.json({error:"Course not found"},{status:404});}
 if(conversationId){const {data:existing}=await db.from("tutor_conversations").select("id").eq("id",conversationId).eq("user_id",user.id).single();if(!existing)return NextResponse.json({error:"Conversation not found"},{status:404});}
 else {const {data:created,error}=await db.from("tutor_conversations").insert({user_id:user.id,course_id:courseId||null,title:message.slice(0,60)}).select("id").single();if(error||!created)return NextResponse.json({error:"Could not create conversation"},{status:500});conversationId=created.id;}
 const {data:history}=await db.from("tutor_messages").select("role,content").eq("conversation_id",conversationId).eq("user_id",user.id).order("created_at",{ascending:false}).limit(18);
 const prior=(history||[]).reverse().map(x=>({role:x.role as "user"|"assistant",content:x.content}));
 const {error:saveError}=await db.from("tutor_messages").insert({conversation_id:conversationId,user_id:user.id,role:"user",content:message});
 if(saveError)return NextResponse.json({error:"Could not save your message"},{status:500});
 try{
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:25000,maxRetries:1});
 const completion=await client.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",max_tokens:900,messages:[{role:"system",content:"You are StudyForge, a supportive tutoring assistant. Teach foundational concepts, check understanding, avoid giving the entire solution immediately unless requested. Ask clarifying questions if material is missing. Never claim to have read notes unless they are actually provided in context. State uncertainty on unverifiable claims."},...prior,{role:"user",content:message}]});
 const answer=completion.choices[0]?.message?.content||"I could not generate a useful answer.";
 await db.from("tutor_messages").insert({conversation_id:conversationId,user_id:user.id,role:"assistant",content:answer});
 return NextResponse.json({conversationId,answer});
 }catch{return NextResponse.json({error:"The tutoring service could not complete your request. Try again."},{status:502})}
}
