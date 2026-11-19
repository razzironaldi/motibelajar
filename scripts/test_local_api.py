"""Local-only Auth/PostgREST authorization test.

Endpoint and publishable key come only from local Supabase CLI JSON status.
No service_role key is accepted or used.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, NoReturn

LOOPBACK = {"127.0.0.1", "localhost", "::1"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUPABASE = shutil.which("supabase") or shutil.which("npx")


def fail(message: str) -> NoReturn:
    raise SystemExit(message)


def local_status() -> dict[str, Any]:
    try:
        if not SUPABASE:
            fail("Supabase CLI not found")
        command = ([SUPABASE, "status", "--output-format", "json"]
                   if os.path.basename(SUPABASE).lower() == "supabase"
                   else [SUPABASE, "supabase", "status", "--output-format", "json"])
        raw = subprocess.check_output(command, cwd=ROOT, text=True, stderr=subprocess.STDOUT)
        value = json.loads(raw)
    except (OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        fail(f"cannot read local Supabase JSON status: {type(exc).__name__}")
    if not isinstance(value, dict) or not isinstance(value.get("env"), dict):
        fail("Supabase status JSON missing env object")
    return value


def local_url(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        fail(f"{label} is empty")
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme not in {"http", "https"} or parsed.hostname not in LOOPBACK:
        fail(f"{label} is not a loopback HTTP URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        fail(f"{label} contains unsupported URL components")
    return value.rstrip("/")


status_json = local_status()
env = status_json["env"]
BASE = local_url(env.get("API_URL"), "API_URL")
key = env.get("PUBLISHABLE_KEY") or env.get("ANON_KEY")
if not isinstance(key, str) or not key or key == env.get("SERVICE_ROLE_KEY"):
    fail("local publishable/anon key unavailable or service_role selected")

def request(path: str, data: Any = None, token: str | None = None, method: str | None = None, content_type: str = "application/json") -> tuple[int, Any]:
    body = None if data is None else (json.dumps(data).encode() if content_type == "application/json" else data)
    headers = {"Content-Type": content_type, "apikey": key}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method=method or ("POST" if body is not None else "GET"))
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read()
            try:
                return response.status, json.loads(raw or b"null")
            except json.JSONDecodeError:
                return response.status, raw
    except urllib.error.HTTPError as exc:
        try:
            return exc.code, json.loads(exc.read() or b"null")
        except json.JSONDecodeError:
            return exc.code, None
    except TimeoutError:
        return 599, {"code": "timeout", "message": "local HTTP timeout"}


def expect(label: str, actual: int, allowed: set[int]) -> bool:
    ok = actual in allowed
    print(f"{'PASS' if ok else 'FAIL'} {label}: HTTP {actual} expected {sorted(allowed)}")
    return ok

actors = {name: (f"{name}@example.test", "fixture-password") for name in ("student-a", "student-b", "bk-a", "bk-b", "additional-bk", "admin", "reviewer")}
tokens: dict[str, str] = {}
failures = 0
for name, (email, password) in actors.items():
    code, payload = request("/auth/v1/token?grant_type=password", {"email": email, "password": password})
    if not expect(f"login {name}", code, {200}):
        failures += 1
    elif isinstance(payload, dict) and payload.get("access_token"):
        tokens[name] = payload["access_token"]
    else:
        print(f"FAIL login {name}: no access token")
        failures += 1

def check(label: str, code: int, allowed: set[int]) -> None:
    global failures
    if not expect(label, code, allowed):
        failures += 1

if "student-a" in tokens:
    code, rows = request("/rest/v1/profiles?select=id,display_name,student_code,active", token=tokens["student-a"])
    check("student A reads own safe profile", code, {200})
    if code == 200 and (not isinstance(rows, list) or len(rows) != 1):
        print("FAIL student A own-row cardinality")
        failures += 1
    code, rows = request("/rest/v1/profiles?id=eq.10000000-0000-0000-0000-000000000002&select=id", token=tokens["student-a"])
    check("student A cannot read student B", code, {200})
    if code == 200 and rows != []:
        print("FAIL student A received student B rows")
        failures += 1
    code, _ = request("/rest/v1/profiles?select=role", token=tokens["student-a"])
    check("student A cannot read role column", code, {401, 403})
    code, _ = request("/rest/v1/profiles?select=email", token=tokens["student-a"])
    check("student A cannot read email column", code, {401, 403})
    code, _ = request("/rest/v1/profiles?id=eq.10000000-0000-0000-0000-000000000001", {"role": "admin"}, tokens["student-a"], "PATCH")
    check("student A cannot change role", code, {401, 403})
    
if "bk-a" in tokens:
    code, rows = request("/rest/v1/profiles?id=eq.10000000-0000-0000-0000-000000000001&select=id", token=tokens["bk-a"])
    check("primary BK reads assigned student", code, {200})
    if code == 200 and rows == []:
        print("FAIL primary BK assigned-student visibility missing")
        failures += 1
if "bk-b" in tokens:
    code, _ = request("/rest/v1/counseling_notes?select=id", token=tokens["bk-b"])
    check("unassigned BK denied counseling notes", code, {401, 403})
if "additional-bk" in tokens:
    code, _ = request("/rest/v1/counseling_notes?select=id", token=tokens["additional-bk"])
    check("additional BK restricted counseling notes", code, {401, 403})
code, _ = request("/rest/v1/public_site_announcements?select=id,slug")
check("anon reads public projection", code, {200})
code, _ = request("/rest/v1/profiles?select=id")
check("anon cannot read private profiles", code, {401, 403})
code, _ = request("/rest/v1/profiles?select=id", token="invalid-token")
check("invalid token rejected", code, {401})
code, _ = request("/rest/v1/profiles?select=id")
check("private endpoint without token rejected", code, {401, 403})
if "student-a" in tokens and "student-b" in tokens:
    own_path = "10000000-0000-0000-0000-000000000001/api-test.txt"
    other_path = "10000000-0000-0000-0000-000000000002/api-test.txt"
    code, _ = request(f"/storage/v1/object/private-assets/{own_path}", b"local-test", tokens["student-a"], "POST", "text/plain")
    check("student A uploads private file", code, {200, 201})
    code, _ = request(f"/storage/v1/object/private-assets/{own_path}", token=tokens["student-a"])
    check("student A downloads own private file", code, {200})
    code, _ = request(f"/storage/v1/object/private-assets/{other_path}", token=tokens["student-a"])
    check("student A cannot download other private file", code, {400, 401, 403, 404})
    code, _ = request("/storage/v1/object/sign/private-assets", {"expiresIn": 1, "paths": [own_path]}, tokens["student-a"])
    check("private signed URL request", code, {200, 201, 400, 401, 403})
    print("INFO public publication/revocation: no end-user publication API exists yet")
print(f"API_TEST_SUMMARY failed={failures}")
if failures:
    raise SystemExit(1)
