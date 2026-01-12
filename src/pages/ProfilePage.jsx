import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, Save, Scale, Ruler } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    weight: '',
    height: '',
    lactose_intolerant: false,
    weight_unit: 'kg',
    height_unit: 'cm',
  });

  useEffect(() => {
    if (currentUser) {
      const userProfile = getProfile(currentUser.id);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          username: userProfile.username || '',
          weight: userProfile.weight || '',
          height: userProfile.height || '',
          lactose_intolerant: userProfile.lactose_intolerant || false,
          weight_unit: userProfile.weight_unit || 'kg',
          height_unit: userProfile.height_unit || 'cm',
        });
      }
    }
  }, [currentUser]);

  const handleSave = () => {
    if (!currentUser) return;

    const updated = updateProfile(currentUser.id, formData);
    if (updated) {
      setProfile(updated);
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const convertWeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'kg' && toUnit === 'lb') return value * 2.20462;
    if (fromUnit === 'lb' && toUnit === 'kg') return value / 2.20462;
    return value;
  };

  const convertHeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'ft') return value / 30.48;
    if (fromUnit === 'ft' && toUnit === 'cm') return value * 30.48;
    return value;
  };

  const handleWeightUnitToggle = () => {
    const newUnit = formData.weight_unit === 'kg' ? 'lb' : 'kg';
    const convertedWeight = formData.weight
      ? convertWeight(parseFloat(formData.weight), formData.weight_unit, newUnit).toFixed(1)
      : '';
    setFormData({ ...formData, weight_unit: newUnit, weight: convertedWeight });
  };

  const handleHeightUnitToggle = () => {
    const newUnit = formData.height_unit === 'cm' ? 'ft' : 'cm';
    const convertedHeight = formData.height
      ? convertHeight(parseFloat(formData.height), formData.height_unit, newUnit).toFixed(1)
      : '';
    setFormData({ ...formData, height_unit: newUnit, height: convertedHeight });
  };

  return (
    <>
      <Helmet>
        <title>Profile - Health Freak</title>
        <meta name="description" content="Manage your health profile and preferences" />
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400">Manage your personal information</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-700 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your username"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    Weight
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="70"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleWeightUnitToggle}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 min-w-[60px]"
                    >
                      {formData.weight_unit}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-400" />
                    Height
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="170"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleHeightUnitToggle}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 min-w-[60px]"
                    >
                      {formData.height_unit}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lactose"
                  checked={formData.lactose_intolerant}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, lactose_intolerant: checked })
                  }
                />
                <Label
                  htmlFor="lactose"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I am lactose intolerant
                </Label>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold transition-all transform hover:scale-105"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {currentUser?.created_at
                      ? new Date(currentUser.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;