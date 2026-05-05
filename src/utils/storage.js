// We use two separate keys: one for the "Database" of all users, and one for the active login.
const USERS_DATABASE_KEY = 'healthfreak_all_users';
const ACTIVE_SESSION_KEY = 'healthfreak_current_user';

// --- HELPER FUNCTIONS ---
// Grabs the full list of registered users
const getAllUsers = () => {
  const users = localStorage.getItem(USERS_DATABASE_KEY);
  return users ? JSON.parse(users) : [];
};

// Saves the full list back to memory
const saveAllUsers = (users) => {
  localStorage.setItem(USERS_DATABASE_KEY, JSON.stringify(users));
};

// --- AUTHENTICATION FUNCTIONS ---

export const createUser = (email, password, name) => {
  const users = getAllUsers();
  
  // 1. Check if the email is already taken
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  // 2. Create the new profile
  const newUser = {
    id: Date.now().toString(),
    email: email,
    password: password, 
    name: name,
    createdAt: new Date().toISOString()
  };

  // 3. Add to our "database" and save
  users.push(newUser);
  saveAllUsers(users);

  // 4. Log the user in automatically
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));
  
  return { user: newUser };
};

export const loginUser = (email, password) => {
  const users = getAllUsers();
  
  // 1. Find the user in our database
  const user = users.find(u => u.email === email);
  
  // 2. Verify they exist and the password matches
  if (!user) {
    throw new Error("No account found with this email. Please create a profile.");
  }
  
  if (user.password !== password) {
    throw new Error("Incorrect password. Please try again.");
  }

  // 3. Set them as the active logged-in user
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = () => {
  // Checks if someone is currently logged in when the app loads
  const session = localStorage.getItem(ACTIVE_SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const logoutUser = () => {
  // Only deletes the active session, NOT the user's profile from the database!
  localStorage.removeItem(ACTIVE_SESSION_KEY);
};
// ==========================================
// APP DATA STORAGE (Food & Activity Tracking)
// ==========================================

const FOOD_LOGS_KEY = 'healthfreak_food_logs';

 export const getFoodLogs = () => {
  const session = localStorage.getItem('healthfreak_current_user');
  if (!session) return [];
  const currentUser = JSON.parse(session);

  const allLogsRaw = localStorage.getItem('healthfreak_food_logs');
  const allLogs = allLogsRaw ? JSON.parse(allLogsRaw) : [];

  // Only return meals that match the current user's ID
  return allLogs.filter(log => log.userId === currentUser.id);
};

// Add a new food log
export const addFoodLog = (logData) => {
  const session = localStorage.getItem('healthfreak_current_user');
  if (!session) return null;
  const currentUser = JSON.parse(session);

  const logs = getFoodLogs();
  
  const newLog = {
    ...logData,
    id: Date.now().toString(),
    userId: currentUser.id, // Tag the meal with the User's ID
    createdAt: new Date().toISOString()
  };
  
  logs.push(newLog);
  localStorage.setItem('healthfreak_food_logs', JSON.stringify(logs));
  
  return newLog;
};

// You might also need these if ActivityTracking.jsx looks for them!
const ACTIVITY_LOGS_KEY = 'healthfreak_activity_logs';

export const getActivityLogs = () => {
  const logs = localStorage.getItem(ACTIVITY_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const addActivityLog = (logData) => {
  const logs = getActivityLogs();
  const newLog = {
    ...logData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  logs.push(newLog);
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(logs));
  return newLog;
};
// Delete a food log by ID
export const deleteFoodLog = (id) => {
  const logs = getFoodLogs();
  // Keep everything EXCEPT the log with the matching ID
  const updatedLogs = logs.filter(log => log.id !== id);
  localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(updatedLogs));
  return updatedLogs;
};

// Delete an activity log by ID (Adding this just in case your Activity page needs it!)
export const deleteActivityLog = (id) => {
  const logs = getActivityLogs();
  const updatedLogs = logs.filter(log => log.id !== id);
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updatedLogs));
  return updatedLogs;
};
// ==========================================
// MEDICATION TRACKING
// ==========================================

const MEDICATIONS_KEY = 'healthfreak_medications';

// Get all medications
export const getMedications = () => {
  const meds = localStorage.getItem(MEDICATIONS_KEY);
  return meds ? JSON.parse(meds) : [];
};

// Add a new medication
export const addMedication = (medData) => {
  const meds = getMedications();
  
  const newMed = {
    ...medData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  meds.push(newMed);
  localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(meds));
  
  return newMed;
};

// Delete a medication
export const deleteMedication = (id) => {
  const meds = getMedications();
  const updatedMeds = meds.filter(med => med.id !== id);
  localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMeds));
  return updatedMeds;
};
// ==========================================
// REMINDERS
// ==========================================

const REMINDERS_KEY = 'healthfreak_reminders';

// Get all reminders
export const getReminders = () => {
  const reminders = localStorage.getItem(REMINDERS_KEY);
  return reminders ? JSON.parse(reminders) : [];
};

// Add a new reminder
export const addReminder = (reminderData) => {
  const reminders = getReminders();
  
  const newReminder = {
    ...reminderData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  reminders.push(newReminder);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  
  return newReminder;
};

// Delete a reminder
export const deleteReminder = (id) => {
  const reminders = getReminders();
  const updatedReminders = reminders.filter(reminder => reminder.id !== id);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(updatedReminders));
  return updatedReminders;
};
// ==========================================
// WATER INTAKE TRACKING
// ==========================================

const WATER_INTAKE_KEY = 'healthfreak_water_intake';

// Get all water intake logs
export const getWaterIntake = () => {
  const logs = localStorage.getItem(WATER_INTAKE_KEY);
  return logs ? JSON.parse(logs) : [];
};

// Add a new water intake log (This is the one your app is begging for!)
export const addWaterIntake = (intakeData) => {
  const logs = getWaterIntake();
  
  const newLog = {
    ...intakeData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  logs.push(newLog);
  localStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(logs));
  
  return newLog;
};

// Delete a water intake log
export const deleteWaterIntake = (id) => {
  const logs = getWaterIntake();
  const updatedLogs = logs.filter(log => log.id !== id);
  localStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(updatedLogs));
  return updatedLogs;
};
// ==========================================
// WEIGHT TRACKING
// ==========================================

const WEIGHT_LOGS_KEY = 'healthfreak_weight_logs';

// Get all weight logs (This is the exact function causing the error!)
export const getWeightLogs = () => {
  const logs = localStorage.getItem(WEIGHT_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

// Add a new weight log
export const addWeightLog = (logData) => {
  const logs = getWeightLogs();
  
  const newLog = {
    ...logData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  logs.push(newLog);
  localStorage.setItem(WEIGHT_LOGS_KEY, JSON.stringify(logs));
  
  return newLog;
};

// Delete a weight log
export const deleteWeightLog = (id) => {
  const logs = getWeightLogs();
  const updatedLogs = logs.filter(log => log.id !== id);
  localStorage.setItem(WEIGHT_LOGS_KEY, JSON.stringify(updatedLogs));
  return updatedLogs;
};
// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

// Get the active user's profile
export const getProfile = () => {
  const session = localStorage.getItem('healthfreak_current_user');
  return session ? JSON.parse(session) : null;
};

// Update the active user's profile (Adding this to prevent a crash when you click Save!)
export const updateProfile = (updatedData) => {
  const session = localStorage.getItem('healthfreak_current_user');
  if (!session) return null;

  let currentUser = JSON.parse(session);
  
  // Merge the new changes (like a new profile picture or updated weight)
  currentUser = { ...currentUser, ...updatedData };
  
  // 1. Save to the active session
  localStorage.setItem('healthfreak_current_user', JSON.stringify(currentUser));

  // 2. Save back to the main database so changes aren't lost when you log out!
  const usersRaw = localStorage.getItem('healthfreak_all_users');
  if (usersRaw) {
    const users = JSON.parse(usersRaw);
    const updatedUsers = users.map(u => u.id === currentUser.id ? currentUser : u);
    localStorage.setItem('healthfreak_all_users', JSON.stringify(updatedUsers));
  }

  return currentUser;
};