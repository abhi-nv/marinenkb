import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Database, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { matsyaAPI } from '@/services/matsyaAPI';
import { DataIngestionRequest, DataIngestionResponse } from '@/types/matsya';

export const DataIngestion: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'csv' | 'json' | 'dwc-a' | 'obis-env'>('csv');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DataIngestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata fields
  const [source, setSource] = useState('');
  const [contributor, setContributor] = useState('');
  const [license, setLicense] = useState('CC-BY');
  const [citation, setCitation] = useState('');
  
  // Validation settings
  const [strictValidation, setStrictValidation] = useState(true);
  const [skipErrors, setSkipErrors] = useState(false);
  
  // Field mapping
  const [fieldMapping, setFieldMapping] = useState('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
      
      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') setFormat('csv');
      else if (extension === 'json') setFormat('json');
      else if (extension === 'zip') setFormat('dwc-a');
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!source.trim()) {
      setError('Please specify the data source');
      return;
    }

    if (!contributor.trim()) {
      setError('Please specify the contributor');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const request: DataIngestionRequest = {
        format,
        data: selectedFile,
        mapping: fieldMapping.trim() ? JSON.parse(fieldMapping) : undefined,
        validation: {
          strict: strictValidation,
          skipErrors: skipErrors,
        },
        metadata: {
          source: source.trim(),
          contributor: contributor.trim(),
          license,
          citation: citation.trim() || undefined,
        }
      };

      const response = await matsyaAPI.ingestData(request);
      
      if (response.success && response.data) {
        setUploadResult(response.data);
        
        // Poll for status updates if processing
        if (response.data.status === 'queued' || response.data.status === 'processing') {
          pollIngestionStatus(response.data.jobId);
        }
      } else {
        setError(response.error?.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const pollIngestionStatus = async (jobId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await matsyaAPI.getIngestionStatus(jobId);
        
        if (response.success && response.data) {
          setUploadResult(response.data);
          
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            return; // Stop polling
          }
          
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 10000); // Poll every 10 seconds
          }
        }
      } catch (err) {
        console.error('Failed to poll ingestion status:', err);
      }
    };

    setTimeout(poll, 5000); // Start polling after 5 seconds
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      case 'queued': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'queued': return <Upload className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDescription = {
    csv: 'Comma-separated values with headers',
    json: 'JSON format with array of records',
    'dwc-a': 'Darwin Core Archive (ZIP file)',
    'obis-env': 'OBIS-ENV format for environmental data'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Ingestion Pipeline
          </CardTitle>
          <CardDescription>
            Upload and process marine biodiversity data in multiple formats with automated validation and standardization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="data-file">Select Data File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="data-file"
                type="file"
                accept=".csv,.json,.zip"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="dwc-a">DwC-A</SelectItem>
                  <SelectItem value="obis-env">OBIS-ENV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500">
              {formatDescription[format]}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h4 className="font-medium">Dataset Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Data Source *</Label>
                <Input
                  id="source"
                  placeholder="e.g., OBIS, Research Vessel Survey"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contributor">Contributor *</Label>
                <Input
                  id="contributor"
                  placeholder="e.g., Marine Research Institute"
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <Select value={license} onValueChange={setLicense}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC-BY">CC-BY</SelectItem>
                    <SelectItem value="CC-BY-SA">CC-BY-SA</SelectItem>
                    <SelectItem value="CC-BY-NC">CC-BY-NC</SelectItem>
                    <SelectItem value="CC0">CC0 (Public Domain)</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="citation">Citation (optional)</Label>
              <Textarea
                id="citation"
                placeholder="How should this dataset be cited?"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Validation Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Validation Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="strict-validation">Strict Validation</Label>
                  <p className="text-xs text-gray-500">Enforce all data quality rules</p>
                </div>
                <Switch
                  id="strict-validation"
                  checked={strictValidation}
                  onCheckedChange={setStrictValidation}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skip-errors">Skip Invalid Records</Label>
                  <p className="text-xs text-gray-500">Continue processing when errors are found</p>
                </div>
                <Switch
                  id="skip-errors"
                  checked={skipErrors}
                  onCheckedChange={setSkipErrors}
                />
              </div>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="space-y-2">
            <Label htmlFor="field-mapping">Field Mapping (optional)</Label>
            <Textarea
              id="field-mapping"
              placeholder='{"source_field": "target_field", "lat": "decimalLatitude", "lng": "decimalLongitude"}'
              value={fieldMapping}
              onChange={(e) => setFieldMapping(e.target.value)}
              rows={3}
              className="font-mono text-sm"
            />
            <div className="text-xs text-gray-500">
              JSON object mapping source fields to Darwin Core terms
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading and Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Ingest Data
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(uploadResult.status)}
                  Ingestion Status
                </CardTitle>
                <CardDescription>
                  Job ID: {uploadResult.jobId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={uploadResult.status === 'completed' ? 'default' : 
                                uploadResult.status === 'failed' ? 'destructive' : 'secondary'}>
                    {uploadResult.status.toUpperCase()}
                  </Badge>
                  {uploadResult.processingTime && (
                    <span className="text-sm text-gray-500">
                      Completed in {uploadResult.processingTime}ms
                    </span>
                  )}
                </div>

                {/* Processing Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.recordsProcessed.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Records Processed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.recordsValid.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Valid Records</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.recordsInvalid.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Invalid Records</div>
                  </div>
                </div>

                {/* Data Quality Report */}
                {uploadResult.dataQualityReport && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Data Quality Assessment</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completeness</span>
                        <span className="text-sm font-medium">
                          {(uploadResult.dataQualityReport.completeness * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={uploadResult.dataQualityReport.completeness * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-sm font-medium">
                          {(uploadResult.dataQualityReport.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={uploadResult.dataQualityReport.accuracy * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Consistency</span>
                        <span className="text-sm font-medium">
                          {(uploadResult.dataQualityReport.consistency * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={uploadResult.dataQualityReport.consistency * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Validity</span>
                        <span className="text-sm font-medium">
                          {(uploadResult.dataQualityReport.validity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={uploadResult.dataQualityReport.validity * 100} className="h-2" />
                    </div>
                  </div>
                )}

                {/* Errors */}
                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-red-600">
                      Validation Errors ({uploadResult.errors.length})
                    </h5>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uploadResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-xs p-2 bg-red-50 rounded border-l-2 border-red-200">
                          <span className="font-medium">Row {error.row}, Field {error.field}:</span> {error.message}
                        </div>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <div className="text-xs text-gray-500 text-center">
                          ... and {uploadResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataIngestion;