// Curated dish catalog for the Menu page. Each dish carries the metadata the
// UI filters on (diet, spice, cuisine) plus a photo. Photos are Unsplash URLs;
// every <img> in the app has an onError fallback so a dead link never breaks
// the layout.

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

const DISHES = [
  {
    name: 'Khichdi',
    cuisine: 'North Indian',
    veg: true,
    spice: 1,
    price: 120,
    tags: ['comfort', 'light', 'one-pot'],
    blurb: 'Slow-cooked rice and moong dal, finished with ghee. The ultimate hug in a bowl.',
    image: U('photo-1512058564366-18510be2db19'),
  },
  {
    name: 'Masala Dosa',
    cuisine: 'South Indian',
    veg: true,
    spice: 2,
    price: 150,
    tags: ['crispy', 'breakfast', 'classic'],
    blurb: 'Golden crisp crepe wrapped around spiced potato, with coconut chutney and sambar.',
    image: U('photo-1668236543090-82eba5ee5976'),
  },
  {
    name: 'Biryani',
    cuisine: 'Hyderabadi',
    veg: false,
    spice: 3,
    price: 220,
    tags: ['celebration', 'aromatic', 'crowd-pleaser'],
    blurb: 'Fragrant dum-cooked rice layered with marinated chicken and saffron.',
    image: U('photo-1633945274405-b6c8069047b0'),
  },
  {
    name: 'Rajma Chawal',
    cuisine: 'North Indian',
    veg: true,
    spice: 2,
    price: 140,
    tags: ['comfort', 'homestyle', 'protein'],
    blurb: 'Kidney beans simmered in tomato gravy over steaming basmati. Ghar jaisa.',
    image: U('photo-1589302168068-964664d93dc0'),
  },
  {
    name: 'Gulab Jamun',
    cuisine: 'Dessert',
    veg: true,
    spice: 1,
    price: 90,
    tags: ['sweet', 'warm', 'festive'],
    blurb: 'Soft khoya dumplings soaked in rose-cardamom syrup. Served warm.',
    image: U('photo-1601050690597-df0568f70950'),
  },
  {
    name: 'Maggi',
    cuisine: 'Indo-Chinese',
    veg: true,
    spice: 2,
    price: 70,
    tags: ['nostalgia', 'midnight', 'quick'],
    blurb: 'The 2-minute legend. Best eaten straight from the pan at 2 AM.',
    image: U('photo-1612929633738-8fe44f7ec841'),
  },
  {
    name: 'Paneer Butter Masala',
    cuisine: 'North Indian',
    veg: true,
    spice: 2,
    price: 210,
    tags: ['rich', 'creamy', 'dinner'],
    blurb: 'Silky tomato-cashew gravy with soft paneer cubes. Naan mandatory.',
    image: U('photo-1631452180519-c014fe946bc7'),
  },
  {
    name: 'Chole Bhature',
    cuisine: 'North Indian',
    veg: true,
    spice: 3,
    price: 160,
    tags: ['hearty', 'weekend', 'spicy'],
    blurb: 'Fluffy bhature with dark, tangy Amritsari chole. A Delhi emotion.',
    image: U('photo-1626132647523-66f5bf380027'),
  },
  {
    name: 'Dal Makhani',
    cuisine: 'North Indian',
    veg: true,
    spice: 1,
    price: 190,
    tags: ['slow-cooked', 'creamy', 'classic'],
    blurb: 'Black lentils simmered overnight with butter and cream. Pure patience.',
    image: U('photo-1546833999-b9f581a1996d'),
  },
  {
    name: 'Samosa',
    cuisine: 'Snack',
    veg: true,
    spice: 2,
    price: 40,
    tags: ['crispy', 'chai-time', 'street'],
    blurb: 'Flaky pastry, spiced potato heart, imli chutney on the side.',
    image: U('photo-1601050690597-df0568f70950'),
  },
  {
    name: 'Butter Chicken',
    cuisine: 'North Indian',
    veg: false,
    spice: 2,
    price: 250,
    tags: ['rich', 'dinner', 'classic'],
    blurb: 'Tandoor-kissed chicken folded into velvety makhani gravy.',
    image: U('photo-1603894584373-5ac82b2ae398'),
  },
  {
    name: 'Poha',
    cuisine: 'Maharashtrian',
    veg: true,
    spice: 1,
    price: 60,
    tags: ['light', 'breakfast', 'quick'],
    blurb: 'Flattened rice tossed with peanuts, curry leaves and a squeeze of lime.',
    image: U('photo-1606491956689-2ea866880c84'),
  },
  {
    name: 'Idli Sambar',
    cuisine: 'South Indian',
    veg: true,
    spice: 1,
    price: 80,
    tags: ['light', 'healthy', 'breakfast'],
    blurb: 'Cloud-soft steamed cakes dunked in piping-hot sambar.',
    image: U('photo-1589301760014-d929f3979dbc'),
  },
  {
    name: 'Pav Bhaji',
    cuisine: 'Mumbai Street',
    veg: true,
    spice: 3,
    price: 130,
    tags: ['street', 'buttery', 'crowd-pleaser'],
    blurb: 'Mashed veg bhaji loaded with butter, scooped up with toasted pav.',
    image: U('photo-1606755962773-d324e0a13086'),
  },
  {
    name: 'Rasmalai',
    cuisine: 'Dessert',
    veg: true,
    spice: 1,
    price: 110,
    tags: ['sweet', 'chilled', 'festive'],
    blurb: 'Feather-light chenna discs resting in saffron-kissed milk.',
    image: U('photo-1551024506-0bccd828d307'),
  },
  {
    name: 'Filter Coffee',
    cuisine: 'Beverage',
    veg: true,
    spice: 1,
    price: 50,
    tags: ['morning', 'strong', 'south-indian'],
    blurb: 'Frothy degree coffee, dabara-style. Instant mood reset.',
    image: U('photo-1617690702423-8e0a3f2e4b1c'),
  },
];

export const SPICE_LABEL = { 1: 'Mild', 2: 'Medium', 3: 'Hot' };

export function findDish(name = '') {
  const n = name.toLowerCase().trim();
  return (
    DISHES.find((d) => d.name.toLowerCase() === n) ||
    DISHES.find((d) => n.includes(d.name.toLowerCase())) ||
    null
  );
}

export default DISHES;
