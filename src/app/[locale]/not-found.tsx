import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream-100 px-4 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-sage-600">404</p>
        <p className="mt-2 text-ink-soft">
          الصفحة غير موجودة · Page not found · הדף לא נמצא
        </p>
        <Link href="/ar" className="btn-primary mt-6">
          الرئيسية / Home
        </Link>
      </div>
    </div>
  );
}
