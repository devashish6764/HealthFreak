import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getMedications, getReminders } from '@/utils/storage';
import { requestNotificationPermission, checkMedicationReminders } from '@/utils/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NotificationCenter = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (currentUser && notificationsEnabled) {
      loadReminders();
      
      // Check reminders every minute
      const interval = setInterval(() => {
        const medications = getMedications(currentUser.id);
        const allReminders = getReminders();
        checkMedicationReminders(medications, allReminders);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentUser, notificationsEnabled]);

  const loadReminders = () => {
    const medications = getMedications(currentUser.id);
    const allReminders = getReminders();
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = daysMap[now.getDay()];

    const upcoming = allReminders
      .filter(r => {
        const medication = medications.find(m => m.id === r.medication_id);
        if (!medication) return false;
        
        const [hours, minutes] = r.reminder_time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        
        return r.days_of_week.includes(currentDay) && reminderTime >= currentTime;
      })
      .map(r => {
        const medication = medications.find(m => m.id === r.medication_id);
        return { ...r, medication };
      })
      .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))
      .slice(0, 5);

    setUpcomingReminders(upcoming);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll receive medication reminders",
      });
      loadReminders();
    } else {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Notification Center
            </CardTitle>
            {!notificationsEnabled && (
              <Button
                onClick={handleEnableNotifications}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Enable Notifications
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!notificationsEnabled ? (
            <div className="text-center py-8">
              <BellOff className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Enable notifications to receive medication reminders</p>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">No upcoming reminders for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-400 mb-3">Upcoming Reminders Today:</p>
              {upcomingReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{reminder.medication.medication_name}</p>
                      <p className="text-sm text-gray-400">{reminder.reminder_time} - {reminder.medication.dosage}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;