const LONELY_PHRASES: string[] = [
  'Sleep is my only companion tonight.',
  'Where did everyone go? Just me and the stars again.',
  'Another night, just me, myself, and my pillow.',
  'Lonely is the way when dreams are your only company.',
  "One is the loneliest number, but at least it's quiet.",
  'No sleepover buddies, just a solo mission to dreamland.',
  'The night is silent, and so am I.',
  'Maybe the sheep left because I was counting them alone.',
  "It's not insomnia, it's just me missing some company.",
  'Lonely dreams are still better than no dreams.'
]

const ADAMANT_PHRASES: string[] = [
  "Sleep is for those who don't have goals. Let's keep going.",
  'No rest, only progress. Speed over sleep.',
  'Determined to beat this night—no time for sleep.',
  "I don't need rest, I need results.",
  "Sleep can wait, but victory won't.",
  'Focused, fast, and maybe a little sleep-deprived.',
  'Who needs rest when you have drive?',
  "The grind doesn't sleep, so neither will I.",
  'Adamant goals require adamant sacrifice—like sleep.',
  'Push forward, sleep is for later.'
]

const NAUGHTY_PHRASES: string[] = [
  'Who needs sleep when you can cause a little trouble instead?',
  'Being naughty means staying up past bedtime.',
  'Sleep is for the well-behaved. I have mischief to make.',
  'A little late-night chaos never hurt anyone.',
  'Why sleep when you can stir things up?',
  'Dreams are nice, but trouble is better.',
  "The night is young, and I'm feeling adventurous.",
  "Sleep? Nah, I've got things to do and trouble to brew.",
  "If I'm awake, I might as well make it worth it.",
  'Who needs dreams when reality is this mischievous?'
]

const BRAVE_PHRASES: string[] = [
  'Sleep can wait—courage calls for action.',
  'Who needs sleep when adventure awaits?',
  'Bravery over comfort; no time to rest.',
  'Facing the night without fear, sleep is secondary.',
  "The brave don't rest, they conquer.",
  'The night is dark, but I am brave enough to face it.',
  'Sleep later, courage now.',
  'Dreams are for the brave, but so is staying up.',
  'No sleep, only daring deeds.',
  'Courage knows no bedtime.'
]

const BOLD_PHRASES: string[] = [
  'Bold dreams require bold actions, even in sleep.',
  "Sleep doesn't faze me; I'm boldly taking on the night.",
  'Being bold means resting with purpose.',
  'Sleep is just a bold recharge for another fearless day.',
  'Courage comes in rest too—boldly taking on the dream world.',
  "I'm boldly going where the dreams are vivid and bright.",
  'No hesitations, even in my dreams.',
  'Bold rest for a bold tomorrow.',
  "Sleep isn't a retreat, it's a bold move.",
  'I rest boldly, knowing what lies ahead.'
]

const CALM_PHRASES: string[] = [
  'Calmness in sleep leads to calmness in life.',
  'No rush, just calmly drifting into the night.',
  'The calm mind dreams the clearest.',
  'I sleep to bring calm to the chaos.',
  'With every breath, I drift calmly into slumber.',
  'Calm dreams lead to serene mornings.',
  'A calm night is all I need.',
  'Peaceful rest, calm dreams, steady heart.',
  'Calmness carries me gently to dreamland.',
  'No worries here, just calm and quiet.'
]

const JOLLY_PHRASES: string[] = [
  'Sleep? More like a joyful nap to recharge!',
  "Dreams are more fun when you're jolly.",
  'I sleep with a smile, because why not?',
  'Jolly dreams make for jolly days.',
  'No nightmares here, only cheerful dreams.',
  'Resting up for more fun tomorrow!',
  'Even in sleep, I keep it jolly.',
  'Happy thoughts lead to happy dreams.',
  'Nothing but joy as I drift to sleep.',
  'Jolly slumber, here I come!'
]

const IMPISH_PHRASES: string[] = [
  'Sleep? I’d rather play a prank or two before bed.',
  'Being impish means bedtime is just another adventure.',
  'Why sleep when there are pranks to pull?',
  'Dreams are fun, but a little mischief is even better.',
  'Sleep tight—after I’ve had my fun.',
  'An impish grin before drifting off.',
  'Who says you can’t have a little fun before bed?',
  'Sleep is inevitable, but mischief makes it memorable.',
  'Resting with a plan for tomorrow’s tricks.',
  'Even my dreams have a playful twist.'
]

const LAX_PHRASES: string[] = [
  'No rush, sleep will come when it comes.',
  'Taking it easy, even in my dreams.',
  'Sleep is best when you’re totally relaxed.',
  'No worries, no stress, just sleep.',
  'Lax and laid-back, drifting into slumber.',
  'Chillin’ my way to dreamland.',
  'No pressure, just a lax journey to sleep.',
  'Relaxed nights make for the best dreams.',
  'Sleep without a care in the world.',
  'Laid-back and dreaming easy.'
]

const RELAXED_PHRASES: string[] = [
  'Relaxation is key to a good night’s sleep.',
  'No rush, no worries—just relaxing into sleep.',
  'I’m relaxed, and so are my dreams.',
  'The best dreams come when you’re truly relaxed.',
  'Relaxed vibes only as I drift off.',
  'Taking it easy all the way to dreamland.',
  'A relaxed mind makes for a restful sleep.',
  'Letting go of everything, just relaxing into dreams.',
  'No stress, just relaxation and sleep.',
  'Relaxed sleep is the best kind of sleep.'
]

const TIMID_PHRASES: string[] = [
  'Quietly drifting into sleep.',
  'Timid steps into the dream world.',
  'No bold moves, just gentle sleep.',
  'Sleep comes softly for the timid.',
  'Timid but ready to dream.',
  'Soft dreams for a soft heart.',
  'Sleep without making a fuss.',
  'Quiet nights, gentle dreams.',
  'Timid but peaceful slumber.',
  'Tiptoeing into dreamland.'
]

const SASSY_PHRASES: string[] = [
  'Sleep? Only if it’s fabulous.',
  'I’ll sleep, but I’ll do it with style.',
  'Sassy dreams are the best kind.',
  'No boring sleep here, only sassy slumber.',
  'Sleep like a diva, wake like a queen.',
  'Even my dreams have attitude.',
  'Resting with a bit of flair.',
  'Sassy sleep for a sassy me.',
  'Dreams with a side of sass.',
  'Sleep like you mean it, with a little sass.'
]

const MODEST_PHRASES: string[] = [
  'Sleep humbly, wake refreshed.',
  'No grand dreams, just a peaceful slumber.',
  'Modesty in rest brings clarity.',
  'Simple dreams, nothing more, nothing less.',
  'Humble sleep, serene rest.',
  'No need for extravagance, just restful dreams.',
  'Modestly drifting off, no big fuss.',
  'Quiet dreams for a modest soul.',
  'Rest is simple and that’s enough.',
  'Sleep without boasting, just rest.'
]

const MILD_PHRASES: string[] = [
  'Sleep comes gently, and so do the dreams.',
  'No rush, no force, just mild slumber.',
  'Mild sleep, warm dreams.',
  'Taking it easy, one soft dream at a time.',
  'The mildest of dreams are the sweetest.',
  'Gently drifting into slumber.',
  'Sleep, mild and kind.',
  'No extremes, just a mild rest.',
  'Dreaming softly, without a care.',
  'Mild night, gentle dreams.'
]

const RASH_PHRASES: string[] = [
  'Sleep can wait, let’s live a little!',
  'Rushing into dreams like it’s an adventure.',
  'No patience for sleep, but I guess I need it.',
  'Who needs a careful approach? Let’s sleep rashly.',
  'Boldly diving into slumber, no second thoughts.',
  'I sleep like I live—fast and rash.',
  'Sleep? Sure, let’s get it over with.',
  'Dreams without hesitation.',
  'Rash decisions lead to wild dreams.',
  'No caution, just sleep.'
]

const QUIET_PHRASES: string[] = [
  'Quiet nights lead to peaceful dreams.',
  'No noise, just a calm and quiet slumber.',
  'Dreams are best when the night is silent.',
  'Quietly drifting into a restful sleep.',
  'Silence brings the best kind of sleep.',
  'A quiet mind leads to a restful night.',
  'No distractions, just a quiet journey to dreamland.',
  'Quiet slumber, peaceful heart.',
  'No words, just quiet rest.',
  'Silent dreams for a silent night.'
]

const CAREFUL_PHRASES: string[] = [
  'Careful steps into dreamland.',
  'Sleep gently, dream softly.',
  'Carefully winding down for the night.',
  'No rush, just careful rest.',
  'Caution in waking, caution in sleep.',
  'Resting with care, dreaming with ease.',
  'Sleep like you mean it, but carefully.',
  'Gentle rest, careful dreams.',
  'Taking my time to rest properly.',
  'Careful dreams make for a peaceful night.'
]

const GENTLE_PHRASES: string[] = [
  'Gentle sleep, gentle dreams.',
  'Drifting softly into a gentle night.',
  'Dreaming with a gentle heart.',
  'Gentle rest, peaceful dreams.',
  'The night is calm, and so am I.',
  'A gentle touch, even in slumber.',
  'Softly drifting off to sleep.',
  'Gentle slumber, quiet night.',
  'No harsh thoughts, just gentle dreams.',
  'Falling asleep with gentle ease.'
]

const HARDY_PHRASES: string[] = [
  'Strong sleep for a strong tomorrow.',
  'No frills, just a hardy rest.',
  'Resting with resilience.',
  'Sleep is just another way to prepare for challenges.',
  'Hardy dreams, steady mind.',
  'Rest well, stay tough.',
  'Sleep like a rock, wake even stronger.',
  'A hardy slumber for a hardy soul.',
  'No fuss, just solid sleep.',
  'Strong rest, strong spirit.'
]

const DOCILE_PHRASES: string[] = [
  'Docile and ready for a gentle sleep.',
  'No resistance, just a peaceful drift into dreams.',
  'Calm dreams for a docile heart.',
  'Sleep comes easy when you’re this docile.',
  'Docile rest, peaceful mind.',
  'No struggle, just easy rest.',
  'Softly slipping into slumber.',
  'A docile night leads to restful dreams.',
  'Sleep without a fight, just rest.',
  'Docile dreams are the best kind of dreams.'
]

const BASHFUL_PHRASES: string[] = [
  'A little shy, even in sleep.',
  'Bashfully drifting into the night.',
  'Quiet dreams for a bashful soul.',
  'Sleep without making a fuss.',
  'Bashful dreams, gentle rest.',
  'No spotlight, just peaceful sleep.',
  'Resting quietly, without drawing attention.',
  'Bashful slumber, soft and calm.',
  'Dreaming in the quietest way.',
  'A shy journey to dreamland.'
]

const QUIRKY_PHRASES: string[] = [
  'Dreaming in my own quirky way.',
  "Sleep doesn't have to be normal, right?",
  'Quirky dreams for a quirky mind.',
  'Resting with a twist of the unusual.',
  'No ordinary sleep here, just quirky rest.',
  'A little odd, even in slumber.',
  'Dreams that are anything but typical.',
  'Sleep with a bit of quirkiness.',
  'Unusual dreams make for interesting mornings.',
  'Resting my quirky mind tonight.'
]

const SERIOUS_PHRASES: string[] = [
  'Sleep is serious business.',
  'No time for games, just rest.',
  'A serious sleep for a serious day ahead.',
  'Resting with purpose.',
  'Dreams are important, and I take them seriously.',
  'No nonsense, just sleep.',
  'Focused rest, ready for anything.',
  'Sleep like you mean it.',
  'Serious dreams for a focused mind.',
  'Taking my rest as seriously as my work.'
]

const HASTY_PHRASES: string[] = [
  'Quickly drifting off, no time to waste.',
  'Sleep fast, dream faster.',
  'No lingering, just straight to sleep.',
  'Hasty sleep for a busy mind.',
  'Dreaming on a schedule, gotta be quick.',
  'In a hurry, even to sleep.',
  'No time to dawdle, sleep calls.',
  'Fast dreams for a fast life.',
  'Sleep now, rush later.',
  'Hasty slumber, but still restful.'
]

const NAIVE_PHRASES: string[] = [
  'Sleeping with a naive smile.',
  'No worries, just simple dreams.',
  'Naive enough to believe in sweet dreams.',
  'The world may be tough, but my dreams are kind.',
  'Sleep like nothing can go wrong.',
  'Naively drifting into slumber.',
  'Dreaming with innocence.',
  'No doubts, just naive dreams.',
  'A hopeful sleep for a hopeful heart.',
  'Naive dreams are the sweetest.'
]

export const phrases: Record<string, string[]> = {
  Lonely: LONELY_PHRASES,
  Adamant: ADAMANT_PHRASES,
  Naughty: NAUGHTY_PHRASES,
  Brave: BRAVE_PHRASES,
  Bold: BOLD_PHRASES,
  Impish: IMPISH_PHRASES,
  Lax: LAX_PHRASES,
  Relaxed: RELAXED_PHRASES,
  Modest: MODEST_PHRASES,
  Mild: MILD_PHRASES,
  Rash: RASH_PHRASES,
  Quiet: QUIET_PHRASES,
  Calm: CALM_PHRASES,
  Gentle: GENTLE_PHRASES,
  Careful: CAREFUL_PHRASES,
  Sassy: SASSY_PHRASES,
  Timid: TIMID_PHRASES,
  Hasty: HASTY_PHRASES,
  Jolly: JOLLY_PHRASES,
  Naive: NAIVE_PHRASES,
  Bashful: BASHFUL_PHRASES,
  Hardy: HARDY_PHRASES,
  Docile: DOCILE_PHRASES,
  Quirky: QUIRKY_PHRASES,
  Serious: SERIOUS_PHRASES
}
