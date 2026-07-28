import { neon } from '@neondatabase/serverless';

interface Env {
  DATABASE_URL: string;
  ADMIN_TOKEN: string;
  ALLOWED_ORIGIN: string;
}

const ADMIN_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Styled by Gloria — Enquiries</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#101010;background:#f7f6f3}*{box-sizing:border-box}body{margin:0}.shell{max-width:1220px;margin:auto;padding:36px 20px}.top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#777}.title{font-family:Georgia,serif;font-size:38px;font-weight:400;margin:8px 0 0}.panel{background:#fff;border:1px solid #ddd;padding:22px}.toolbar{display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between;margin-bottom:18px}.input,select,button{font:inherit;border:1px solid #ccc;background:#fff;padding:11px 13px;border-radius:0}.input{min-width:240px}button{cursor:pointer;background:#101010;color:#fff;text-transform:uppercase;font-size:11px;letter-spacing:.12em}.muted{color:#777;font-size:13px}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:820px}th,td{text-align:left;padding:14px 10px;border-bottom:1px solid #e7e7e7;vertical-align:top}th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#666}td{font-size:13px}.message{white-space:pre-wrap;max-width:360px;color:#555}.status{display:inline-block;padding:5px 8px;font-size:10px;text-transform:uppercase;letter-spacing:.1em;background:#eee}.status.new{background:#f0e2c8}.status.archived{background:#e6e6e6}.login{max-width:420px;margin:15vh auto;padding:20px}.login h1{font-family:Georgia,serif;font-size:32px;font-weight:400}.login form{display:grid;gap:12px}.error{color:#a00;font-size:13px;margin-top:12px}@media(max-width:600px){.top{display:block}.title{font-size:30px}.shell{padding:24px 14px}}
</style></head><body><main id="app"></main>
<script>
const app=document.getElementById('app');let token=sessionStorage.getItem('sbg_admin_token')||'';
function login(error=''){app.innerHTML='<section class="login panel"><div class="eyebrow">Styled by Gloria</div><h1>Enquiry desk</h1><p class="muted">Enter the private admin token to view submissions.</p><form id="login"><input class="input" id="token" type="password" placeholder="Admin token" required><button>Open dashboard</button></form>'+(error?'<p class="error">'+error+'</p>':'')+'</section>';document.getElementById('login').onsubmit=e=>{e.preventDefault();token=document.getElementById('token').value;sessionStorage.setItem('sbg_admin_token',token);load()}}
async function api(path,options={}){const r=await fetch(path,{...options,headers:{Authorization:'Bearer '+token,...(options.headers||{})}});if(r.status===401){sessionStorage.removeItem('sbg_admin_token');token='';login('Invalid admin token.');throw new Error('Unauthorized')}if(!r.ok)throw new Error(await r.text());return r.json()}
async function load(){try{const data=await api('/api/submissions');render(data.submissions||[])}catch(e){if(token) app.innerHTML='<section class="login panel"><p class="error">Unable to load submissions.</p><button onclick="logout()">Sign out</button></section>'}}
function render(rows){app.innerHTML='<div class="shell"><div class="top"><div><div class="eyebrow">Styled by Gloria / Private desk</div><h1 class="title">Enquiries</h1></div><button onclick="logout()">Sign out</button></div><section class="panel"><div class="toolbar"><input id="search" class="input" placeholder="Search name, email, subject"><select id="status"><option value="">All statuses</option><option value="new">New</option><option value="archived">Archived</option></select><span id="count" class="muted"></span></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Contact</th><th>Subject</th><th>Message</th><th>Status</th><th></th></tr></thead><tbody id="rows"></tbody></table></div></section></div>';const draw=()=>{const q=(document.getElementById('search').value||'').toLowerCase(),s=document.getElementById('status').value;const filtered=rows.filter(x=>(!s||x.status===s)&&(!q||[x.name,x.email,x.subject,x.message].join(' ').toLowerCase().includes(q)));document.getElementById('count').textContent=filtered.length+' enquiries';document.getElementById('rows').innerHTML=filtered.map(x=>'<tr><td>'+new Date(x.created_at).toLocaleString()+'</td><td><strong>'+esc(x.name)+'</strong><br><a href="mailto:'+esc(x.email)+'">'+esc(x.email)+'</a></td><td>'+esc(x.subject||'—')+'<br><span class="muted">'+esc(x.source)+'</span></td><td class="message">'+esc(x.message)+'</td><td><span class="status '+esc(x.status)+'">'+esc(x.status)+'</span></td><td><button onclick="archive('+x.id+')">'+(x.status==='archived'?'Restore':'Archive')+'</button></td></tr>').join('')||'<tr><td colspan="6" class="muted">No enquiries found.</td></tr>'};document.getElementById('search').oninput=draw;document.getElementById('status').onchange=draw;draw()}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
async function archive(id){await api('/api/submissions/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'archived'})});load()}
function logout(){sessionStorage.removeItem('sbg_admin_token');token='';login()}token?load():login();
</script></body></html>`;

function corsHeaders(origin: string, env: Env) {
  return {
    'Access-Control-Allow-Origin': origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

function json(data: unknown, status = 200, env?: Env, origin = '') {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...(env ? corsHeaders(origin, env) : {}) } });
}

function authorized(request: Request, env: Env) {
  return env.ADMIN_TOKEN && request.headers.get('Authorization') === `Bearer ${env.ADMIN_TOKEN}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin, env) });
    if (url.pathname === '/admin' || url.pathname === '/admin/') return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/health') return json({ ok: true, service: 'styled-by-gloria-leads' }, 200, env, origin);
    if (url.pathname === '/api/submissions' && request.method === 'POST') {
      if (origin !== env.ALLOWED_ORIGIN) return json({ error: 'Forbidden' }, 403, env, origin);
      try {
        const body = await request.json() as Record<string, unknown>;
        if (String(body.website || '').trim()) return json({ ok: true }, 200, env, origin);
        const name = String(body.name || '').trim().slice(0, 120);
        const email = String(body.email || '').trim().slice(0, 200);
        const subject = String(body.subject || '').trim().slice(0, 200);
        const message = String(body.message || '').trim().slice(0, 5000);
        const source = String(body.source || 'contact').trim().slice(0, 80);
        const pageUrl = String(body.page_url || '').trim().slice(0, 500);
        if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please provide a valid name, email, and message.' }, 422, env, origin);
        const sql = neon(env.DATABASE_URL);
        await sql`INSERT INTO submissions (name, email, subject, message, source, page_url) VALUES (${name}, ${email}, ${subject}, ${message}, ${source}, ${pageUrl})`;
        return json({ ok: true }, 201, env, origin);
      } catch { return json({ error: 'Unable to save enquiry.' }, 400, env, origin); }
    }
    if (url.pathname === '/api/submissions' && request.method === 'GET') {
      if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401, env, origin);
      const sql = neon(env.DATABASE_URL);
      const submissions = await sql`SELECT id, created_at, name, email, subject, message, source, page_url, status FROM submissions ORDER BY created_at DESC LIMIT 500`;
      return json({ submissions }, 200, env, origin);
    }
    const match = url.pathname.match(/^\/api\/submissions\/(\d+)$/);
    if (match && request.method === 'PATCH') {
      if (!authorized(request, env)) return json({ error: 'Unauthorized' }, 401, env, origin);
      const body = await request.json() as { status?: string };
      const status = body.status === 'archived' ? 'archived' : 'new';
      const sql = neon(env.DATABASE_URL);
      const id = Number(match[1]);
      await sql`UPDATE submissions SET status=${status} WHERE id=${id}`;
      return json({ ok: true }, 200, env, origin);
    }
    return new Response('Not found', { status: 404 });
  }
};
