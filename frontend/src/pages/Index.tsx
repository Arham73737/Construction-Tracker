import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import { SiteDetails } from '@/components/SiteDetails';
import { TaskBoard } from '@/components/TaskBoard';
import { CreateTask } from '@/components/CreateTask';
import { AddSite } from '@/components/AddSite';
import { sitesAPI, authAPI } from '@/services/api';
import { Site } from '@/types';

type AppState = 'dashboard' | 'site-details' | 'task-board' | 'create-task' | 'add-site';

interface IndexProps {
  user: any; // Logged-in user
  sites?: Site[];
  setSites?: React.Dispatch<React.SetStateAction<Site[]>>;
  onLogout?: () => void;
}

const Index = ({ user, onLogout }: IndexProps) => {
  const [currentState, setCurrentState] = useState<AppState>('dashboard');
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSiteId, setCurrentSiteId] = useState<string>('');
  const [currentFloorId, setCurrentFloorId] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);

  // Fetch sites when the component mounts
  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const sitesData = await sitesAPI.listSites();
      setSites(sitesData);
    } catch (error) {
      console.error("Failed to fetch sites in Index:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authAPI.logout();
      window.location.reload();
    }
  };

  const handleSelectSite = (siteId: string) => {
    setCurrentSiteId(siteId);
    setTasks([]);
    setCurrentState('site-details');
  };

  const handleSelectFloor = (floorId: string, floorTasks: any[]) => {
    setCurrentFloorId(floorId);
    setTasks(floorTasks);
    setCurrentState('task-board');
  };

  const handleCreateTask = () => setCurrentState('create-task');

  const handleSaveTask = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    // Refresh sites to get updated task counters
    fetchSites();
    setCurrentState('task-board');
  };

  const handleBackToDashboard = () => {
    fetchSites();
    setCurrentState('dashboard');
  };
  const handleBackToSiteDetails = () => setCurrentState('site-details');
  const handleBackToTaskBoard = () => setCurrentState('task-board');
  const handleAddSite = () => setCurrentState('add-site');

  const handleSaveSite = (newSite: Site) => {
    setSites((prevSites) => [...prevSites, newSite]);
    setCurrentState('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-sm text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  switch (currentState) {
    case 'dashboard':
      return (
        <Dashboard
          user={user}
          supervisorId={user?.name || ''}
          sites={sites}
          setSites={setSites}
          onSelectSite={handleSelectSite}
          onLogout={handleLogout}
          onAddSite={handleAddSite}
        />
      );

    case 'site-details':
      return (
        <SiteDetails
          user={user}
          siteId={currentSiteId}
          sites={sites}
          onBack={handleBackToDashboard}
          onSelectFloor={handleSelectFloor}
        />
      );

    case 'task-board':
      return (
        <TaskBoard
          user={user}
          floorId={currentFloorId}
          siteId={currentSiteId}
          sites={sites}
          onBack={handleBackToSiteDetails}
          onCreateTask={handleCreateTask}
          tasks={tasks}
          onUpdateTasks={setTasks}
        />
      );

    case 'create-task':
      return (
        <CreateTask
          floorId={currentFloorId}
          siteId={currentSiteId}
          sites={sites}
          onBack={handleBackToTaskBoard}
          onSave={handleSaveTask}
        />
      );

    case 'add-site':
      return (
        <AddSite
          onBack={handleBackToDashboard}
          onSave={handleSaveSite}
        />
      );

    default:
      return <div>Invalid State</div>;
  }
};

export default Index;
