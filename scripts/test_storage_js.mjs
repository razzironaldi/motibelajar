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
const result = await client.storage.from('private-assets').upload(path, body, { contentType: 'text/plain', upsert: false });
if (result.error) throw result.error;
const own = await client.storage.from('private-assets').download(path);
if (own.error || new TextDecoder().decode(await own.data.arrayBuffer()) !== '12345678901234567890123456789012') throw own.error ?? new Error('owner download mismatch');
const other = createClient(env.API_URL, key, { auth: { persistSession: false } });
const otherAuth = await other.auth.signInWithPassword({ email: 'student-b@example.test', password: 'fixture-password' });
if (otherAuth.error) throw otherAuth.error;
const denied = await other.storage.from('private-assets').download(path);
if (!denied.error) throw new Error('cross-user download unexpectedly allowed');
const signed = await client.storage.from('private-assets').createSignedUrl(path, 60);
if (signed.error) throw signed.error;
const signedResponse = await fetch(signed.data.signedUrl);
if (signedResponse.status !== 200) throw new Error(`signed URL ${signedResponse.status}`);
const removed = await client.storage.from('private-assets').remove([path]);
if (removed.error) throw removed.error;
console.log(JSON.stringify({ method: 'supabase-js', api_host: base.hostname, api_port: base.port, uid, path, owner_upload: 200, owner_download: 200, cross_user_denied: denied.error.status ?? 400, signed_url: signedResponse.status, delete: 200 }));
