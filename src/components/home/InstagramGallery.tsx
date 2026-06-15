import Image from "next/image";
import { Instagram } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { SectionHeading } from "./Categories";
import { INSTAGRAM_HANDLE } from "@/lib/utils";

const GALLERY = [
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=400&q=80",
  "/products/flowers-6.jpeg",
  "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=400&q=80",
];

export function InstagramGallery({ dict }: { dict: Dictionary }) {
  return (
    <section className="bg-cream-50 py-16 lg:py-20">
      <div className="container-px">
        <SectionHeading
          title={dict.instagram.title}
          subtitle={dict.instagram.subtitle}
        />

        <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
          {GALLERY.map((src, i) => (
            <a
              key={i}
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={src}
                alt={`${dict.instagram.title} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 grid place-items-center bg-sage-700/0 text-white opacity-0 transition-all duration-300 group-hover:bg-sage-700/40 group-hover:opacity-100">
                <Instagram className="h-7 w-7" />
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <Instagram className="h-4 w-4" />
            {dict.instagram.follow} @{INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  );
}
