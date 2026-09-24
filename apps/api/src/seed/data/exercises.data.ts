export interface ExerciseData {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

export const EXERCISES: ExerciseData[] = [
  // Core (11)
  { name: 'Ab Wheel Rollout', muscleGroup: 'core', equipment: 'none', difficulty: 'intermediate' },
  { name: 'Bicycle Crunches', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Cable Woodchops', muscleGroup: 'core', equipment: 'cable', difficulty: 'intermediate' },
  { name: 'Crunches', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Dead Bug', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Leg Raises', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Mountain Climbers', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Russian Twist', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Side Plank', muscleGroup: 'core', equipment: 'bodyweight', difficulty: 'beginner' },

  // Shoulders (8)
  { name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Front Raises', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Lateral Raises', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Overhead Barbell Press', muscleGroup: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Rear Delt Flyes', muscleGroup: 'shoulders', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Seated Dumbbell Press', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Shoulder Shrugs', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Upright Rows', muscleGroup: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },

  // Quadriceps (8)
  { name: 'Barbell Back Squat', muscleGroup: 'quadriceps', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'quadriceps', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Front Squat', muscleGroup: 'quadriceps', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Goblet Squat', muscleGroup: 'quadriceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Hack Squat', muscleGroup: 'quadriceps', equipment: 'machine', difficulty: 'intermediate' },
  { name: 'Leg Extension', muscleGroup: 'quadriceps', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Leg Press', muscleGroup: 'quadriceps', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Walking Lunges', muscleGroup: 'quadriceps', equipment: 'dumbbell', difficulty: 'beginner' },

  // Biceps (7)
  { name: 'Barbell Curl', muscleGroup: 'biceps', equipment: 'barbell', difficulty: 'beginner' },
  { name: 'Cable Curl', muscleGroup: 'biceps', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Concentration Curl', muscleGroup: 'biceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Hammer Curl', muscleGroup: 'biceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Preacher Curl', muscleGroup: 'biceps', equipment: 'barbell', difficulty: 'beginner' },

  // Back (9)
  { name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Face Pulls', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Hyperextensions', muscleGroup: 'back', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Pull-Ups', muscleGroup: 'back', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Single Arm Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'T-Bar Row', muscleGroup: 'back', equipment: 'barbell', difficulty: 'intermediate' },

  // Full Body (8)
  { name: 'Battle Ropes', muscleGroup: 'full_body', equipment: 'cardio_machine', difficulty: 'intermediate' },
  { name: 'Box Jumps', muscleGroup: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Burpees', muscleGroup: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Clean and Press', muscleGroup: 'full_body', equipment: 'barbell', difficulty: 'advanced' },
  { name: 'Kettlebell Swing', muscleGroup: 'full_body', equipment: 'kettlebell', difficulty: 'intermediate' },
  { name: 'Man Makers', muscleGroup: 'full_body', equipment: 'dumbbell', difficulty: 'advanced' },
  { name: 'Thrusters', muscleGroup: 'full_body', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Turkish Get Up', muscleGroup: 'full_body', equipment: 'kettlebell', difficulty: 'advanced' },

  // Chest (8)
  { name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable', difficulty: 'intermediate' },
  { name: 'Chest Dips', muscleGroup: 'chest', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Decline Bench Press', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Dumbbell Flyes', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Flat Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Pec Deck Machine', muscleGroup: 'chest', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Push-Ups', muscleGroup: 'chest', equipment: 'bodyweight', difficulty: 'beginner' },

  // Glutes (5)
  { name: 'Cable Kickbacks', muscleGroup: 'glutes', equipment: 'cable', difficulty: 'beginner' },
  { name: 'Glute Bridge', muscleGroup: 'glutes', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Hip Thrust', muscleGroup: 'glutes', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Step Ups', muscleGroup: 'glutes', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Sumo Deadlift', muscleGroup: 'glutes', equipment: 'barbell', difficulty: 'intermediate' },

  // Stretching (10)
  { name: 'Cat-Cow Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Chest Doorway Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: "Child's Pose", muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Foam Rolling - Full Body', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Hip Flexor Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Pigeon Pose', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Quad Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Shoulder Cross-Body Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: 'Standing Hamstring Stretch', muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },
  { name: "World's Greatest Stretch", muscleGroup: 'stretching', equipment: 'none', difficulty: 'beginner' },

  // Triceps (7)
  { name: 'Close Grip Bench Press', muscleGroup: 'triceps', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Diamond Push-Ups', muscleGroup: 'triceps', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Skull Crushers', muscleGroup: 'triceps', equipment: 'ez_bar', difficulty: 'intermediate' },
  { name: 'Tricep Dips', muscleGroup: 'triceps', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Tricep Kickbacks', muscleGroup: 'triceps', equipment: 'dumbbell', difficulty: 'beginner' },
  { name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable', difficulty: 'beginner' },

  // Calves (4)
  { name: 'Donkey Calf Raise', muscleGroup: 'calves', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Seated Calf Raise', muscleGroup: 'calves', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Single Leg Calf Raise', muscleGroup: 'calves', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Standing Calf Raise', muscleGroup: 'calves', equipment: 'machine', difficulty: 'beginner' },

  // Cardio (8)
  { name: 'Elliptical', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'High Knees', muscleGroup: 'cardio', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Jumping Jacks', muscleGroup: 'cardio', equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Jump Rope', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'Rowing Machine', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'Stair Climber', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'Stationary Bike', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'Treadmill Running', muscleGroup: 'cardio', equipment: 'cardio_machine', difficulty: 'beginner' },

  // Hamstrings (6)
  { name: 'Good Mornings', muscleGroup: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Lying Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Seated Leg Curl', muscleGroup: 'hamstrings', equipment: 'machine', difficulty: 'beginner' },
  { name: 'Single Leg Romanian Deadlift', muscleGroup: 'hamstrings', equipment: 'dumbbell', difficulty: 'intermediate' },
  { name: 'Stiff Leg Deadlift', muscleGroup: 'hamstrings', equipment: 'barbell', difficulty: 'intermediate' },
];
