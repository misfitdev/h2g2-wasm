/**
 * Guide entries for the Sub-Etha Sens-O-Matic companion pane.
 *
 * Keyed on the room name reported by the Z-machine (`get_location()`), which is
 * the raw object name and therefore varies in case and punctuation between
 * rooms -- match against `aliases` after normalisation, never on the raw string.
 */

export interface GuideEntry {
  id: string;
  /** Headword, rendered in the Guide's own shouty capitals. */
  title: string;
  /** The Guide's one-line verdict, e.g. "Mostly harmless." */
  verdict: string;
  body: string[];
  /** Other headwords the entry points at; decorative. */
  crossRefs?: string[];
  /** Normalised room-name fragments that select this entry. */
  aliases: string[];
  /** Extra headwords a cross-reference may arrive by. */
  headwords?: string[];
}

/** Uppercases and strips punctuation so 'GRAVITY, LOCAL' matches 'gravity local'. */
export function normalizeHeadword(headword: string): string {
  return headword.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

/**
 * Lowercases, strips punctuation, and collapses whitespace so that "Front of
 * House" and "front-of-house" select the same entry.
 */
export function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const FALLBACK_ENTRY: GuideEntry = {
  id: 'unknown',
  title: 'THIS PLACE',
  verdict: 'Insufficiently surveyed.',
  body: [
    'The Guide has no entry for wherever it is you have got to. This is not necessarily a bad sign. The Guide has no entry for a great many places, most of which are perfectly pleasant, and at least one of which is the exact geometric centre of the galaxy.',
    'The relevant field researcher was last heard from some while ago, and was at the time attempting to file expenses for a meal they described as "regrettable in ways the accounting department is not equipped to process".',
    'In the meantime: do not panic, and consider looking at something.',
  ],
  crossRefs: ['RESEARCH, FIELD', 'EXPENSES'],
  aliases: [],
};

export const GUIDE_ENTRIES: GuideEntry[] = [
  {
    id: 'bedroom',
    title: 'BEDS',
    verdict: 'A poor defence against municipal planning.',
    body: [
      'A bed is a device for postponing the day. It performs this function admirably right up until the moment a bulldozer arrives, at which point its performance falls off rather sharply.',
      'Sentient species across the galaxy have independently invented the bed, the hangover, and the deep conviction that both were someone else\'s idea. Only one species went on to invent the bypass.',
      'Guide researchers recommend getting up. Guide researchers recognise that this advice is unwelcome and are prepared to repeat it.',
    ],
    crossRefs: ['BYPASSES', 'HANGOVERS', 'GRAVITY, LOCAL'],
    aliases: ['bedroom', 'bed'],
  },
  {
    id: 'house',
    title: 'HOUSES, DEMOLITION OF',
    verdict: 'Legally impeccable. Emotionally less so.',
    body: [
      'The plans were on display. They have been on display for nine months in the bottom of a locked filing cabinet stuck in a disused lavatory with a sign on the door saying "Beware of the Leopard". This is considered, by the relevant authorities, to be adequate public notice.',
      'The Guide notes that lying down in front of a bulldozer is a well-established negotiating position, and one of the very few that improves the longer you hold it.',
      'It is unwise to leave the mud unattended.',
    ],
    crossRefs: ['LEOPARDS', 'PLANNING PERMISSION', 'MUD'],
    aliases: ['front of house', 'porch', 'house', 'garden', 'path'],
  },
  {
    id: 'pub',
    title: 'PUBS',
    verdict: 'Structurally unsound. Medicinally essential.',
    body: [
      'A pub is an establishment for the sale of beverages that make the end of the world seem more manageable, and in sufficient quantity, less likely to have been your fault.',
      'Six pints is the recommended dose prior to matter transference. This is not superstition. The Guide has run the numbers and would rather not discuss them.',
      'Peanuts are advised afterwards, to replace the salt and protein consumed by the process. They are the only part of the operation anybody enjoys.',
    ],
    crossRefs: ['MATTER TRANSFERENCE BEAMS', 'PEANUTS', 'MUSCLE RELAXATION'],
    aliases: ['pub', 'bar', 'horse and groom'],
  },
  {
    id: 'dark',
    title: 'DARKNESS',
    verdict: 'Absence of light. Presence of everything else.',
    body: [
      'Darkness is the galaxy\'s most widely distributed substance, available everywhere, requiring no maintenance, and supplied entirely free of charge. Economists have never forgiven it.',
      'It is statistically safe. It is also where the overwhelming majority of things that eat people prefer to conduct business, which is a different statistic entirely, and one the Guide prints in a smaller font.',
      'A torch would be nice. Several species have gone to considerable trouble to invent one.',
    ],
    crossRefs: ['GRUES', 'TORCHES', 'STATISTICS, MISLEADING'],
    aliases: ['dark', 'darkness', 'pitch black'],
  },
  {
    id: 'vogon-ship',
    title: 'VOGONS',
    verdict: 'Not evil. Bad-tempered, bureaucratic, officious and callous.',
    body: [
      'Vogons are the galaxy\'s civil service given mass and a spaceship. They wouldn\'t lift a finger to save their own grandmothers from the Ravenous Bugblatter Beast of Traal without orders signed in triplicate, sent in, sent back, queried, lost, found, subjected to public inquiry, lost again, and finally buried in soft peat for three months and recycled as firelighters.',
      'Their poetry is the third worst in the universe. The Guide has ranked it carefully and stands by the placement, though several members of the ranking committee have since retired for health reasons.',
      'Do not, under any circumstances, praise it sincerely. Vogons are impervious to flattery but exquisitely sensitive to accuracy.',
    ],
    crossRefs: ['POETRY, WORST', 'AIRLOCKS', 'PEAT, SOFT'],
    aliases: [
      'vogon',
      'vogon hold',
      'vogon ship',
      'hold',
      'airlock',
      'vogon sleeping quarters',
    ],
  },
  {
    id: 'heart-of-gold',
    title: 'HEART OF GOLD',
    verdict: 'The most improbable object in existence. Twice.',
    body: [
      'The first spacecraft to make practical use of the Infinite Improbability Drive, a propulsion system that crosses interstellar distances by passing through every conceivable point in the universe at once, which passengers find exhilarating, disturbing, and frequently upholstered.',
      'The ship is fitted with Sirius Cybernetics Corporation products throughout. The Guide\'s entry on the Sirius Cybernetics Corporation reads, in its entirety: "A bunch of mindless jerks who\'ll be the first against the wall when the revolution comes."',
      'The onboard computer is Genuine People Personality enabled. It would like to help. It really would.',
    ],
    crossRefs: [
      'IMPROBABILITY DRIVE, INFINITE',
      'SIRIUS CYBERNETICS CORPORATION',
      'DOORS, HAPPY',
    ],
    aliases: [
      'heart of gold',
      'bridge',
      'gold',
      'pod',
      'escape pod',
      'spaceship pod',
    ],
  },
  {
    id: 'damogran',
    title: 'DAMOGRAN',
    verdict: 'Beautiful. Inconvenient. Both on purpose.',
    body: [
      'Damogran is a planet of long, curving, wildly inconvenient islands, separated by seas of such loveliness that nobody has ever quite got round to complaining about the ferry timetable.',
      'It is therefore the galaxy\'s preferred venue for events that must be seen to happen but must not, under any circumstances, be easy to attend.',
      'The local lizards are said to be excellent company, provided your standards for company are principally about listening.',
    ],
    crossRefs: ['SECURITY BY GEOGRAPHY', 'PRESS EVENTS', 'LIZARDS'],
    aliases: ['damogran', 'island', 'beach'],
  },
  {
    id: 'magrathea',
    title: 'MAGRATHEA',
    verdict: 'Bankrupt. Asleep. Still taking orders.',
    body: [
      'In the days before the Galactic Empire ran out of money, Magrathea manufactured luxury planets to order, with bespoke coastlines, hand-finished fjords, and optional weather.',
      'When the economy collapsed, the Magratheans locked the doors and went to sleep to wait for it to recover. This is, the Guide notes, the single most successful business decision in recorded history, and the only one that has never once been reviewed.',
      'Should you meet a planetary designer, do ask about the fjords. They will insist you don\'t have to, and they will be lying.',
    ],
    crossRefs: ['FJORDS', 'RECESSIONS', 'MICE'],
    aliases: ['magrathea', 'crater', 'planet surface'],
  },
  {
    id: 'traal',
    title: 'RAVENOUS BUGBLATTER BEAST OF TRAAL',
    verdict: 'So stupid it thinks that if you can\'t see it, it can\'t see you.',
    body: [
      'A creature of remarkable ferocity and genuinely negligible intelligence. It will happily eat anything, though it prefers to eat things that have recently been alive, on the grounds that these require less chewing and more screaming.',
      'The standard defence is a towel wrapped around the head. The beast, unable to see you, assumes you cannot see it, and concludes on that basis that you are not there. It is a defence of stunning elegance and no mechanical complexity whatsoever.',
      'The towel remains the most massively useful thing any interstellar hitchhiker can carry. The Guide is not being whimsical about this and would like that noted.',
    ],
    crossRefs: ['TOWELS', 'LOGIC, ABSENCE OF'],
    aliases: ['traal', 'bugblatter', 'beast'],
    headwords: ['TRAAL', 'BUGBLATTER', 'RAVENOUS BUGBLATTER BEAST'],
  },
  {
    id: 'whale',
    title: 'WHALES, SUDDEN',
    verdict: 'A brief but distinguished career.',
    body: [
      'Improbability side effects occasionally produce a sperm whale several miles above a planetary surface. The whale, having no evolutionary preparation whatsoever, must invent from first principles the concepts of self, wind, ground, and finally impact, all within roughly ninety seconds.',
      'It manages the first three with real grace. The Guide considers this among the finest intellectual achievements in the galaxy, and the shortest.',
      'A bowl of petunias is usually produced at the same time, and has notably less to say.',
    ],
    crossRefs: ['PETUNIAS, BOWLS OF', 'FALLING', 'FIRST PRINCIPLES'],
    aliases: ['whale', 'sky', 'falling'],
  },
  {
    id: 'maze',
    title: 'WAR CHAMBERS AND MAZES',
    verdict: 'Someone has thought about this too hard.',
    body: [
      'A maze is what you get when architecture is asked to solve a problem that was really a personality problem all along.',
      'Galactic war chambers are almost always mazes, on the theory that an enemy who cannot find the war cannot win it. The theory holds up rather better than anyone expected, largely because nobody involved can find the war either.',
      'Map it. Yes, actually map it. The Guide is aware this is unglamorous advice and offers it anyway.',
    ],
    crossRefs: ['MAPS', 'WARS, MISPLACED', 'ARCHITECTURE, DEFENSIVE'],
    aliases: ['maze', 'war chamber', 'corridor', 'junction'],
  },
  {
    id: 'party',
    title: 'PARTIES, INTERMINABLE',
    verdict: 'Now in its third generation.',
    body: [
      'Some parties end. Others achieve a kind of critical mass, at which point the guests stop leaving, the supplies start being requisitioned by force, and the building takes to the air in search of further drink.',
      'Children have been born at this party who have never known anything else, and who regard the outside world as a rumour started by people who could not hold their liquor.',
      'The Guide advises arriving late. The Guide concedes there is no longer such a thing as late.',
    ],
    crossRefs: ['DRINKS', 'SOCIAL MOMENTUM', 'EXITS'],
    aliases: ['party', 'flying party'],
  },
  {
    id: 'earth',
    title: 'EARTH',
    verdict: 'Mostly harmless.',
    body: [
      'An utterly insignificant little blue-green planet whose ape-descended life forms are so amazingly primitive that they still think digital watches are a pretty neat idea.',
      'The full entry once read simply "Harmless". A field researcher spent fifteen years there and filed a manuscript running to several volumes, of which the editors retained one additional word. He considered this a triumph, and was, by the standards of the Guide\'s editorial process, entirely correct.',
      'It is scheduled for demolition. The Guide will update this entry when the paperwork clears.',
    ],
    crossRefs: ['WATCHES, DIGITAL', 'EDITORS', 'BYPASSES'],
    aliases: ['earth', 'country lane', 'lane', 'field', 'village'],
  },
];


/**
 * Topic entries, reached only by following a cross-reference. They carry no
 * aliases, so the room matcher can never select them.
 */
const TOPIC_ENTRIES: GuideEntry[] = [
  {
    id: 'towels',
    title: 'TOWELS',
    verdict: 'The most massively useful thing an interstellar hitchhiker can carry.',
    body: [
      'You can wrap it round you for warmth on the cold moons of Jaglan Beta; lie on it on the brilliant marble sands of Santraginus V; sleep under it beneath the stars of the Kakrafoon desert; use it to sail a miniraft down the slow heavy River Moth; wet it for hand-to-hand combat; wind it round your head to ward off noxious fumes or the gaze of the Ravenous Bugblatter Beast of Traal.',
      'More importantly, a towel has immense psychological value. Any strag who finds that a hitchhiker still has his towel will automatically assume he is also in possession of a toothbrush, flannel, soap, tin of biscuits, flask, compass, map, ball of string, gnat spray, wet-weather gear and space suit. The strag will then happily lend the hitchhiker any of these items the hitchhiker has actually lost.',
    ],
    crossRefs: ['TRAAL', 'STRAGS'],
    aliases: [],
  },
  {
    id: 'sirius-cybernetics',
    title: 'SIRIUS CYBERNETICS CORPORATION',
    verdict: "A bunch of mindless jerks who'll be the first against the wall when the revolution comes.",
    body: [
      'Manufacturers of doors that sigh with satisfaction when they close, lifts capable of seeing dimly into the immediate future, and robots fitted with Genuine People Personalities, a technology whose chief achievement has been to make machinery depressed.',
      'The fundamental design flaw in every Sirius Cybernetics product is entirely compensated for by the fundamental design flaw in their marketing division, which is that nobody there has ever used one. Their complaints department now occupies the major landmasses of three medium-sized planets and is recruiting.',
      'The Corporation\'s own brochure quotes the Guide\'s verdict above, describing it as "a lot of fun". This is the single most persuasive argument the Guide has ever made.',
    ],
    crossRefs: ['DOORS, HAPPY', 'IMPROBABILITY DRIVE, INFINITE'],
    aliases: [],
  },
  {
    id: 'bypasses',
    title: 'BYPASSES',
    verdict: 'Devices for getting from point A to point B very quickly, while points in between get demolished.',
    body: [
      'Nobody who lives at point A has the slightest interest in going to point B. Nobody at point B wishes to go to A. The people at the points in between are not consulted, on the grounds that they are, by definition, in the way.',
      'The plans are always on display. Where they are on display, for how long, and behind how many locked doors is considered an implementation detail.',
    ],
    crossRefs: ['LEOPARDS', 'PLANNING PERMISSION', 'MUD'],
    aliases: [],
  },
  {
    id: 'leopards',
    title: 'LEOPARDS',
    verdict: 'Load-bearing, administratively.',
    body: [
      'The leopard\'s principal function in galactic civilisation is to appear on a sign, on a door, in a disused lavatory, in a basement with no stairs.',
      'No leopard has ever been found behind such a door. This has never been held to weaken the notice, and several planning authorities now regard the leopard as the single most efficient piece of public consultation ever devised.',
      'Should you meet an actual leopard, the towel advice does not apply.',
    ],
    crossRefs: ['BYPASSES', 'TOWELS'],
    aliases: [],
  },
  {
    id: 'mud',
    title: 'MUD',
    verdict: "Earth's principal contribution to galactic diplomacy.",
    body: ['Best deployed while lying in it, in front of something large and yellow.'],
    crossRefs: ['BYPASSES'],
    aliases: [],
  },
  {
    id: 'peanuts',
    title: 'PEANUTS',
    verdict: 'Restores the salt and protein consumed by matter transference.',
    body: ['The only part of the procedure anyone looks forward to.'],
    crossRefs: ['MATTER TRANSFERENCE BEAMS'],
    aliases: [],
  },
  {
    id: 'hangovers',
    title: 'HANGOVERS',
    verdict: 'The body filing a formal complaint.',
    body: ['It will not be read, but it must be received.'],
    crossRefs: ['PUBS'],
    aliases: [],
  },

  {
    id: "doors-happy",
    title: "DOORS, HAPPY",
    verdict: "Fitted with Genuine People Personalities, at length.",
    body: [
      "A Sirius Cybernetics door does not merely open. It opens with a satisfied hum, closes with a sigh of pleasure at a job well done, and would very much like you to know that it enjoyed being of service.",
      "The Complaints division maintains that no customer has ever objected to this. The Complaints division maintains a great many things.",
      "It is technically possible to disable the personality circuit. It is not possible to do so without the door finding out.",
    ],
    crossRefs: ["SIRIUS CYBERNETICS CORPORATION", "EXITS"],
    aliases: [],
  },
  {
    id: "editors",
    title: "EDITORS",
    verdict: "The reason the entry is shorter than the research.",
    body: [
      "A field researcher once spent fifteen years on Earth and submitted a manuscript running to several volumes. The editors retained one word, and later allowed a second. The researcher regarded this as a triumph and was, by the standards of the Guide\u2019s editorial process, entirely correct.",
      "Guide editors work to the principle that anything worth saying can be said in less space, and that anything not worth saying should be filed anyway in case it becomes worth saying later.",
      "The Guide has never knowingly been wrong. It has occasionally been so comprehensively inaccurate that reality was held to be at fault.",
    ],
    crossRefs: ["EARTH", "RESEARCH, FIELD", "EXPENSES"],
    aliases: [],
  },
  {
    id: "fjords",
    title: "FJORDS",
    verdict: "Award-winning. You will be told.",
    body: [
      "Fjords are the crumpled coastal detailing applied to bespoke planets by the Magrathean design houses, and are widely held to give a continent a lovely baroque feel.",
      "The designer responsible for the Norwegian coast won an award for it. He will mention the award. He will mention it without being asked, again shortly afterwards, and once more as you leave.",
      "Current fashion favours flat, featureless coastline, which the profession regards as a passing madness and a personal insult.",
    ],
    crossRefs: ["MAGRATHEA", "RECESSIONS", "MICE"],
    aliases: [],
  },
  {
    id: "grues",
    title: "GRUES",
    verdict: "Probably not real. Statistically, no comfort at all.",
    body: [
      "The grue is the traditional explanation for what becomes of adventurers who wander about in unlit rooms. It is said to lurk, to be insatiable, and to be held off only by light.",
      "No grue has ever been photographed, measured, or produced in court. Every account of one comes from somebody who was in the dark at the time, which the Guide notes is precisely the condition in which people are least reliable and most likely to be eaten.",
      "Carry a torch. The argument for doing so does not depend on grues existing.",
    ],
    crossRefs: ["DARKNESS", "TORCHES", "STATISTICS, MISLEADING"],
    aliases: [],
  },
  {
    id: "improbability-drive",
    title: "IMPROBABILITY DRIVE, INFINITE",
    verdict: "Crossing vast interstellar distances without all that tedious mucking about in hyperspace.",
    body: [
      "The drive passes through every conceivable point in every conceivable universe at once, which means you are never entirely certain where you will arrive, in what condition, or whether the soft furnishings will have developed opinions on the way.",
      "Finite improbability was a solved problem, useful chiefly for enlivening parties. Infinite improbability was held to be impossible until a student, tired of being told so, calculated exactly how unlikely such a machine was, fed the figure into a finite generator, and switched it on.",
      "He was mobbed at the next awards ceremony by physicists who had had quite enough of smart-arses. The Guide records this as the only scientific breakthrough in history to have been punished on schedule.",
    ],
    crossRefs: ["HEART OF GOLD", "WHALES, SUDDEN", "PETUNIAS, BOWLS OF"],
    aliases: [],
  },
  {
    id: "mice",
    title: "MICE",
    verdict: "Not mice.",
    body: [
      "What Earth took for small white laboratory animals were the protrusion into our dimension of hyperintelligent pandimensional beings, who commissioned the planet, funded it, and ran it as the largest computational experiment ever attempted.",
      "The experiments those beings appeared to be undergoing at the hands of scientists were, from the other side of the arrangement, going rather well.",
      "They were not pleased about the demolition. They were, however, insured.",
    ],
    crossRefs: ["EARTH", "MAGRATHEA", "BYPASSES"],
    aliases: [],
  },
  {
    id: "petunias",
    title: "PETUNIAS, BOWLS OF",
    verdict: "Oh no, not again.",
    body: [
      "Improbability side effects occasionally produce a bowl of petunias at altitude. The bowl invariably thinks precisely one thing on the way down, which is recorded above.",
      "The Guide holds that if we knew exactly why the bowl thought this, we would know a great deal more about the nature of the universe than we presently do.",
      "It is usually accompanied by a whale, which has considerably more to say and far less idea what is going on.",
    ],
    crossRefs: ["WHALES, SUDDEN", "FALLING", "IMPROBABILITY DRIVE, INFINITE"],
    aliases: [],
  },
  {
    id: "poetry-worst",
    title: "POETRY, WORST",
    verdict: "Third worst in the universe, and trying harder.",
    body: [
      "Vogon poetry is the third worst in the universe. Second place belongs to the Azgoths of Kria, during whose recitals four of the audience died of internal haemorrhaging and the president of the Mid-Galactic Arts Nobbling Council survived only by gnawing off one of his own legs.",
      "The worst was written by Paula Nancy Millstone Jennings of Greenbridge, Essex, and perished with the planet. The Guide files this under mercies.",
      "Surviving a recital is possible. Praising one sincerely is not, because Vogons are impervious to flattery and exquisitely sensitive to accuracy.",
    ],
    crossRefs: ["VOGONS", "EARTH", "MUSCLE RELAXATION"],
    aliases: [],
  },
  {
    id: "strags",
    title: "STRAGS",
    verdict: "Non-hitchhiker. That is, very nearly everybody.",
    body: [
      "A strag is anyone who does not hitch. The category is enormous, largely content, and mostly in possession of a compass.",
      "A strag who notices that you still have your towel after several star systems will conclude that you are a person of substance, resource and foresight, and will happily lend you a toothbrush, a flask, a map, and anything else you have contrived to lose.",
      "The Guide stresses that this is not deception. It is simply the only reliable method anyone has found of borrowing a compass.",
    ],
    crossRefs: ["TOWELS", "FIRST PRINCIPLES"],
    aliases: [],
  },
  {
    id: "watches-digital",
    title: "WATCHES, DIGITAL",
    verdict: "Still considered a pretty neat idea.",
    body: [
      "Man had always assumed he was more intelligent than the dolphins because he had achieved so much \u2014 the wheel, New York, wars \u2014 while the dolphins had done nothing but muck about in the water having a good time.",
      "The dolphins had always believed themselves far more intelligent than man, for precisely the same reasons.",
      "The Guide lists the digital watch among Earth\u2019s achievements, in the same cautious spirit with which it lists the bypass.",
    ],
    crossRefs: ["EARTH", "BYPASSES"],
    aliases: [],
  },
  {
    id: "airlocks",
    title: "AIRLOCKS",
    verdict: "Where a Vogon conversation traditionally concludes.",
    body: [
      "Thirty seconds of vacuum and no paperwork whatsoever, which is the only part of the procedure a Vogon dislikes.",
    ],
    crossRefs: ["VOGONS"],
    aliases: [],
  },
  {
    id: "architecture-defensive",
    title: "ARCHITECTURE, DEFENSIVE",
    verdict: "Building as a substitute for thinking.",
    body: [
      "If the enemy cannot find the war, the enemy cannot win it. Neither, it emerges, can anybody else.",
    ],
    crossRefs: ["WAR CHAMBERS AND MAZES", "MAPS"],
    aliases: [],
  },
  {
    id: "drinks",
    title: "DRINKS",
    verdict: "The galaxy\u2019s principal load-bearing structure.",
    body: [
      "Six pints before matter transference, and several more afterwards on medical advice the Guide has declined to print.",
    ],
    crossRefs: ["PUBS", "MUSCLE RELAXATION"],
    aliases: [],
  },
  {
    id: "exits",
    title: "EXITS",
    verdict: "The most under-used feature of any room.",
    body: [
      "The Guide recommends locating one on arrival rather than on departure.",
    ],
    crossRefs: ["DOORS, HAPPY"],
    aliases: [],
  },
  {
    id: "falling",
    title: "FALLING",
    verdict: "Flying, minus the knack.",
    body: [
      "The knack lies in throwing yourself at the ground and missing. Most things that fall do not miss.",
    ],
    crossRefs: ["WHALES, SUDDEN", "PETUNIAS, BOWLS OF"],
    aliases: [],
  },
  {
    id: "first-principles",
    title: "FIRST PRINCIPLES",
    verdict: "Reasoning from nothing, at speed, under time pressure.",
    body: [
      "The finest example on record lasted ninety seconds and concluded at ground level.",
    ],
    crossRefs: ["WHALES, SUDDEN"],
    aliases: [],
  },
  {
    id: "gravity-local",
    title: "GRAVITY, LOCAL",
    verdict: "The reason getting out of bed is genuinely difficult.",
    body: [
      "Not, as is widely alleged, a character failing. The Guide has checked.",
    ],
    crossRefs: ["BEDS", "FALLING"],
    aliases: [],
  },
  {
    id: "lizards",
    title: "LIZARDS",
    verdict: "Excellent company, if your standard for company is listening.",
    body: [
      "On Damogran they are held to be the finest conversationalists on the planet, chiefly because they never start.",
    ],
    crossRefs: ["DAMOGRAN"],
    aliases: [],
  },
  {
    id: "logic-absence",
    title: "LOGIC, ABSENCE OF",
    verdict: "A defence mechanism in its own right.",
    body: [
      "The Bugblatter Beast assumes that if it cannot see you, you cannot see it. This has never once worked in its favour.",
    ],
    crossRefs: ["TRAAL", "TOWELS"],
    aliases: [],
  },
  {
    id: "maps",
    title: "MAPS",
    verdict: "Unglamorous. Decisive.",
    body: [
      "The Guide offers this advice knowing perfectly well that nobody takes it until the third time they pass the same junction.",
    ],
    crossRefs: ["WAR CHAMBERS AND MAZES"],
    aliases: [],
  },
  {
    id: "matter-transference",
    title: "MATTER TRANSFERENCE BEAMS",
    verdict: "Instantaneous, and deeply unpleasant.",
    body: [
      "Relaxation beforehand is essential; six pints is the traditional dose, and the Guide would rather not discuss the arithmetic.",
    ],
    crossRefs: ["PUBS", "MUSCLE RELAXATION", "PEANUTS"],
    aliases: [],
  },
  {
    id: "muscle-relaxation",
    title: "MUSCLE RELAXATION",
    verdict: "Compulsory before transference.",
    body: [
      "The only compulsory thing in the galaxy that anybody has ever looked forward to.",
    ],
    crossRefs: ["PUBS", "DRINKS"],
    aliases: [],
  },
  {
    id: "peat-soft",
    title: "PEAT, SOFT",
    verdict: "Stage eleven of the Vogon approvals process.",
    body: [
      "Three months minimum, after which the document is recycled as firelighters and the request is considered closed.",
    ],
    crossRefs: ["VOGONS"],
    aliases: [],
  },
  {
    id: "planning-permission",
    title: "PLANNING PERMISSION",
    verdict: "Granted. It was always going to be granted.",
    body: [
      "The consultation ran for nine months in a locked filing cabinet. You were entirely welcome to attend.",
    ],
    crossRefs: ["BYPASSES", "LEOPARDS"],
    aliases: [],
  },
  {
    id: "press-events",
    title: "PRESS EVENTS",
    verdict: "Ceremonies held where nobody can reach them.",
    body: [
      "Attendance is not the point. Attendance has never been the point.",
    ],
    crossRefs: ["DAMOGRAN", "SECURITY BY GEOGRAPHY"],
    aliases: [],
  },
  {
    id: "recessions",
    title: "RECESSIONS",
    verdict: "A good time to lock the doors and sleep.",
    body: [
      "Magrathea did precisely that, and remains the only economy in history to have survived one without comment.",
    ],
    crossRefs: ["MAGRATHEA", "FJORDS"],
    aliases: [],
  },
  {
    id: "research-field",
    title: "RESEARCH, FIELD",
    verdict: "Fifteen years. One word. Occasionally two.",
    body: [
      "The Guide considers this an excellent rate of return and has structured its contracts accordingly.",
    ],
    crossRefs: ["EDITORS", "EXPENSES", "EARTH"],
    aliases: [],
  },
  {
    id: "security-geography",
    title: "SECURITY BY GEOGRAPHY",
    verdict: "The cheapest security there is.",
    body: [
      "Put the thing somewhere inconvenient. Nobody will come. Nobody was ever going to come.",
    ],
    crossRefs: ["DAMOGRAN", "PRESS EVENTS"],
    aliases: [],
  },
  {
    id: "social-momentum",
    title: "SOCIAL MOMENTUM",
    verdict: "When a party stops being an event and becomes a condition.",
    body: [
      "Guests cease to leave, supplies begin to be requisitioned by force, and the building takes to the air.",
    ],
    crossRefs: ["PARTIES, INTERMINABLE"],
    aliases: [],
  },
  {
    id: "statistics-misleading",
    title: "STATISTICS, MISLEADING",
    verdict: "Printed in a smaller font.",
    body: [
      "Darkness is statistically safe. That is true, and it is not the relevant statistic.",
    ],
    crossRefs: ["DARKNESS", "GRUES"],
    aliases: [],
  },
  {
    id: "torches",
    title: "TORCHES",
    verdict: "Several species went to considerable trouble to invent one.",
    body: [
      "You are strongly advised to benefit from their trouble.",
    ],
    crossRefs: ["DARKNESS", "GRUES"],
    aliases: [],
  },
  {
    id: "wars-misplaced",
    title: "WARS, MISPLACED",
    verdict: "Mislaid in the filing, then in the architecture.",
    body: [
      "Several are believed to be ongoing. None can be located.",
    ],
    crossRefs: ["WAR CHAMBERS AND MAZES", "ARCHITECTURE, DEFENSIVE"],
    aliases: [],
  },
  {
    id: "expenses",
    title: "EXPENSES",
    verdict: "The only Guide document ever filed on time.",
    body: [
      "A researcher may be vague about the coordinates of an entire planet, but never about the cost of the meal he had on it.",
    ],
    crossRefs: ["RESEARCH, FIELD", "EDITORS"],
    aliases: [],
  },
];

/** Everything reachable by headword: room entries plus topic entries. */
const ALL_ENTRIES: GuideEntry[] = [...GUIDE_ENTRIES, ...TOPIC_ENTRIES];

/**
 * Selects the Guide entry for a room. Exact alias matches win over partial
 * ones so that "Dark" cannot be shadowed by a longer entry that merely
 * mentions it; unmatched rooms get the fallback rather than nothing.
 */
export function getGuideEntry(location: string): GuideEntry {
  const normalized = normalizeLocation(location);
  if (!normalized) return FALLBACK_ENTRY;

  const exact = GUIDE_ENTRIES.find((entry) =>
    entry.aliases.some((alias) => alias === normalized)
  );
  if (exact) return exact;

  // Whole words only. Normalisation leaves single-space-separated words, so
  // padding both sides makes `includes` a word-boundary test and still admits
  // multi-word aliases. Plain substring matching would select PUBS for
  // "Embarkation" on the strength of "bar".
  const padded = ` ${normalized} `;
  const partial = GUIDE_ENTRIES.find((entry) =>
    entry.aliases.some((alias) => padded.includes(` ${alias} `))
  );
  return partial ?? FALLBACK_ENTRY;
}

/** A cross-reference the Guide has not got round to filing. */
export function unwrittenEntry(headword: string): GuideEntry {
  return {
    id: `unwritten:${normalizeHeadword(headword)}`,
    title: normalizeHeadword(headword),
    verdict: 'Not yet filed.',
    body: [
      'The researcher assigned to this entry submitted an expenses claim, a change-of-address form, and no copy whatsoever.',
      'The Guide records the headword in the confident expectation that somebody, eventually, will be made to deal with it.',
    ],
    aliases: [],
  };
}

/** Finds an entry by headword, for following a cross-reference. */
export function getGuideEntryByTitle(headword: string): GuideEntry | null {
  const target = normalizeHeadword(headword);
  if (!target) return null;

  return (
    ALL_ENTRIES.find(
      (entry) =>
        normalizeHeadword(entry.title) === target ||
        entry.headwords?.some((h) => normalizeHeadword(h) === target)
    ) ?? null
  );
}
