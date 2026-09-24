export enum Role {
  OWNER = 'owner',
  MANAGER = 'manager',
  FRONTDESK = 'frontdesk',
  TRAINER = 'trainer',
  MEMBER = 'member',
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

export enum MembershipStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  FROZEN = 'frozen',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  TRANSFERRED = 'transferred',
  CANCELLED = 'cancelled',
}

export enum PackageType {
  MEMBERSHIP = 'membership',
  PT = 'pt',
  SUNNY_HOUR = 'sunnyHour',
}

export enum PaymentMethod {
  CASH = 'cash',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  CARD = 'card',
  OTHER = 'other',
}

export enum AttendanceSource {
  MANUAL = 'manual',
  SELF = 'self',
  BIOMETRIC = 'biometric',
}

export enum FollowUpType {
  PAYMENT = 'payment',
  RENEWAL = 'renewal',
  VISITOR = 'visitor',
  INQUIRY = 'inquiry',
  ATTENDANCE = 'attendance',
}

export enum FollowUpStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

export enum FollowUpPriority {
  NORMAL = 'normal',
  CRITICAL = 'critical',
}

export enum StaffRole {
  MANAGER = 'manager',
  FRONTDESK = 'frontdesk',
  TRAINER = 'trainer',
  OTHER = 'other',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  NOT_SET = 'prefer_not_to_say',
}

export enum ReferenceSource {
  WALK_IN = 'walk_in',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  ONLINE = 'online',
  ADVERTISEMENT = 'advertisement',
  OTHER = 'other',
}

export enum AgeGroup {
  UNDER_20 = 'under_20',
  TWENTY_35 = '20_35',
  THIRTY5_50 = '35_50',
  OVER_50 = 'over_50',
}

export enum ExpenseCategory {
  RENT = 'Rent',
  ELECTRICITY = 'Electricity',
  WATER = 'Water',
  INTERNET = 'Internet',
  EQUIPMENT = 'Equipment',
  REPAIRS = 'Repairs & Maintenance',
  CLEANING = 'Cleaning Supplies',
  MARKETING = 'Marketing',
  STAFF_SALARY = 'Staff Salary',
  TRAINER_COMMISSION = 'Trainer Commission',
  INSURANCE = 'Insurance',
  LICENSES = 'Licenses & Permits',
  OTHER = 'Other',
}

export enum PettyCashSource {
  OWNER_CASH = 'owner_cash',
  BANK_WITHDRAWAL = 'bank_withdrawal',
  COUNTER_COLLECTION = 'counter_collection',
  OTHER = 'other',
}

export enum MessageChannel {
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum MessageStatus {
  SENT = 'sent',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum MessageTrigger {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SYSTEM = 'system',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CLIENT = 'waiting_for_client',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TicketCategory {
  GENERAL = 'general',
  BILLING = 'billing',
  TECHNICAL = 'technical',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
}

export enum WorkoutGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  GENERAL_FITNESS = 'general_fitness',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  TONING = 'toning',
}

export enum WorkoutDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum DietGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  GENERAL_FITNESS = 'general_fitness',
}

export enum DietType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  EGG_ITARIAN = 'egg_itarian',
  VEGAN = 'vegan',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  CORE = 'core',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
  STRETCHING = 'stretching',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  SMITH_MACHINE = 'smith_machine',
  EZ_BAR = 'ez_bar',
  PLATE = 'plate',
  TRX = 'trx',
  CARDIO_MACHINE = 'cardio_machine',
  NONE = 'none',
}

export enum InventoryUnit {
  PIECE = 'piece',
  KG = 'kg',
  G = 'g',
  LITRE = 'litre',
  ML = 'ml',
  SERVING = 'serving',
  BOX = 'box',
  PACK = 'pack',
}

export enum InventoryCategory {
  SUPPLEMENT = 'Supplement',
  APPAREL = 'Apparel',
  ACCESSORY = 'Accessory',
  EQUIPMENT = 'Equipment',
  BEVERAGE = 'Beverage',
  OTHER = 'Other',
}

export enum ClassCategory {
  YOGA = 'yoga',
  HIIT = 'hiit',
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  DANCE = 'dance',
  PILATES = 'pilates',
  BOXING = 'boxing',
  SPINNING = 'spinning',
  CROSSFIT = 'crossfit',
  MEDITATION = 'meditation',
  OTHER = 'other',
}

export enum ClassDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
}
