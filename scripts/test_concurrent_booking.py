"""Local-only two-session HTTP booking race. No service-role key."""
from __future__ import annotations
import json, os, shutil, subprocess, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cli=shutil.which("supabase")
if cli:
    cmd=[cli,"status","--output-format","json"]
else:
    npx=shutil.which("npx.cmd") or shutil.which("npx")
    if not npx: raise SystemExit("npx unavailable")
    cmd=[npx,"supabase","status","--output-format","json"]
env=json.loads(subprocess.check_output(cmd,cwd=ROOT,text=True))["env"]
base=env["API_URL"].rstrip("/")
key=env.get("PUBLISHABLE_KEY") or env.get("ANON_KEY")
users={"student":"student-a@example.test","bk":"bk-a@example.test"}

def req(path, data=None, token=None, method=None):
    body=None if data is None else json.dumps(data).encode()
    headers={"apikey":key,"Content-Type":"application/json","Prefer":"return=representation"}
    if token: headers["Authorization"]=f"Bearer {token}"
    r=urllib.request.Request(base+path,body,headers,method or ("POST" if body else "GET"))
    try:
        with urllib.request.urlopen(r,timeout=20) as x:return x.status,json.loads(x.read() or b"null")
    except urllib.error.HTTPError as e:return e.code,json.loads(e.read() or b"null")

def login(email):
    code,p=req("/auth/v1/token?grant_type=password",{"email":email,"password":"fixture-password"})
    assert code==200 and p.get("access_token"), (code,p)
    return p["access_token"]

student=login(users["student"])
bk1=login(users["bk"]); bk2=login(users["bk"])
future=datetime.now(timezone.utc)+timedelta(days=3)
slot_payload={"p_counselor_id":"10000000-0000-0000-0000-000000000011","p_starts_at":future.isoformat(),"p_ends_at":(future+timedelta(minutes=30)).isoformat(),"p_channel":"online","p_location_ref":"local-race"}
code,slot=req("/rest/v1/rpc/create_counseling_slot",slot_payload,bk1)
assert code==200,(code,slot)
slot_id=slot[0] if isinstance(slot,list) else slot
request_id="40000000-0000-0000-0000-000000000002"
setup=("insert into public.counseling_requests "
       "(id,student_id,assigned_counselor_id,reason,category,urgency,status,availability_json) "
       "values ('"+request_id+"','10000000-0000-0000-0000-000000000001',"
       "'10000000-0000-0000-0000-000000000011','Concurrent booking test','belajar','normal','submitted','{}');")
subprocess.check_call([npx,"supabase","db","query",setup],cwd=ROOT)

def race(token):
    return req("/rest/v1/rpc/offer_counseling_slot",{"p_request_id":request_id,"p_slot_id":slot_id,"p_counselor_id":"10000000-0000-0000-0000-000000000011"},token)
with ThreadPoolExecutor(max_workers=2) as pool:
    results=list(pool.map(race,[bk1,bk2]))
statuses=[code for code,_ in results]
print("RACE_HTTP_STATUSES",statuses)
assert sum(code==200 for code in statuses)==1, results
assert sum(code not in (200,) for code in statuses)==1, results
verify=subprocess.check_output([npx,"supabase","db","query",f"select count(*) from public.counseling_appointments where request_id='{request_id}';"],cwd=ROOT,text=True)
assert "1" in verify,(verify,)
print("CONCURRENT_BOOKING_PASS appointments=1 winner=1 loser=1")
