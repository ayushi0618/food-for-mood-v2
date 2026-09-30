// Approximate nutrition snapshot per serving. Values are rough estimates for
// a standard restaurant serving — shown in the UI as "approx." and never as
// medical advice. Dishes missing here simply hide the nutrition panel.

const NUTRITION = {
  'Khichdi': { calories: 320, protein: 12, carbs: 55, fat: 6, serving: '1 bowl (300g)' },
  'Masala Dosa': { calories: 380, protein: 9, carbs: 68, fat: 9, serving: '1 dosa + sides' },
  'Biryani': { calories: 640, protein: 28, carbs: 72, fat: 22, serving: '1 plate (350g)' },
  'Rajma Chawal': { calories: 450, protein: 15, carbs: 78, fat: 8, serving: '1 plate (350g)' },
  'Gulab Jamun': { calories: 300, protein: 4, carbs: 52, fat: 10, serving: '2 pieces' },
  'Maggi': { calories: 350, protein: 8, carbs: 50, fat: 14, serving: '1 pack' },
  'Paneer Butter Masala': { calories: 480, protein: 18, carbs: 22, fat: 36, serving: '1 katori + 2 naan' },
  'Chole Bhature': { calories: 620, protein: 16, carbs: 84, fat: 24, serving: '2 bhature + chole' },
  'Dal Makhani': { calories: 420, protein: 14, carbs: 32, fat: 28, serving: '1 katori + rice' },
  'Samosa': { calories: 260, protein: 5, carbs: 30, fat: 14, serving: '2 pieces' },
  'Butter Chicken': { calories: 560, protein: 30, carbs: 18, fat: 40, serving: '1 katori + 2 naan' },
  'Poha': { calories: 250, protein: 6, carbs: 46, fat: 6, serving: '1 plate (200g)' },
  'Idli Sambar': { calories: 220, protein: 8, carbs: 42, fat: 3, serving: '3 idli + sambar' },
  'Pav Bhaji': { calories: 520, protein: 12, carbs: 70, fat: 22, serving: '2 pav + bhaji' },
  'Rasmalai': { calories: 280, protein: 9, carbs: 38, fat: 10, serving: '2 pieces' },
  'Filter Coffee': { calories: 90, protein: 3, carbs: 12, fat: 4, serving: '1 dabara (150ml)' },
};

export function getNutrition(dishName = '') {
  const key = Object.keys(NUTRITION).find(
    (k) => k.toLowerCase() === dishName.toLowerCase().trim()
  );
  return key ? NUTRITION[key] : null;
}

export default NUTRITION;
