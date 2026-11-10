import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CheckCircle, Clock, Plus, User, X, Paintbrush, Wrench, Hammer, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tasksAPI, authAPI } from '../services/api';
import { Site, Task, TaskStatus } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface TaskBoardProps {
  user: any;
  floorId: string;
  siteId: string;
  sites: Site[];
  onBack: () => void;
  onCreateTask: () => void;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const categoryColors: Record<string, string> = {
  painter: 'bg-purple-100 text-purple-800',
  plumber: 'bg-blue-100 text-blue-800',
  carpenter: 'bg-yellow-100 text-yellow-800',
  electrician: 'bg-orange-100 text-orange-800',
  general: 'bg-gray-200 text-gray-900',
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'painter':
      return <Paintbrush className="h-3 w-3" />;
    case 'plumber':
      return <Wrench className="h-3 w-3" />;
    case 'carpenter':
      return <Hammer className="h-3 w-3" />;
    case 'electrician':
      return <Zap className="h-3 w-3" />;
    default:
      return <Star className="h-3 w-3" />;
  }
};

export const TaskBoard = ({
  user,
  floorId,
  siteId,
  sites,
  onBack,
  onCreateTask,
  tasks: propTasks,
  onUpdateTasks,
}: TaskBoardProps) => {
  const canManage = user.role === 'admin' || user.role === 'builder';
  const currentSite = sites.find((site) => site.id === siteId);
  const [tasks, setTasks] = useState<Task[]>(propTasks);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [assignedUsersDetails, setAssignedUsersDetails] = useState<Record<string, { name: string; role: string }>>({});

  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.listForFloor(siteId, floorId);
      setTasks(data);
      onUpdateTasks(data);

      const uniqueAssignedBy = [...new Set(data.map((task) => task.assignedBy).filter(Boolean))] as string[];
      const detailsToFetch: Record<string, { name: string; role: string }> = {};

      const pendingUserIds = uniqueAssignedBy.filter((userId) => !assignedUsersDetails[userId]);

      await Promise.all(
        pendingUserIds.map(async (userId) => {
          const taskWithDetails = data.find((t) => t.assignedBy === userId && t.assignedByName);
          if (taskWithDetails) {
            detailsToFetch[userId] = {
              name: taskWithDetails.assignedByName || 'Supervisor',
              role: taskWithDetails.assignedByRole || '',
            };
            return;
          }
          try {
            const userDetails = await authAPI.getUserDetails(userId);
            detailsToFetch[userId] = { name: userDetails.name, role: userDetails.role };
          } catch (error) {
            detailsToFetch[userId] = { name: 'Supervisor', role: '' };
          }
        })
      );

      setAssignedUsersDetails((prev) => ({ ...prev, ...detailsToFetch }));
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [siteId, floorId]);

  const markTaskComplete = async (taskId: string) => {
    try {
      await tasksAPI.updateStatus(taskId, 'completed');
      fetchTasks();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.deleteTask(taskId);
      fetchTasks();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete task');
    }
  };

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

  const floorNumber = floorId.replace('floor-', '');
  const filteredTasks = tasks.filter((task) => filter === 'all' || task.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" className="text-white border-white/20 bg-white/10 hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Floor {floorNumber} Tasks</h1>
                <p className="text-white/90">{currentSite.name}</p>
              </div>
            </div>
            {canManage && (
              <Button onClick={onCreateTask} className="text-white border-white/20 bg-white/10 hover:bg-white/20">
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              onClick={() => setFilter(type)}
              className={filter === type ? 'bg-gradient-to-r from-blue-600 to-orange-600' : ''}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({tasks.filter((t) => type === 'all' || t.status === type).length})
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const assignedUser =
              (task.assignedByName
                ? { name: task.assignedByName, role: task.assignedByRole || '' }
                : assignedUsersDetails[task.assignedBy]) || { name: 'Supervisor', role: '' };
            const formattedDate = task.dateAssigned ? new Date(task.dateAssigned).toLocaleDateString() : 'N/A';
            const category = task.category?.toLowerCase() || 'general';

            // Resolve full image URL cleanly
            const fullImageUrl = task.imageUrl
              ? task.imageUrl.startsWith('http')
                ? task.imageUrl
                : `${API_BASE.replace(/\/api$/, '')}${task.imageUrl}`
              : null;

            return (
              <Card key={task.id} className="shadow-lg flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{task.title}</CardTitle>
                      <CardDescription>{task.flat} - {task.room}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${categoryColors[category] || categoryColors.general} flex items-center gap-1 capitalize`}>
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                      </Badge>
                      <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div className="flex-grow">
                    {fullImageUrl && (
                      <img
                        src={fullImageUrl}
                        alt="Task reference"
                        className="rounded-md w-full h-36 object-cover mb-4 border"
                      />
                    )}
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      {task.assignedBy && (
                        <div>
                          <User className="inline h-4 w-4 mr-1" />
                          <span className="font-semibold capitalize">{assignedUser.name}</span>
                          {assignedUser.role && <span className="ml-1 text-gray-400 capitalize">({assignedUser.role})</span>}
                        </div>
                      )}
                      <div>
                        <Calendar className="inline h-4 w-4 mr-1" /> {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2">
                    {task.status !== 'completed' && (
                      <Button
                        onClick={() => markTaskComplete(task.id)}
                        variant="outline"
                        className="w-full text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as Complete
                      </Button>
                    )}
                    {canManage && (
                      <Button onClick={() => deleteTask(task.id)} variant="destructive" className="w-full">
                        <X className="h-4 w-4 mr-2" /> Delete Task
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};
