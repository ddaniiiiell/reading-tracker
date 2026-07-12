/**
 * Luxe Manhwa Tracker - Application Logic
 */

// ==========================================================================
// STATE MANAGEMENT & DATA LOCALSTORAGE INITIALIZATION
// ==========================================================================
let manhwas = [];
let currentFilter = 'all';
let currentSort = 'latest-read';
let searchQuery = '';
let currentView = 'grid'; // 'grid' | 'list'
const STORAGE_KEY = 'luxe_manhwa_tracker_data_v6';
const LEGACY_STORAGE_KEY = 'luxe_manhwa_tracker_data_v5';

// Default Mock Data for rich visual first-impression
const MOCK_DATA = [
  {
    "id": "manhwa_1",
    "title": "Jungle juice",
    "chapter": 61,
    "link": "https://jungle-juice.online/manga/jungle-juice-chapter-62/",
    "lastReadDate": "2022-01-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_2",
    "title": "tomb raider king",
    "chapter": 90,
    "link": "https://tomb-raider-king.com/manga/tomb-raider-king-chapter-90/",
    "lastReadDate": "2022-01-02",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_3",
    "title": "Limit breaker",
    "chapter": 50,
    "link": "https://mangaweebs.in/manga/limit-breaker/chapter-50/",
    "lastReadDate": "2022-01-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_4",
    "title": "Berserk of Gluttony",
    "chapter": 33,
    "link": "https://manga-fast.com/manga/berserk-of-gluttony/chapter-33/",
    "lastReadDate": "2022-01-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_5",
    "title": "The prince of myolyeong",
    "chapter": 19,
    "link": "https://manhuazonghe.com/manhua/the-prince-of-myolyeong/chapter-19/",
    "lastReadDate": "2022-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_6",
    "title": "Mercenary enrollment",
    "chapter": 56,
    "link": "",
    "lastReadDate": "2022-01-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "unknown"
  },
  {
    "id": "manhwa_7",
    "title": "Study Group",
    "chapter": 139,
    "link": "https://mangaweebs.in/manga/ysjp2ki1go/chapter-139/",
    "lastReadDate": "2022-01-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_8",
    "title": "Isekai apocalypse",
    "chapter": 14.2,
    "link": "https://mangaonlineteam.com/manga/isekai-apocalypse-mynoghra-the-conquest-of-the-world-starts-with-the-civilization-of-ruin/chapter-14.2/",
    "lastReadDate": "2022-04-28",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_9",
    "title": "Baki you",
    "chapter": 128,
    "link": "https://bakidou.com/manga/baki-dou-2018-chapter-126/",
    "lastReadDate": "2022-05-31",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_10",
    "title": "Blue Lock",
    "chapter": 175,
    "link": "https://bluelockmanga.com/manga/blue-lock-chapter-175/",
    "lastReadDate": "2022-05-31",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_11",
    "title": "Call of the night",
    "chapter": 144,
    "link": "https://callofnight.com/manga/call-of-the-night-chapter-144/",
    "lastReadDate": "2022-10-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_12",
    "title": "Maybe meant to be",
    "chapter": 42,
    "link": "https://void-scans.com/maybe-meant-to-be-chapter-42/",
    "lastReadDate": "2022-10-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_13",
    "title": "To not die",
    "chapter": 67,
    "link": "https://tonotdie.com/manga/to-not-die-chapter-67/",
    "lastReadDate": "2022-11-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_14",
    "title": "Manager Kim",
    "chapter": 58,
    "link": "https://elarcpage.com/189699/manager-kim-chapter-58/",
    "lastReadDate": "2022-11-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_15",
    "title": "I was reincarnated as the 7th prince",
    "chapter": 110,
    "link": "https://mangabuddy.com/i-was-reincarnated-as-the-7th-prince-so-i-will-perfect-my-magic-as-i-please/chapter-110",
    "lastReadDate": "2022-11-08",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_16",
    "title": "Lightning degree",
    "chapter": 7,
    "link": "https://mangaweebs.in/manga/ofxmdsljdxuete26fob9/chapter-7/",
    "lastReadDate": "2022-11-08",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_17",
    "title": "Sakamoto days",
    "chapter": 95,
    "link": "https://sakamotodaymanga.com/manga/sakamoto-days-chapter-95/",
    "lastReadDate": "2022-11-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_18",
    "title": "Expressionless girl",
    "chapter": 66,
    "link": "https://mangakakalot.com/chapter/expressionless_face_girl_and_emotional_face_boy/chapter_66",
    "lastReadDate": "2022-12-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_19",
    "title": "Death row boys",
    "chapter": 30,
    "link": "https://astrascans.com/manga/death-row-boy/chapter-30/",
    "lastReadDate": "2022-12-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_20",
    "title": "My companion is the strongest undead",
    "chapter": 20,
    "link": "https://platinumscans.com/manga/my-companion-is-the-strongest-undead-in-another-world/chapter-20/",
    "lastReadDate": "2023-01-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_21",
    "title": "A returners magic should be special",
    "chapter": 219,
    "link": "https://areturnermagic.com/manga/a-returners-magic-should-be-special-chapter-219/",
    "lastReadDate": "2023-02-23",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_22",
    "title": "summoned to a parallel fantasy world many times",
    "chapter": 25,
    "link": "https://void-scans.com/summoned-to-a-parallel-fantasy-world-many-times-chapter-25/",
    "lastReadDate": "2023-03-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_23",
    "title": "Gods part time employee",
    "chapter": 27,
    "link": "https://aquamanga.com/read/i-became-a-part-time-employee-for-gods/chapter-27/",
    "lastReadDate": "2023-04-02",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_24",
    "title": "Reincarnated as a slime",
    "chapter": 104,
    "link": "https://www.tenseislime.com/manga/tensei-shitara-slime-datta-ken-chapter-104/",
    "lastReadDate": "2023-04-16",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_25",
    "title": "Overlord",
    "chapter": 71,
    "link": "https://overlord-read.online/overlord-chapter-71/",
    "lastReadDate": "2023-04-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_26",
    "title": "In a party with a dragon",
    "chapter": 12,
    "link": "https://mangakakalot.com/chapter/a_story_about_a_dragon_and_the_rising_of_an_adventurer/chapter_12",
    "lastReadDate": "2023-04-25",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_27",
    "title": "Legend of the northern blade",
    "chapter": 156,
    "link": "https://en.leviatanscans.com/manga/legend-of-the-northern-blade/chapter-156/",
    "lastReadDate": "2023-05-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_28",
    "title": "Tougen Anki",
    "chapter": 147,
    "link": "https://mangakakalot.com/chapter/ym923759/chapter_147",
    "lastReadDate": "2023-07-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_29",
    "title": "Tenkaichi",
    "chapter": 28,
    "link": "https://chapmanganelo.com/manga-mj127555/chapter-28",
    "lastReadDate": "2023-08-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_30",
    "title": "Nito no Taidana Isekai Shoukougun",
    "chapter": 30.2,
    "link": "https://mangaclash.com/manga/nito-no-taidana-isekai-shoukougun-saijaku-shoku/chapter-30-2/",
    "lastReadDate": "2023-08-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_31",
    "title": "Rainbow class hunter",
    "chapter": 31,
    "link": "https://www.topmanhua.com/manhua/savior-of-divine-blood-draw-out-0-00000001-to-become-the-strongest/chapter-31/",
    "lastReadDate": "2023-08-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_32",
    "title": "Rebuild world",
    "chapter": 28,
    "link": "https://ww5.mangakakalot.tv/chapter/manga-fd982686/chapter-28",
    "lastReadDate": "2023-08-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_33",
    "title": "Skeleton soldier",
    "chapter": 246,
    "link": "https://luminousscans.com/skeleton-soldier-couldnt-protect-the-dungeon-chapter-246/",
    "lastReadDate": "2023-08-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_34",
    "title": "Country of magicians",
    "chapter": 1,
    "link": "https://ww6.mangakakalot.tv/chapter/manga-dh980390/chapter-1",
    "lastReadDate": "2023-09-11",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_35",
    "title": "Lili men",
    "chapter": 13,
    "link": "https://mangakakalot.com/chapter/tg930319/chapter_13",
    "lastReadDate": "2023-09-11",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_36",
    "title": "Hand over the money!",
    "chapter": 20,
    "link": "https://void-scans.com/1/hand-over-the-money-chapter-20/",
    "lastReadDate": "2023-10-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_37",
    "title": "Mashle (muscle magic)",
    "chapter": 163,
    "link": "https://mashle-manga.online/manga/mashle-magic-and-muscles-chapter-163/",
    "lastReadDate": "2023-11-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_38",
    "title": "Kaiju #8",
    "chapter": 99,
    "link": "https://kaiju-no8.com/manga/kaiju-no-8-chapter-99/",
    "lastReadDate": "2023-12-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_39",
    "title": "Tower of God",
    "chapter": 588,
    "link": "https://www.webtoons.com/en/fantasy/tower-of-god/season-3-ep-171/viewer?title_no=95&episode_no=589",
    "lastReadDate": "2023-12-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_40",
    "title": "shikimoris not just a cutie",
    "chapter": 151,
    "link": "https://mangakakalot.to/read/shikimoris-not-just-a-cutie-1358/en/chapter-151",
    "lastReadDate": "2023-12-28",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_41",
    "title": "Blue giant",
    "chapter": 80,
    "link": "https://ww7.manganelo.tv/chapter/manga-se970261/chapter-80",
    "lastReadDate": "2023-01-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_42",
    "title": "Primal gods",
    "chapter": 26.5,
    "link": "https://chapmanganelo.com/manga-fm120532/chapter-26.5",
    "lastReadDate": "2024-01-11",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_43",
    "title": "FFF- class Trashhero",
    "chapter": 172,
    "link": "https://toonily.com/serie/fff-class-trashero-8019099a/chapter-172/",
    "lastReadDate": "2026-07-04",
    "status": "on-hold",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_44",
    "title": "Fight class",
    "chapter": 93,
    "link": "https://ww8.mangakakalot.tv/chapter/manga-cd980038/chapter-93",
    "lastReadDate": "2024-04-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_45",
    "title": "Academys undercover professor",
    "chapter": 93,
    "link": "https://academysundercoverprofessor.com/manga/academys-undercover-professor-chapter-93/",
    "lastReadDate": "2024-04-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_46",
    "title": "Reformation of the dead beat noble",
    "chapter": 106,
    "link": "https://w3.reformationofthedeadbeat.com/manga/99499-the-lazy-prince-becomes-a-genius-chapter-106/",
    "lastReadDate": "2024-04-25",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_47",
    "title": "The black mage who reincarnated after 66666 years",
    "chapter": 190,
    "link": "https://asurascans.com/comics/the-dark-magician-transmigrates-after-66666-years-a80d257e/chapter/190",
    "lastReadDate": "2026-07-11",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_48",
    "title": "Mr devourer",
    "chapter": 41,
    "link": "https://mrdevourerpleaseactlikeafinalboss.com/manga/mr-devourer-please-act-like-a-final-boss-chapter-41/",
    "lastReadDate": "2024-05-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_49",
    "title": "death tube",
    "chapter": 98,
    "link": "https://ww8.mangakakalot.tv/chapter/manga-pp951398/chapter-98",
    "lastReadDate": "2024-05-27",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_50",
    "title": "pumpkin night",
    "chapter": 109,
    "link": "https://pumpkin-night.com/manga/pumpkin-night-chapter-109/",
    "lastReadDate": "2024-05-28",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_51",
    "title": "Ruri dragon",
    "chapter": 14,
    "link": "https://chapmanganelo.com/manga-oh128627/chapter-14",
    "lastReadDate": "2024-06-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_52",
    "title": "dandadan",
    "chapter": 156,
    "link": "https://dandadan.net/manga/dandadan-chapter-156/",
    "lastReadDate": "2024-06-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_53",
    "title": "Reincarnator",
    "chapter": 33,
    "link": "https://reincarnator.com/manga/reincarnator-chapter-33/",
    "lastReadDate": "2024-06-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_54",
    "title": "Dear anemone",
    "chapter": 13,
    "link": "https://chapmanganelo.com/manga-xs138212/chapter-13",
    "lastReadDate": "2024-06-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_55",
    "title": "I returned as an FFF-Class witch doctor",
    "chapter": 114,
    "link": "https://www.mgeko.cc/reader/en/i-returned-as-an-fff-class-witch-doctor-chapter-112-eng-li/",
    "lastReadDate": "2026-07-03",
    "status": "completed",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_56",
    "title": "I regressed to my ruined family",
    "chapter": 89,
    "link": "https://manhuaus.org/manga/i-regressed-to-my-ruined-family/chapter-89/",
    "lastReadDate": "2024-06-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_57",
    "title": "Standard of reincarnation",
    "chapter": 98,
    "link": "https://manhwaclan.com/manga/standard-of-reincarnation/chapter-98/",
    "lastReadDate": "2024-06-24",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_58",
    "title": "Mikadono sanshimawi (3 sisters + yuu)",
    "chapter": 118,
    "link": "https://chapmanganelo.com/manga-nz128519/chapter-118",
    "lastReadDate": "2024-06-26",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_59",
    "title": "Jujutsu kaisen",
    "chapter": 266,
    "link": "https://w7.jujustu-kaisen.com/manga/jujutsu-kaisen-chapter-266/",
    "lastReadDate": "2024-08-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_60",
    "title": "The heavenly demon cant live a normal life",
    "chapter": 117,
    "link": "https://heavenlydemoncantliveanormallife.com/manga/97353-the-heavenly-demon-cant-live-a-normal-life-chapter-117/",
    "lastReadDate": "2024-08-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_61",
    "title": "I killed an academy player",
    "chapter": 48,
    "link": "https://ikilledacademyplayer.com/manga/i-killed-an-academy-player-chapter-48/",
    "lastReadDate": "2024-09-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_62",
    "title": "Berserk",
    "chapter": 376,
    "link": "https://readberserk.com/chapter/berserk-chapter-376/",
    "lastReadDate": "2024-09-16",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_63",
    "title": "Second Life Ranker",
    "chapter": 183,
    "link": "https://w29.secondliferanker.com/second-life-ranker-manga-chapter-183/",
    "lastReadDate": "2024-09-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_64",
    "title": "survival story of the sword king",
    "chapter": 222,
    "link": "https://w62.swordkingstory.com/survival-story-of-a-sword-king-in-a-fantasy-world-chapter-222/",
    "lastReadDate": "2024-09-23",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_65",
    "title": "Player",
    "chapter": 224,
    "link": "https://www.mgeko.cc/reader/en/player-mg1-chapter-224-eng-li/",
    "lastReadDate": "2024-09-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_66",
    "title": "The world after the fall",
    "chapter": 147,
    "link": "https://w1.theworldafterfall.com/manga/the-world-after-the-fall-chapter-147/?date=2024-10-02",
    "lastReadDate": "2024-10-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_67",
    "title": "Furitsumore Kodoku na Shi yo (murder mystery)",
    "chapter": 26,
    "link": "https://mangakakalot.com/chapter/on932442/chapter_26",
    "lastReadDate": "2024-10-02",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_68",
    "title": "Talent swallowing magician",
    "chapter": 94,
    "link": "https://talentswallowingmagician.com/manga/talent-swallowing-magician-chapter-94/",
    "lastReadDate": "2024-10-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_69",
    "title": "Blacksmith zig",
    "chapter": 63,
    "link": "https://mangadex.org/chapter/6615229a-14cd-42e7-9f66-50db78cacdec/1",
    "lastReadDate": "2024-10-27",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_70",
    "title": "Evolution road to space monster",
    "chapter": 58,
    "link": "https://chapmanganato.to/manga-uh998064/chapter-58",
    "lastReadDate": "2024-12-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_71",
    "title": "Goblin’s night",
    "chapter": 76,
    "link": "https://goblinsnight.com/manga/goblins-night-chapter-76/",
    "lastReadDate": "2024-12-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_72",
    "title": "Kai-hen wizard",
    "chapter": 13,
    "link": "https://bato.ing/title/167764-en-kai-hen-wizards-official/3120013-ch_13",
    "lastReadDate": "2024-12-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_73",
    "title": "The beginning after the end",
    "chapter": 193,
    "link": "https://thebeginningaftertheend.mangaseen.com/manga/the-beginning-after-the-end-manga-chapter-193/",
    "lastReadDate": "2024-01-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_74",
    "title": "Magic academy’s genius blinker",
    "chapter": 47,
    "link": "https://www.toongod.org/webtoon/magic-academys-genius-blinker/chapter-47/",
    "lastReadDate": "2025-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_75",
    "title": "Necromancer academy and the genie summoner",
    "chapter": 151,
    "link": "https://necromanceracademy.online/manga/necromancer-academy-and-the-genius-summoner-chapter-151/",
    "lastReadDate": "2025-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_76",
    "title": "Forget my husband ill go make money",
    "chapter": 83,
    "link": "https://mangadex.org/chapter/9742b834-5508-48c5-b49e-eeb80a4abeff/1",
    "lastReadDate": "2025-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_77",
    "title": "Kaoru Hana wa Rin to Saku",
    "chapter": 136,
    "link": "https://kaoruhanawarintosaku.com/manga/99580-kaoru-hana-wa-rin-to-saku-chapter-136/",
    "lastReadDate": "2025-02-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_78",
    "title": "Blue Box",
    "chapter": 181,
    "link": "https://blue-box-manga.online/manga/blue-box-chapter-182/",
    "lastReadDate": "2025-02-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_79",
    "title": "Trancension academy",
    "chapter": 61,
    "link": "https://transcensionacademy.top/manga/transcension-academy-chapter-061/",
    "lastReadDate": "2025-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_80",
    "title": "The indomitable martial king",
    "chapter": 70,
    "link": "https://theindomitablemartialking.org/manga/the-indomitable-martial-king-chapter-70/",
    "lastReadDate": "2025-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_81",
    "title": "The max level player’s 100th regression",
    "chapter": 46,
    "link": "https://w1.100regression.com/the-max-level-players-100th-regression-chapter-46/",
    "lastReadDate": "2025-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_82",
    "title": "Star embracing swords master",
    "chapter": 80,
    "link": "https://starembracingswordmaster.com/manga/star-embracing-swordmaster-chapter-80/",
    "lastReadDate": "2025-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_83",
    "title": "baek xx",
    "chapter": 124,
    "link": "https://hivecomic.com/series/baek-xx/chapter-124",
    "lastReadDate": "2025-04-28",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_84",
    "title": "Phantom buster",
    "chapter": 45,
    "link": "https://mangadex.org/chapter/7b730787-905c-4442-b445-0cb13dedac04/45",
    "lastReadDate": "2025-04-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_85",
    "title": "Record of ragnorok",
    "chapter": 104,
    "link": "https://record-ragnarok.com/manga/record-of-ragnarok-chapter-102/",
    "lastReadDate": "2025-04-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_86",
    "title": "Juujika no rokunin",
    "chapter": 208,
    "link": "https://w13.juujikano-rokunin.com/manga/juujika-no-rokunin-chapter-208/",
    "lastReadDate": "2025-05-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_87",
    "title": "the way to meet mom",
    "chapter": 26,
    "link": "https://mangadex.org/title/8b8102da-c875-4dae-a79c-c62e817ff3f5/on-the-way-to-meet-mom",
    "lastReadDate": "2025-05-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_88",
    "title": "Absolute regression",
    "chapter": 47,
    "link": "https://asuracomic.net/series/absolute-regression-d292765e/chapter/47",
    "lastReadDate": "2025-05-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_89",
    "title": "Grand blue",
    "chapter": 102,
    "link": "https://xbato.com/title/86663-grand-blue-dreaming-official/3327669-ch_102",
    "lastReadDate": "2025-05-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_90",
    "title": "Warrior high school",
    "chapter": 0,
    "link": "https://www.toongod.org/webtoon/warrior-high-school-dungeon-raid-department/chapter-45/",
    "lastReadDate": "2025-07-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_91",
    "title": "Day walker",
    "chapter": 45,
    "link": "https://www.mgeko.cc/reader/en/daywalker-chapter-45-eng-li/",
    "lastReadDate": "2025-07-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_92",
    "title": "eleceed",
    "chapter": 368,
    "link": "https://manhwabuddy.com/manhwa/eleceed/chapter-368/",
    "lastReadDate": "2025-09-21",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_93",
    "title": "Regressing as the reincarnated bastard of the sword clan",
    "chapter": 71,
    "link": "https://vortexscans.org/series/regressing-as-the-reincarnated-bastard/chapter-71",
    "lastReadDate": "2025-11-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_94",
    "title": "Bad born blood",
    "chapter": 72,
    "link": "https://asuracomic.net/series/bad-born-blood-50643aa2/chapter/72",
    "lastReadDate": "2026-02-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_95",
    "title": "Star embracing sword master",
    "chapter": 109,
    "link": "https://asuracomic.net/series/star-embracing-swordmaster-769bc194/chapter/109",
    "lastReadDate": "2026-02-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_96",
    "title": "Jujutsu kaisen module",
    "chapter": 23,
    "link": "https://jujutsumodulo.com/chapter/23/",
    "lastReadDate": "2026-02-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_97",
    "title": "Level 999 goblin",
    "chapter": 41,
    "link": "https://asuracomic.net/series/level-999-goblin-60985c3e/chapter/41",
    "lastReadDate": "2026-02-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_98",
    "title": "Reaper of the drifting moon",
    "chapter": 128,
    "link": "https://asuracomic.net/series/reaper-of-the-drifting-moon-2a3ea549/chapter/128",
    "lastReadDate": "2026-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_99",
    "title": "Dragon devouring mage",
    "chapter": 136,
    "link": "https://asuracomic.net/series/dragon-devouring-mage-6c596642/chapter/136",
    "lastReadDate": "2026-03-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_100",
    "title": "The player hides his past",
    "chapter": 111,
    "link": "https://asuracomic.net/series/the-player-hides-his-past-e4e26939/chapter/111",
    "lastReadDate": "2026-03-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_101",
    "title": "Childhood friend of the zenith",
    "chapter": 97,
    "link": "https://www.toongod.org/webtoon/childhood-friend-of-the-zenith/chapter-97/",
    "lastReadDate": "2026-03-15",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken"
  },
  {
    "id": "manhwa_102",
    "title": "Priest of corruption",
    "chapter": 79,
    "link": "https://asurascans.com/comics/the-priest-of-corruption-75e30c62/chapter/79",
    "lastReadDate": "2026-04-08",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_103",
    "title": "Dungeon odyssey",
    "chapter": 155,
    "link": "https://asurascans.com/comics/dungeon-odyssey-75e30c62/chapter/155",
    "lastReadDate": "2026-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_104",
    "title": "The dark mage’s return to enlistment",
    "chapter": 84,
    "link": "https://asurascans.com/comics/the-dark-mages-return-to-enlistment-0984835a/chapter/85",
    "lastReadDate": "2026-05-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_105",
    "title": "Cosmic heavenly demon 3077",
    "chapter": 87,
    "link": "https://mangadex.org/chapter/74660d1b-fb17-467f-aed7-d48e445101e8/1",
    "lastReadDate": "2026-05-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_106",
    "title": "What a bountiful harvest, Demon Lord!",
    "chapter": 73,
    "link": "https://asurascans.com/comics/what-a-bountiful-harvest-demon-lord-fc4c7eba/chapter/73",
    "lastReadDate": "2026-06-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_107",
    "title": "Evolution begins with a big tree",
    "chapter": 516,
    "link": "https://arenascan.com/evolution-begins-with-a-big-tree-chapter-516/",
    "lastReadDate": "2026-06-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_108",
    "title": "Tang chronicles",
    "chapter": 49,
    "link": "https://asurascans.com/comics/the-tang-clan-chronicles-fc4c7eba/chapter/49",
    "lastReadDate": "2026-06-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "title": "Berserk quest",
    "chapter": 0,
    "link": "",
    "lastReadDate": "2021-01-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "unknown",
    "id": "manhwa_109"
  },
  {
    "title": "Mookhyang the origin",
    "chapter": 47,
    "link": "https://www.asurascans.com/mookhyang-the-origin-chapter-47/",
    "lastReadDate": "2021-01-02",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_110"
  },
  {
    "title": "Spirit farmer",
    "chapter": 74,
    "link": "https://www.asurascans.com/spirit-farmer-chapter-74/",
    "lastReadDate": "2021-01-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_111"
  },
  {
    "title": "Solo spell caster",
    "chapter": 71,
    "link": "https://www.asurascans.com/solo-spell-caster-chapter-71/",
    "lastReadDate": "2021-01-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_112"
  },
  {
    "title": "Wandering warrior of Wudang",
    "chapter": 58,
    "link": "https://www.asurascans.com/wandering-warrior-of-wudang-chapter-58/",
    "lastReadDate": "2021-01-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_113"
  },
  {
    "title": "King of bugs",
    "chapter": 28,
    "link": "https://www.asurascans.com/the-king-of-bugs-chapter-28/",
    "lastReadDate": "2021-01-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_114"
  },
  {
    "title": "Return of the ` constellation",
    "chapter": 20,
    "link": "https://www.asurascans.com/return-of-the-shattered-constellation-chapter-20/",
    "lastReadDate": "2021-01-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_115"
  },
  {
    "title": "Damn reincarnation",
    "chapter": 81,
    "link": "https://reaperscans.com/comics/6887-damn-reincarnation/chapters/30550051-chapter-81",
    "lastReadDate": "2021-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_116"
  },
  {
    "title": "Revenge of the iron blooded sword hound",
    "chapter": 95,
    "link": "https://asuracomic.net/series/revenge-of-the-iron-blooded-sword-hound-4088ab84/chapter/95",
    "lastReadDate": "2021-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_117"
  },
  {
    "title": "Wandering warrior of wading",
    "chapter": 135,
    "link": "https://asuracomic.net/series/wandering-warrior-of-wudang-db789faa/chapter/135",
    "lastReadDate": "2021-01-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_118"
  },
  {
    "title": "SSS class suicide hunter",
    "chapter": 109.5,
    "link": "https://reaperscans.com/comics/5150-sss-class-suicide-hunter/chapters/67173991-chapter-1095",
    "lastReadDate": "2021-01-20",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_119"
  },
  {
    "title": "Leveling with the gods",
    "chapter": 127,
    "link": "https://reaperscans.com/series/leveling-with-the-gods-805/chapter-127",
    "lastReadDate": "2021-01-21",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_120"
  },
  {
    "title": "I obtained a mythic item",
    "chapter": 164,
    "link": "https://asuracomic.net/series/i-obtained-a-mythic-item-61d61bd5/chapter/164",
    "lastReadDate": "2021-01-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_121"
  },
  {
    "title": "Pick me up infinite gacha",
    "chapter": 208,
    "link": "https://asurascans.com/comics/pick-me-up-infinite-gacha-a80d257e/chapter/208",
    "lastReadDate": "2026-07-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_122"
  },
  {
    "title": "Updater",
    "chapter": 98,
    "link": "",
    "lastReadDate": "2021-01-27",
    "status": "reading",
    "notes": "",
    "linkStatus": "unknown",
    "id": "manhwa_123"
  },
  {
    "title": "The nebula civilization",
    "chapter": 73,
    "link": "https://asuracomic.net/series/the-nebulas-civilization-f844a9d2/chapter/73",
    "lastReadDate": "2021-01-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_124"
  },
  {
    "title": "Nano machine",
    "chapter": 243,
    "link": "https://asuracomic.net/series/nano-machine-2f06f1c7/chapter/243",
    "lastReadDate": "2021-01-29",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_125"
  },
  {
    "title": "Nine heavens sword master",
    "chapter": 74.5,
    "link": "https://flamecomics.com/nine-heavens-swordmaster-chapter-74-5/",
    "lastReadDate": "2021-01-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_126"
  },
  {
    "title": "Star fostered sword master",
    "chapter": 26,
    "link": "https://flamecomics.com/star-fostered-swordmaster-chapter-26/",
    "lastReadDate": "2021-01-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_127"
  },
  {
    "title": "Academy’s genius swordsman",
    "chapter": 33,
    "link": "https://flamecomics.com/academys-genius-swordsman-chapter-33/",
    "lastReadDate": "2021-01-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_128"
  },
  {
    "title": "Solo max level newbie",
    "chapter": 84,
    "link": "https://www.asurascans.com/solo-max-level-newbie-chapter-84-land-of-cruel-cold-tundra/",
    "lastReadDate": "2021-01-31",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_129"
  },
  {
    "title": "My school life pretending to be a worthless person",
    "chapter": 43,
    "link": "https://www.asurascans.com/my-school-life-pretending-to-be-a-worthless-person-chapter-43/",
    "lastReadDate": "2021-02-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_130"
  },
  {
    "title": "Ex and ash",
    "chapter": 67,
    "link": "https://flamescans.org/1675422061-ex-and-ash-chapter-67/",
    "lastReadDate": "2021-02-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_131"
  },
  {
    "title": "Overgeared",
    "chapter": 264,
    "link": "https://reaperscans.com/series/overgeared/chapter-264",
    "lastReadDate": "2021-02-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_132"
  },
  {
    "title": "the demon prince goes to academy",
    "chapter": 21,
    "link": "https://reaperscans.com/comics/4770-the-demon-prince-goes-to-the-academy/chapters/53053301-chapter-21",
    "lastReadDate": "2021-02-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_133"
  },
  {
    "title": "Player who returned 10,000 years later",
    "chapter": 54,
    "link": "https://reaperscans.com/comics/2800-player-who-returned-10000-years-later/chapters/72273736-chapter-45",
    "lastReadDate": "2022-02-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_134"
  },
  {
    "title": "Sword masters youngest son",
    "chapter": 100,
    "link": "https://reaperscans.com/comics/4050-swordmasters-youngest-son/chapters/48333169-chapter-99",
    "lastReadDate": "2022-02-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_135"
  },
  {
    "title": "Infinite mage",
    "chapter": 157,
    "link": "https://asuracomic.net/series/infinite-mage-c2f05e79/chapter/157",
    "lastReadDate": "2022-02-27",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_136"
  },
  {
    "title": "Skill lender",
    "chapter": 90,
    "link": "https://mangafire.to/read/skill-lenders-retrieving-tale-i-told-you-its-10-per-10-days-at-first-didnt-ii.mxz8/en/chapter-90",
    "lastReadDate": "2022-02-27",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_137"
  },
  {
    "title": "The reincarnated assassin is a genius swordsman",
    "chapter": 54,
    "link": "https://asuracomic.net/series/the-reincarnated-assassin-is-a-genius-swordsman-3a344bdb/chapter/54",
    "lastReadDate": "2022-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_138"
  },
  {
    "title": "Reborn as the enemy’s prince",
    "chapter": 63,
    "link": "https://asuracomic.net/series/reborn-as-the-enemy-prince-55fe9ffa/chapter/63",
    "lastReadDate": "2022-03-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_139"
  },
  {
    "title": "Omniscient reader",
    "chapter": 252,
    "link": "https://flamecomics.xyz/series/2/84185a02acdae926",
    "lastReadDate": "2022-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_140"
  },
  {
    "title": "Solo leveling ragnarok",
    "chapter": 44,
    "link": "https://flamecomics.xyz/series/143/3c600529bed56ecd",
    "lastReadDate": "2022-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_141"
  },
  {
    "title": "Surviving the apocalypse",
    "chapter": 45,
    "link": "https://flamecomics.xyz/series/138/b4bf91c0692ff22a",
    "lastReadDate": "2022-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_142"
  },
  {
    "title": "Legend of asura the venom dragon",
    "chapter": 79,
    "link": "https://www.asurascans.com/legend-of-asura-the-venom-dragon-chapter-79/",
    "lastReadDate": "2022-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_143"
  },
  {
    "title": "The Max Level Hero Has Returned",
    "chapter": 78,
    "link": "https://www.asurascans.com/the-max-level-hero-has-returned-chapter-78/",
    "lastReadDate": "2022-03-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_144"
  },
  {
    "title": "Ghost story club",
    "chapter": 56,
    "link": "https://reaperscans.com/series/ghost-story-club-remake/chapter-56",
    "lastReadDate": "2022-03-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_145"
  },
  {
    "title": "The hero returns",
    "chapter": 111,
    "link": "https://reaperscans.com/series/the-hero-returns/chapter-111",
    "lastReadDate": "2022-03-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_146"
  },
  {
    "title": "The 31st piece turns the tables",
    "chapter": 84,
    "link": "https://reaperscans.com/series/the-31st-piece-turns-the-tables-558/chapter-84",
    "lastReadDate": "2022-03-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_147"
  },
  {
    "title": "S class hunter doesn’t want to be a villainous princess",
    "chapter": 60,
    "link": "https://reaperscans.com/series/the-s-class-hunter-doesnt-want-to-be-a-villainous-princess-791/chapter-60",
    "lastReadDate": "2022-04-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_148"
  },
  {
    "title": "The unbeatable dungeons lazy monster",
    "chapter": 70.5,
    "link": "https://reaperscans.com/series/the-unbeatable-dungeons-lazy-boss-monster/chapter-70-5",
    "lastReadDate": "2022-04-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_149"
  },
  {
    "title": "Rankers return",
    "chapter": 182,
    "link": "https://reaperscans.com/series/rankers-return/chapter-182",
    "lastReadDate": "2022-04-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_150"
  },
  {
    "title": "The constellation that returned from hell",
    "chapter": 146,
    "link": "https://asuratoon.com/4631981187-the-constellation-that-returned-from-hell-chapter-146/",
    "lastReadDate": "2022-04-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_151"
  },
  {
    "title": "Worn and Torn Newbie",
    "chapter": 159,
    "link": "https://asuratoon.com/4631981187-worn-and-torn-newbie-chapter-159/",
    "lastReadDate": "2022-04-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_152"
  },
  {
    "title": "The martial god who regressed to level 2",
    "chapter": 92,
    "link": "https://reaperscans.com/series/the-martial-god-who-regressed-back-to-level-2-382/chapter-92",
    "lastReadDate": "2022-04-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_153"
  },
  {
    "title": "Aire",
    "chapter": 57,
    "link": "https://reaperscans.com/series/aire/chapter-57/",
    "lastReadDate": "2022-04-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_154"
  },
  {
    "title": "Used to be a boss",
    "chapter": 22,
    "link": "https://flamescans.org/1680861661-i-used-to-be-a-boss-chapter-22/",
    "lastReadDate": "2022-04-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_155"
  },
  {
    "title": "Estio",
    "chapter": 33,
    "link": "https://reaperscans.com/series/estio/chapter-33/",
    "lastReadDate": "2022-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_156"
  },
  {
    "title": "The villain wants to live",
    "chapter": 26,
    "link": "https://reaperscans.com/series/the-villain-wants-to-live/chapter-26",
    "lastReadDate": "2022-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_157"
  },
  {
    "title": "Return of the SSS class ranker",
    "chapter": 98,
    "link": "https://asuratoon.com/8612194254-return-of-the-sss-class-ranker-chapter-98/",
    "lastReadDate": "2022-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_158"
  },
  {
    "title": "The greatest estate developer",
    "chapter": 135,
    "link": "https://asuratoon.com/1908287720-the-greatest-estate-developer-chapter-135/",
    "lastReadDate": "2023-04-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_159"
  },
  {
    "title": "Legendary youngest son of the marquis house",
    "chapter": 92,
    "link": "https://asurascans.com/comics/legendary-youngest-son-of-the-marquis-house-a80d257e/chapter/92",
    "lastReadDate": "2026-07-08",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_160"
  },
  {
    "title": "Return of the mount Hua sect",
    "chapter": 119,
    "link": "https://asuratoon.com/1908287720-return-of-the-mount-hua-sect-chapter-119/",
    "lastReadDate": "2023-04-16",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_161"
  },
  {
    "title": "Sleeping ranker",
    "chapter": 109,
    "link": "https://asuratoon.com/1908287720-sleeping-ranker-chapter-109/",
    "lastReadDate": "2023-04-16",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_162"
  },
  {
    "title": "The tutorial of the advanced player",
    "chapter": 109,
    "link": "https://www.asurascans.com/the-tutorial-tower-of-the-advanced-player-chapter-109/",
    "lastReadDate": "2023-04-25",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_163"
  },
  {
    "title": "Return of the crazy demon",
    "chapter": 118,
    "link": "https://asuratoon.com/1908287720-the-return-of-the-crazy-demon-chapter-118/",
    "lastReadDate": "2023-04-25",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_164"
  },
  {
    "title": "Drug eating genius mage",
    "chapter": 48,
    "link": "https://asuratoon.com/8612194254-drug-eating-genius-mage-chapter-48/",
    "lastReadDate": "2023-04-25",
    "status": "on-hold",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_165"
  },
  {
    "title": "Surviving the game as a barbarian",
    "chapter": 53,
    "link": "https://asuracomic.net/8612194254-surviving-the-game-as-a-barbarian-chapter-53/",
    "lastReadDate": "2023-05-01",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_167"
  },
  {
    "title": "Emperors domination",
    "chapter": 19,
    "link": "https://www.asurascans.com/emperors-domination-chapter-19/",
    "lastReadDate": "2023-05-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_169"
  },
  {
    "title": "Hoarding in hell",
    "chapter": 32,
    "link": "https://www.asurascans.com/hoarding-in-hell-chapter-32/",
    "lastReadDate": "2023-05-03",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_170"
  },
  {
    "title": "The Regressed Mercenary's Machinations",
    "chapter": 37,
    "link": "https://asuracomic.net/series/the-regressed-mercenarys-machinations-69ab1a87/chapter/37",
    "lastReadDate": "2023-05-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_171"
  },
  {
    "title": "Perfect surgeon",
    "chapter": 26,
    "link": "https://reaperscans.com/series/perfect-surgeon/chapter-26/",
    "lastReadDate": "2023-05-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_172"
  },
  {
    "title": "Return of the disaster class hero",
    "chapter": 124,
    "link": "https://reaperscans.com/series/the-return-of-the-disaster-class-hero/chapter-124",
    "lastReadDate": "2023-05-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_173"
  },
  {
    "title": "The tutorial is too hard",
    "chapter": 213,
    "link": "https://reaperscans.com/series/the-tutorial-is-too-hard-836/chapter-213",
    "lastReadDate": "2023-05-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_174"
  },
  {
    "title": "Archmage transcending through regression",
    "chapter": 102,
    "link": "https://asuracomic.net/1908287720-archmage-transcending-through-regression-chapter-102/",
    "lastReadDate": "2023-05-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_175"
  },
  {
    "title": "Myst might mayhem",
    "chapter": 74,
    "link": "https://asuracomic.net/series/myst-might-mayhem-6bcc3195/chapter/74",
    "lastReadDate": "2023-05-21",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_176"
  },
  {
    "title": "Eternally regressing knight",
    "chapter": 58,
    "link": "https://asuracomic.net/series/eternally-regressing-knight-4f95bdb1/chapter/58",
    "lastReadDate": "2023-05-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_177"
  },
  {
    "title": "Phantom spirit king",
    "chapter": 21,
    "link": "https://reaperscans.com/series/phantom-spirit-king/chapter-21/",
    "lastReadDate": "2023-05-24",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_178"
  },
  {
    "title": "How to live as a villain",
    "chapter": 44,
    "link": "https://reaperscans.com/series/how-to-live-as-a-villain/chapter-44/",
    "lastReadDate": "2023-05-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_179"
  },
  {
    "title": "Hyper luck",
    "chapter": 20,
    "link": "https://reaperscans.com/series/hyper-luck-manhwa/chapter-20/",
    "lastReadDate": "2023-05-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_180"
  },
  {
    "title": "Level 1 player",
    "chapter": 38,
    "link": "https://reaperscans.com/series/level-1-player/chapter-38/",
    "lastReadDate": "2023-05-31",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_181"
  },
  {
    "title": "Demonic evolution",
    "chapter": 61,
    "link": "https://demonicevolution.org/manga/demonic-evolution-chapter-61/",
    "lastReadDate": "2023-05-31",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_182"
  },
  {
    "title": "Relife player",
    "chapter": 65,
    "link": "https://asuracomic.net/8612194254-relife-player-chapter-65-s2-end/",
    "lastReadDate": "2023-06-02",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_183"
  },
  {
    "title": "I grow stronger by eating",
    "chapter": 100,
    "link": "https://asuracomic.net/8612194254-i-grow-stronger-by-eating-chapter-100-the-end/",
    "lastReadDate": "2024-06-03",
    "status": "on-hold",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_184"
  },
  {
    "title": "Regressor instruction manual",
    "chapter": 48,
    "link": "https://reaperscans.com/series/regressor-instruction-manual/chapter-48/",
    "lastReadDate": "2024-06-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_185"
  },
  {
    "title": "Arcane sniper",
    "chapter": 75,
    "link": "https://reaperscans.com/series/arcane-sniper/chapter-75/",
    "lastReadDate": "2024-06-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_186"
  },
  {
    "title": "Academy undercover professor",
    "chapter": 8,
    "link": "https://reaperscans.com/series/academys-undercover-professor-manhwa/",
    "lastReadDate": "2024-06-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_187"
  },
  {
    "title": "Real life quest",
    "chapter": 37,
    "link": "https://flamescans.org/1654790462-real-life-quest-chapter-1/",
    "lastReadDate": "2024-06-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken",
    "id": "manhwa_188"
  },
  {
    "title": "The second coming of gluttony",
    "chapter": 109,
    "link": "https://www.asurascans.com/the-second-coming-of-gluttony-chapter-109/",
    "lastReadDate": "2024-06-09",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_189"
  },
  {
    "title": "Superhuman battlefield",
    "chapter": 109,
    "link": "https://asurascans.us/read-en-us/superhuman-battlefield/chapter-109/",
    "lastReadDate": "2024-06-12",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_190"
  },
  {
    "title": "I reincarnated as the crazed heir",
    "chapter": 51,
    "link": "https://www.asurascans.com/i-reincarnated-as-the-crazed-heir-chapter-51/",
    "lastReadDate": "2024-06-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_191"
  },
  {
    "title": "Regressing with the king’s power",
    "chapter": 95,
    "link": "https://asuracomic.net/series/regressing-with-the-kings-power-05e2416a/chapter/95",
    "lastReadDate": "2024-06-23",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_192"
  },
  {
    "title": "Trash of the counts family",
    "chapter": 110,
    "link": "https://asuracomic.net/8612194254-trash-of-the-counts-family-chapter-110/",
    "lastReadDate": "2024-06-25",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_193"
  },
  {
    "title": "One step for the dark lord",
    "chapter": 160,
    "link": "https://flamecomics.me/one-step-for-the-dark-lord-chapter-160/",
    "lastReadDate": "2024-06-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken",
    "id": "manhwa_194"
  },
  {
    "title": "Reincarnation of the suicidal battle god",
    "chapter": 100,
    "link": "https://asuracomic.net/8612194254-reincarnation-of-the-suicidal-battle-god-chapter-100/",
    "lastReadDate": "2024-07-18",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_195"
  },
  {
    "title": "Poison eating healer",
    "chapter": 50,
    "link": "https://asura.gg/poison-eating-healer-chapter-50-s1-end/",
    "lastReadDate": "2024-08-03",
    "status": "reading",
    "notes": "on haitus",
    "linkStatus": "active",
    "id": "manhwa_196"
  },
  {
    "title": "Is this hero for real",
    "chapter": 41,
    "link": "https://reaperscans.com/series/is-this-hero-for-real/chapter-41/",
    "lastReadDate": "2024-08-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_197"
  },
  {
    "title": "The Great Mage Returns After 4000 Years",
    "chapter": 185,
    "link": "https://reaperscans.com/comics/7319-the-great-mage-returns-after-4000-years/chapters/74419125-chapter-185",
    "lastReadDate": "2024-09-11",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_198"
  },
  {
    "title": "Chronicles of the martial gods return",
    "chapter": 35,
    "link": "https://www.asurascans.com/chronicles-of-the-martial-gods-return-chapter-35/",
    "lastReadDate": "2024-09-16",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_199"
  },
  {
    "title": "Player from today onwards",
    "chapter": 57,
    "link": "https://reaperscans.com/series/player-from-today-onwards/chapter-57/",
    "lastReadDate": "2024-09-24",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_200"
  },
  {
    "title": "Return of the broken constellation",
    "chapter": 50,
    "link": "https://reaperscans.com/comics/3323-return-of-the-broken-constellation/chapters/32956515-chapter-50",
    "lastReadDate": "2024-10-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_201"
  },
  {
    "title": "Return of the legendary spear knight",
    "chapter": 65.5,
    "link": "https://reaperscans.com/comics/7655-return-of-the-legendary-spear-knight/chapters/64074428-chapter-655",
    "lastReadDate": "2024-10-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_202"
  },
  {
    "title": "Return of the frozen player",
    "chapter": 52,
    "link": "https://reaperscans.com/comics/7868-return-of-the-frozen-player/chapters/21165072-chapter-52",
    "lastReadDate": "2024-10-26",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_204"
  },
  {
    "title": "The book of lager",
    "chapter": 51,
    "link": "https://asura.gg/the-book-of-lagier-chapter-51/",
    "lastReadDate": "2024-10-26",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_205"
  },
  {
    "title": "서울역 드루이드 Seoul station druid",
    "chapter": 74,
    "link": "https://reaperscans.com/comics/1185-seoul-station-druid/chapters/78078667-chapter-74",
    "lastReadDate": "2024-10-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_206"
  },
  {
    "title": "Of all things I became a crow",
    "chapter": 57,
    "link": "https://asura.gg/of-all-things-i-became-a-crow-chapter-57/",
    "lastReadDate": "2025-11-08",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_207"
  },
  {
    "title": "The house without time",
    "chapter": 202,
    "link": "https://www.mgeko.cc/reader/en/the-house-without-times-chapter-202-eng-li/",
    "lastReadDate": "2025-11-24",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_208"
  },
  {
    "title": "Dungeon reset",
    "chapter": 135,
    "link": "https://reaperscans.com/comics/8713-dungeon-reset/chapters/49253456-chapter-135",
    "lastReadDate": "2025-11-28",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_209"
  },
  {
    "title": "Return of the 8th class magician",
    "chapter": 78,
    "link": "https://asura.gg/return-of-the-8th-class-magician-chapter-78/",
    "lastReadDate": "2025-12-04",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_210"
  },
  {
    "title": "Shadowless night",
    "chapter": 30,
    "link": "https://asura.gg/shadowless-night-chapter-30/",
    "lastReadDate": "2025-12-05",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_211"
  },
  {
    "title": "The challenger",
    "chapter": 33,
    "link": "https://asura.gg/the-challenger-chapter-33/",
    "lastReadDate": "2025-12-06",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_212"
  },
  {
    "title": "Absolute sword sense",
    "chapter": 21.5,
    "link": "https://asura.gg/absolute-sword-sense-chapter-21-5/",
    "lastReadDate": "2025-12-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_213"
  },
  {
    "title": "Legend of asura venom dragon",
    "chapter": 84,
    "link": "https://asura.gg/legend-of-asura-the-venom-dragon-chapter-84/",
    "lastReadDate": "2025-12-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_214"
  },
  {
    "title": "Helmut the forsaken child",
    "chapter": 34,
    "link": "https://asura.gg/helmut-the-forsaken-child-chapter-34/",
    "lastReadDate": "2025-12-07",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_215"
  },
  {
    "title": "Demon lords martial arts ascension",
    "chapter": 23,
    "link": "https://asura.gg/demon-lords-martial-arts-ascension-chapter-23/",
    "lastReadDate": "2025-12-10",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_216"
  },
  {
    "title": "Champions path to murim",
    "chapter": 33,
    "link": "https://asura.gg/champions-path-to-murim-chapter-33/",
    "lastReadDate": "2025-12-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_217"
  },
  {
    "title": "Heavenly inquisition sword",
    "chapter": 14,
    "link": "https://asura.gg/heavenly-inquisition-sword-chapter-14/",
    "lastReadDate": "2025-12-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_218"
  },
  {
    "title": "Genius of a unique lineage",
    "chapter": 24,
    "link": "https://asura.gg/genius-of-the-unique-lineage-chapter-24/",
    "lastReadDate": "2025-12-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_219"
  },
  {
    "title": "Existence",
    "chapter": 21,
    "link": "https://asura.gg/existence-chapter-21/",
    "lastReadDate": "2025-12-13",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_220"
  },
  {
    "title": "The newbie is too strong",
    "chapter": 40,
    "link": "https://asura.gg/the-newbie-is-too-strong-chapter-40-s1-end/",
    "lastReadDate": "2025-12-14",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_221"
  },
  {
    "title": "Life of a magic academy mage",
    "chapter": 19,
    "link": "https://asura.gg/life-of-a-magic-academy-mage-chapter-19/",
    "lastReadDate": "2025-12-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_222"
  },
  {
    "title": "Worlds strongest troll",
    "chapter": 13,
    "link": "https://asura.gg/worlds-strongest-troll-chapter-13/",
    "lastReadDate": "2025-12-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_223"
  },
  {
    "title": "Star instructor",
    "chapter": 50,
    "link": "https://asura.gg/star-instructor-master-baek-chapter-50-s1-end/",
    "lastReadDate": "2025-12-17",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_224"
  },
  {
    "title": "The S classes that I raised",
    "chapter": 61,
    "link": "https://reaperscans.com/comics/3692-the-s-classes-that-i-raised/chapters/14651383-chapter-61",
    "lastReadDate": "2025-12-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_225"
  },
  {
    "title": "Knight of the frozen flower",
    "chapter": 48,
    "link": "https://reaperscans.com/comics/2818-knight-of-the-frozen-flower/chapters/23891309-chapter-48",
    "lastReadDate": "2025-12-19",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_226"
  },
  {
    "title": "Ragna crimson",
    "chapter": 79,
    "link": "https://ragna.ragnacrimsonmanga.com/manga/ragna-crimson-manga-chapter-79/",
    "lastReadDate": "2025-12-22",
    "status": "reading",
    "notes": "",
    "linkStatus": "broken",
    "id": "manhwa_227"
  },
  {
    "title": "The god of war who regressed",
    "chapter": 41,
    "link": "https://flamecomics.com/the-god-of-war-who-regressed-to-level-2-chapter-41/",
    "lastReadDate": "2025-12-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_228"
  },
  {
    "title": "Youngest of the sword clan",
    "chapter": 100,
    "link": "https://flamecomics.com/youngest-son-of-the-renowned-swordsmanship-clan-chapter-100/",
    "lastReadDate": "2025-12-30",
    "status": "reading",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_229"
  },
  {
    "title": "Kill the dragon",
    "chapter": 12,
    "link": "https://www.asurascans.com/comics/kill-the-dragon/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_230"
  },
  {
    "title": "King of runs",
    "chapter": 12,
    "link": "https://www.asurascans.com/comics/king-of-runes/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_231"
  },
  {
    "title": "My daughter is the final boss",
    "chapter": 20,
    "link": "https://www.asurascans.com/my-daughter-is-the-final-boss-chapter-1/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_232"
  },
  {
    "title": "Transmigrating to the otherworld once more",
    "chapter": 0,
    "link": "",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "unknown",
    "id": "manhwa_233"
  },
  {
    "title": "My insanely competent underlings",
    "chapter": 0,
    "link": "",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "unknown",
    "id": "manhwa_234"
  },
  {
    "title": "Im not that kind of talent",
    "chapter": 17,
    "link": "https://www.asurascans.com/1672760368-im-not-that-kind-of-talent-chapter-1/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_235"
  },
  {
    "title": "heavenly demon instructor",
    "chapter": 23,
    "link": "https://www.asurascans.com/comics/heavenly-demon-instructor/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_236"
  },
  {
    "title": "The regress or instruction manual",
    "chapter": 24,
    "link": "https://www.asurascans.com/comics/regressor-instruction-manual/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_237"
  },
  {
    "title": "The S-Classes That I Raised",
    "chapter": 9,
    "link": "https://www.asurascans.com/comics/the-s-classes-that-i-raised/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_238"
  },
  {
    "title": "Return of the unrivaled spear knight",
    "chapter": 26,
    "link": "https://www.asurascans.com/comics/return-of-the-unrivaled-spear-knight/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_239"
  },
  {
    "title": "Demonic spirit king",
    "chapter": 14,
    "link": "https://www.asurascans.com/comics/demonic-spirit-king/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_240"
  },
  {
    "title": "Starting today im a player",
    "chapter": 28,
    "link": "https://www.asurascans.com/comics/starting-today-im-a-player/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_241"
  },
  {
    "title": "Your talent is mine",
    "chapter": 15,
    "link": "https://www.asurascans.com/comics/your-talent-is-mine/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_242"
  },
  {
    "title": "My path to killing gods in another world",
    "chapter": 28,
    "link": "https://www.asurascans.com/comics/my-path-to-killing-gods-in-another-world/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_243"
  },
  {
    "title": "Rise from the rubble",
    "chapter": 59,
    "link": "https://www.asurascans.com/comics/rise-from-the-rubble/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_244"
  },
  {
    "title": "Death is the only ending for the villainess",
    "chapter": 27,
    "link": "https://www.asurascans.com/comics/death-is-the-only-ending-for-the-villainess/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_245"
  },
  {
    "title": "The strongest player",
    "chapter": 3,
    "link": "https://www.asurascans.com/comics/the-strongest-player/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_246"
  },
  {
    "title": "Heavenly martial god",
    "chapter": 31,
    "link": "https://www.asurascans.com/comics/heavenly-martial-god/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_247"
  },
  {
    "title": "Maxed out leveling",
    "chapter": 24,
    "link": "https://www.asurascans.com/comics/maxed-out-leveling/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_248"
  },
  {
    "title": "Solo bug player",
    "chapter": 80,
    "link": "https://www.asurascans.com/comics/11-solo-bug-player/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_249"
  },
  {
    "title": "Max level returner",
    "chapter": 120,
    "link": "https://www.asurascans.com/1-max-level-returner-chapter-0/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_250"
  },
  {
    "title": "Above the heavens",
    "chapter": 11,
    "link": "https://www.asurascans.com/comics/above-the-heavens/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_252"
  },
  {
    "title": "The world after the end",
    "chapter": 9,
    "link": "https://www.asurascans.com/comics/the-world-after-the-end/",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_253"
  },
  {
    "title": "Instant danger",
    "chapter": 9,
    "link": "https://manhuascan.com/read-instant-regret-chapter-1.html",
    "lastReadDate": "",
    "status": "plan-to-read",
    "notes": "",
    "linkStatus": "active",
    "id": "manhwa_254"
  },
  {
    "id": "manhwa_1783359810304",
    "title": "Reincarnation of the Fist King",
    "chapter": 59,
    "status": "reading",
    "link": "https://asurascans.com/comics/reincarnation-of-the-fist-king-a80d257e/chapter/59",
    "lastReadDate": "2026-07-06",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_1783444527716",
    "title": "Auto Hunting With My Clones",
    "chapter": 176,
    "status": "completed",
    "link": "https://autohuntingclones.com/comic/auto-hunting-with-my-clones-chapter-176/",
    "lastReadDate": "2026-07-07",
    "notes": "",
    "linkStatus": "active"
  },
  {
    "id": "manhwa_1783620131165",
    "title": "Steel-Eating player",
    "chapter": 101,
    "status": "reading",
    "link": "https://asurascans.com/comics/steel-eating-player-a80d257e/chapter/101",
    "lastReadDate": "2026-07-09",
    "notes": "",
    "linkStatus": "active"
  }
];

// Initialize application data
function initApp() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  const legacyStoredData = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (storedData) {
    try {
      manhwas = JSON.parse(storedData);
    } catch (e) {
      console.error("Error parsing stored manhwa data, fallback to mock data", e);
      manhwas = [...MOCK_DATA];
    }
  } else if (legacyStoredData) {
    try {
      manhwas = mergeRecoveredData(JSON.parse(legacyStoredData));
    } catch (e) {
      console.error("Error parsing legacy manhwa data, fallback to recovered data", e);
      manhwas = [...MOCK_DATA];
    }
    saveData();
  } else {
    manhwas = [...MOCK_DATA];
    saveData();
  }
  
  const storedView = localStorage.getItem('luxe_manhwa_tracker_view');
  if (storedView) {
    currentView = storedView;
  }
  
  // Trigger initial pings for links on load (non-blocking)
  manhwas.forEach(m => {
    if (m.link) {
      pingLink(m.id, m.link);
    }
  });

  // Set default date input in the form to today
  document.getElementById('input-date').value = getTodayString();
  
  render();
}

function mergeRecoveredData(storedManhwas) {
  if (!Array.isArray(storedManhwas)) {
    return [...MOCK_DATA];
  }

  const recoveredIds = new Set(MOCK_DATA.map(m => m.id));
  const browserOnlyManhwas = storedManhwas.filter(m => m && !recoveredIds.has(m.id));
  return [...MOCK_DATA, ...browserOnlyManhwas];
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manhwas));
}

// Helper to get today's date formatted as YYYY-MM-DD
function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to format date beautifully for display
function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Never';
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr + 'T00:00:00'); // Prevent timezone shifts
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateStr;
  }
}

// ==========================================================================
// CRUD OPERATIONS
// ==========================================================================

function addOrUpdateManhwa(id, title, chapter, status, link, lastReadDate, notes) {
  const cleanLink = link ? link.trim() : "";
  const cleanTitle = title.trim();
  
  if (id) {
    // Update Mode
    manhwas = manhwas.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          title: cleanTitle,
          chapter: parseInt(chapter) || 0,
          status,
          link: cleanLink,
          lastReadDate: lastReadDate || getTodayString(),
          notes: notes.trim()
        };
        // If link changed, trigger a re-check
        if (m.link !== cleanLink) {
          updated.linkStatus = 'checking';
          setTimeout(() => pingLink(id, cleanLink), 100);
        }
        return updated;
      }
      return m;
    });
  } else {
    // Add Mode
    const newId = 'manhwa_' + Date.now();
    const newManhwa = {
      id: newId,
      title: cleanTitle,
      chapter: parseInt(chapter) || 0,
      status,
      link: cleanLink,
      lastReadDate: lastReadDate || getTodayString(),
      notes: notes.trim(),
      linkStatus: cleanLink ? 'checking' : 'unknown'
    };
    manhwas.push(newManhwa);
    if (cleanLink) {
      setTimeout(() => pingLink(newId, cleanLink), 100);
    }
  }
  
  saveData();
  render();
}

function deleteManhwa(id) {
  if (confirm("Are you sure you want to remove this manhwa from your tracker?")) {
    manhwas = manhwas.filter(m => m.id !== id);
    saveData();
    render();
  }
}

function updateLinkForChapter(link, newChapter) {
  if (!link) return link;

  const chapterPattern = /(chapter|ep|episode)([-_./]?)(\d+(?:[._-]\d+)*)/i;
  if (!chapterPattern.test(link)) return link;

  return link.replace(chapterPattern, (match, label, separator) => {
    return `${label}${separator}${String(newChapter)}`;
  });
}

function incrementChapter(id) {
  let updatedLink = null;

  manhwas = manhwas.map(m => {
    if (m.id === id) {
      const newChapter = (m.chapter || 0) + 1;
      const nextLink = updateLinkForChapter(m.link, newChapter);

      if (nextLink !== m.link) {
        updatedLink = nextLink;
      }

      return {
        ...m,
        chapter: newChapter,
        link: nextLink,
        lastReadDate: getTodayString()
      };
    }
    return m;
  });

  if (updatedLink) {
    const updatedManhwa = manhwas.find(m => m.id === id);
    if (updatedManhwa) {
      updatedManhwa.linkStatus = 'checking';
      setTimeout(() => pingLink(id, updatedLink), 100);
    }
  }

  saveData();
  render();
}

function startReadingManhwa(id) {
  manhwas = manhwas.map(m => {
    if (m.id === id) {
      return {
        ...m,
        status: 'reading',
        lastReadDate: getTodayString()
      };
    }
    return m;
  });
  saveData();
  render();
}

// Manual Toggle for reporting link broken
function toggleLinkBroken(id) {
  manhwas = manhwas.map(m => {
    if (m.id === id) {
      const current = m.linkStatus;
      const nextStatus = current === 'broken' ? 'active' : 'broken';
      return { ...m, linkStatus: nextStatus };
    }
    return m;
  });
  saveData();
  render();
}

// ==========================================================================
// SMART CLIENT-SIDE LINK PINGER
// ==========================================================================
async function pingLink(id, url) {
  if (!url) return;
  
  // Basic validation of URL structure
  try {
    new URL(url);
  } catch (e) {
    updateLinkState(id, 'broken');
    return;
  }

  // Update DOM status dot to 'checking'
  updateLinkState(id, 'checking');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

  try {
    // Fetch with no-cors. Since external manga sites block CORS,
    // this will succeed or throw. A DNS/network failure triggers an error.
    // A CORS block still returns a type: opaque response (which resolves!).
    await fetch(url, {
      mode: 'no-cors',
      signal: controller.signal
    });
    
    // If it didn't crash out, we assume it's active
    clearTimeout(timeoutId);
    updateLinkState(id, 'active');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Link verification failed for ${url}:`, err);
    // If aborted or failed network connection, flag as broken
    updateLinkState(id, 'broken');
  }
}

function updateLinkState(id, status) {
  // Update state
  let changed = false;
  manhwas = manhwas.map(m => {
    if (m.id === id && m.linkStatus !== status) {
      changed = true;
      return { ...m, linkStatus: status };
    }
    return m;
  });
  
  if (changed) {
    saveData();
    // Partially update card DOM to prevent redrawing everything and losing scroll/focus
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      const dot = card.querySelector('.status-dot');
      const brokenBadge = card.querySelector('.link-broken-badge');
      if (dot) {
        dot.className = `status-dot ${status}`;
        dot.title = `Link Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      }
      
      // Update warning badge visibility
      if (status === 'broken') {
        if (!brokenBadge) {
          const linkContainer = card.querySelector('.chapter-link-container');
          if (linkContainer) {
            const badge = document.createElement('span');
            badge.className = 'link-broken-badge';
            badge.innerHTML = `
              <svg class="icon" style="width: 10px; height: 10px; margin-right: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Broken Link?
            `;
            linkContainer.appendChild(badge);
          }
        }
      } else {
        if (brokenBadge) {
          brokenBadge.remove();
        }
      }
    }
  }
}

// ==========================================================================
// RENDER & DOM UPDATES
// ==========================================================================

function render() {
  const grid = document.getElementById('manhwa-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Apply layout view class
  if (currentView === 'list') {
    grid.classList.add('list-view');
  } else {
    grid.classList.remove('list-view');
  }

  // Update view toggle button states
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');
  if (gridBtn && listBtn) {
    if (currentView === 'list') {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    } else {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    }
  }
  
  // 1. Filter
  let filtered = manhwas.filter(m => {
    const matchesStatus = currentFilter === 'all' || m.status === currentFilter;
    const matchesSearch = searchQuery === '' || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // 2. Sort
  filtered.sort((a, b) => {
    if (currentSort === 'latest-read') {
      const dateA = a.lastReadDate || '0000-00-00';
      const dateB = b.lastReadDate || '0000-00-00';
      return dateB.localeCompare(dateA); // Most recent first
    } else if (currentSort === 'oldest-read') {
      const dateA = a.lastReadDate || '9999-99-99'; // Push no-date items to the end
      const dateB = b.lastReadDate || '9999-99-99';
      return dateA.localeCompare(dateB); // Oldest first
    } else if (currentSort === 'alphabetical') {
      return a.title.localeCompare(b.title); // A-Z
    } else if (currentSort === 'chapters-count') {
      return (b.chapter || 0) - (a.chapter || 0); // High to low
    }
    return 0;
  });

  // 3. Update stats
  updateStats();

  // 4. Render Grid or Empty State
  if (filtered.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    
    // Adjust text based on query vs complete empty
    const isSearching = searchQuery !== '' || currentFilter !== 'all';
    emptyState.querySelector('h3').textContent = isSearching ? 'No matching manhwas' : 'No manhwas tracked yet';
    emptyState.querySelector('p').textContent = isSearching ? 'Try adjusting your search query or status filter.' : 'Start your reading list by adding a new manhwa.';
    emptyState.querySelector('#empty-add-btn').style.display = isSearching ? 'none' : 'inline-flex';
  } else {
    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    grid.innerHTML = filtered.map(m => {
      const statusTitle = m.status.replace('-', ' ');
      const formattedDate = formatDateDisplay(m.lastReadDate);
      const isBroken = m.linkStatus === 'broken';
      
      return `
        <div class="manhwa-card" data-id="${m.id}">
          <div class="card-header">
            <div class="card-title-area">
              <h3 class="card-title">${escapeHTML(m.title)}</h3>
              <span class="status-badge status-${m.status}">${statusTitle}</span>
            </div>
            
            <div class="card-actions-quick">
              <button class="btn-icon edit-card-btn" title="Edit Manhwa" aria-label="Edit details">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">${m.status === 'plan-to-read' ? 'Released Chapters' : 'Current Chapter'}</span>
              <span class="detail-value">Ch. ${m.chapter || 0}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Chapter Link</span>
              <span class="detail-value chapter-link-container">
                ${m.link ? `
                  <span class="status-dot ${m.linkStatus || 'unknown'}" title="Link Status: ${m.linkStatus || 'Unknown'}"></span>
                  <a href="${escapeHTML(m.link)}" target="_blank" rel="noopener noreferrer" class="chapter-link">Visit Link</a>
                  ${isBroken ? `
                    <span class="link-broken-badge" title="We detected a connection issue.">
                      <svg class="icon" style="width: 10px; height: 10px; margin-right: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      Broken Link?
                    </span>
                  ` : ''}
                ` : '<span class="detail-value" style="font-weight: normal; opacity: 0.5;">No link added</span>'}
              </span>
            </div>

            ${m.status !== 'plan-to-read' ? `
              <div class="detail-row">
                <span class="detail-label">Last Read</span>
                <span class="detail-value" title="${m.lastReadDate || ''}">${formattedDate}</span>
              </div>
            ` : ''}

            ${m.notes ? `<p class="card-notes">${escapeHTML(m.notes)}</p>` : ''}
          </div>

          <div class="card-actions">
            <button class="btn-icon delete-card-btn" title="Delete Manhwa" aria-label="Delete manhwa">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            <div class="primary-card-actions">
              ${m.link ? `
                <button class="quick-add-btn toggle-link-status-btn" title="Toggle broken flag manually">Flag Link</button>
              ` : ''}
              ${m.status === 'plan-to-read' ? `
                <button class="quick-add-btn start-reading-btn">Start Reading</button>
              ` : `
                <button class="quick-add-btn plus-one-btn">+1 Chapter</button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Reattach Event Listeners to cards
    attachCardListeners();
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent = manhwas.length;
  
  const readingCount = manhwas.filter(m => m.status === 'reading').length;
  document.getElementById('stat-reading').textContent = readingCount;

  const planToReadCount = manhwas.filter(m => m.status === 'plan-to-read').length;
  const planToReadEl = document.getElementById('stat-plan-to-read');
  if (planToReadEl) {
    planToReadEl.textContent = planToReadCount;
  }
  
  // Find latest active date
  let latestDate = null;
  manhwas.forEach(m => {
    if (m.lastReadDate) {
      if (!latestDate || m.lastReadDate > latestDate) {
        latestDate = m.lastReadDate;
      }
    }
  });
  
  document.getElementById('stat-last-active').textContent = latestDate ? formatDateDisplay(latestDate) : '—';
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================================
// INTERACTIVE DOM EVENT HANDLERS & BINDING
// ==========================================================================

// Global Modals controllers
const modal = document.getElementById('manhwa-modal');
const modalTitle = document.getElementById('modal-title');
const manhwaForm = document.getElementById('manhwa-form');

function updateModalFormFields(status) {
  const dateGroup = document.getElementById('form-group-date');
  const chapterLabel = document.getElementById('form-label-chapter');
  
  if (status === 'plan-to-read') {
    if (dateGroup) dateGroup.style.display = 'none';
    if (chapterLabel) chapterLabel.textContent = 'Released Chapters';
  } else {
    if (dateGroup) dateGroup.style.display = 'block';
    if (chapterLabel) chapterLabel.textContent = 'Current Chapter';
  }
}

function openModal(title, mode = 'add', data = null) {
  modalTitle.textContent = title;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
  
  const statusSelect = document.getElementById('input-status');
  if (mode === 'edit' && data) {
    document.getElementById('manhwa-id').value = data.id;
    document.getElementById('input-title').value = data.title;
    document.getElementById('input-chapter').value = data.chapter;
    statusSelect.value = data.status;
    document.getElementById('input-link').value = data.link;
    document.getElementById('input-date').value = data.lastReadDate || getTodayString();
    document.getElementById('input-notes').value = data.notes || '';
    updateModalFormFields(data.status);
  } else {
    manhwaForm.reset();
    document.getElementById('manhwa-id').value = '';
    document.getElementById('input-date').value = getTodayString();
    statusSelect.value = 'reading';
    updateModalFormFields('reading');
  }
  document.getElementById('input-title').focus();
}

function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Unlock scrolling
  manhwaForm.reset();
}

function initBackToTopButton() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  let ticking = false;

  const updateVisibility = () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateVisibility);
      ticking = true;
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  updateVisibility();
}

function attachCardListeners() {
  // Plus One Button
  document.querySelectorAll('.plus-one-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      incrementChapter(id);
    });
  });

  // Start Reading Button
  document.querySelectorAll('.start-reading-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      startReadingManhwa(id);
    });
  });

  // Edit Button
  document.querySelectorAll('.edit-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      const manhwa = manhwas.find(m => m.id === id);
      if (manhwa) {
        openModal("Edit Manhwa Details", 'edit', manhwa);
      }
    });
  });

  // Delete Button
  document.querySelectorAll('.delete-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      deleteManhwa(id);
    });
  });

  // Toggle Link status flag manually
  document.querySelectorAll('.toggle-link-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.manhwa-card');
      const id = card.getAttribute('data-id');
      toggleLinkBroken(id);
    });
  });
}

// Bind Page Controllers
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initBackToTopButton();

  // "Add Manhwa" click events
  document.getElementById('add-manhwa-btn').addEventListener('click', () => {
    openModal("Add New Manhwa", 'add');
  });

  document.getElementById('empty-add-btn').addEventListener('click', () => {
    openModal("Add New Manhwa", 'add');
  });

  // Close modals
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('form-cancel').addEventListener('click', closeModal);
  
  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submit
  manhwaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('manhwa-id').value;
    const title = document.getElementById('input-title').value;
    const chapter = document.getElementById('input-chapter').value;
    const status = document.getElementById('input-status').value;
    const link = document.getElementById('input-link').value;
    const lastReadDate = document.getElementById('input-date').value;
    const notes = document.getElementById('input-notes').value;

    addOrUpdateManhwa(id, title, chapter, status, link, lastReadDate, notes);
    closeModal();
  });

  // Search input change
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
  });

  // Filter change
  const filterStatus = document.getElementById('filter-status');
  filterStatus.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    render();
  });

  // Sort change
  const sortBy = document.getElementById('sort-by');
  sortBy.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });

  // View toggle handlers
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');
  if (gridBtn && listBtn) {
    gridBtn.addEventListener('click', () => {
      if (currentView !== 'grid') {
        currentView = 'grid';
        localStorage.setItem('luxe_manhwa_tracker_view', 'grid');
        render();
      }
    });

    listBtn.addEventListener('click', () => {
      if (currentView !== 'list') {
        currentView = 'list';
        localStorage.setItem('luxe_manhwa_tracker_view', 'list');
        render();
      }
    });
  }

  // Modal input status change handler
  const inputStatus = document.getElementById('input-status');
  if (inputStatus) {
    inputStatus.addEventListener('change', (e) => {
      updateModalFormFields(e.target.value);
    });
  }
});
