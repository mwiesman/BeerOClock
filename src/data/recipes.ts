export interface RecipeStep {
  instruction: string;
  timeMinutes?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'beef' | 'pork' | 'chicken' | 'fish' | 'veggies' | 'other';
  steps: RecipeStep[];
  totalTimeMinutes: number;
  imageEmoji: string;
}

export const recipes: Recipe[] = [
  {
    id: 'classic-burger',
    name: 'Classic Burger',
    description: 'Quarter-pound beef patty grilled to perfection.',
    category: 'beef',
    imageEmoji: '🍔',
    totalTimeMinutes: 8,
    steps: [
      { instruction: 'Form patties and season with salt & pepper.' },
      { instruction: 'Grill first side over high heat.', timeMinutes: 4 },
      { instruction: 'Flip and grill second side. Add cheese in last minute.', timeMinutes: 4 },
      { instruction: 'Rest on bun for 1 minute. Add toppings.', timeMinutes: 1 },
    ],
  },
  {
    id: 'smash-burger',
    name: 'Smash Burger',
    description: 'Thin, crispy-edged smash burgers with maximum crust.',
    category: 'beef',
    imageEmoji: '🫓',
    totalTimeMinutes: 6,
    steps: [
      { instruction: 'Roll beef into loose balls. Heat grill/griddle screaming hot.' },
      { instruction: 'Place ball on grill and SMASH flat. Season.', timeMinutes: 2 },
      { instruction: 'Flip when edges are crispy. Add cheese.', timeMinutes: 2 },
      { instruction: 'Stack patties, add toppings.', timeMinutes: 1 },
    ],
  },
  {
    id: 'ny-strip',
    name: 'NY Strip Steak',
    description: 'Medium-rare NY strip with a perfect sear.',
    category: 'beef',
    imageEmoji: '🥩',
    totalTimeMinutes: 10,
    steps: [
      { instruction: 'Bring steak to room temp. Season generously.' },
      { instruction: 'Sear over high heat.', timeMinutes: 4 },
      { instruction: 'Flip and sear other side.', timeMinutes: 4 },
      { instruction: 'Rest before slicing.', timeMinutes: 5 },
    ],
  },
  {
    id: 'bbq-chicken',
    name: 'BBQ Chicken Breast',
    description: 'Juicy chicken breast with tangy BBQ glaze.',
    category: 'chicken',
    imageEmoji: '🍗',
    totalTimeMinutes: 20,
    steps: [
      { instruction: 'Pound chicken to even thickness. Season.' },
      { instruction: 'Grill over medium heat.', timeMinutes: 7 },
      { instruction: 'Flip and continue grilling.', timeMinutes: 7 },
      { instruction: 'Brush with BBQ sauce, grill 2 more min per side.', timeMinutes: 4 },
      { instruction: 'Rest before serving.', timeMinutes: 3 },
    ],
  },
  {
    id: 'grilled-salmon',
    name: 'Grilled Salmon',
    description: 'Cedar-plank style grilled salmon fillet.',
    category: 'fish',
    imageEmoji: '🐟',
    totalTimeMinutes: 12,
    steps: [
      { instruction: 'Season salmon with olive oil, lemon, salt & pepper.' },
      { instruction: 'Place skin-side down on medium heat.', timeMinutes: 8 },
      { instruction: 'Flip carefully and finish.', timeMinutes: 4 },
    ],
  },
  {
    id: 'hot-dogs',
    name: 'Hot Dogs',
    description: 'Classic grilled franks with char marks.',
    category: 'other',
    imageEmoji: '🌭',
    totalTimeMinutes: 8,
    steps: [
      { instruction: 'Score hot dogs diagonally.' },
      { instruction: 'Grill over medium-high, turning occasionally.', timeMinutes: 6 },
      { instruction: 'Toast buns on grill.', timeMinutes: 2 },
    ],
  },
  {
    id: 'baby-back-ribs',
    name: 'Baby Back Ribs',
    description: 'Low and slow smoked ribs. This is a commitment.',
    category: 'pork',
    imageEmoji: '🍖',
    totalTimeMinutes: 180,
    steps: [
      { instruction: 'Remove membrane. Apply dry rub generously.' },
      { instruction: 'Smoke at 225°F indirect heat.', timeMinutes: 120 },
      { instruction: 'Wrap in foil with butter and brown sugar.', timeMinutes: 45 },
      { instruction: 'Unwrap, glaze with sauce, and finish.', timeMinutes: 15 },
    ],
  },
  {
    id: 'corn-on-cob',
    name: 'Grilled Corn on the Cob',
    description: 'Sweet charred corn with butter.',
    category: 'veggies',
    imageEmoji: '🌽',
    totalTimeMinutes: 15,
    steps: [
      { instruction: 'Peel husks back, remove silk, re-wrap.' },
      { instruction: 'Grill in husks over medium heat, turning.', timeMinutes: 10 },
      { instruction: 'Remove husks and char directly on grill.', timeMinutes: 5 },
    ],
  },
  {
    id: 'asparagus',
    name: 'Grilled Asparagus',
    description: 'Quick and simple grilled asparagus spears.',
    category: 'veggies',
    imageEmoji: '🥬',
    totalTimeMinutes: 8,
    steps: [
      { instruction: 'Trim woody ends. Toss with olive oil, salt, pepper.' },
      { instruction: 'Grill over high heat, turning once.', timeMinutes: 6 },
      { instruction: 'Squeeze lemon over top.', timeMinutes: 1 },
    ],
  },
  {
    id: 'brisket',
    name: 'Whole Brisket',
    description: "The king of BBQ. That's a LOT of Cold Ones.",
    category: 'beef',
    imageEmoji: '🔥',
    totalTimeMinutes: 360,
    steps: [
      { instruction: 'Trim fat cap to 1/4 inch. Apply rub. Let sit overnight.' },
      { instruction: 'Smoke fat-side up at 225°F.', timeMinutes: 240 },
      { instruction: 'Wrap in butcher paper when bark is set.', timeMinutes: 90 },
      { instruction: 'Rest in cooler for at least 30 minutes.', timeMinutes: 30 },
    ],
  },
];
