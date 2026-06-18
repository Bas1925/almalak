import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { getStudioAdminItems, saveStudioItems } from "@/lib/server/studio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getStudioAdminItems() });
}

export async function PUT(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const ok = await saveStudioItems(body);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 400 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, items: await getStudioAdminItems() });
}
