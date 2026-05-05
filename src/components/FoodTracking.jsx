import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getFoodLogs, addFoodLog, deleteFoodLog } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Camera, Trash2, Coffee, Utensils, Cookie, Moon, ChevronDown, ChevronUp } from 'lucide-react';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'from-amber-500 to-orange-600' },
  { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'from-cyan-500 to-blue-600' },
  { id: 'snacks', label: 'Snacks', icon: Cookie, color: 'from-lime-500 to-green-600' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: 'from-purple-500 to-pink-600' },
];

const FoodTracking = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Add this line
  const [foodLogs, setFoodLogs] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(2000);
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: true,
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentMealType, setCurrentMealType] = useState('');
  const [newFood, setNewFood] = useState({ name: '', calories: '' });

  const today = new Date().toISOString().split('T')[0];

  // Load logs on mount or when user changes
  const loadFoodLogs = () => {
    // Our updated storage.js automatically grabs the right user's logs
    const logs = getFoodLogs();
    setFoodLogs(logs);
  };
  // This function simulates sending the image to an AI API
  // Connects to LogMeal API to analyze the uploaded image
  const analyzeFoodImage = async (imageFile) => {
    setIsAnalyzing(true);
    
    // Paste your actual LogMeal API token here! 
    // (Note: Read the security tip below after testing this)
    const LOGMEAL_API_TOKEN = import.meta.env.VITE_LOGMEAL_API_KEY; 

    try {
      // --- STEP 1: Send image to identify the food ---
      const formData = new FormData();
      formData.append('image', imageFile);

      const recognitionResponse = await fetch('https://api.logmeal.es/v2/recognition/dish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOGMEAL_API_TOKEN}`
        },
        body: formData
      });

      if (!recognitionResponse.ok) throw new Error("Failed to recognize food");
      const recognitionData = await recognitionResponse.json();

      // Grab the best guess from the AI and the unique ID for the picture
      const dishName = recognitionData.recognition_results[0].name;
      const imageId = recognitionData.imageId;

      // --- STEP 2: Ask for the calories using that image ID ---
      const nutritionResponse = await fetch('https://api.logmeal.es/v2/recipe/nutritionalInfo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOGMEAL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageId: imageId })
      });

      if (!nutritionResponse.ok) throw new Error("Failed to get nutrition info");
      const nutritionData = await nutritionResponse.json();

      // Extract the calories (LogMeal usually returns a precise decimal, so we round it)
      const calories = Math.round(nutritionData.nutritional_info.calories);

      // --- STEP 3: Auto-fill your UI! ---
      setNewFood({ 
        // Capitalize the first letter so it looks nice (e.g., "grilled chicken")
        name: dishName.charAt(0).toUpperCase() + dishName.slice(1), 
        calories: calories.toString() 
      });
      
      toast({
        title: "Scan Complete! 🤖",
        description: "AI successfully identified your food.",
      });

    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({
        title: "Scan Failed",
        description: "Could not identify the food. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFoodLogs();
    }
  }, [currentUser]);

  // Safe Math Calculations
  const totalCalories = Array.isArray(foodLogs) 
    ? foodLogs.reduce((sum, log) => sum + (Number(log.calories) || 0), 0) 
    : 0;
    
  const caloriePercentage = Math.min((totalCalories / dailyGoal) * 100, 100);

  // Cleaned up Add Food Function
  const handleAddFood = () => {
    if (!newFood.name || !newFood.calories) {
      toast({ title: "Missing Info", description: "Please enter a name and calories." });
      return;
    }

    addFoodLog({
      food_name: newFood.name, // Saving as food_name to match your UI below
      calories: parseFloat(newFood.calories),
      meal_type: currentMealType,
      date: today
    });

    loadFoodLogs(); // Refresh the screen instantly
    
    // Reset Form
    setCapturedImage(null);
    setNewFood({ name: '', calories: '' });
    setDialogOpen(false);
    
    toast({
      title: "Food added! 🍽️",
      description: `${newFood.name} has been logged`,
    });
  };

  const handleDeleteFood = (logId) => {
    deleteFoodLog(logId);
    loadFoodLogs();
    toast({
      title: "Food deleted",
      description: "Entry removed from your log",
    });
  };

  const handleSaveGoal = () => {
    setDailyGoal(parseInt(newGoal) || 2000);
    setIsEditingGoal(false);
    toast({
      title: "Goal updated! 🎯",
      description: `Daily calorie goal set to ${newGoal}`,
    });
  };

  const getMealLogs = (mealType) => {
    return (Array.isArray(foodLogs) ? foodLogs : []).filter(log => log.meal_type === mealType);
  };

  const getMealCalories = (mealType) => {
    return getMealLogs(mealType).reduce((sum, log) => sum + (Number(log.calories) || 0), 0);
  };

  const toggleMeal = (mealType) => {
    setExpandedMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        id="global-food-camera" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={(e) => {
           const file = e.target.files[0];
           if (file) {
             // 1. Show the picture in the UI immediately
             setCapturedImage(URL.createObjectURL(file)); 
             setDialogOpen(true); 
             
             // 2. Start the AI analysis!
             analyzeFoodImage(file);
           }
        }}
      />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-slate-700 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="12" fill="none" />
                  <circle
                    cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - caloriePercentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d9ff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{totalCalories}</span>
                  <span className="text-sm text-gray-400">/ {dailyGoal}</span>
                  <span className="text-xs text-gray-500 mt-1">calories</span>
                </div>
              </div>
              <div className="text-center">
                {isEditingGoal ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
                      className="w-24 bg-slate-800 border-slate-700 text-white text-center"
                    />
                    <Button onClick={handleSaveGoal} size="sm" className="bg-cyan-500 hover:bg-cyan-600">Save</Button>
                    <Button onClick={() => setIsEditingGoal(false)} size="sm" variant="outline" className="border-slate-700">Cancel</Button>
                  </div>
                ) : (
                  <button onClick={() => { setNewGoal(dailyGoal); setIsEditingGoal(true); }} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                    Daily Goal: {dailyGoal} cal (click to edit)
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4">
        {MEAL_TYPES.map((meal, index) => {
          const MealIcon = meal.icon;
          const mealLogs = getMealLogs(meal.id);
          const mealCalories = getMealCalories(meal.id);
          const isExpanded = expandedMeals[meal.id];

          return (
            <motion.div key={meal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-slate-700 bg-slate-900/50 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
                <CardHeader className="cursor-pointer" onClick={() => toggleMeal(meal.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meal.color} flex items-center justify-center`}>
                        <MealIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{meal.label}</CardTitle>
                        <p className="text-sm text-gray-400">{mealCalories} calories</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="w-8 h-8 rounded-full bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 p-0 mr-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMealType(meal.id);
                          document.getElementById('global-food-camera').click();
                        }}
                      >
                        <Camera size={14} />
                      </Button>
                      
                      <Dialog open={dialogOpen && currentMealType === meal.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setCurrentMealType(meal.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                            onClick={(e) => { e.stopPropagation(); setCurrentMealType(meal.id); }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Add Food to {meal.label}</DialogTitle>
                            <DialogDescription>Enter the food details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
               {capturedImage && (
                 <div className="w-full flex justify-center mb-2 relative">
                   <img src={capturedImage} alt="Food" className="h-32 object-cover rounded-lg border border-slate-700" />
                   
                   {/* SHOW THIS WHEN AI IS THINKING */}
                   {isAnalyzing && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-lg">
                       <span className="text-cyan-400 font-medium animate-pulse">Analyzing food... 🔍</span>
                     </div>
                   )}
                 </div>
               )}
               
               <div className="space-y-2">
                 <Label htmlFor="food-name">Food Name</Label>
                 <Input
                   id="food-name" 
                   placeholder={isAnalyzing ? "AI is guessing..." : "e.g., Grilled Chicken"}
                   value={newFood.name} 
                   onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                   className="bg-slate-800 border-slate-700 text-white"
                   disabled={isAnalyzing} // Lock input while thinking
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="calories">Calories</Label>
                 <Input
                   id="calories" 
                   type="number" 
                   placeholder={isAnalyzing ? "..." : "e.g., 250"}
                   value={newFood.calories} 
                   onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                   className="bg-slate-800 border-slate-700 text-white"
                   disabled={isAnalyzing} // Lock input while thinking
                 />
               </div>
             </div>
                          <DialogFooter>
                            <Button onClick={handleAddFood} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                              Add Food
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <CardContent>
                        {mealLogs.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No food logged yet</p>
                        ) : (
                          <div className="space-y-2">
                            {mealLogs.map((log) => (
                              <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                                <div>
                                  <p className="text-white font-medium">{log.food_name || log.name}</p>
                                  <p className="text-sm text-gray-400">{log.calories} cal</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteFood(log.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FoodTracking;