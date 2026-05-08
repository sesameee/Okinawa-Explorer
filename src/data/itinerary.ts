import { mapsQueryLink } from "../lib/tripMapsUtils";

export type StopType = "hotel" | "transfer" | "attraction" | "meal";
export type TravelModeType = "DRIVING" | "TRANSIT";

export interface StopSchedule {
  start: string;
  end: string;
  isWindow: boolean;
}

export interface DayStop {
  idx: number;
  id: string;
  name: string;
  type: StopType;
  queryChoices: string[];
  mapsUrl: string;
  schedule: StopSchedule;
  alternatives?: string[];
}

export interface ItineraryDay {
  dayNumber: number;
  dateLabel: string;
  title: string;
  baseHotel: { query: string; label: string; type: "hotel" };
  stops: DayStop[];
  order: number[];
  travelMode: TravelModeType;
  staticLegs: Record<string, { minutes: number; distanceKm: number }>;
}

export interface ItineraryData {
  tripName: string;
  start: string;
  end: string;
  days: ItineraryDay[];
}

export interface MustEatItem {
  title: string;
  daySuggested: number;
  query: string[];
  scheduleHint: { start: string; end: string };
}

export const ROUTE_MODE_BY_DAY: Record<number, TravelModeType> = {
  1: "DRIVING",
  2: "DRIVING",
  3: "DRIVING",
  4: "DRIVING",
  5: "DRIVING",
  6: "DRIVING",
  7: "DRIVING",
};

export const NAHA_CENTER = { lat: 26.2124, lng: 127.6809 };

export const PLACE_FIELDS: ReadonlyArray<string> = [
  "place_id",
  "name",
  "rating",
  "user_ratings_total",
  "business_status",
  "opening_hours",
  "geometry",
  "formatted_address",
];

export const ITINERARY: ItineraryData = {
  tripName: "沖繩7天6夜親子（精實版）",
  start: "2026-05-10",
  end: "2026-05-16",
  days: [
    {
      dayNumber: 1,
      dateLabel: "2026/05/10（日）",
      title: "那霸進場 -> 瀨長島 -> 恩納",
      baseHotel: { query: "BEB5 沖繩瀨良垣", label: "BEB5 沖繩瀨良垣", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha1", name: "BEB5 沖繩瀨良垣", type: "hotel", queryChoices: ["BEB5 沖繩瀨良垣"], mapsUrl: mapsQueryLink("BEB5 沖繩瀨良垣"), schedule: { start: "20:20", end: "21:30", isWindow: false } },
        { idx: 1, id: "airport_naha", name: "那霸機場", type: "transfer", queryChoices: ["那覇空港"], mapsUrl: mapsQueryLink("那覇空港"), schedule: { start: "14:40", end: "15:50", isWindow: false } },
        { idx: 2, id: "rental_store", name: "臨空豐崎營業所", type: "transfer", queryChoices: ["臨空豐崎レンタカー 営業所"], mapsUrl: mapsQueryLink("臨空豐崎 レンタカー 営業所"), schedule: { start: "15:50", end: "16:30", isWindow: false } },
        { idx: 3, id: "seragaki_shima", name: "瀨長島", type: "attraction", queryChoices: ["瀨長島"], mapsUrl: mapsQueryLink("瀬長島"), schedule: { start: "17:10", end: "18:10", isWindow: true } },
        { idx: 4, id: "umikaji_terrace", name: "瀨長島內用餐 - 不確定", type: "meal", queryChoices: ["ウミカジテラス 瀬長島"], mapsUrl: mapsQueryLink("ウミカジテラス 瀬長島"), schedule: { start: "18:20", end: "20:20", isWindow: true }, alternatives: ["瀬長島 レストラン", "瀬長島 グルメ"] },
      ],
      order: [1, 2, 3, 4, 0],
      travelMode: ROUTE_MODE_BY_DAY[1],
      staticLegs: { "1-2": { minutes: 30, distanceKm: 0 }, "2-3": { minutes: 40, distanceKm: 0 }, "3-4": { minutes: 10, distanceKm: 0 }, "4-0": { minutes: 70, distanceKm: 0 } },
    },
    {
      dayNumber: 2,
      dateLabel: "2026/05/11（ㄧ）",
      title: "本部＋古宇利海景日",
      baseHotel: { query: "BEB5 沖繩瀨良垣", label: "BEB5 沖繩瀨良垣", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha1", name: "BEB5 沖繩瀨良垣", type: "hotel", queryChoices: ["BEB5 沖繩瀨良垣"], mapsUrl: mapsQueryLink("BEB5 沖繩瀨良垣"), schedule: { start: "07:30", end: "08:30", isWindow: false } },
        { idx: 1, id: "camel_sandwich", name: "CAMEL SANDWICH & SMOOTHIE（早餐）", type: "meal", queryChoices: ["CAMEL SANDWICH & SMOOTHIE 278-1 Urasaki, Motobu, Kunigami District, Okinawa 905-0217日本", "CAMEL SANDWICH & SMOOTHIE 本部町 浦崎 278-1"], mapsUrl: mapsQueryLink("CAMEL SANDWICH & SMOOTHIE 278-1 Urasaki, Motobu, Kunigami District, Okinawa 905-0217日本"), schedule: { start: "08:45", end: "09:20", isWindow: true }, alternatives: ["278-1 Urasaki, Motobu"] },
        { idx: 2, id: "ocean_expo", name: "沖繩美麗海水族館", type: "attraction", queryChoices: ["沖繩美麗海水族館"], mapsUrl: mapsQueryLink("沖繩美麗海水族館"), schedule: { start: "09:30", end: "12:30", isWindow: true }, alternatives: ["沖繩海洋博公園"] },
        { idx: 3, id: "umigojuku", name: "食堂海路（午餐）", type: "meal", queryChoices: ["食堂海路 沖繩"], mapsUrl: mapsQueryLink("食堂海路 沖繩"), schedule: { start: "12:40", end: "14:40", isWindow: true }, alternatives: ["海路 食堂 本部"] },
        { idx: 4, id: "kouri_view", name: "古宇利大橋 南端觀景台", type: "attraction", queryChoices: ["古宇利大橋 南端 觀景台"], mapsUrl: mapsQueryLink("古宇利大橋 南端觀景台"), schedule: { start: "15:20", end: "15:50", isWindow: true }, alternatives: ["古宇利島 展望台"] },
        { idx: 5, id: "kouri_tower", name: "古宇利海洋塔", type: "attraction", queryChoices: ["古宇利海洋塔"], mapsUrl: mapsQueryLink("古宇利海洋塔"), schedule: { start: "16:00", end: "17:30", isWindow: true }, alternatives: ["古宇利島 海洋塔"] },
        { idx: 6, id: "kouri_ebi_ebi", name: "古宇利蝦蝦飯", type: "meal", queryChoices: ["古宇利 蝦蝦飯"], mapsUrl: mapsQueryLink("古宇利蝦蝦飯"), schedule: { start: "17:40", end: "19:40", isWindow: true }, alternatives: ["古宇利島 海鮮飯"] },
      ],
      order: [0, 1, 2, 3, 4, 5, 6, 0],
      travelMode: ROUTE_MODE_BY_DAY[2],
      staticLegs: { "0-1": { minutes: 55, distanceKm: 0 }, "1-2": { minutes: 10, distanceKm: 0 }, "2-3": { minutes: 10, distanceKm: 0 }, "3-4": { minutes: 40, distanceKm: 0 }, "4-5": { minutes: 10, distanceKm: 0 }, "5-6": { minutes: 10, distanceKm: 0 }, "6-0": { minutes: 70, distanceKm: 0 } },
    },
    {
      dayNumber: 3,
      dateLabel: "2026/05/12（二）",
      title: "名護同區順路日",
      baseHotel: { query: "BEB5 沖繩瀨良垣", label: "BEB5 沖繩瀨良垣", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha1", name: "BEB5 沖繩瀨良垣", type: "hotel", queryChoices: ["BEB5 沖繩瀨良垣"], mapsUrl: mapsQueryLink("BEB5 沖繩瀨良垣"), schedule: { start: "07:30", end: "08:30", isWindow: false } },
        { idx: 1, id: "nabee_beach", name: "恩納海濱公園Nabee海灘", type: "attraction", queryChoices: ["恩納海濱公園Nabee海灘 419-4 Onna, Kunigami District, Okinawa 904-0411日本", "Nabee Beach Onna 419-4"], mapsUrl: mapsQueryLink("恩納海濱公園Nabee海灘 419-4 Onna, Kunigami District, Okinawa 904-0411日本"), schedule: { start: "09:30", end: "10:30", isWindow: true }, alternatives: ["Nabee海灘", "Onna Beach Park Nabee"] },
        { idx: 2, id: "manzamo", name: "萬座毛", type: "attraction", queryChoices: ["萬座毛 Onna, Kunigami District, Okinawa 904-0411日本", "万座毛 恩納村"], mapsUrl: mapsQueryLink("萬座毛 Onna, Kunigami District, Okinawa 904-0411日本"), schedule: { start: "10:40", end: "11:30", isWindow: true }, alternatives: ["万座毛", "Manzamo"] },
        { idx: 3, id: "dive_steak", name: "潛水員牛排（午餐）需排隊可再換", type: "meal", queryChoices: ["潛水員牛排 名護"], mapsUrl: mapsQueryLink("潜水員牛排 名護"), schedule: { start: "12:00", end: "14:00", isWindow: true }, alternatives: ["名護 ステーキレストラン 潛水員"] },
        { idx: 4, id: "marine_park", name: "部瀬名海中公園", type: "attraction", queryChoices: ["部瀬名海中公園"], mapsUrl: mapsQueryLink("部瀬名海中公園"), schedule: { start: "14:40", end: "16:10", isWindow: true }, alternatives: ["瀬底 海中公園"] },
        { idx: 5, id: "dinner_aw_or_ramen", name: "A&W 或 暖暮拉麵（名護/恩納沿線）-- 不確定", type: "meal", queryChoices: ["A&W 名護", "A&W 恩納店", "暖暮拉麵 名護"], mapsUrl: mapsQueryLink("A&W 名護"), schedule: { start: "16:50", end: "18:50", isWindow: true }, alternatives: ["暖暮拉麵 沖繩", "名護 拉麵"] },
      ],
      order: [0, 1, 2, 3, 4, 5, 0],
      travelMode: ROUTE_MODE_BY_DAY[3],
      staticLegs: { "0-1": { minutes: 10, distanceKm: 0 }, "1-2": { minutes: 10, distanceKm: 0 }, "2-3": { minutes: 40, distanceKm: 0 }, "3-4": { minutes: 40, distanceKm: 0 }, "4-5": { minutes: 40, distanceKm: 0 }, "5-0": { minutes: 20, distanceKm: 0 } },
    },
    {
      dayNumber: 4,
      dateLabel: "2026/05/13（三）",
      title: "恩納退房 -> 南部文化 -> 那霸入住",
      baseHotel: { query: "BEB5 沖繩瀨良垣", label: "BEB5 沖繩瀨良垣", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha1", name: "BEB5 沖繩瀨良垣", type: "hotel", queryChoices: ["BEB5 沖繩瀨良垣"], mapsUrl: mapsQueryLink("BEB5 沖繩瀨良垣"), schedule: { start: "08:30", end: "10:00", isWindow: false } },
        { idx: 1, id: "gyokusendo", name: "玉泉洞", type: "attraction", queryChoices: ["玉泉洞"], mapsUrl: mapsQueryLink("玉泉洞"), schedule: { start: "11:20", end: "12:00", isWindow: true }, alternatives: ["首里城 公園"] },
        { idx: 2, id: "sumanumeh_lunch", name: "Sumanumeh 拉麵", type: "meal", queryChoices: ["Sumanumeh 40-1 Kokuba, Naha, Okinawa 902-0075日本", "Sumanumeh 那覇 国場 40-1"], mapsUrl: mapsQueryLink("Sumanumeh 40-1 Kokuba, Naha, Okinawa 902-0075日本"), schedule: { start: "12:10", end: "14:10", isWindow: true }, alternatives: ["40-1 Kokuba, Naha", "国場 40-1"] },
        { idx: 3, id: "hoppepan_lunch", name: "hoppepan 麵包店", type: "meal", queryChoices: ["ホッペパン"], mapsUrl: mapsQueryLink("ホッペパン"), schedule: { start: "14:10", end: "14:50", isWindow: true }, alternatives: ["hoppepan"] },
        { idx: 4, id: "hasn_ryu", name: "波上宮", type: "attraction", queryChoices: ["波上宮"], mapsUrl: mapsQueryLink("波上宮"), schedule: { start: "15:00", end: "15:50", isWindow: true }, alternatives: ["波上宮 周辺"] },
        { idx: 5, id: "hotel_naha2", name: "東急STAY沖繩那霸", type: "hotel", queryChoices: ["東急STAY沖縄 那覇"], mapsUrl: mapsQueryLink("東急STAY沖繩那霸"), schedule: { start: "16:10", end: "17:00", isWindow: false } },
        { idx: 6, id: "dinner_yakiniku_or_ramen", name: "燒肉本部牧場 國際通店（已訂位）", type: "meal", queryChoices: ["燒肉本部 県庁前", "暖暮拉麵 那覇"], mapsUrl: mapsQueryLink("燒肉本部 県庁前"), schedule: { start: "18:00", end: "20:00", isWindow: true }, alternatives: ["暖暮拉麵 沖繩", "燒肉本部 沖繩"] },
      ],
      order: [0, 1, 2, 3, 4, 5, 6],
      travelMode: ROUTE_MODE_BY_DAY[4],
      staticLegs: { "0-1": { minutes: 100, distanceKm: 0 }, "1-2": { minutes: 10, distanceKm: 0 }, "2-3": { minutes: 15, distanceKm: 0 }, "3-4": { minutes: 20, distanceKm: 0 }, "4-5": { minutes: 60, distanceKm: 0 }, "5-6": { minutes: 20, distanceKm: 0 } },
    },
    {
      dayNumber: 5,
      dateLabel: "2026/05/14（四）",
      title: "購物＋兒童放電日",
      baseHotel: { query: "東急STAY沖繩那霸", label: "東急STAY沖繩那霸", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha2", name: "東急STAY沖繩那霸", type: "hotel", queryChoices: ["東急STAY沖縄 那覇"], mapsUrl: mapsQueryLink("東急STAY沖繩那霸"), schedule: { start: "07:30", end: "08:30", isWindow: false } },
        { idx: 1, id: "kids_kingdom", name: "沖繩兒童王國", type: "attraction", queryChoices: ["沖繩兒童王國"], mapsUrl: mapsQueryLink("沖縄こどもの国"), schedule: { start: "09:15", end: "11:45", isWindow: true }, alternatives: ["沖繩兒童王國 こどもの国"] },
        { idx: 2, id: "aeon_mall_kokuren", name: "永旺夢樂城沖繩來客夢（午餐/放電/採買）", type: "meal", queryChoices: ["永旺夢樂城沖繩來客夢 レストラン街", "AEON MALL Okinawa Kouri-mu"], mapsUrl: mapsQueryLink("永旺夢樂城沖繩來客夢"), schedule: { start: "12:00", end: "18:00", isWindow: true }, alternatives: ["AEON MALL Okinawa Koki-mu レストラン"] },
        { idx: 3, id: "birthday_yamazato", name: "Birthday Yamazato", type: "meal", queryChoices: ["Birthday Yamazato 日本〒904-0033 Okinawa, Yamazato, 1 Chome−1−2 パーチェ山里 ２階"], mapsUrl: mapsQueryLink("Birthday Yamazato 日本〒904-0033 Okinawa, Yamazato, 1 Chome−1−2 パーチェ山里 ２階"), schedule: { start: "18:00", end: "18:25", isWindow: true }, alternatives: ["Birthday Yamazato Okinawa Yamazato"] },
        { idx: 4, id: "dinner_yakiniku", name: "燒肉本部（縣廳前）-- 不確定", type: "meal", queryChoices: ["燒肉本部 県庁前"], mapsUrl: mapsQueryLink("燒肉本部 県庁前"), schedule: { start: "18:30", end: "20:30", isWindow: true }, alternatives: ["燒肉本部 沖繩 ランチ ディナー"] },
      ],
      order: [0, 1, 2, 3, 4, 0],
      travelMode: ROUTE_MODE_BY_DAY[5],
      staticLegs: { "0-1": { minutes: 45, distanceKm: 0 }, "1-2": { minutes: 15, distanceKm: 0 }, "2-3": { minutes: 15, distanceKm: 0 }, "3-4": { minutes: 20, distanceKm: 0 }, "4-0": { minutes: 50, distanceKm: 0 } },
    },
    {
      dayNumber: 6,
      dateLabel: "2026/05/15（五）",
      title: "還車後那霸/浦添輕鬆日（無車可Uber）",
      baseHotel: { query: "東急STAY沖繩那霸", label: "東急STAY沖繩那霸", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha2", name: "東急STAY沖繩那霸", type: "hotel", queryChoices: ["東急STAY沖縄 那覇"], mapsUrl: mapsQueryLink("東急STAY沖繩那霸"), schedule: { start: "07:30", end: "08:30", isWindow: false } },
        { idx: 1, id: "dfs_rental_return", name: "DFS 營業所（還車）／歌町站附近", type: "transfer", queryChoices: ["DFS 營業所 還車 歌町", "歌町駅 レンタカー 営業所"], mapsUrl: mapsQueryLink("DFS 營業所 歌町站 還車"), schedule: { start: "08:30", end: "10:00", isWindow: false } },
        { idx: 2, id: "urasoe_park", name: "浦添大公園", type: "attraction", queryChoices: ["浦添大公園"], mapsUrl: mapsQueryLink("浦添大公園"), schedule: { start: "10:00", end: "12:00", isWindow: true }, alternatives: ["浦添公園"] },
        { idx: 3, id: "parco_city", name: "PARCO CITY（午餐/購物）", type: "meal", queryChoices: ["PARCO CITY レストラン", "PARCO CITY 沖縄"], mapsUrl: mapsQueryLink("PARCO CITY 沖繩"), schedule: { start: "12:40", end: "17:00", isWindow: true }, alternatives: ["PARCO CITY 沖縄 レストラン街"] },
        { idx: 4, id: "dinner_ramen_or_aw", name: "暖暮拉麵（那霸）/ A&W（擇一）-- 不確定", type: "meal", queryChoices: ["暖暮拉麵 那霸", "A&W 那霸"], mapsUrl: mapsQueryLink("暖暮拉麵 那霸"), schedule: { start: "18:00", end: "20:00", isWindow: true }, alternatives: ["A&W 沖繩", "暖暮拉麵 沖繩"] },
      ],
      order: [0, 1, 2, 3, 4, 0],
      travelMode: ROUTE_MODE_BY_DAY[6],
      staticLegs: { "0-1": { minutes: 30, distanceKm: 0 }, "1-2": { minutes: 90, distanceKm: 0 }, "2-3": { minutes: 30, distanceKm: 0 }, "3-4": { minutes: 20, distanceKm: 0 }, "4-0": { minutes: 30, distanceKm: 0 } },
    },
    {
      dayNumber: 7,
      dateLabel: "2026/05/16（六）",
      title: "返程日",
      baseHotel: { query: "東急STAY沖繩那霸", label: "東急STAY沖繩那霸", type: "hotel" },
      stops: [
        { idx: 0, id: "hotel_naha2", name: "東急STAY沖繩那霸", type: "hotel", queryChoices: ["東急STAY沖縄 那覇"], mapsUrl: mapsQueryLink("東急STAY沖繩那霸"), schedule: { start: "07:30", end: "10:30", isWindow: false } },
        { idx: 1, id: "lunch_last", name: "午餐（那霸近郊，擇一）不確定", type: "meal", queryChoices: ["牧志公設市場", "國際通 ランチ"], mapsUrl: mapsQueryLink("那霸 國際通 ランチ"), schedule: { start: "10:30", end: "12:30", isWindow: true }, alternatives: ["那霸 沖繩そば ランチ"] },
        { idx: 2, id: "airport_naha2", name: "那霸機場", type: "transfer", queryChoices: ["那覇空港"], mapsUrl: mapsQueryLink("那覇空港"), schedule: { start: "13:00", end: "15:00", isWindow: false } },
      ],
      order: [0, 1, 2],
      travelMode: ROUTE_MODE_BY_DAY[7],
      staticLegs: { "0-1": { minutes: 20, distanceKm: 0 }, "1-2": { minutes: 30, distanceKm: 0 } },
    },
  ],
};

export const MUST_EAT: MustEatItem[] = [
  { title: "hoppepan麵包店", daySuggested: 4, query: ["hoppepan 2 Chome-10-10 Uchima, Urasoe, Okinawa 901-2121日本"], scheduleHint: { start: "14:10", end: "14:50" } },
  { title: "古宇利蝦蝦飯", daySuggested: 2, query: ["古宇利蝦蝦飯 314 Kouri, Nakijin, Kunigami District, Okinawa 905-0406日本"], scheduleHint: { start: "17:40", end: "19:40" } },
  { title: "潛水員牛排", daySuggested: 3, query: ["潛水員牛排 162 Umusa, Nago, Okinawa 905-0006日本"], scheduleHint: { start: "12:00", end: "14:00" } },
  { title: "食堂海路", daySuggested: 2, query: ["食堂海路 1056-1 Yamagawa, Motobu, Kunigami District, Okinawa 905-0205日本"], scheduleHint: { start: "12:40", end: "14:40" } },
  { title: "A&W(那霸)", daySuggested: 6, query: ["A&W(那霸) ２F, 1 Chome-1-1 Matsuo, Naha, Okinawa 900-0014日本"], scheduleHint: { start: "18:00", end: "20:00" } },
  { title: "暖暮拉麵(那霸)", daySuggested: 6, query: ["暖暮拉麵(那霸) 2 Chome-16-10 Makishi, Naha, Okinawa 900-0013日本"], scheduleHint: { start: "18:00", end: "20:00" } },
  { title: "燒肉本部牧場 國際通店", daySuggested: 4, query: ["燒肉本部牧場 國際通店 日本〒900-0014 Okinawa, Naha, Matsuo, 1 Chome−1−2 マルイト那覇松尾ビル ２階"], scheduleHint: { start: "18:00", end: "20:00" } },
  { title: "Sumanumeh拉麵", daySuggested: 4, query: ["Sumanumeh 40-1 Kokuba, Naha, Okinawa 902-0075日本"], scheduleHint: { start: "12:10", end: "14:10" } },
  { title: "CAMEL SANDWICH & SMOOTHIE早餐", daySuggested: 2, query: ["CAMEL SANDWICH & SMOOTHIE早餐 278-1 Urasaki, Motobu, Kunigami District, Okinawa 905-0217日本"], scheduleHint: { start: "08:45", end: "09:20" } },
];
