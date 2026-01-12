// Local storage utility functions for data persistence
// This will be replaced with Supabase once integration is complete

const STORAGE_KEYS = {
  USERS: 'health_tracker_users',
  CURRENT_USER: 'health_tracker_current_user',
  PROFILES: 'health_tracker_profiles',
  FOOD_LOGS: 'health_tracker_food_logs',
  MEDICATIONS: 'health_tracker_medications',
  MEDICATION_REMINDERS: 'health_tracker_medication_reminders',
  WATER_INTAKE: 'health_tracker_water_intake',
  WEIGHT_LOGS: 'health_tracker_weight_logs',
};

// Helper functions
const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// UUID generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// User authentication
export const createUser = (email, password, username) => {
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const userId = generateUUID();
  const newUser = {
    id: userId,
    email,
    password_hash: btoa(password), // Simple encoding (use proper hashing in production)
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);
  setToStorage(STORAGE_KEYS.USERS, users);

  // Create profile
  const profiles = getFromStorage(STORAGE_KEYS.PROFILES) || [];
  const newProfile = {
    id: generateUUID(),
    user_id: userId,
    username,
    weight: null,
    height: null,
    lactose_intolerant: false,
    weight_unit: 'kg',
    height_unit: 'cm',
    updated_at: new Date().toISOString(),
  };
  profiles.push(newProfile);
  setToStorage(STORAGE_KEYS.PROFILES, profiles);

  return { user: newUser, profile: newProfile };
};

export const loginUser = (email, password) => {
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  const user = users.find(
    u => u.email === email && u.password_hash === btoa(password)
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = () => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER);
};

// Profile management
export const getProfile = (userId) => {
  const profiles = getFromStorage(STORAGE_KEYS.PROFILES) || [];
  return profiles.find(p => p.user_id === userId);
};

export const updateProfile = (userId, updates) => {
  const profiles = getFromStorage(STORAGE_KEYS.PROFILES) || [];
  const index = profiles.findIndex(p => p.user_id === userId);
  
  if (index !== -1) {
    profiles[index] = {
      ...profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.PROFILES, profiles);
    return profiles[index];
  }
  return null;
};

// Food logs
export const getFoodLogs = (userId, date = null) => {
  const logs = getFromStorage(STORAGE_KEYS.FOOD_LOGS) || [];
  let userLogs = logs.filter(log => log.user_id === userId);
  
  if (date) {
    userLogs = userLogs.filter(log => log.date === date);
  }
  
  return userLogs;
};

export const addFoodLog = (userId, mealType, foodName, calories, date) => {
  const logs = getFromStorage(STORAGE_KEYS.FOOD_LOGS) || [];
  const newLog = {
    id: generateUUID(),
    user_id: userId,
    meal_type: mealType,
    food_name: foodName,
    calories: parseInt(calories),
    date,
    created_at: new Date().toISOString(),
  };
  logs.push(newLog);
  setToStorage(STORAGE_KEYS.FOOD_LOGS, logs);
  return newLog;
};

export const deleteFoodLog = (logId) => {
  const logs = getFromStorage(STORAGE_KEYS.FOOD_LOGS) || [];
  const filtered = logs.filter(log => log.id !== logId);
  setToStorage(STORAGE_KEYS.FOOD_LOGS, filtered);
};

// Medications
export const getMedications = (userId) => {
  const meds = getFromStorage(STORAGE_KEYS.MEDICATIONS) || [];
  return meds.filter(med => med.user_id === userId);
};

export const addMedication = (userId, medicationName, dosage) => {
  const meds = getFromStorage(STORAGE_KEYS.MEDICATIONS) || [];
  const newMed = {
    id: generateUUID(),
    user_id: userId,
    medication_name: medicationName,
    dosage,
    created_at: new Date().toISOString(),
  };
  meds.push(newMed);
  setToStorage(STORAGE_KEYS.MEDICATIONS, meds);
  return newMed;
};

export const deleteMedication = (medId) => {
  const meds = getFromStorage(STORAGE_KEYS.MEDICATIONS) || [];
  const filtered = meds.filter(med => med.id !== medId);
  setToStorage(STORAGE_KEYS.MEDICATIONS, filtered);
  
  // Also delete associated reminders
  const reminders = getFromStorage(STORAGE_KEYS.MEDICATION_REMINDERS) || [];
  const filteredReminders = reminders.filter(r => r.medication_id !== medId);
  setToStorage(STORAGE_KEYS.MEDICATION_REMINDERS, filteredReminders);
};

// Medication reminders
export const getReminders = (medicationId = null) => {
  const reminders = getFromStorage(STORAGE_KEYS.MEDICATION_REMINDERS) || [];
  if (medicationId) {
    return reminders.filter(r => r.medication_id === medicationId);
  }
  return reminders;
};

export const addReminder = (medicationId, reminderTime, daysOfWeek) => {
  const reminders = getFromStorage(STORAGE_KEYS.MEDICATION_REMINDERS) || [];
  const newReminder = {
    id: generateUUID(),
    medication_id: medicationId,
    reminder_time: reminderTime,
    days_of_week: daysOfWeek,
    created_at: new Date().toISOString(),
  };
  reminders.push(newReminder);
  setToStorage(STORAGE_KEYS.MEDICATION_REMINDERS, reminders);
  return newReminder;
};

export const deleteReminder = (reminderId) => {
  const reminders = getFromStorage(STORAGE_KEYS.MEDICATION_REMINDERS) || [];
  const filtered = reminders.filter(r => r.id !== reminderId);
  setToStorage(STORAGE_KEYS.MEDICATION_REMINDERS, filtered);
};

// Water intake
export const getWaterIntake = (userId, date = null) => {
  const intake = getFromStorage(STORAGE_KEYS.WATER_INTAKE) || [];
  let userIntake = intake.filter(w => w.user_id === userId);
  
  if (date) {
    userIntake = userIntake.filter(w => w.date === date);
  }
  
  return userIntake;
};

export const addWaterIntake = (userId, amountMl, date) => {
  const intake = getFromStorage(STORAGE_KEYS.WATER_INTAKE) || [];
  const newIntake = {
    id: generateUUID(),
    user_id: userId,
    amount_ml: parseInt(amountMl),
    date,
    created_at: new Date().toISOString(),
  };
  intake.push(newIntake);
  setToStorage(STORAGE_KEYS.WATER_INTAKE, intake);
  return newIntake;
};

export const deleteWaterIntake = (intakeId) => {
  const intake = getFromStorage(STORAGE_KEYS.WATER_INTAKE) || [];
  const filtered = intake.filter(w => w.id !== intakeId);
  setToStorage(STORAGE_KEYS.WATER_INTAKE, filtered);
};

// Weight logs
export const getWeightLogs = (userId, startDate = null, endDate = null) => {
  const logs = getFromStorage(STORAGE_KEYS.WEIGHT_LOGS) || [];
  let userLogs = logs.filter(log => log.user_id === userId);
  
  if (startDate && endDate) {
    userLogs = userLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  }
  
  return userLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const addWeightLog = (userId, weight, date) => {
  const logs = getFromStorage(STORAGE_KEYS.WEIGHT_LOGS) || [];
  const newLog = {
    id: generateUUID(),
    user_id: userId,
    weight: parseFloat(weight),
    date,
    created_at: new Date().toISOString(),
  };
  logs.push(newLog);
  setToStorage(STORAGE_KEYS.WEIGHT_LOGS, logs);
  return newLog;
};