import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';

const statusCommand = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const statusArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npx supabase status --output-format json']
  : ['supabase', 'status', '--output-format', 'json'];
const status = JSON.parse(execFileSync(statusCommand, statusArgs, { cwd: process.cwd(), encoding: 'utf8' }));
const env = status.env;
const base = new URL(env.API_URL);
if (!['127.0.0.1', 'localhost', '::1'].includes(base.hostname)) throw new Error('non-loopback API_URL');
const key = env.PUBLISHABLE_KEY || env.ANON_KEY;
if (!key || key === env.SERVICE_ROLE_KEY) throw new Error('service_role key rejected');
const client = createClient(env.API_URL, key, { auth: { persistSession: false } });
const { data: auth, error: authError } = await client.auth.signInWithPassword({ email: 'student-a@example.test', password: 'fixture-password' });
if (authError) throw new Error(`login ${authError.status ?? 'unknown'} ${authError.message}`);
const uid = auth.user.id;
const path = `${uid}/js-${Date.now()}.txt`;
const body = new TextEncoder().encode('12345678901234567890123456789012');
const started = Date.now();
const result = await Promise.race([
  client.storage.from('private-assets').upload(path, body, { contentType: 'text/plain', upsert: false }),
  new Promise(resolve => setTimeout(() => resolve({ data: null, error: { status: 599, message: 'client timeout after 15000ms' } }), 15000)),
]);
console.log(JSON.stringify({ method: 'supabase-js', api_host: base.hostname, api_port: base.port, uid, path, bytes: body.byteLength, duration_ms: Date.now() - started, status: result.error?.status ?? 200, code: result.error?.code ?? null, message: result.error?.message ?? null }));
if (result.error) process.exitCode = 1;
