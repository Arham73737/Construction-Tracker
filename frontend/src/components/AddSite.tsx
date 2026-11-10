import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building, Save } from 'lucide-react';
import { useState } from 'react';
import { sitesAPI } from '../services/api';

interface AddSiteProps {
  onBack: () => void;
  onSave: (site: any) => void;
}

export const AddSite = ({ onBack, onSave }: AddSiteProps) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: 1,
    flatsPerFloor: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'floors' || name === 'flatsPerFloor' ? parseInt(value) || 1 : value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.floors < 1 || formData.flatsPerFloor < 1) {
      setError('Floors and flats per floor must be at least 1');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSite = await sitesAPI.createSite({
        name: formData.name.trim(),
        address: formData.address.trim(),
        floors: formData.floors,
        flatsPerFloor: formData.flatsPerFloor
      });

      // ✅ Make sure defaults exist
      const safeSite = {
        id: newSite.id,
        name: newSite.name,
        address: newSite.address,
        floors: newSite.floors,
        flatsPerFloor: newSite.flatsPerFloor,
        status: newSite.status || 'Active',
        activeTasks: newSite.activeTasks || 0,
        completedTasks: newSite.completedTasks || 0,
      };

      // ✅ Update parent Dashboard state
      onSave(safeSite);

      // ✅ Return back to Dashboard
      onBack();
    } catch (error: any) {
      console.error('Error creating site:', error);
      setError(error.message || 'Failed to create site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Add New Construction Site</h1>
                <p className="text-white/90">Enter the details for the new site</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Site Information</CardTitle>
            <CardDescription>Fill in the details for the new construction site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Riverside Apartments"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street, Downtown"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="floors">Number of Floors</Label>
                <Input
                  id="floors"
                  name="floors"
                  type="number"
                  min="1"
                  value={formData.floors}
                  onChange={handleInputChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flatsPerFloor">Flats per Floor</Label>
                <Input
                  id="flatsPerFloor"
                  name="flatsPerFloor"
                  type="number"
                  min="1"
                  value={formData.flatsPerFloor}
                  onChange={handleInputChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:shadow-lg transition-all duration-300 flex-1"
                disabled={isLoading}
              >
                <Save className="h-5 w-5 mr-2" />
                {isLoading ? 'Creating Site...' : 'Save Site'}
              </Button>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Site Name:</span> <div className="font-medium">{formData.name || 'Not set'}</div></div>
                <div><span className="text-gray-600">Address:</span> <div className="font-medium">{formData.address || 'Not set'}</div></div>
                <div><span className="text-gray-600">Total Floors:</span> <div className="font-medium">{formData.floors}</div></div>
                <div><span className="text-gray-600">Flats per Floor:</span> <div className="font-medium">{formData.flatsPerFloor}</div></div>
                <div><span className="text-gray-600">Total Flats:</span> <div className="font-medium text-blue-600">{formData.floors * formData.flatsPerFloor}</div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
