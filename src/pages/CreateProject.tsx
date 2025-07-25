import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        content: 'Project content will be added here.',
        tags: [],
        isPublic: false,
      };
      
      console.log('Creating project with data:', projectData);
      
      const newProject = await api.createProject(projectData);
      
      console.log('Full API response:', newProject);
      console.log('Response type:', typeof newProject);
      console.log('Response keys:', newProject ? Object.keys(newProject) : 'null');
      console.log('Project ID (_id):', newProject?._id);
      console.log('Project ID (id):', (newProject as any)?.id);
      
      // Check both _id and id fields (sometimes MongoDB returns id instead of _id)
      const projectId = newProject?._id || (newProject as any)?.id;
      
      if (!projectId) {
        console.error('No ID found in response:', newProject);
        throw new Error('Project was created but no ID was returned');
      }
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      // Navigate to project details page
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Create project error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
