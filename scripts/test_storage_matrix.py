from __future__ import annotations
import json, subprocess, time, urllib.error, urllib.parse, urllib.request

s=json.loads(subprocess.check_output('npx supabase status --output-format json',shell=True,text=True)); e=s['env']; base=e['API_URL']; key=e.get('PUBLISHABLE_KEY') or e.get('ANON_KEY')

def call(path, body=None, token=None, method=None, ctype='application/json', timeout=20):
 h={'apikey':key,'Content-Type':ctype};
 if token: h['Authorization']=f'Bearer {token}'
 req=urllib.request.Request(base+path,data=body,headers=h,method=method or ('POST' if body is not None else 'GET'))
 try:
  with urllib.request.urlopen(req,timeout=timeout) as r: return r.status,r.read()
 except urllib.error.HTTPError as x: return x.code,x.read()
 except Exception as x: return 599,str(x).encode()

def login(email):
 c,b=call('/auth/v1/token?grant_type=password',json.dumps({'email':email,'password':'fixture-password'}).encode())
 return c,json.loads(b)['access_token']
_,a=login('student-a@example.test'); _,b=login('student-b@example.test');
path=f'10000000-0000-0000-0000-000000000001/matrix-{int(time.time()*1000)}.txt'; body=b'12345678901234567890123456789012'
for label,c,t in [('upload',None,a),('owner-download',None,a),('cross-user-download',None,b),('anon-download',None,None)]:
 if label=='upload': code,raw=call('/storage/v1/object/private-assets/'+path,body,a,'POST','text/plain')
 else: code,raw=call('/storage/v1/object/private-assets/'+path,token=t)
 print(json.dumps({'test':label,'status':code,'bytes':len(raw),'body_preview':raw[:120].decode('utf8','replace')}))
code,raw=call('/storage/v1/object/sign/private-assets',json.dumps({'expiresIn':1,'paths':[path]}).encode(),a)
print(json.dumps({'test':'signed-url-create','status':code,'body_preview':raw[:300].decode('utf8','replace')}))
if code==200:
 payload=json.loads(raw); signed=payload[0].get('signedURL') or payload[0].get('signedUrl') or payload[0].get('signed_url')
 if signed:
  signed_path = signed if signed.startswith('/storage/v1/') else '/storage/v1' + signed
  code2,raw2=call(signed_path,token=None); print(json.dumps({'test':'signed-url-download-immediate','status':code2,'bytes':len(raw2)})); time.sleep(2); code3,raw3=call(signed_path,token=None); print(json.dumps({'test':'signed-url-download-expired','status':code3,'bytes':len(raw3),'body_preview':raw3[:120].decode('utf8','replace')}))
