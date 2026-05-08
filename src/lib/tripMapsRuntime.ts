import type { ItineraryDay, MustEatItem, StopType } from "../data/itinerary";
import {
  candidateScore,
  getTokyoWeekdayIndexFromDayNumber,
  isOpenDuringWindow,
  tokenizeForMatch,
} from "./tripMapsUtils";

export interface ResolvedPlace {
  placeId: string | null;
  coords: google.maps.LatLngLiteral | null;
  details: google.maps.places.PlaceResult | null;
  openStatus: boolean | null;
}

export interface DayLegResult {
  fromIdx: number;
  toIdx: number;
  durationMinutes: number | null;
  durationText: string | null;
  geometryKm: number | null;
}

export interface DayComputeResult {
  resolvedByStopId: Record<string, ResolvedPlace | null>;
  legs: DayLegResult[];
  directionsResult: google.maps.DirectionsResult | null;
}

export interface MustEatResult {
  title: string;
  result: ResolvedPlace | null;
}

export function createServices() {
  const offscreen = document.createElement("div");
  const offscreenMap = new google.maps.Map(offscreen, { center: { lat: 26.2, lng: 127.6 }, zoom: 10 });
  return {
    placesService: new google.maps.places.PlacesService(offscreenMap),
    directionsService: new google.maps.DirectionsService(),
    spherical: google.maps.geometry?.spherical,
  };
}

export async function computeMustEat(
  items: MustEatItem[],
  placesService: google.maps.places.PlacesService,
): Promise<MustEatResult[]> {
  const results: MustEatResult[] = [];
  for (const item of items) {
    const result = await resolvePlaceByOpenCheck({
      placesService,
      type: "meal",
      queries: item.query,
      dayNumber: item.daySuggested,
      scheduleWindow: { ...item.scheduleHint, isWindow: true },
      openOnly: true,
    });
    results.push({ title: item.title, result });
  }
  return results;
}

export async function computeDay(
  day: ItineraryDay,
  placesService: google.maps.places.PlacesService,
  directionsService: google.maps.DirectionsService,
  spherical?: typeof google.maps.geometry.spherical,
): Promise<DayComputeResult> {
  const resolvedByStopId: Record<string, ResolvedPlace | null> = {};

  for (const stop of day.stops) {
    const openOnly = stop.type === "attraction" || stop.type === "meal";
    const result = await resolvePlaceByOpenCheck({
      placesService,
      type: stop.type,
      queries: [stop.queryChoices?.[0] || stop.name, ...(stop.alternatives || [])],
      dayNumber: day.dayNumber,
      scheduleWindow: stop.schedule,
      openOnly,
    });
    resolvedByStopId[stop.id] = result;
  }

  const routeOrder = day.order.slice();
  const originStop = day.stops.find((s) => s.idx === routeOrder[0]);
  const destinationStop = day.stops.find((s) => s.idx === routeOrder[routeOrder.length - 1]);
  const origin = originStop ? resolvedByStopId[originStop.id]?.coords : null;
  const destination = destinationStop ? resolvedByStopId[destinationStop.id]?.coords : null;

  const legs: DayLegResult[] = [];
  let directionsResult: google.maps.DirectionsResult | null = null;

  if (origin && destination) {
    try {
      const waypointIdxs = routeOrder.slice(1, -1);
      const waypoints = waypointIdxs
        .map((idx) => {
          const stop = day.stops.find((s) => s.idx === idx);
          const coords = stop ? resolvedByStopId[stop.id]?.coords : null;
          return coords ? { location: coords, stopover: true } : null;
        })
        .filter(Boolean) as google.maps.DirectionsWaypoint[];

      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode:
          day.travelMode === "TRANSIT"
            ? google.maps.TravelMode.TRANSIT
            : google.maps.TravelMode.DRIVING,
        waypoints: waypoints.length ? waypoints : undefined,
      };

      directionsResult = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === "OK" && result) resolve(result);
          else reject(new Error(status));
        });
      });

      const routeLegs = directionsResult.routes?.[0]?.legs || [];
      for (let i = 0; i < routeLegs.length; i++) {
        const fromIdx = routeOrder[i];
        const toIdx = routeOrder[i + 1];
        const leg = routeLegs[i];
        const fromStop = day.stops.find((s) => s.idx === fromIdx);
        const toStop = day.stops.find((s) => s.idx === toIdx);
        const fromCoords = fromStop ? resolvedByStopId[fromStop.id]?.coords : null;
        const toCoords = toStop ? resolvedByStopId[toStop.id]?.coords : null;
        let geometryKm: number | null = null;
        if (fromCoords && toCoords && spherical?.computeDistanceBetween) {
          geometryKm = spherical.computeDistanceBetween(fromCoords, toCoords) / 1000;
        }

        legs.push({
          fromIdx,
          toIdx,
          durationMinutes:
            typeof leg?.duration?.value === "number" ? leg.duration.value / 60 : null,
          durationText: leg?.duration?.text || null,
          geometryKm,
        });
      }
    } catch {
      // fallback
    }
  }

  if (!legs.length) {
    for (let i = 0; i < routeOrder.length - 1; i++) {
      const fromIdx = routeOrder[i];
      const toIdx = routeOrder[i + 1];
      const staticLeg = day.staticLegs[`${fromIdx}-${toIdx}`];
      const fromStop = day.stops.find((s) => s.idx === fromIdx);
      const toStop = day.stops.find((s) => s.idx === toIdx);
      const fromCoords = fromStop ? resolvedByStopId[fromStop.id]?.coords : null;
      const toCoords = toStop ? resolvedByStopId[toStop.id]?.coords : null;
      let geometryKm: number | null = null;
      if (fromCoords && toCoords && spherical?.computeDistanceBetween) {
        geometryKm = spherical.computeDistanceBetween(fromCoords, toCoords) / 1000;
      }
      legs.push({
        fromIdx,
        toIdx,
        durationMinutes: staticLeg?.minutes ?? null,
        durationText: staticLeg ? `${staticLeg.minutes} 分` : null,
        geometryKm,
      });
    }
  }

  return { resolvedByStopId, legs, directionsResult };
}

async function resolvePlaceByOpenCheck({
  placesService,
  type,
  queries,
  dayNumber,
  scheduleWindow,
  openOnly,
}: {
  placesService: google.maps.places.PlacesService;
  type: StopType;
  queries: string[];
  dayNumber: number;
  scheduleWindow: { start: string; end: string; isWindow: boolean };
  openOnly: boolean;
}): Promise<ResolvedPlace | null> {
  const openResult: ResolvedPlace = { details: null, coords: null, openStatus: null, placeId: null };
  const weekdayIdx = getTokyoWeekdayIndexFromDayNumber(dayNumber);

  const candidates = (Array.isArray(queries) ? queries : [queries]).filter(Boolean);
  const expectedAnchor = candidates[0] || "";
  for (const q of candidates) {
    const result = await searchBestCandidateAndGetDetails({
      placesService,
      query: q,
      expectedAnchor,
      openOnly,
      weekdayIdx,
      start: scheduleWindow.start,
      end: scheduleWindow.end,
    });
    if (!result?.details?.place_id) continue;
    if (!openOnly) return result;
    if (result.openStatus === true) return result;
    openResult.details = result.details;
    openResult.coords = result.coords;
    openResult.openStatus = result.openStatus;
    openResult.placeId = result.placeId;
  }
  return openResult.details ? openResult : null;
}

async function searchBestCandidateAndGetDetails({
  placesService,
  query,
  expectedAnchor,
  openOnly,
  weekdayIdx,
  start,
  end,
}: {
  placesService: google.maps.places.PlacesService;
  query: string;
  expectedAnchor: string;
  openOnly: boolean;
  weekdayIdx: number;
  start: string;
  end: string;
}): Promise<ResolvedPlace | null> {
  const textSearchRequest: google.maps.places.TextSearchRequest = {
    query,
    location: { lat: 26.2124, lng: 127.6809 },
    region: "JP",
  };

  const searchResults = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
    placesService.textSearch(textSearchRequest, (results, status) => {
      if (status === "OK" && Array.isArray(results) && results.length > 0) resolve(results);
      else resolve([]);
    });
  });

  const expectedTokens = tokenizeForMatch(expectedAnchor);
  const scored = searchResults
    .filter((r) => r && r.place_id)
    .map((r) => ({ raw: r, score: candidateScore(r, expectedTokens, expectedAnchor || query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  for (const item of scored) {
    const details = await new Promise<google.maps.places.PlaceResult | null>((resolve) => {
      placesService.getDetails(
        {
          placeId: item.raw.place_id!,
          fields: [
            "place_id",
            "name",
            "rating",
            "user_ratings_total",
            "business_status",
            "opening_hours",
            "geometry",
            "formatted_address",
          ],
        },
        (place, status) => {
          if (status === "OK" && place) resolve(place);
          else resolve(null);
        },
      );
    });
    const rawCoords = item.raw.geometry?.location
      ? { lat: item.raw.geometry.location.lat(), lng: item.raw.geometry.location.lng() }
      : null;
    if (!details?.place_id) {
      if (!item.raw.place_id || !rawCoords) continue;
      // Fallback: keep route/marker usable when Place Details lookup fails.
      return { placeId: item.raw.place_id, coords: rawCoords, details: item.raw, openStatus: null };
    }
    const coords = details.geometry?.location
      ? { lat: details.geometry.location.lat(), lng: details.geometry.location.lng() }
      : rawCoords;
    if (!coords) continue;

    let openStatus: boolean | null = null;
    if (openOnly) {
      if (details.business_status && details.business_status !== "OPERATIONAL") {
        openStatus = false;
      } else {
        openStatus = isOpenDuringWindow(details.opening_hours, weekdayIdx, start, end);
      }
    }
    return { placeId: details.place_id, coords, details, openStatus };
  }

  return null;
}
