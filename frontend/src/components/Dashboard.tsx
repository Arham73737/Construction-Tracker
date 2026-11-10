import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, CheckCircle, Settings, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { sitesAPI } from '../services/api';
import { Site } from '@/types'; // Assuming you create a types.ts file

interface DashboardProps {
  user: any;
  supervisorId: string;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
  onAddSite: () => void;
  onSelectSite: (siteId: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, supervisorId, sites, setSites, onAddSite, onSelectSite, onLogout }) => {
  const canManage = user.role === 'admin' || user.role === 'builder';

  const supervisorNames: Record<string, string> = {
    'supervisor-1': 'John Martinez',
    'supervisor-2': 'Sarah Johnson',
  };
  const supervisorName = supervisorNames[supervisorId] || user.name || 'Admin User';

  const handleDeleteSite = async (siteId: string) => {
    if (!window.confirm("Are you sure you want to delete this site? All associated tasks will be removed.")) {
      return;
    }
    try {
      await sitesAPI.deleteSite(siteId);
      setSites(prevSites => prevSites.filter(s => s.id !== siteId));
    } catch (err) {
      console.error("Failed to delete site", err);
      alert("Failed to delete site.");
    }
  };

  const totalActiveTasks = sites.reduce((sum, s) => sum + s.activeTasks, 0);
  const totalCompletedTasks = sites.reduce((sum, s) => sum + s.completedTasks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Construction Task Tracker</h1>
              <p className="text-white/90">Welcome back, {supervisorName}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" /> Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black">
              <DropdownMenuItem onClick={onLogout}>🚪 Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardHeader><CardTitle>Total Sites</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{sites.length}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Active Tasks</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-orange-600">{totalActiveTasks}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Completed Tasks</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{totalCompletedTasks}</div></CardContent></Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Construction Sites</h2>
          {canManage && (
            <Button onClick={onAddSite} className="bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" /> Add New Site
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <Card key={site.id} className="shadow-lg hover:shadow-xl transition relative flex flex-col">
              <div onClick={() => onSelectSite(site.id)} className="cursor-pointer flex-grow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{site.name}</CardTitle>
                      <CardDescription>{site.address}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700" pr-7 >{site.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Structure:</span><span>{site.floors} floors × {site.flatsPerFloor} flats</span></div>
                    <div className="flex justify-between"><span>Active Tasks:</span><Badge className="bg-orange-50 text-orange-600">{site.activeTasks}</Badge></div>
                    <div className="flex justify-between"><span>Completed:</span><Badge className="bg-green-50 text-green-600"><CheckCircle className="h-3 w-3 mr-1" /> {site.completedTasks}</Badge></div>
                  </div>
                </CardContent>
              </div>
              {canManage && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    handleDeleteSite(site.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;