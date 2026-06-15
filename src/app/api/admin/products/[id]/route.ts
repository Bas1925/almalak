import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { updateProduct, deleteProduct, getProductById } from "@/lib/server/catalog";
import { normalizeProduct } from "@/lib/admin/product-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const existing = await getProductById(params.id);
  if (!existing) return NextResponse.json({ error: "not-found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  const next = normalizeProduct(body, { isNew: false, existing });
  if (!next) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const updated = await updateProduct(params.id, next);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ok = await deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "not-found" }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
