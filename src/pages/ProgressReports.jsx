import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download,TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { getFoodLogs, getWaterIntake, getWeightLogs } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



const ProgressReports = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('day');
  const [dayData, setDayData] = useState({ calories: 0, water: 0 });
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);

const exportToPDF = async () => {
    const element = document.getElementById('report-content'); 
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('HealthFreak-Monthly-Report.pdf');
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, activeTab]);

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];

    // Day view
    const todayFood = getFoodLogs(currentUser.id, today);
    const todayWater = getWaterIntake(currentUser.id, today);
    const totalCalories = todayFood.reduce((sum, log) => sum + log.calories, 0);
    const totalWater = todayWater.reduce((sum, log) => sum + log.amount_ml, 0);
    setDayData({ calories: totalCalories, water: totalWater });

    // Week view
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    const weekStats = weekDates.map(date => {
      const foodLogs = getFoodLogs(currentUser.id, date);
      const waterLogs = getWaterIntake(currentUser.id, date);
      return {
        date,
        calories: foodLogs.reduce((sum, log) => sum + log.calories, 0),
        water: waterLogs.reduce((sum, log) => sum + log.amount_ml, 0),
      };
    });
    setWeekData(weekStats);

    // Month view
    const monthDates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      monthDates.push(date.toISOString().split('T')[0]);
    }

    const monthStats = monthDates.map(date => {
      const foodLogs = getFoodLogs(currentUser.id, date);
      const waterLogs = getWaterIntake(currentUser.id, date);
      return {
        date,
        calories: foodLogs.reduce((sum, log) => sum + log.calories, 0),
        water: waterLogs.reduce((sum, log) => sum + log.amount_ml, 0),
      };
    });
    setMonthData(monthStats);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const SimpleBarChart = ({ data, dataKey, color, maxValue }) => {
    const maxVal = maxValue || Math.max(...data.map(d => d[dataKey]));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = maxVal > 0 ? (item[dataKey] / maxVal) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-16">{formatDate(item.date)}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`h-full ${color} flex items-center justify-end pr-2`}
                >
                  {item[dataKey] > 0 && (
                    <span className="text-xs font-medium text-white">{item[dataKey]}</span>
                  )}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Progress Reports - Health Freak</title>
        <meta name="description" content="Track your health progress over time" />
      </Helmet>
      <div id="report-content" className="space-y-6">
        {/* PDF Export Button */}
        <div className="flex justify-end w-full">
          <Button onClick={exportToPDF} className="gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg">
            <Download size={18} /> Export PDF Report
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Progress Reports</h1>
            <p className="text-gray-400">Track your health journey</p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-700">
            <TabsTrigger value="day" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Month
            </TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle>Calorie Intake</CardTitle>
                    <CardDescription>Today's total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        {dayData.calories}
                      </span>
                      <p className="text-gray-400 mt-2">calories</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle>Water Intake</CardTitle>
                    <CardDescription>Today's total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {dayData.water}
                      </span>
                      <p className="text-gray-400 mt-2">ml</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Calorie Intake - Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={weekData} 
                    dataKey="calories" 
                    color="bg-gradient-to-r from-cyan-500 to-purple-600"
                    maxValue={2500}
                  />
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
                  <CardTitle>Water Intake - Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={weekData} 
                    dataKey="water" 
                    color="bg-gradient-to-r from-cyan-500 to-blue-600"
                    maxValue={2500}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="month" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Calorie Intake - Last 30 Days</CardTitle>
                  <CardDescription>Average: {Math.round(monthData.reduce((sum, d) => sum + d.calories, 0) / monthData.length || 0)} cal/day</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={monthData.filter((_, i) => i % 3 === 0)} 
                    dataKey="calories" 
                    color="bg-gradient-to-r from-cyan-500 to-purple-600"
                    maxValue={2500}
                  />
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
                  <CardTitle>Water Intake - Last 30 Days</CardTitle>
                  <CardDescription>Average: {Math.round(monthData.reduce((sum, d) => sum + d.water, 0) / monthData.length || 0)} ml/day</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={monthData.filter((_, i) => i % 3 === 0)} 
                    dataKey="water" 
                    color="bg-gradient-to-r from-cyan-500 to-blue-600"
                    maxValue={2500}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProgressReports;