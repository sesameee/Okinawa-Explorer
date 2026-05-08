import type { ItineraryDay } from "../../data/itinerary";

export function TripOverviewTable({
  days,
  onDayClick,
}: {
  days: ItineraryDay[];
  onDayClick: (dayNumber: number) => void;
}) {
  return (
    <section className="scrapbook-card border-primary/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4">行程總覽</h3>
      <div className="space-y-2">
        {days.map((d) => (
          <div
            key={d.dayNumber}
            className="flex items-start justify-between gap-4 border-b border-primary/10 pb-2 text-sm"
          >
            <button
              type="button"
              onClick={() => onDayClick(d.dayNumber)}
              className="text-primary font-semibold whitespace-nowrap hover:underline cursor-pointer"
            >
              Day {d.dayNumber}
            </button>
            <div className="hidden md:block text-slate-200 flex-1">{d.dateLabel}</div>
            <div className="text-slate-400 text-right">{d.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
