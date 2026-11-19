import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStorageWorkerClient } from "@/lib/supabase/admin";

const out = (data: unknown, error: unknown, requestId: string, status = 200) => NextResponse.json({ data, error, requestId }, { status });

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return out(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return out(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { fileAssetId?: string; sourceObjectPath?: string; publicObjectPath?: string } | null;
  if (!body?.fileAssetId || !body.sourceObjectPath || !body.publicObjectPath) return out(null, { code: "invalid_input" }, requestId, 400);
  const { data: publication, error: publishError } = await supabase.rpc("publish_file_asset", { p_file_asset_id: body.fileAssetId, p_actor_id: user.id, p_public_object_path: body.publicObjectPath });
  if (publishError) return out(null, { code: "publication_not_authorized" }, requestId, 403);
  const worker = createStorageWorkerClient();
  if (!worker) {
    await supabase.rpc("revoke_file_publication", { p_publication_id: (publication as { id: string }).id, p_actor_id: user.id });
    return out(null, { code: "worker_not_configured" }, requestId, 503);
  }
  const { error: copyError } = await worker.storage.from("private-assets").copy(body.sourceObjectPath, body.publicObjectPath, { destinationBucket: "public-assets" });
  if (copyError) {
    await supabase.rpc("revoke_file_publication", { p_publication_id: (publication as { id: string }).id, p_actor_id: user.id });
    return out(null, { code: "publication_copy_failed" }, requestId, 502);
  }
  return out({ publication }, null, requestId, 201);
}

export async function DELETE(request: Request) {
  const requestId = crypto.randomUUID();
  const supabase = await createClient();
  if (!supabase) return out(null, { code: "not_configured" }, requestId, 503);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return out(null, { code: "unauthenticated" }, requestId, 401);
  const body = await request.json().catch(() => null) as { publicationId?: string; publicObjectPath?: string } | null;
  if (!body?.publicationId || !body.publicObjectPath) return out(null, { code: "invalid_input" }, requestId, 400);
  const { error: revokeError } = await supabase.rpc("revoke_file_publication", { p_publication_id: body.publicationId, p_actor_id: user.id });
  if (revokeError) return out(null, { code: "revocation_not_authorized" }, requestId, 403);
  const worker = createStorageWorkerClient();
  if (!worker) return out(null, { code: "worker_not_configured" }, requestId, 503);
  const { error: removeError } = await worker.storage.from("public-assets").remove([body.publicObjectPath]);
  if (removeError) return out(null, { code: "public_object_remove_failed" }, requestId, 502);
  return out({ revoked: true }, null, requestId);
}
