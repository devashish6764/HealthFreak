// Notification service for medication reminders and water intake alerts

let notificationPermission = 'default';

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    notificationPermission = permission;
    return permission === 'granted';
  }
  return false;
};

export const sendNotification = (title, options = {}) => {
  if (notificationPermission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
};

export const checkMedicationReminders = (medications, reminders) => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayName = daysMap[currentDay];

  reminders.forEach(reminder => {
    if (reminder.reminder_time === currentTime && reminder.days_of_week.includes(currentDayName)) {
      const medication = medications.find(m => m.id === reminder.medication_id);
      if (medication) {
        sendNotification('💊 Medication Reminder', {
          body: `Time to take ${medication.medication_name} (${medication.dosage})`,
          tag: `med-${reminder.id}`,
        });
      }
    }
  });
};

export const checkWaterIntakeGoal = (currentIntake, goal) => {
  const percentage = (currentIntake / goal) * 100;
  
  if (percentage < 50 && new Date().getHours() >= 12) {
    sendNotification('💧 Water Reminder', {
      body: `You've only had ${currentIntake}ml of water today. Stay hydrated!`,
      tag: 'water-reminder',
    });
  }
};

// Initialize notification permission on load
if ('Notification' in window) {
  notificationPermission = Notification.permission;
}