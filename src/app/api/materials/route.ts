import {NextRequest,NextResponse} from "next/server";
import {serverDb,supabaseConfigured} from "@/lib/supabase";
const supported=new Map([["text/plain",["txt"]],["application/pdf",["pdf"]],["image/png",["png"]],["image/jpeg",["jpg","jpeg"]],["application/vnd.openxmlformats-officedocument.wordprocessingml.document",["docx"]]]);
export async function POST(req:NextRequest){
 if(!supabaseConfigured())return NextResponse.json({error:"Storage is not configured"},{status:503});
 const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const form=await req.formData();const upload=form.get("file"),courseId=form.get("courseId");
 if(!(upload instanceof File)||typeof courseId!=="string"||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(courseId))return NextResponse.json({error:"File and course are required"},{status:400});
 if(upload.size===0||upload.size>8*1024*1024)return NextResponse.json({error:"Maximum file size is 8 MB"},{status:413});
 const extension=upload.name.split(".").pop()?.toLowerCase()||"";
 if(!supported.get(upload.type)?.includes(extension))return NextResponse.json({error:"Unsupported file type"},{status:400});
 const {data:course}=await db.from("courses").select("id").eq("id",courseId).eq("user_id",user.id).single();if(!course)return NextResponse.json({error:"Course not found"},{status:404});
 const buffer=new Uint8Array(await upload.arrayBuffer());const magic=Array.from(buffer.slice(0,4));
 const isPdf=buffer.slice(0,5).every((n,i)=>n===[37,80,68,70,45][i]);
 const isPng=[137,80,78,71].every((n,i)=>magic[i]===n);
 const isJpeg=magic[0]===255&&magic[1]===216;
 const isZip=[80,75].every((n,i)=>magic[i]===n);
 if((extension==="pdf"&&!isPdf)||(extension==="png"&&!isPng)||(["jpg","jpeg"].includes(extension)&&!isJpeg)||(extension==="docx"&&!isZip))return NextResponse.json({error:"File content does not match extension"},{status:400});
 const path=`${user.id}/${courseId}/${crypto.randomUUID()}.${extension}`;
 const {error:storageError}=await db.storage.from("course-materials").upload(path,buffer,{contentType:upload.type,upsert:false});
 if(storageError)return NextResponse.json({error:"Could not store file"},{status:500});
 const extractedText=extension==="txt"?new TextDecoder("utf-8",{fatal:false}).decode(buffer).slice(0,40000):null;
 const {data,error}=await db.from("course_materials").insert({user_id:user.id,course_id:courseId,filename:upload.name.slice(0,220),storage_path:path,mime_type:upload.type,extracted_text:extractedText}).select("id,filename,created_at").single();
 if(error){await db.storage.from("course-materials").remove([path]);return NextResponse.json({error:"Could not save material"},{status:500});}
 return NextResponse.json({material:data,analyzed:Boolean(extractedText),notice:extractedText?"Text ready for grounded tutoring":"File stored privately; document/image text extraction is not available yet."});
}
