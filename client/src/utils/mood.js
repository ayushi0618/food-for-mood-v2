// Deterministic, client-side mood classifier. It scans the user's situation
// text for emotion keywords and returns a mood label + theme color. Kept
// deliberately simple and explainable: no black box, easy to discuss in an
// interview, and it never overrides the Gemini recommendation — it only
// powers journaling, badges, and the Insights dashboard.

const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    color: '#D9A441',
    keywords: [
      'happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful',
      'fantastic', 'delighted', 'cheerful', 'glad', 'smile', 'laugh',
    ],
  },
  {
    id: 'celebrating',
    label: 'Celebrating',
    color: '#C0495B',
    keywords: [
      'celebrat', 'party', 'birthday', 'anniversary', 'promotion', 'promoted',
      'won', 'success', 'achievement', 'graduat', 'festival', 'diwali',
    ],
  },
  {
    id: 'sad',
    label: 'Sad',
    color: '#6B8CAE',
    keywords: [
      'sad', 'cry', 'crying', 'depress', 'lonely', 'heartbreak', 'breakup',
      'miss ', 'gloomy', 'down', 'upset', 'tear',
    ],
  },
  {
    id: 'stressed',
    label: 'Stressed',
    color: '#C2571B',
    keywords: [
      'stress', 'deadline', 'exam', 'work pressure', 'overwhelm', 'anxiet',
      'anxious', 'worried', 'tension', 'panic', 'nervous', 'interview',
    ],
  },
  {
    id: 'tired',
    label: 'Tired',
    color: '#8A7561',
    keywords: [
      'tired', 'exhaust', 'sleepy', 'drained', 'fatigue', 'long day',
      'hectic', 'burnout', 'lazy', 'lethargic',
    ],
  },
  {
    id: 'sick',
    label: 'Under the weather',
    color: '#5F8D4E',
    keywords: [
      'sick', 'cold', 'fever', 'flu', 'cough', 'ill', 'unwell', 'headache',
      'stomach', 'recover',
    ],
  },
  {
    id: 'angry',
    label: 'Angry',
    color: '#A83A2E',
    keywords: [
      'angry', 'furious', 'irritat', 'annoyed', 'frustrat', 'fight',
      'argument', 'rage', 'mad at',
    ],
  },
  {
    id: 'bored',
    label: 'Bored',
    color: '#9A8FBF',
    keywords: ['bored', 'boring', 'nothing to do', 'dull', 'monotonous'],
  },
  {
    id: 'romantic',
    label: 'Romantic',
    color: '#C0495B',
    keywords: ['date', 'romantic', 'valentine', 'dinner with', 'anniversary dinner'],
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    color: '#B07C4F',
    keywords: [
      'nostalgi', 'childhood', 'memories', 'miss home', 'homesick',
      'grandmother', 'nani', 'dadi', 'old days',
    ],
  },
  {
    id: 'hungry',
    label: 'Hungry',
    color: '#C2571B',
    keywords: ['hungry', 'starving', 'craving', 'appetite'],
  },
];

export const FALLBACK_MOOD = { id: 'curious', label: 'Curious', color: '#7A6A5C' };

export function detectMood(text = '') {
  const t = ` ${text.toLowerCase()} `;
  let best = null;
  let bestScore = 0;
  for (const mood of MOODS) {
    let score = 0;
    for (const kw of mood.keywords) {
      if (t.includes(kw)) score += kw.length; // longer keywords weigh more
    }
    if (score > bestScore) {
      bestScore = score;
      best = mood;
    }
  }
  if (!best) return FALLBACK_MOOD;
  return { id: best.id, label: best.label, color: best.color };
}

export function moodColor(label) {
  const found = MOODS.find((m) => m.label === label);
  return found ? found.color : FALLBACK_MOOD.color;
}

export const MOOD_SUGGESTIONS = [
  { label: 'Long day at work', text: 'I just finished a really long and exhausting day at work.' },
  { label: 'Feeling low', text: 'Feeling low today, it has been raining all day and I miss home.' },
  { label: 'Celebration', text: 'I got promoted at work! Time to celebrate with friends.' },
  { label: 'Exam stress', text: 'My exams start tomorrow and I am super stressed and anxious.' },
  { label: 'Sick day', text: 'I have a cold and fever, need something soothing.' },
  { label: 'Lazy Sunday', text: 'Lazy Sunday afternoon, craving something tasty and comforting.' },
];
