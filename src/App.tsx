import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronUp, Heart, Share2 } from "lucide-react";
import { ITINERARY, MUST_EAT } from "./data/itinerary";
import { useGoogleMapsScript } from "./hooks/useGoogleMapsScript";
import { computeDay, computeMustEat, createServices, type DayComputeResult, type MustEatResult } from "./lib/tripMapsRuntime";
import { TripDaySection } from "./components/trip/TripDaySection";
import { MustEatList } from "./components/trip/MustEatList";
import { TripOverviewTable } from "./components/trip/TripOverviewTable";

const NavItem = ({ day, active, onClick }: { key?: string | number; day: number; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`font-semibold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer ${
      active ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-primary'
    }`}
  >
    Day {day}
  </button>
);

type Route = "trip" | "must-eat";

const getRouteFromHash = (): Route =>
  typeof window !== "undefined" && window.location.hash === "#/must-eat" ? "must-eat" : "trip";

export default function App() {
  const [activeDay, setActiveDay] = useState("day1");
  const [isScrolled, setIsScrolled] = useState(false);
  const [dayComputed, setDayComputed] = useState<Record<number, DayComputeResult>>({});
  const [mustEatResult, setMustEatResult] = useState<MustEatResult[]>([]);
  const [route, setRoute] = useState<Route>(getRouteFromHash);

  useEffect(() => {
    const handler = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (next: Route) => {
    const hash = next === "must-eat" ? "#/must-eat" : "#/";
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapsState = useGoogleMapsScript(apiKey);
  const mapsReady = mapsState === "ready";

  const dayIdList = useMemo(() => ITINERARY.days.map((d) => `day${d.dayNumber}`), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleActiveDayByScroll = () => {
      const navOffset = 140;
      let current = dayIdList[0] ?? "day1";

      for (const id of dayIdList) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - navOffset <= 0) {
          current = id;
        }
      }
      setActiveDay((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", handleActiveDayByScroll, { passive: true });
    handleActiveDayByScroll();
    return () => window.removeEventListener("scroll", handleActiveDayByScroll);
  }, [dayIdList]);

  useEffect(() => {
    if (!mapsReady) return;
    let cancelled = false;

    (async () => {
      const { placesService, directionsService, spherical } = createServices();
      const next: Record<number, DayComputeResult> = {};
      for (const day of ITINERARY.days) {
        next[day.dayNumber] = await computeDay(day, placesService, directionsService, spherical);
      }
      const must = await computeMustEat(MUST_EAT, placesService);
      if (cancelled) return;
      setDayComputed(next);
      setMustEatResult(must);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapsReady]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveDay(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-navy-900 selection:bg-primary/30">
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
        isScrolled || route === "must-eat" ? 'bg-navy-900/95 backdrop-blur-md border-primary/10 py-4' : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("trip")}
            className="text-2xl font-bold text-primary tracking-tight cursor-pointer hover:opacity-90"
          >
            Okinawa Explorer
          </button>
          <div className="flex items-center gap-4 lg:gap-8">
            {route === "trip" && (
              <div className="hidden lg:flex items-center gap-8">
                {ITINERARY.days.map((day) => (
                  <NavItem
                    key={day.dayNumber}
                    day={day.dayNumber}
                    active={activeDay === `day${day.dayNumber}`}
                    onClick={() => scrollTo(`day${day.dayNumber}`)}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate("must-eat")}
              className={`font-semibold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer whitespace-nowrap ${
                route === "must-eat"
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-slate-400 hover:text-primary"
              }`}
            >
              必吃美食
            </button>
          </div>
        </div>
      </nav>

      {route === "trip" ? (
        <>
          {/* Hero Section */}
          <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 z-0"
            >
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbV9eQT-5UNIW1iZHXZ9wt4bCA5Tr8rwN5_8SKb4Fn2wk43TartksM4SfP3wPm4TfIh_03wuxEFZMsFterj13o95c_45GX_2-bYpk-Nbq0GcCgH9wpgAsv0HXbxMKT8DFufE4KYDX2RHgFutT_RZqFJId6lnBeam_1hUMfeepdMp5iZNHQ5h0QMR0UPljuCXto5FfTzA_sjEyqwlOtcHFWNs2Vt4ElPdJVjpCBrhovEXmPtYV8u5bJ0xfUSY3UoK3DGxsTF_3xU5A"
                alt="Okinawa Beach"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
            </motion.div>

            <div className="relative z-10 text-center px-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white"
              >
                Okinawa Family Adventure
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="text-lg md:text-xl max-w-2xl mx-auto text-slate-200/90 leading-relaxed font-medium"
              >
                準備好衝向沖繩的大海與陽光了嗎？
                <br />
                7 天親子冒險行程，帶你一路玩遍人氣景點、美食與夢幻海灘！
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-12 flex justify-center"
              >
                <div className="w-1 h-12 bg-primary rounded-full animate-bounce opacity-40" />
              </motion.div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 py-24 space-y-48">
            <TripOverviewTable
              days={ITINERARY.days}
              onDayClick={(dayNumber) => scrollTo(`day${dayNumber}`)}
            />

            {ITINERARY.days.map((day, idx) => (
              <TripDaySection
                key={day.dayNumber}
                day={day}
                idx={idx}
                compute={dayComputed[day.dayNumber]}
                mapsReady={mapsReady}
              />
            ))}

            {mapsState === "missing_key" && (
              <div className="text-sm text-amber-300 scrapbook-card border-amber-500/20 p-4">
                尚未設定 <code>VITE_GOOGLE_MAPS_API_KEY</code>，目前僅顯示靜態行程資料。
              </div>
            )}
          </main>
        </>
      ) : (
        <main className="max-w-3xl mx-auto px-6 pt-18 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
          </motion.div>
          <MustEatList items={MUST_EAT} results={mustEatResult} />
        </main>
      )}

      {isScrolled && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-5 bottom-6 md:right-8 md:bottom-8 z-50 rounded-full bg-primary text-navy-900 p-3 shadow-xl hover:shadow-primary/30 transition-shadow"
          aria-label="回到最上面"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </div>
  );
}
