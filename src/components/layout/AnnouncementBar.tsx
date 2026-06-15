import { MapPin } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export function AnnouncementBar({ dict }: { dict: Dictionary }) {
  return (
    <div className="bg-sage-600 text-cream-100">
      <div className="container-px flex h-9 items-center justify-center text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {dict.announcement.location}
        </span>
      </div>
    </div>
  );
}
