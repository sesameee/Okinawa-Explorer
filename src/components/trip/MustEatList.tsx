import type { MustEatItem } from "../../data/itinerary";
import type { MustEatResult } from "../../lib/tripMapsRuntime";
import { mapsQueryLink, starText } from "../../lib/tripMapsUtils";

export function MustEatList({
  items,
  results,
}: {
  items: MustEatItem[];
  results: MustEatResult[];
}) {
  const map = new Map(results.map((r) => [r.title, r.result]));

  return (
    <section className="scrapbook-card border-primary/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4">必吃美食</h3>
      <div className="space-y-4">
        {items.map((m) => {
          const res = map.get(m.title);
          const rating = res?.details?.rating;
          const count = res?.details?.user_ratings_total;
          return (
            <div key={m.title} className="border-b border-primary/10 pb-3">
              <div className="font-semibold text-slate-100">{m.title}</div>
              <div className="text-xs text-slate-400">
                Day {m.daySuggested} · {m.scheduleHint.start}–{m.scheduleHint.end}
              </div>
              <div className="text-xs text-amber-300 mt-1">
                {starText(rating as number)}{" "}
                {typeof count === "number" ? `${count.toLocaleString("zh-Hant-JP")} 則` : ""}
              </div>
              <a
                href={mapsQueryLink(m.title)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Google Maps
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
