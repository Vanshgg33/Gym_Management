export const DIET_TEMPLATES = [
  {
    name: 'Vegan Fitness Plan',
    description: 'A balanced vegan plan for general fitness with plant-based protein sources.',
    goal: 'general_fitness',
    dietType: 'vegan',
    dailyCalories: 2200,
    proteinLevel: 'moderate',
    isTemplate: true,
    status: 'active',
    meals: [
      {
        slot: 'early_morning',
        name: 'Lemon Water',
        items: [{ name: 'Warm lemon water', quantity: '1 glass' }],
      },
      {
        slot: 'breakfast',
        name: 'Overnight Oats',
        items: [
          { name: 'Oats', quantity: '80g', calories: 300, protein: 10 },
          { name: 'Almond milk', quantity: '200ml', calories: 30 },
          { name: 'Chia seeds', quantity: '15g', calories: 75, protein: 3 },
          { name: 'Berries', quantity: '50g', calories: 30 },
        ],
      },
      {
        slot: 'mid_morning',
        name: 'Fruit & Nuts',
        items: [
          { name: 'Banana', quantity: '1 medium', calories: 90 },
          { name: 'Almonds', quantity: '20g', calories: 120, protein: 4 },
        ],
      },
      {
        slot: 'lunch',
        name: 'Tofu Rice Bowl',
        items: [
          { name: 'Brown rice', quantity: '150g', calories: 165, protein: 4 },
          { name: 'Tofu', quantity: '150g', calories: 120, protein: 15 },
          { name: 'Mixed vegetables', quantity: '100g', calories: 50 },
          { name: 'Olive oil', quantity: '10ml', calories: 90 },
        ],
      },
      {
        slot: 'evening_snack',
        name: 'Hummus & Veggies',
        items: [
          { name: 'Hummus', quantity: '60g', calories: 140, protein: 5 },
          { name: 'Cucumber', quantity: '100g', calories: 15 },
          { name: 'Carrots', quantity: '100g', calories: 40 },
        ],
      },
      {
        slot: 'pre_workout',
        name: 'Tempeh Wrap',
        items: [
          { name: 'Tempeh', quantity: '100g', calories: 195, protein: 20 },
          { name: 'Whole wheat roti', quantity: '1 piece', calories: 120, protein: 4 },
          { name: 'Spinach', quantity: '30g', calories: 7 },
        ],
      },
      {
        slot: 'post_workout',
        name: 'Protein Smoothie',
        items: [
          { name: 'Plant protein powder', quantity: '30g', calories: 120, protein: 24 },
          { name: 'Banana', quantity: '1 medium', calories: 90 },
          { name: 'Almond milk', quantity: '250ml', calories: 40 },
        ],
      },
      {
        slot: 'dinner',
        name: 'Lentil Dal',
        items: [
          { name: 'Red lentils', quantity: '100g', calories: 350, protein: 25 },
          { name: 'Brown rice', quantity: '100g', calories: 110, protein: 3 },
          { name: 'Vegetables', quantity: '100g', calories: 50 },
        ],
      },
    ],
  },
  {
    name: 'Weight Loss Low Carb',
    description: 'High-protein, low-carb non-veg plan for effective fat loss.',
    goal: 'weight_loss',
    dietType: 'non_veg',
    dailyCalories: 1600,
    proteinLevel: 'high',
    isTemplate: true,
    status: 'active',
    meals: [
      {
        slot: 'early_morning',
        name: 'Green Tea',
        items: [{ name: 'Green tea (unsweetened)', quantity: '1 cup', calories: 2 }],
      },
      {
        slot: 'breakfast',
        name: 'Egg White Omelette',
        items: [
          { name: 'Egg whites', quantity: '4 pieces', calories: 68, protein: 14 },
          { name: 'Vegetables', quantity: '100g', calories: 30 },
          { name: 'Olive oil', quantity: '1 tsp', calories: 40 },
        ],
        note: 'No bread or toast',
      },
      {
        slot: 'mid_morning',
        name: 'Greek Yogurt',
        items: [
          { name: 'Plain Greek yogurt', quantity: '150g', calories: 90, protein: 15 },
          { name: 'Cucumber slices', quantity: '50g', calories: 8 },
        ],
      },
      {
        slot: 'lunch',
        name: 'Grilled Chicken Salad',
        items: [
          { name: 'Chicken breast', quantity: '150g', calories: 165, protein: 31 },
          { name: 'Mixed greens', quantity: '100g', calories: 20 },
          { name: 'Olive oil dressing', quantity: '10ml', calories: 90 },
        ],
        note: 'No dressing with sugar',
      },
      {
        slot: 'evening_snack',
        name: 'Protein Shake',
        items: [
          { name: 'Whey protein', quantity: '25g', calories: 100, protein: 20 },
          { name: 'Water', quantity: '200ml', calories: 0 },
        ],
      },
      {
        slot: 'dinner',
        name: 'Fish with Vegetables',
        items: [
          { name: 'Salmon', quantity: '150g', calories: 280, protein: 30 },
          { name: 'Broccoli', quantity: '150g', calories: 52 },
          { name: 'Zucchini', quantity: '100g', calories: 17 },
        ],
        note: 'Dinner by 7:30 PM',
      },
    ],
  },
  {
    name: 'Indian Vegetarian Balanced',
    description: 'A traditional Indian vegetarian plan balanced for everyday fitness.',
    goal: 'general_fitness',
    dietType: 'veg',
    dailyCalories: 2000,
    proteinLevel: 'moderate',
    isTemplate: true,
    status: 'active',
    meals: [
      {
        slot: 'early_morning',
        name: 'Warm Turmeric Milk',
        items: [
          { name: 'Milk', quantity: '200ml', calories: 130, protein: 7 },
          { name: 'Turmeric', quantity: '1 pinch', calories: 2 },
        ],
      },
      {
        slot: 'breakfast',
        name: 'Moong Dal Cheela',
        items: [
          { name: 'Moong dal', quantity: '80g', calories: 265, protein: 18 },
          { name: 'Onion', quantity: '30g', calories: 12 },
          { name: 'Green chilli', quantity: '1 piece', calories: 5 },
          { name: 'Coriander', quantity: 'handful', calories: 3 },
          { name: 'Mint chutney', quantity: '2 tbsp', calories: 20 },
        ],
      },
      {
        slot: 'mid_morning',
        name: 'Poha',
        items: [
          { name: 'Beaten rice (poha)', quantity: '60g', calories: 200, protein: 4 },
          { name: 'Vegetables', quantity: '50g', calories: 25 },
          { name: 'Peanuts', quantity: '20g', calories: 114, protein: 5 },
        ],
      },
      {
        slot: 'lunch',
        name: 'Dal Rice + Sabzi',
        items: [
          { name: 'Dal', quantity: '100g', calories: 350, protein: 22 },
          { name: 'Rice', quantity: '100g', calories: 130, protein: 3 },
          { name: 'Seasonal vegetable curry', quantity: '150g', calories: 100 },
          { name: 'Curd', quantity: '100g', calories: 60, protein: 3 },
        ],
      },
      {
        slot: 'evening_snack',
        name: 'Paneer Tikka',
        items: [
          { name: 'Paneer', quantity: '80g', calories: 220, protein: 14 },
          { name: 'Bell peppers', quantity: '50g', calories: 16 },
        ],
      },
      {
        slot: 'dinner',
        name: 'Roti + Dal + Salad',
        items: [
          { name: 'Whole wheat roti', quantity: '2 pieces', calories: 240, protein: 8 },
          { name: 'Dal', quantity: '100g', calories: 350, protein: 22 },
          { name: 'Green salad', quantity: '100g', calories: 25 },
        ],
        note: 'Dinner by 8 PM',
      },
    ],
  },
  {
    name: 'High Protein Non-Veg',
    description: 'A high-calorie, very high protein non-veg plan for muscle gain.',
    goal: 'muscle_gain',
    dietType: 'non_veg',
    dailyCalories: 2500,
    proteinLevel: 'very_high',
    isTemplate: true,
    status: 'active',
    meals: [
      {
        slot: 'early_morning',
        name: 'Pre-Workout Snack',
        items: [
          { name: 'Boiled eggs', quantity: '2 pieces', calories: 140, protein: 12 },
          { name: 'Banana', quantity: '1 medium', calories: 90 },
        ],
      },
      {
        slot: 'breakfast',
        name: 'Oats + Eggs',
        items: [
          { name: 'Oats', quantity: '80g', calories: 300, protein: 10 },
          { name: 'Scrambled eggs', quantity: '3 pieces', calories: 210, protein: 18 },
          { name: 'Milk', quantity: '200ml', calories: 130, protein: 7 },
          { name: 'Nuts', quantity: '20g', calories: 130, protein: 4 },
        ],
      },
      {
        slot: 'mid_morning',
        name: 'Chicken Breast + Rice',
        items: [
          { name: 'Chicken breast', quantity: '150g', calories: 165, protein: 31 },
          { name: 'Brown rice', quantity: '100g', calories: 110, protein: 3 },
        ],
      },
      {
        slot: 'lunch',
        name: 'Tuna Rice Bowl',
        items: [
          { name: 'Tuna', quantity: '150g', calories: 180, protein: 35 },
          { name: 'Brown rice', quantity: '150g', calories: 165, protein: 4 },
          { name: 'Vegetables', quantity: '100g', calories: 50 },
          { name: 'Olive oil', quantity: '10ml', calories: 90 },
        ],
      },
      {
        slot: 'evening_snack',
        name: 'Whey Protein Shake',
        items: [
          { name: 'Whey protein', quantity: '30g', calories: 120, protein: 24 },
          { name: 'Milk', quantity: '300ml', calories: 195, protein: 10 },
          { name: 'Banana', quantity: '1 medium', calories: 90 },
        ],
      },
      {
        slot: 'pre_workout',
        name: 'Dates + Almonds',
        items: [
          { name: 'Dates', quantity: '3 pieces', calories: 65 },
          { name: 'Almonds', quantity: '20g', calories: 120, protein: 4 },
        ],
      },
      {
        slot: 'post_workout',
        name: 'Egg White Shake',
        items: [
          { name: 'Egg whites', quantity: '4 pieces', calories: 68, protein: 14 },
          { name: 'Milk', quantity: '200ml', calories: 130, protein: 7 },
          { name: 'Whey protein', quantity: '25g', calories: 100, protein: 20 },
        ],
      },
      {
        slot: 'dinner',
        name: 'Salmon + Veggies',
        items: [
          { name: 'Salmon', quantity: '200g', calories: 370, protein: 40 },
          { name: 'Sweet potato', quantity: '150g', calories: 130 },
          { name: 'Broccoli', quantity: '100g', calories: 34 },
          { name: 'Olive oil', quantity: '1 tsp', calories: 40 },
        ],
      },
      {
        slot: 'bedtime',
        name: 'Casein / Cottage Cheese',
        items: [
          { name: 'Cottage cheese or casein protein', quantity: '150g / 30g', calories: 180, protein: 28 },
          { name: 'Milk', quantity: '200ml', calories: 130, protein: 7 },
        ],
      },
    ],
  },
];
