import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { tasksAPI } from '../services/api';

interface Site {
  id: string;
  name: string;
  address: string;
  floors: number;
  flatsPerFloor: number;
}

interface CreateTaskProps {
  floorId: string;
  siteId: string;
  sites: Site[];
  onBack: () => void;
  onSave: (tasks: any[]) => void;
}

const rooms = [
  'Living Room','Main Bedroom','Bedroom 2','Bedroom 3','Kitchen','Bathroom','Master Bathroom',
  'Balcony','Entrance','Dining Area','Study Room','Storage Room'
];

const taskCategories = [
  'general', 'painter', 'plumber', 'carpenter', 'electrician'
];

export const CreateTask = ({ floorId, siteId, sites, onBack, onSave }: CreateTaskProps) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    flat: '',
    room: '',
    category: '', // Add category to state
    priority: 'medium' as 'low' | 'medium' | 'high',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentSite = sites.find(site => site.id === siteId);
  if (!currentSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Site not found</h2>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const siteName = currentSite.name;
  const floorNumber = floorId.split('-')[1];
  const numberOfFlats = currentSite.flatsPerFloor;

  const availableFlats = Array.from({ length: numberOfFlats }, (_, i) => `A-${floorNumber}${(i + 1).toString().padStart(2, '0')}`);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTaskData({ ...taskData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setTaskData({ ...taskData, image: null });
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!taskData.title || !taskData.description || !taskData.flat || !taskData.room || !taskData.category) {
      alert('Please fill in all required fields, including task category');
      return;
    }

    setSaving(true);
    try {
      const normalizedFloorId = floorId.startsWith("floor-") ? floorId : `floor-${floorId}`;

      await tasksAPI.createTask({
        siteId,
        floorId: normalizedFloorId,
        title: taskData.title,
        description: taskData.description,
        flat: taskData.flat,
        room: taskData.room,
        category: taskData.category,
        priority: taskData.priority,
        image: taskData.image
      });

      const updatedTasks = await tasksAPI.listForFloor(siteId, normalizedFloorId);
      onSave(updatedTasks);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Task</h1>
            <p className="text-white/90">{siteName} - Floor {floorNumber}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Task Details</CardTitle>
            <CardDescription>Fill in the information for the new task assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input id="title" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} placeholder="e.g., Fix electrical wiring" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flat">Select Flat *</Label>
                <Select value={taskData.flat} onValueChange={(value) => setTaskData({ ...taskData, flat: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose flat" /></SelectTrigger>
                  <SelectContent>{availableFlats.map(flat => <SelectItem key={flat} value={flat}>{flat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Select Room *</Label>
                <Select value={taskData.room} onValueChange={(value) => setTaskData({ ...taskData, room: value })}>
                  <SelectTrigger><SelectValue placeholder="Choose room" /></SelectTrigger>
                  <SelectContent>{rooms.map(room => <SelectItem key={room} value={room}>{room}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Task Category *</Label>
              <Select value={taskData.category} onValueChange={(value) => setTaskData({ ...taskData, category: value })}>
                <SelectTrigger><SelectValue placeholder="Choose task category" /></SelectTrigger>
                <SelectContent>
                  {taskCategories.map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={taskData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setTaskData({ ...taskData, priority: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Task Description *</Label>
              <Textarea id="description" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} placeholder="Describe the task in detail..." className="min-h-[100px]" required />
            </div>

            <div className="space-y-2">
              <Label>Reference Photo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Task reference" className="w-full h-48 object-cover rounded-md" />
                    <Button variant="outline" size="sm" onClick={removeImage} className="absolute top-2 right-2 bg-white/90 hover:bg-white">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <Label htmlFor="image-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <Upload className="h-4 w-4 mr-2" /> Choose Photo
                      <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={onBack} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-lg transition-all duration-300">
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Task'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};