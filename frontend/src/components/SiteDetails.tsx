import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Plus, Eye, Wrench } from 'lucide-react';
import { tasksAPI } from "../services/api";
import { Site } from '@/types';

interface SiteDetailsProps {
  user: any;
  siteId: string;
  sites: Site[];
  onBack: () => void;
  onSelectFloor: (floorId: string, tasks: any[]) => void;
}

export const SiteDetails = ({ user, siteId, sites, onBack, onSelectFloor }: SiteDetailsProps) => {
  const canManage = user.role === 'admin' || user.role === 'builder';
  const site = sites.find(s => s.id === siteId);
  const [floorTasks, setFloorTasks] = useState<{ [key: string]: { active: number; completed: number; tasks: any[] } }>({});

  useEffect(() => {
    const fetchTasks = async () => {
      if (!site) return;
      try {
        // Fetch all site tasks in a single request instead of N sequential floor requests
        const allTasks = await tasksAPI.listForSite(siteId);
        const newFloorTasks: any = {};
        for (let i = 1; i <= site.floors; i++) {
          const floorId = `floor-${i}`;
          const floorTasksList = allTasks.filter(
            (t: any) => t.floorId === floorId || t.floorId === `${i}`
          );
          const active = floorTasksList.filter((t: any) => t.status !== "completed").length;
          const completed = floorTasksList.length - active;
          newFloorTasks[floorId] = { active, completed, tasks: floorTasksList };
        }
        setFloorTasks(newFloorTasks);
      } catch (e) {
        console.error("Failed to fetch tasks for site:", siteId, e);
      }
    };
    if (site) {
      fetchTasks();
    }
  }, [siteId, site]);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Site not found</h2>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const totalActiveTasks = Object.values(floorTasks).reduce((sum, f) => sum + (f?.active || 0), 0);
  const totalCompletedTasks = Object.values(floorTasks).reduce((sum, f) => sum + (f?.completed || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">{site.name}</h1>
                <p className="text-white/90">{site.address}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="text-lg">Site Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><span className="text-sm text-gray-600">Total Floors:</span><div className="font-semibold">{site.floors}</div></div>
              <div><span className="text-sm text-gray-600">Flats per Floor:</span><div className="font-semibold">{site.flatsPerFloor}</div></div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader><CardTitle className="text-lg">Your Task Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><span className="text-sm text-gray-600">Active Tasks:</span><div className="font-semibold text-orange-600">{totalActiveTasks}</div></div>
              <div><span className="text-sm text-gray-600">Completed Tasks:</span><div className="font-semibold text-green-600">{totalCompletedTasks}</div></div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6">Floor Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: site.floors }, (_, index) => {
              const floorNumber = site.floors - index;
              const floorId = `floor-${floorNumber}`;
              const floorData = floorTasks[floorId] || { active: 0, completed: 0, tasks: [] };
              const totalWorkerTasksOnFloor = floorData.active + floorData.completed;

              // Hide the floor from workers if they have no tasks there
              if (canManage || totalWorkerTasksOnFloor > 0) {
                return (
                  <Card
                    key={floorId}
                    className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => onSelectFloor(floorId, floorData.tasks)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Floor {floorNumber}</CardTitle>
                        {canManage ? (
                           <Badge variant="secondary" className="bg-blue-100 text-blue-700">{site.flatsPerFloor} flats</Badge>
                        ) : (
                           <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center"><Wrench className="h-3 w-3 mr-1" /> {totalWorkerTasksOnFloor} Tasks</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Active Tasks:</span><Badge variant="outline" className="bg-orange-50 text-orange-600">{floorData.active}</Badge></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Completed:</span><Badge variant="outline" className="bg-green-50 text-green-600">{floorData.completed}</Badge></div>
                        <Button variant="outline" size="sm" className="w-full mt-3"><Eye className="h-4 w-4 mr-2" /> View Tasks</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your construction site efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                {canManage && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-lg"
                    onClick={() => onSelectFloor(`floor-${site.floors}`, floorTasks[`floor-${site.floors}`]?.tasks || [])}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Task
                  </Button>
                )}
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
