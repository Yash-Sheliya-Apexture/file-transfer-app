export interface Env {
	JWT_SECRET: string;
	TELEGRAM_BOT_TOKENS_JSON: string;
	DOWNLOAD_PAYLOADS: KVNamespace;
}
const corsHeaders = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'};
interface JwtPayload { kvKey: string }
interface DownloadPayload { fileName: string; fileSize: number; chunks: { order: number; locations: { botId: string; fileId: string }[] }[] }
async function verifyJwt(token: string, secret: string): Promise<JwtPayload|null> { try { const [h,p,s]=token.split('.'); if(!h||!p||!s) return null; const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},!1,['verify']); const v=await crypto.subtle.verify('HMAC',k,base64UrlToBytes(s),new TextEncoder().encode(`${h}.${p}`)); if(!v) return null; return JSON.parse(new TextDecoder().decode(base64UrlToBytes(p))) } catch(e){return null}}
async function getTelegramFileUrl(fileId: string, botToken: string): Promise<string> { const a=`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`; const r=await fetch(a); if(!r.ok){const t=await r.text();throw new Error(`Telegram getFile API failed with status ${r.status}: ${t}`)} let d; try{d=await r.json()}catch(e){throw new Error("Telegram API returned a non-JSON response.")} if(!d.ok||!d.result.file_path){throw new Error(`Telegram API error: ${d.description||"Could not get file path"}`)} return `https://api.telegram.org/file/bot${botToken}/${d.result.file_path}`}
const base64UrlToBytes = (s:string): ArrayBuffer => { const p=s.replace(/-/g,'+').replace(/_/g,'/'); const a=atob(p); const l=a.length; const b=new Uint8Array(l); for(let i=0;i<l;i++){b[i]=a.charCodeAt(i)} return b.buffer};
async function streamChunksToWriter(writable: WritableStream, chunks: DownloadPayload['chunks'], botTokenMap: Map<string, string>) { const w=writable.getWriter(); const s=chunks.sort((a,b)=>a.order-b.order); try { for(const c of s){let v=!1;let l:Error|undefined;for(let a=1;a<=3;a++){for(const o of c.locations){try{const t=botTokenMap.get(o.botId);if(!t)continue;const n=await getTelegramFileUrl(o.fileId,t);const d=await fetch(n);if(d.ok&&d.body){const k=d.body.getReader();while(!0){const {done:m,value:u}=await k.read();if(m)break;w.write(u)}v=!0;break}else{l=new Error(`Telegram API responded with status ${d.status} for chunk ${c.order}`)}}catch(e){l=e instanceof Error?e:new Error(String(e))}}if(v)break}if(!v)throw new Error(`All replicas and retries failed for chunk ${c.order}. Last error: ${l?.message}`)}await w.close()} catch(e){console.error("Streaming failed:",e);await w.abort(e)}}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method==='OPTIONS')return new Response(null, {headers:corsHeaders});
		const u=new URL(request.url); const t=u.searchParams.get('token');
		if(!t)return new Response('Missing download token.',{status:400,headers:corsHeaders});
		const j=await verifyJwt(t,env.JWT_SECRET);
		if(!j||!j.kvKey)return new Response('Invalid or expired token.',{status:403,headers:corsHeaders});
		const p=await env.DOWNLOAD_PAYLOADS.get<DownloadPayload>(j.kvKey,"json");
		if(!p)return new Response('Download link has expired or is invalid.',{status:404,headers:corsHeaders});
		ctx.waitUntil(env.DOWNLOAD_PAYLOADS.delete(j.kvKey));
		try{const m:Map<string,string>=new Map(JSON.parse(env.TELEGRAM_BOT_TOKENS_JSON).map((b:{id:string;token:string})=>[b.id,b.token]));
            const {readable:r,writable:w}=new TransformStream(); ctx.waitUntil(streamChunksToWriter(w,p.chunks,m));
            return new Response(r,{headers:{...corsHeaders,'Content-Disposition':`attachment; filename="${p.fileName}"`,'Content-Type':'application/octet-stream','Content-Length':p.fileSize.toString()}})}
        catch(e){return new Response(e instanceof Error?e.message:"An internal error occurred.",{status:500,headers:corsHeaders})}
	},
};
