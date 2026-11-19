from __future__ import annotations
import json, subprocess, time, urllib.error, urllib.parse, urllib.request

status_raw = subprocess.check_output('npx supabase status --output-format json', shell=True, text=True)
status = json.loads(status_raw)
env = status['env']; base = env['API_URL']; key = env.get('PUBLISHABLE_KEY') or env.get('ANON_KEY')
parsed = urllib.parse.urlsplit(base)
if parsed.hostname not in {'127.0.0.1', 'localhost', '::1'}: raise SystemExit('non-loopback')

def call(path, body=None, token=None, content_type='application/json', timeout=15):
    headers={'apikey': key, 'Content-Type': content_type}
    if token: headers['Authorization'] = f'Bearer {token}'
    req=urllib.request.Request(base+path, data=body, headers=headers, method='POST' if body is not None else 'GET')
    started=time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(), time.monotonic()-started, None
    except urllib.error.HTTPError as e:
        return e.code, e.read(), time.monotonic()-started, None
    except Exception as e:
        return 599, b'', time.monotonic()-started, type(e).__name__

auth_code, raw, _, exc = call('/auth/v1/token?grant_type=password', json.dumps({'email':'student-a@example.test','password':'fixture-password'}).encode())
if auth_code != 200: raise SystemExit(f'login HTTP {auth_code} exception={exc} body={raw[:300]!r}')
session=json.loads(raw); token=session['access_token']; uid=session['user']['id']; path=f'{uid}/http-{int(time.time()*1000)}.txt'; body=b'12345678901234567890123456789012'
code, raw, duration, exc=call(f'/storage/v1/object/private-assets/{path}', body, token, 'text/plain')
print(json.dumps({'method':'http','api_host':parsed.hostname,'api_port':parsed.port,'uid':uid,'path':path,'bytes':len(body),'duration_ms':round(duration*1000),'status':code,'exception_type':exc,'response':raw[:500].decode('utf8','replace')}))
if code >= 500 or code == 599: raise SystemExit(1)
