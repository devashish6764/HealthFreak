import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getWaterIntake, addWaterIntake, deleteWaterIntake } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Droplet, Trash2, Plus } from 'lucide-react';

const QUICK_AMOUNTS = [250, 500, 750, 1000];

const WaterIntake = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [waterLogs, setWaterLogs] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(2000);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentUser) {
      loadWaterLogs();
    }
  }, [currentUser]);

  const loadWaterLogs = () => {
    const logs = getWaterIntake(currentUser.id, today);
    setWaterLogs(logs);
  };

  const totalIntake = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  const percentage = Math.min((totalIntake / dailyGoal) * 100, 100);

  const handleQuickAdd = (amount) => {
    addWaterIntake(currentUser.id, amount, today);
    loadWaterLogs();
    toast({
      title: "Water logged! 💧",
      description: `Added ${amount}ml to your intake`,
    });
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addWaterIntake(currentUser.id, amount, today);
    loadWaterLogs();
    setCustomAmount('');
    toast({
      title: "Water logged! 💧",
      description: `Added ${amount}ml to your intake`,
    });
  };

  const handleDelete = (logId) => {
    deleteWaterIntake(logId);
    loadWaterLogs();
    toast({
      title: "Entry deleted",
      description: "Water intake entry removed",
    });
  };

  const handleSaveGoal = () => {
    setDailyGoal(parseInt(newGoal));
    setIsEditingGoal(false);
    toast({
      title: "Goal updated! 🎯",
      description: `Daily water goal set to ${newGoal}ml`,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-700 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#waterGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Droplet className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="text-3xl font-bold text-white">{totalIntake}</span>
                  <span className="text-sm text-gray-400">/ {dailyGoal} ml</span>
                </div>
              </div>
              <div className="text-center">
                {isEditingGoal ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      className="w-24 bg-slate-800 border-slate-700 text-white text-center"
                    />
                    <span className="text-gray-400">ml</span>
                    <Button
                      onClick={handleSaveGoal}
                      size="sm"
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditingGoal(false)}
                      size="sm"
                      variant="outline"
                      className="border-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNewGoal(dailyGoal);
                      setIsEditingGoal(true);
                    }}
                    className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    Daily Goal: {dailyGoal}ml (click to edit)
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_AMOUNTS.map((amount, index) => (
                <motion.div
                  key={amount}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Button
                    onClick={() => handleQuickAdd(amount)}
                    className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 text-cyan-300 font-semibold transition-all transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {amount}ml
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                type="number"
                placeholder="Custom amount (ml)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button
                onClick={handleCustomAdd}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader>
            <CardTitle>Today's Log</CardTitle>
          </CardHeader>
          <CardContent>
            {waterLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No water logged today</p>
            ) : (
              <div className="space-y-2">
                {waterLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Droplet className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">{log.amount_ml}ml</p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(log.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WaterIntake;