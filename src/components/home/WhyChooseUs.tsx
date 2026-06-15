import { Banknote, Gift, Gem } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { SectionHeading } from "./Categories";

export function WhyChooseUs({ dict }: { dict: Dictionary }) {
  const items = [
    { icon: Banknote, ...dict.whyUs.items.payment, color: "text-blossom-500 bg-blossom-50" },
    { icon: Gift, ...dict.whyUs.items.packaging, color: "text-gold-400 bg-gold-50" },
    { icon: Gem, ...dict.whyUs.items.quality, color: "text-sage-500 bg-sage-50" },
  ];

  return (
    <section className="container-px py-16 lg:py-20">
      <SectionHeading title={dict.whyUs.title} subtitle={dict.whyUs.subtitle} />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="card flex flex-col items-center p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <span className={`grid h-16 w-16 place-items-center rounded-2xl ${item.color}`}>
              <item.icon className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <h3 className="mt-5 font-display text-lg font-bold text-sage-700">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
