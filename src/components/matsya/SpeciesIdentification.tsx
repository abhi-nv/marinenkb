import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, Microscope, Fish, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { matsyaAPI } from '@/services/matsyaAPI';
import { SpeciesIdentificationRequest, SpeciesIdentificationResponse } from '@/types/matsya';

export const SpeciesIdentification: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'otolith' | 'specimen' | 'microscopy'>('specimen');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SpeciesIdentificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata fields
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [depth, setDepth] = useState('');
  const [captureDate, setCaptureDate] = useState('');
  const [equipment, setEquipment] = useState('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResults(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const request: SpeciesIdentificationRequest = {
          imageData: base64Data,
          imageType,
          metadata: {
            location: location.latitude && location.longitude ? {
              latitude: parseFloat(location.latitude),
              longitude: parseFloat(location.longitude)
            } : undefined,
            depth: depth ? parseFloat(depth) : undefined,
            captureDate: captureDate || undefined,
            equipment: equipment || undefined,
          }
        };

        const response = await matsyaAPI.identifySpecies(request);
        
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          setError(response.error?.message || 'Analysis failed');
        }
        
        setIsAnalyzing(false);
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
    }
  };

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'otolith': return <Fish className="w-4 h-4" />;
      case 'specimen': return <Camera className="w-4 h-4" />;
      case 'microscopy': return <Microscope className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            AI-Powered Species Identification
          </CardTitle>
          <CardDescription>
            Upload images of marine specimens, otoliths, or microscopy samples for automated species identification using our CNN-based models.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Select Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Select value={imageType} onValueChange={(value: any) => setImageType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specimen">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Specimen
                    </div>
                  </SelectItem>
                  <SelectItem value="otolith">
                    <div className="flex items-center gap-2">
                      <Fish className="w-4 h-4" />
                      Otolith
                    </div>
                  </SelectItem>
                  <SelectItem value="microscopy">
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4" />
                      Microscopy
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label>Image Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Selected specimen"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 12.9716"
                value={location.latitude}
                onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., 77.5946"
                value={location.longitude}
                onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (m, optional)</Label>
              <Input
                id="depth"
                type="number"
                placeholder="e.g., 50"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment (optional)</Label>
              <Input
                id="equipment"
                placeholder="e.g., Nikon D850"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="capture-date">Capture Date (optional)</Label>
              <Input
                id="capture-date"
                type="date"
                value={captureDate}
                onChange={(e) => setCaptureDate(e.target.value)}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Identify Species
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
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Identification Results
                </CardTitle>
                <CardDescription>
                  Analysis completed in {results.processingTime}ms using model version {results.modelVersion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={results.imageQuality === 'excellent' ? 'default' : 
                                results.imageQuality === 'good' ? 'secondary' : 'destructive'}>
                    Image Quality: {results.imageQuality}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {results.predictions.map((prediction, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{prediction.scientificName}</h4>
                          {prediction.commonName && (
                            <p className="text-sm text-gray-600">{prediction.commonName}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Rank: {prediction.taxonomicRank}
                            {prediction.aphiaId && ` • AphiaID: ${prediction.aphiaId}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                      <Progress 
                        value={prediction.confidence * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                {results.predictions.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No species matches found. The image may be of poor quality or contain species not in our training database.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeciesIdentification;