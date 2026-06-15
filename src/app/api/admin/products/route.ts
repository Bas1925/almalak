import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { getAllProducts, createProduct } from "@/lib/server/catalog";
import { normalizeProduct } from "@/lib/admin/product-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ products: await getAllProducts() });
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  const product = normalizeProduct(body, { isNew: true });
  if (!product) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await createProduct(product);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, product });
}
