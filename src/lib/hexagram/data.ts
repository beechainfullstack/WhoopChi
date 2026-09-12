/**
 * The 64 hexagrams in King Wen order.
 *
 * Trigrams are given as [lower, upper]. Lines are derived bottom-to-top:
 * a 6-char string where "1" = yang (solid) and "0" = yin (broken).
 */

export type TrigramName =
  | "heaven"
  | "earth"
  | "thunder"
  | "water"
  | "mountain"
  | "wind"
  | "fire"
  | "lake";

export const TRIGRAMS: Record<
  TrigramName,
  { lines: string; symbol: string; chinese: string; attribute: string }
> = {
  heaven: { lines: "111", symbol: "☰", chinese: "乾", attribute: "the creative" },
  earth: { lines: "000", symbol: "☷", chinese: "坤", attribute: "the receptive" },
  thunder: { lines: "100", symbol: "☳", chinese: "震", attribute: "the arousing" },
  water: { lines: "010", symbol: "☵", chinese: "坎", attribute: "the abysmal" },
  mountain: { lines: "001", symbol: "☶", chinese: "艮", attribute: "keeping still" },
  wind: { lines: "011", symbol: "☴", chinese: "巽", attribute: "the gentle" },
  fire: { lines: "101", symbol: "☲", chinese: "離", attribute: "the clinging" },
  lake: { lines: "110", symbol: "☱", chinese: "兌", attribute: "the joyous" },
};

export interface HexagramDef {
  number: number;
  name: string;
  pinyin: string;
  chinese: string;
  trigrams: [TrigramName, TrigramName];
  /** One-line reading shown to free users. */
  brief: string;
  /** Fuller interpretation shown to paid users. */
  meaning: string;
}

type Raw = [
  number,
  string,
  string,
  string,
  TrigramName,
  TrigramName,
  string,
  string,
];

const RAW: Raw[] = [
  [1, "The Creative", "Qián", "乾", "heaven", "heaven",
    "Pure vitality. Strength is yours today; act with clarity and purpose.",
    "Six strong lines. The body is fully charged and aligned with its own best baseline. This is a day for initiative, sustained effort, and decisive movement. Guard against arrogance: strength that does not rest becomes brittle. Use the surplus deliberately."],
  [2, "The Receptive", "Kūn", "坤", "earth", "earth",
    "Yield. Every measure sits below your norm; the day asks for stillness and receiving.",
    "Six open lines. Nothing in the body is pushing above its baseline, which is not weakness but readiness to receive. Rest, nourish, listen. The receptive does not lead; it carries what is placed upon it and brings it to completion in time. Do not force outcomes today."],
  [3, "Difficulty at the Beginning", "Zhūn", "屯", "thunder", "water",
    "Growing pains. Something is stirring beneath, but the path is not yet clear.",
    "Thunder below water: movement meets danger. Early growth is chaotic by nature. The body shows sparks of activation under a cloudy surface. Persevere, but do not rush; gather helpers, take small steps, and let order emerge from the confusion."],
  [4, "Youthful Folly", "Méng", "蒙", "water", "mountain",
    "Inexperience. Signals are murky; seek the lesson rather than the answer.",
    "Water at the foot of the mountain: a spring that does not yet know where it flows. Data is ambiguous today, and the temptation is to over-read it. Approach with a beginner's mind. Ask once and trust the answer; asking repeatedly clouds it further."],
  [5, "Waiting", "Xū", "需", "heaven", "water",
    "Patience. Strength is present but the moment is not. Nourish and wait.",
    "Clouds gather in heaven but rain has not fallen. There is inner strength beneath an uncertain surface. Waiting is not passivity; it is a confident pause. Eat, drink, hold steady, and the danger ahead will pass on its own timing."],
  [6, "Conflict", "Sòng", "訟", "water", "heaven",
    "Tension. Two forces in the body pull in opposite directions. Do not escalate.",
    "Heaven rises while water sinks: the two move apart. Inner uncertainty meets outer force. This is a day where pushing hard will breed friction. Meet the situation halfway, seek mediation, and avoid carrying disputes to their end."],
  [7, "The Army", "Shī", "師", "water", "earth",
    "Discipline. Resources are hidden underground; organise them before spending.",
    "Water stored within the earth: latent power held in reserve. The body has more than it shows, but it needs structure. Lead yourself like a general: clear orders, rested troops, no wasted movement. Strength through discipline, not display."],
  [8, "Holding Together", "Bǐ", "比", "earth", "water",
    "Union. Systems want to cohere. Seek connection and shared rhythm.",
    "Water over the earth flows into every crevice and binds it together. Today favours alignment: with people, with routine, with your own rhythms. Join what is already gathering. Hesitation here means missing the moment of union."],
  [9, "The Taming Power of the Small", "Xiǎo Chù", "小畜", "heaven", "wind",
    "Restraint. Great strength is held in check by small things. Refine details.",
    "Wind blows across heaven: it can gather clouds but not yet bring rain. Strong underlying capacity is held by a gentle limit. Only small matters can be accomplished; attend to them. Friendliness and finesse achieve more than force today."],
  [10, "Treading", "Lǚ", "履", "lake", "heaven",
    "Careful conduct. You walk on the tiger's tail; step lightly and it will not bite.",
    "The joyous beneath the creative: the weak treads behind the strong. The body is moving in the presence of great forces. Proceed with courtesy and care, and the way opens. Cheerful, correct conduct carries you through even when the ground is dangerous."],
  [11, "Peace", "Tài", "泰", "heaven", "earth",
    "Harmony. Heaven and earth meet; everything in the body is flowing together.",
    "The creative rises from below and the receptive descends from above: their union brings spring. This is a rare, fertile state. Inner strength meets outer gentleness. Extend what is good, remove what is decayed, and enjoy the flourishing without complacency."],
  [12, "Standstill", "Pǐ", "否", "earth", "heaven",
    "Stagnation. The forces move apart; withdraw rather than push through.",
    "Heaven drifts upward, earth sinks downward: no exchange, no growth. The body is not cooperating with itself today. This is not the time for ambition. Retreat into inner worth, do not be tempted by shortcuts, and wait for the standstill to pass."],
  [13, "Fellowship", "Tóng Rén", "同人", "fire", "heaven",
    "Community. Clarity beneath strength; a good day to move openly with others.",
    "Fire rises toward heaven: the two are of one nature. Openness and shared purpose are supported. Meet others in the open field rather than the private chamber. Fellowship built on true shared goals, not on convenience, endures."],
  [14, "Possession in Great Measure", "Dà Yǒu", "大有", "heaven", "fire",
    "Abundance. Strength and clarity together; you have more than you need.",
    "Fire above heaven: the sun at noon, illuminating everything. Great inner strength paired with clarity of vision. This is a day of plenty. Use it with modesty and generosity; possession in great measure is preserved only through humility."],
  [15, "Modesty", "Qiān", "謙", "mountain", "earth",
    "Humility. The mountain hides within the earth. Lower yourself and be raised.",
    "A mountain concealed beneath level ground: greatness that does not display itself. The body has a quiet solidity today. Reduce what is excessive, augment what is lacking, and balance the two. Modesty carries every undertaking to completion."],
  [16, "Enthusiasm", "Yù", "豫", "earth", "thunder",
    "Momentum. Thunder rises from the earth; energy wants to move. Let it, with music.",
    "Thunder bursts out of the earth: movement that meets no resistance. Enthusiasm carries others along, but it must follow the natural order of things rather than whim. Move with the grain of the day. Joyful action, not frantic action."],
  [17, "Following", "Suí", "隨", "thunder", "lake",
    "Adaptability. Let the day lead and follow willingly. Rest at evening.",
    "Thunder within the lake: movement inside joy. To lead one must first know how to follow. Adapt to what the body asks, do not impose a plan on it. Following in this sense is not weakness but the wisdom of moving with the time."],
  [18, "Work on What Has Been Spoiled", "Gǔ", "蠱", "wind", "mountain",
    "Repair. Something neglected asks for attention. Deliberate before and after acting.",
    "Wind stalled at the foot of the mountain: stagnation that has begun to decay. Not a catastrophe, only a call for maintenance. Find what has been let slide (sleep, routine, load) and address it. Careful consideration before the fix and vigilance after."],
  [19, "Approach", "Lín", "臨", "lake", "earth",
    "Arrival. Something favourable is drawing near. Meet it, but be mindful of its end.",
    "The earth stands above the lake, looking down on it kindly: the great approaching the small. Conditions are improving and spring is arriving. Act while the tide is rising, teach and support, but remember that every approach eventually turns."],
  [20, "Contemplation", "Guān", "觀", "earth", "wind",
    "Observation. Stand on the tower and view the whole. Understand before you act.",
    "Wind moves over the earth: it touches everything without possessing. Today is for seeing clearly rather than doing. Study the pattern of your own data, notice what recurs. Sincere contemplation itself has a transforming influence."],
  [21, "Biting Through", "Shì Kè", "噬嗑", "thunder", "fire",
    "Resolve. An obstacle between the jaws must be bitten through decisively.",
    "Thunder and lightning together: clarity paired with decisive movement. Something is obstructing union and must be removed firmly. Do not tolerate the obstruction out of politeness. Energetic, clear, and just action clears the way."],
  [22, "Grace", "Bì", "賁", "fire", "mountain",
    "Form. Beauty and surface today; enjoy it, but do not mistake it for substance.",
    "Fire illuminating the mountain: beautiful, but only on the surface. This favours small matters of form, appearance, and ornament. Substance must remain the priority. Grace is a fine light on the situation, not the situation itself."],
  [23, "Splitting Apart", "Bō", "剝", "earth", "mountain",
    "Erosion. Foundations are thinning. Do not undertake anything; hold still.",
    "The mountain rests on the earth but its base is worn away. The yin lines have risen almost to the top. This is a time of decline that cannot be fought directly. Remain quiet, generous to those below you, and wait for the cycle to turn."],
  [24, "Return", "Fù", "復", "thunder", "earth",
    "Turning point. The first light after darkness. Rest, and let renewal begin.",
    "A single yang line returns beneath the earth: the winter solstice. Something in the body has begun to recover after a low. Do not force the return; protect it. Rest at the turning point so the new movement can gather strength naturally."],
  [25, "Innocence", "Wú Wàng", "無妄", "thunder", "heaven",
    "Spontaneity. Act from instinct, without ulterior motive, and things go well.",
    "Thunder under heaven: movement in accord with the natural order. The body's impulses are trustworthy today. Act without scheming or expectation. What is unforeseen may arrive; meet it plainly and do not treat it with medicine it does not need."],
  [26, "The Taming Power of the Great", "Dà Chù", "大畜", "heaven", "mountain",
    "Stored power. Great strength is held by stillness. Accumulate, then release.",
    "Heaven within the mountain: enormous energy held in check. Unlike the small restraint, this holding is itself a source of power. Study, train, hold firm. When the time comes the accumulated force will carry you across the great water."],
  [27, "Nourishment", "Yí", "頤", "thunder", "mountain",
    "Sustenance. Pay attention to what you feed yourself, in body and in mind.",
    "The image of an open mouth: movement below, stillness above. The day is about intake. Notice what you nourish: food, sleep, attention, company. Be careful in words and temperate in eating and drinking. What you cultivate reveals your character."],
  [28, "Preponderance of the Great", "Dà Guò", "大過", "wind", "lake",
    "Overload. The beam is bending under weight. Lighten the load before it breaks.",
    "The lake rises above the trees: a flood. Four strong lines in the middle with weak lines at each end: too much weight, too little support. Something exceptional is being demanded of the body. Extraordinary measures are called for, then a return to normal."],
  [29, "The Abysmal", "Kǎn", "坎", "water", "water",
    "Danger. Water upon water. Stay sincere and keep moving; do not stop in the gorge.",
    "The abyss doubled: repeated danger. The body is in a trough. Water shows the way through: it does not fight the ravine, it flows through it without losing its nature. Maintain your inner truth, keep to what is essential, and continue forward."],
  [30, "The Clinging", "Lí", "離", "fire", "fire",
    "Brightness. Doubled fire; great clarity, if it has something steady to burn.",
    "Fire upon fire: light that depends on what it clings to. Clarity, awareness, and warmth are high today, but fire consumes its fuel. Care for what sustains the brightness. Nurture the cow, as the ancient text says: tend the docile source of your energy."],
  [31, "Influence", "Xián", "咸", "mountain", "lake",
    "Attraction. Something is drawing you. Let influence work through stillness.",
    "The lake atop the mountain: the mountain receives the lake's moisture, the lake the mountain's support. Mutual attraction. Influence spreads best from a settled base. Keep the heart open and the mind unagitated, and what is meant to come will come."],
  [32, "Duration", "Héng", "恆", "wind", "thunder",
    "Consistency. Thunder and wind move together and endure. Keep to your rhythm.",
    "Movement outside, gentleness within: a marriage that lasts. The body's baseline itself is the teaching today. Duration is not stillness but renewed movement along a fixed path. Do not change direction; persist in what already works."],
  [33, "Retreat", "Dùn", "遯", "mountain", "heaven",
    "Withdrawal. Yin is rising; step back in good order while you still choose to.",
    "The mountain under heaven: heaven retreats upward, keeping its distance. Not flight but a strategic withdrawal. Reduce load, shorten commitments, and hold the small things firmly. Retreat done well is itself a form of strength."],
  [34, "The Power of the Great", "Dà Zhuàng", "大壯", "heaven", "thunder",
    "Force. Thunder in heaven; strength moving outward. Use it justly.",
    "Four strong lines pushing upward beneath thunder. Great vigour is available. The danger is in pure force without correctness: the ram that butts the hedge and tangles its horns. Move powerfully but only where movement is right."],
  [35, "Progress", "Jìn", "晉", "earth", "fire",
    "Advancement. The sun rises over the earth. A clear, easy path forward.",
    "Fire above earth: the sun climbing at dawn. Progress that is rapid and easy. Clarity rises out of receptivity. Brighten your own virtue, accept what is offered, and advance without haste or hesitation. A favourable day."],
  [36, "Darkening of the Light", "Míng Yí", "明夷", "fire", "earth",
    "Concealment. The light has gone below the earth. Protect your clarity quietly.",
    "The sun sinks beneath the earth. Something is dimming the inner brightness, or hostile conditions require that you not display it. Do not fight the darkness; veil your light and preserve it. Perseverance in adversity, not brilliance, is the task."],
  [37, "The Family", "Jiā Rén", "家人", "fire", "wind",
    "Order at home. Tend the internal household: routines, roles, boundaries.",
    "Wind arising from fire: influence from within outward. The day concerns the interior order of things, the small daily structures that hold a life together. Words with substance, actions with consistency. Set the house in order and the outer world follows."],
  [38, "Opposition", "Kuí", "睽", "lake", "fire",
    "Divergence. Fire rises, the lake sinks. Small matters only; don't force unity.",
    "Two forces moving in opposite directions. Parts of the body are not agreeing with one another. Opposition is not hostility, only difference. Preserve what individuality demands, accomplish small things, and do not try to reconcile what the day will not reconcile."],
  [39, "Obstruction", "Jiǎn", "蹇", "mountain", "water",
    "Blocked. Water ahead, mountain behind. Turn inward and find another way.",
    "Danger in front, a steep mountain at the back: no easy path. The obstruction is external but the answer is internal. Do not push against the wall. Retreat, reflect, gather allies, and cultivate yourself. The way opens later, from the southwest."],
  [40, "Deliverance", "Jiě", "解", "water", "thunder",
    "Release. The storm breaks and tension dissolves. Return to normal swiftly.",
    "Thunder and rain: the pent-up pressure finally released. Whatever has been obstructed is giving way. Do not linger in the drama of release. Forgive quickly, resolve what remains, and return to ordinary rhythm. Simplicity now brings good fortune."],
  [41, "Decrease", "Sǔn", "損", "lake", "mountain",
    "Simplify. Something below is being spent to strengthen what is above. Accept it.",
    "The lake at the foot of the mountain evaporates to nourish the height. Decrease is not necessarily bad; it is the transfer of resource from one place to another. Curb anger, restrain desire, do with less. Sincerity makes even a small offering enough."],
  [42, "Increase", "Yì", "益", "thunder", "wind",
    "Growth. Wind and thunder reinforce each other. A generous, expansive day.",
    "What is above sacrifices to what is below, and everything grows. Increase is available: energy, clarity, capacity. It is a time for undertakings and for crossing the great water. When you see good, imitate it; when you find fault, correct it."],
  [43, "Breakthrough", "Guài", "夬", "heaven", "lake",
    "Resolution. Five strong lines push out the last weakness. Be firm but not harsh.",
    "The lake has risen to heaven: a cloudburst is imminent. One weak line remains at the top and the strength below is about to break through. Declare the matter openly, with resolve, but without violence. Do not rely on force alone; share what you gain."],
  [44, "Coming to Meet", "Gòu", "姤", "wind", "heaven",
    "A first sign. One weak line enters below the strength. Notice small beginnings.",
    "Wind under heaven: a single yin line has appeared beneath five yang. The dominant condition is strong, but something new and small has entered from below. Meet it consciously. Small things gain power if not addressed at their beginning."],
  [45, "Gathering Together", "Cuì", "萃", "earth", "lake",
    "Convergence. The lake collects above the earth. Gather what is scattered.",
    "Water collects in the lake over the earth. Forces are gathering, and gathering brings both strength and risk. Bring your resources together around a clear centre. Prepare for the unexpected, as a large gathering invites disorder if not well led."],
  [46, "Pushing Upward", "Shēng", "升", "wind", "earth",
    "Ascent. Wood grows up through the earth. Steady effort, small steps, upward.",
    "The tree pushing up through the soil: unhurried, unrelenting growth. The body is quietly climbing. Do not worry about the height; attend to the next step. Seek out those who can help and advance southward, toward light and activity."],
  [47, "Oppression", "Kùn", "困", "water", "lake",
    "Exhaustion. The lake has drained away. Speak little; hold to inner strength.",
    "Water has leaked from the lake: the vessel is empty. Adversity and depletion. Words will not be believed in such a time, so let action and quiet perseverance speak. This is a testing of character. Remain cheerful within; the great person endures."],
  [48, "The Well", "Jǐng", "井", "wind", "water",
    "The source. The well is always there beneath everything. Draw from it carefully.",
    "Wood reaching down into water: the well that is neither increased nor decreased. Your baseline itself is the well: the deep, reliable resource beneath the daily fluctuation. Draw from it, maintain it, and do not let the rope fall short or the jug break."],
  [49, "Revolution", "Gé", "革", "fire", "lake",
    "Change. Fire and water at odds; something must be transformed. Time it well.",
    "Fire beneath the lake: two elements that fight each other. The old order is no longer sufficient. Revolution is warranted, but only when the moment is right and the cause is clear. Set the calendar, make the change deliberately, and regret will vanish."],
  [50, "The Cauldron", "Dǐng", "鼎", "wind", "fire",
    "Transformation. Wood feeds the fire; raw material becomes nourishment.",
    "The sacred vessel in which food is cooked. Wind and wood under fire: the transformation of raw material into something that sustains. A day of refinement. Take what the body gives and cook it into something usable. Supreme good fortune."],
  [51, "The Arousing", "Zhèn", "震", "thunder", "thunder",
    "Shock. Thunder doubled. A jolt to the system; meet it with awe, then laughter.",
    "Thunder repeated: a shock that terrifies and then passes. Something has jolted the body out of its pattern. Fear first, then composure. The shock is a teacher. Let it wake you, do not let it scatter you. Afterward, laughing words."],
  [52, "Keeping Still", "Gèn", "艮", "mountain", "mountain",
    "Stillness. Mountain upon mountain. Rest completely; there is nothing to do.",
    "Two mountains: the ultimate stillness. The back is kept still so that the ego disappears. Not a suppression of movement but a rest so complete that movement arises from it naturally later. Meditate, sleep, stop. The time for stillness is now."],
  [53, "Development", "Jiàn", "漸", "mountain", "wind",
    "Gradual progress. The tree grows on the mountain, slowly. Do not hurry it.",
    "Wood on the mountain: growth that is slow because its foundation is high and firm. Development that lasts is gradual. The wild goose flies in stages. Trust incremental progress; each step properly taken makes the next possible."],
  [54, "The Marrying Maiden", "Guī Mèi", "歸妹", "lake", "thunder",
    "Uneven footing. You are in a subordinate position. Act with tact and patience.",
    "Thunder over the lake: the younger entering an established household. The situation is not one of equals, and initiating action would bring misfortune. Understand the transitory nature of the moment. Careful, modest conduct makes the position tolerable."],
  [55, "Abundance", "Fēng", "豐", "fire", "thunder",
    "Fullness. Thunder and lightning, the sun at midday. Enjoy the peak; it will pass.",
    "Clarity within, movement without: the height of prosperity. Everything is at its fullest. But the sun at noon has already begun to set. Do not grieve at the coming decline; be like the sun at midday, illuminating fully while the moment lasts."],
  [56, "The Wanderer", "Lǚ", "旅", "mountain", "fire",
    "Transience. Fire on the mountain does not stay. Travel light; be courteous.",
    "Fire on the mountain: it flares and moves on, never lingering. You are a stranger in today's conditions. Keep to the essential, be reserved and correct, and do not get entangled. Small successes are available to the modest traveller."],
  [57, "The Gentle", "Xùn", "巽", "wind", "wind",
    "Penetration. Wind upon wind. Small, persistent effects accomplish much.",
    "Wind doubled: gentle, ceaseless, penetrating everywhere. Nothing dramatic, but nothing is unreached. Influence today comes through persistence and subtlety rather than force. Have a clear aim, and let small repeated efforts do the work."],
  [58, "The Joyous", "Duì", "兌", "lake", "lake",
    "Joy. Lake upon lake. Ease and openness; share it with others.",
    "Two lakes joined, replenishing each other. Joy that is gentle without and firm within. This is true joy, not mere pleasure. Talk with friends, practise together, exchange what you have learned. Joy spreads and doubles when it is shared."],
  [59, "Dispersion", "Huàn", "渙", "water", "wind",
    "Dissolving. Wind over water breaks up what is rigid. Let blockages scatter.",
    "Wind moving across water dissolves the ice. Something hardened is loosening. Egotism, rigidity, and blocked energy are being dispersed. Do not cling to the structures dissolving today; instead help the process by reconnecting with what is larger than yourself."],
  [60, "Limitation", "Jié", "節", "lake", "water",
    "Boundaries. Water in the lake has its measure. Set limits, and keep them gentle.",
    "Water above the lake: the lake holds only so much. Limits give form and preserve. Today calls for measure in exertion, in intake, in ambition. But galling limitation is not to be persisted in; the limits should be ones you can live within."],
  [61, "Inner Truth", "Zhōng Fú", "中孚", "lake", "wind",
    "Sincerity. Wind over the lake stirs its depths. Truth from the centre reaches all.",
    "Two open lines at the centre: an empty heart, free of prejudice, able to receive truth. Wind over the lake reaches the invisible depths. Inner sincerity is the power of the day. It reaches even pigs and fishes, the least responsive of creatures."],
  [62, "Preponderance of the Small", "Xiǎo Guò", "小過", "mountain", "thunder",
    "Modest scale. Thunder over the mountain: sound without much force. Keep it small.",
    "Weak lines outnumber strong: the small predominates. This is not a time for great undertakings. Attend to small things with exceptional care. The bird should not fly too high; it should return to its nest. Excessive modesty is the correct excess today."],
  [63, "After Completion", "Jì Jì", "既濟", "fire", "water",
    "Equilibrium. Everything is in its place. Attend to details or the order will slip.",
    "Water over fire: perfect balance, each line in its correct position. The transition has been made. But perfect order is unstable; the only direction from here is toward disorder. Good fortune at the beginning, so be careful in small matters at the end."],
  [64, "Before Completion", "Wèi Jì", "未濟", "water", "fire",
    "Almost. Fire over water, not yet in balance. The crossing is close; be deliberate.",
    "Fire above water: each line out of place, yet the possibility of order is near. Spring before the thaw. Deliberation and caution are needed for the final crossing. The little fox nearly across gets its tail wet. Finish carefully; do not celebrate early."],
];

export const HEXAGRAMS: HexagramDef[] = RAW.map(
  ([number, name, pinyin, chinese, lower, upper, brief, meaning]) => ({
    number,
    name,
    pinyin,
    chinese,
    trigrams: [lower, upper],
    brief,
    meaning,
  }),
);

/** Lines bottom-to-top, "1" = yang, "0" = yin. */
export function linesOf(h: HexagramDef): string {
  return TRIGRAMS[h.trigrams[0]].lines + TRIGRAMS[h.trigrams[1]].lines;
}

const BY_LINES = new Map<string, HexagramDef>(
  HEXAGRAMS.map((h) => [linesOf(h), h]),
);

const BY_NUMBER = new Map<number, HexagramDef>(
  HEXAGRAMS.map((h) => [h.number, h]),
);

export function hexagramByLines(lines: string): HexagramDef {
  const h = BY_LINES.get(lines);
  if (!h) throw new Error(`No hexagram for line pattern ${lines}`);
  return h;
}

export function hexagramByNumber(n: number): HexagramDef {
  const h = BY_NUMBER.get(n);
  if (!h) throw new Error(`No hexagram number ${n}`);
  return h;
}

/** Unicode "Yijing Hexagram Symbols" block: U+4DC0 is hexagram 1. */
export function hexagramGlyph(n: number): string {
  return String.fromCodePoint(0x4dc0 + n - 1);
}
