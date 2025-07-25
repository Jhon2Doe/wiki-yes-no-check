
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isViewMode = searchParams.get('mode') === 'view';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [installationGuide, setInstallationGuide] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  
  // README sections
  const [projectDocumentation, setProjectDocumentation] = useState('');
  const [summary, setSummary] = useState('');
  const [hardware, setHardware] = useState('');
  const [network, setNetwork] = useState('');
  const [software, setSoftware] = useState('');
  const [installationDeployment, setInstallationDeployment] = useState('');

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
        
        // Parse content into sections if it exists
        if (data.content) {
          const sections = parseContentIntoSections(data.content);
          setProjectDocumentation(sections.projectDocumentation);
          setSummary(sections.summary);
          setHardware(sections.hardware);
          setNetwork(sections.network);
          setSoftware(sections.software);
          setInstallationDeployment(sections.installationDeployment);
        }
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

  // Function to parse content into sections
  const parseContentIntoSections = (content: string) => {
    const sections = {
      projectDocumentation: '',
      summary: '',
      hardware: '',
      network: '',
      software: '',
      installationDeployment: ''
    };

    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      
      if (trimmedLine.includes('project documentation')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'projectDocumentation';
        currentContent = [];
      } else if (trimmedLine.includes('summary')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'summary';
        currentContent = [];
      } else if (trimmedLine.includes('hardware')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'hardware';
        currentContent = [];
      } else if (trimmedLine.includes('network')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'network';
        currentContent = [];
      } else if (trimmedLine.includes('software')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'software';
        currentContent = [];
      } else if (trimmedLine.includes('installation') && trimmedLine.includes('deployment')) {
        if (currentSection) sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        currentSection = 'installationDeployment';
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // Save the last section
    if (currentSection) {
      sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
    }

    return sections;
  };

  // Function to combine sections back into content
  const combineSectionsIntoContent = () => {
    const sections = [
      { title: '# Project Documentation', content: projectDocumentation },
      { title: '# Summary', content: summary },
      { title: '# Hardware', content: hardware },
      { title: '# Network', content: network },
      { title: '# Software', content: software },
      { title: '# Installation & Deployment', content: installationDeployment }
    ];

    return sections
      .filter(section => section.content.trim())
      .map(section => `${section.title}\n\n${section.content}`)
      .join('\n\n');
  };

  const handleSave = async () => {
    if (!id || !project) return;

    setSaving(true);
    try {
      // Combine sections into content before saving
      const combinedContent = combineSectionsIntoContent();
      
      await api.updateProject(id, {
        content: combinedContent,
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
            {!isViewMode && (
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documentation</CardTitle>
                  <CardDescription>
                    Overview and general documentation for your project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={projectDocumentation}
                    onChange={(e) => setProjectDocumentation(e.target.value)}
                    placeholder="Describe your project, its purpose, and general information..."
                    rows={8}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    Brief summary of the project and its key features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Project summary, key features, and objectives..."
                    rows={6}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hardware</CardTitle>
                  <CardDescription>
                    Hardware requirements and specifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={hardware}
                    onChange={(e) => setHardware(e.target.value)}
                    placeholder="Hardware requirements, specifications, compatibility..."
                    rows={6}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network</CardTitle>
                  <CardDescription>
                    Network configuration and requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    placeholder="Network requirements, configurations, ports, protocols..."
                    rows={6}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Software</CardTitle>
                  <CardDescription>
                    Software dependencies and requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={software}
                    onChange={(e) => setSoftware(e.target.value)}
                    placeholder="Software dependencies, frameworks, libraries, versions..."
                    rows={6}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Installation & Deployment</CardTitle>
                  <CardDescription>
                    Step-by-step installation and deployment instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={installationDeployment}
                    onChange={(e) => setInstallationDeployment(e.target.value)}
                    placeholder="Installation steps, deployment process, configuration..."
                    rows={8}
                    className="font-mono text-sm"
                    readOnly={isViewMode}
                  />
                </CardContent>
              </Card>
            </div>
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
                      readOnly={isViewMode}
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
                      readOnly={isViewMode}
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
