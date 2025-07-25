
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Key, Code, Save, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api, type Project } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [installationGuide, setInstallationGuide] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        console.error('No project ID provided');
        setLoading(false);
        return;
      }
      
      console.log('Fetching project with ID:', id);
      
      try {
        const data = await api.getProject(id);
        console.log('Project data received:', data);
        setProject(data);
        setContent(data.content || '');
        setInstallationGuide(data.installationGuide || '');
        setSourceCodeUrl(data.sourceCodeUrl || '');
      } catch (error) {
        console.error('Fetch project error:', error);
        toast({
          title: 'Error',
          description: `Failed to load project details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
        // Navigate back to projects list if project not found
        if (error instanceof Error && error.message.includes('404')) {
          navigate('/projects');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast, navigate]);

  const handleSave = async () => {
    if (!id || !project) return;

    setSaving(true);
    try {
      await api.updateProject(id, {
        content,
        installationGuide,
        sourceCodeUrl,
      });
      
      toast({
        title: 'Success',
        description: 'Project details saved successfully.',
      });
    } catch (error) {
      console.error('Save project error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project details.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading project details...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="readme" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="readme" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              README
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readme" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation (README)</CardTitle>
                <CardDescription>
                  Write your project documentation, installation instructions, and usage guide.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content">Project Documentation</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="# Project Documentation

## Overview
Describe your project here...

## Installation
1. Step one
2. Step two

## Usage
How to use your project...

## Features
- Feature 1
- Feature 2"
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation & Setup Guide</CardTitle>
                <CardDescription>
                  Provide installation instructions, configuration details, and setup requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="installation">Installation Guide</Label>
                    <Textarea
                      id="installation"
                      value={installationGuide}
                      onChange={(e) => setInstallationGuide(e.target.value)}
                      placeholder="# Installation Guide

## Prerequisites
- Node.js 18+
- npm or yarn

## Environment Variables
Create a .env file with:
```
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

## Installation Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run the application: `npm start`

## Configuration
Additional configuration details..."
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Code</CardTitle>
                <CardDescription>
                  Add your source code repository URL and any code-related information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sourceCode">Source Code URL</Label>
                    <Textarea
                      id="sourceCode"
                      value={sourceCodeUrl}
                      onChange={(e) => setSourceCodeUrl(e.target.value)}
                      placeholder="https://github.com/username/repository

Or provide inline code examples:

```javascript
// Example code
function example() {
  console.log('Hello World');
}
```

## Code Structure
- `/src` - Source code
- `/docs` - Documentation
- `/tests` - Test files

## API Endpoints
- GET /api/users - Get all users
- POST /api/users - Create user"
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
