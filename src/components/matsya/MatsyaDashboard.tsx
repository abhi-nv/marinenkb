import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Dna, 
  Camera, 
  Upload, 
  Activity, 
  Globe, 
  Fish, 
  Waves,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import SpeciesIdentification from './SpeciesIdentification';
import eDNAAnalysis from './eDNAAnalysis';
import DataIngestion from './DataIngestion';
import { matsyaAPI } from '@/services/matsyaAPI';

export const MatsyaDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const healthResponse = await matsyaAPI.getSystemHealth();
      if (healthResponse.success) {
        setSystemHealth(healthResponse.data);
      }
      
      // Mock recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'species_identification',
          description: 'Species identified: Thunnus albacares',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'data_ingestion',
          description: 'OBIS dataset processed: 1,250 records',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'edna_analysis',
          description: 'eDNA sequence analyzed: 12S rRNA marker',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'completed'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'species_identification': return <Camera className="w-4 h-4" />;
      case 'data_ingestion': return <Upload className="w-4 h-4" />;
      case 'edna_analysis': return <Dna className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">MATSYA Platform</h1>
        <p className="text-muted-foreground">
          AI-Driven Unified Data Platform for Oceanographic, Fisheries, and Molecular Biodiversity Insights
        </p>
      </div>

      {/* System Status */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Version {systemHealth.version} • Uptime: {Math.floor(systemHealth.uptime / 3600)}h
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {Object.entries(systemHealth.services).map(([service, info]: [string, any]) => (
                <div key={service} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-sm font-medium ${info.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {service.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {info.responseTime}ms
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marine Records</p>
                <p className="text-2xl font-bold">2.1M+</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Species Identified</p>
                <p className="text-2xl font-bold">45K+</p>
              </div>
              <Fish className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">eDNA Sequences</p>
                <p className="text-2xl font-bold">12K+</p>
              </div>
              <Dna className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Globe className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="species-id">Species ID</TabsTrigger>
          <TabsTrigger value="edna">eDNA Analysis</TabsTrigger>
          <TabsTrigger value="ingestion">Data Ingestion</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform operations and analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mt-0.5">
                        {getActivityIcon(activity.type)}
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Integrated Data Sources</CardTitle>
                <CardDescription>Connected marine biodiversity databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'OBIS Global', records: '100M+', status: 'active' },
                    { name: 'GBIF', records: '2B+', status: 'active' },
                    { name: 'EMODnet Biology', records: '800K+', status: 'active' },
                    { name: 'WoRMS', records: '400K+', status: 'active' },
                    { name: 'IndOBIS', records: '50K+', status: 'active' },
                    { name: 'Real-time Sensors', records: 'Live', status: 'active' }
                  ].map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-gray-600">{source.records} records</p>
                      </div>
                      <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                        {source.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">AI Species Identification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  CNN-based models for automated species identification from images
                </p>
                <Button variant="outline" size="sm">
                  Try Now
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Dna className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">eDNA Sequence Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  BERT-like models for DNA sequence matching and identification
                </p>
                <Button variant="outline" size="sm">
                  Analyze
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Data Ingestion</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Multi-format data processing with automated validation
                </p>
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="species-id">
          <SpeciesIdentification />
        </TabsContent>

        <TabsContent value="edna">
          <eDNAAnalysis />
        </TabsContent>

        <TabsContent value="ingestion">
          <DataIngestion />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>
                Ecosystem analysis, correlation studies, and predictive modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Advanced analytics features are currently in development. This will include ecosystem analysis, 
                  environmental correlation studies, time series forecasting, and graph-based relationship modeling.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatsyaDashboard;