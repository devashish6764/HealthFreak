import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getMedications, addMedication, deleteMedication, getReminders, addReminder, deleteReminder } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Bell, Pill, Clock } from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MedicationManagement = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [addMedDialog, setAddMedDialog] = useState(false);
  const [addReminderDialog, setAddReminderDialog] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [newMed, setNewMed] = useState({ name: '', dosage: '' });
  const [newReminder, setNewReminder] = useState({ time: '', days: [] });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    const meds = getMedications(currentUser.id);
    setMedications(meds);
    const allReminders = getReminders();
    setReminders(allReminders);
  };

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addMedication(currentUser.id, newMed.name, newMed.dosage);
    loadData();
    setNewMed({ name: '', dosage: '' });
    setAddMedDialog(false);
    toast({
      title: "Medication added! 💊",
      description: `${newMed.name} has been added to your list`,
    });
  };

  const handleDeleteMedication = (medId) => {
    deleteMedication(medId);
    loadData();
    toast({
      title: "Medication deleted",
      description: "Medication and its reminders have been removed",
    });
  };

  const handleAddReminder = () => {
    if (!newReminder.time || newReminder.days.length === 0) {
      toast({
        title: "Error",
        description: "Please select time and at least one day",
        variant: "destructive",
      });
      return;
    }

    addReminder(selectedMedId, newReminder.time, newReminder.days);
    loadData();
    setNewReminder({ time: '', days: [] });
    setAddReminderDialog(false);
    toast({
      title: "Reminder added! ⏰",
      description: "You'll be notified at the scheduled time",
    });
  };

  const handleDeleteReminder = (reminderId) => {
    deleteReminder(reminderId);
    loadData();
    toast({
      title: "Reminder deleted",
      description: "Reminder has been removed",
    });
  };

  const toggleDay = (day) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getMedicationReminders = (medId) => {
    return reminders.filter(r => r.medication_id === medId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Medications</h2>
            <p className="text-gray-400">Manage your medications and reminders</p>
          </div>
        </div>
        <Dialog open={addMedDialog} onOpenChange={setAddMedDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Medication</DialogTitle>
              <DialogDescription>Enter the medication details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input
                  id="med-name"
                  placeholder="e.g., Aspirin"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 100mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddMedication}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Add Medication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card className="border-slate-700 bg-slate-900/50">
          <CardContent className="py-12 text-center">
            <Pill className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No medications added yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Medication" to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {medications.map((med, index) => {
            const medReminders = getMedicationReminders(med.id);
            
            return (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-700 bg-slate-900/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{med.medication_name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <span>{med.dosage}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={addReminderDialog && selectedMedId === med.id} onOpenChange={(open) => {
                          setAddReminderDialog(open);
                          if (open) setSelectedMedId(med.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 hover:bg-slate-800"
                              onClick={() => setSelectedMedId(med.id)}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Add Reminder
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Add Reminder</DialogTitle>
                              <DialogDescription>Set a reminder for {med.medication_name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reminder-time" className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-cyan-400" />
                                  Time
                                </Label>
                                <Input
                                  id="reminder-time"
                                  type="time"
                                  value={newReminder.time}
                                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                                  className="bg-slate-800 border-slate-700 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Days of Week</Label>
                                <div className="flex gap-2 flex-wrap">
                                  {DAYS_OF_WEEK.map(day => (
                                    <button
                                      key={day}
                                      onClick={() => toggleDay(day)}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        newReminder.days.includes(day)
                                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleAddReminder}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                              >
                                Add Reminder
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMedication(med.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {medReminders.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-400 mb-2">Reminders:</p>
                        {medReminders.map(reminder => (
                          <div
                            key={reminder.id}
                            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-cyan-400" />
                              <div>
                                <p className="text-white font-medium">{reminder.reminder_time}</p>
                                <p className="text-sm text-gray-400">{reminder.days_of_week.join(', ')}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationManagement;