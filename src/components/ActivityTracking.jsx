import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Activity, Flame, Clock } from 'lucide-react';

const ActivityTracking = () => {
  const [activities, setActivities] = useState([]);
  const [workout, setWorkout] = useState('');
  const [duration, setDuration] = useState('');

  const handleAddActivity = () => {
    if (!workout || !duration) return;
    
    // Simple mock calculation: roughly 5-10 calories per minute depending on workout
    const caloriesBurned = parseInt(duration) * 8; 

    setActivities([{ id: Date.now(), workout, duration, caloriesBurned }, ...activities]);
    setWorkout('');
    setDuration('');
  };

  return (
    <Card className="p-6 bg-slate-900 border-slate-700 text-white max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-primary" size={24} />
        <h2 className="text-xl font-bold">Activity Log</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <Input 
          placeholder="e.g. Running, Yoga" 
          value={workout} 
          onChange={(e) => setWorkout(e.target.value)}
          className="bg-slate-800 border-slate-700 focus:border-primary"
        />
        <Input 
          type="number" 
          placeholder="Mins" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)}
          className="bg-slate-800 border-slate-700 w-24 focus:border-primary"
        />
        <Button onClick={handleAddActivity}>Log</Button>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
            <span className="font-semibold">{act.workout}</span>
            <div className="flex gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Clock size={14}/> {act.duration}m</span>
              <span className="flex items-center gap-1 text-orange-400"><Flame size={14}/> {act.caloriesBurned} kcal</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityTracking;