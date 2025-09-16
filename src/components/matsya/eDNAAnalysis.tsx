import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dna, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { matsyaAPI } from '@/services/matsyaAPI';
import { eDNASequenceRequest, eDNASequenceResponse } from '@/types/matsya';

export const eDNAAnalysis: React.FC = () => {
  const [sequence, setSequence] = useState('');
  const [marker, setMarker] = useState<'12S' | '16S' | 'COI' | 'ITS'>('12S');
  const [region, setRegion] = useState('');
  const [primerSet, setPrimerSet] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<eDNASequenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Metadata fields
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [depth, setDepth] = useState('');
  const [sampleDate, setSampleDate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [salinity, setSalinity] = useState('');
  const [ph, setPh] = useState('');

  const handleAnalyze = async () => {
    if (!sequence.trim()) {
      setError('Please enter a DNA sequence');
      return;
    }

    // Basic sequence validation
    const cleanSequence = sequence.replace(/\s/g, '').toUpperCase();
    const validBases = /^[ATCGRYSWKMBDHVN]+$/;
    
    if (!validBases.test(cleanSequence)) {
      setError('Invalid DNA sequence. Please use only valid nucleotide codes (A, T, C, G, R, Y, S, W, K, M, B, D, H, V, N)');
      return;
    }

    if (cleanSequence.length < 50) {
      setError('Sequence too short. Please provide at least 50 base pairs for reliable identification');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const request: eDNASequenceRequest = {
        sequence: cleanSequence,
        marker,
        region: region || undefined,
        primerSet: primerSet || undefined,
        metadata: {
          sampleLocation: location.latitude && location.longitude ? {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
          } : undefined,
          sampleDate: sampleDate || undefined,
          depth: depth ? parseFloat(depth) : undefined,
          environmentalData: {
            temperature: temperature ? parseFloat(temperature) : undefined,
            salinity: salinity ? parseFloat(salinity) : undefined,
            ph: ph ? parseFloat(ph) : undefined,
          }
        }
      };

      const response = await matsyaAPI.analyzeeDNA(request);
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error?.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMarkerDescription = (marker: string) => {
    switch (marker) {
      case '12S': return 'Mitochondrial 12S rRNA - Fish identification';
      case '16S': return 'Mitochondrial 16S rRNA - Bacteria, archaea';
      case 'COI': return 'Cytochrome c oxidase I - Metazoans';
      case 'ITS': return 'Internal transcribed spacer - Fungi';
      default: return '';
    }
  };

  const getDatabaseIcon = (database: string) => {
    return <Database className="w-4 h-4" />;
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.98) return 'text-green-600';
    if (similarity >= 0.95) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            eDNA Sequence Analysis
          </CardTitle>
          <CardDescription>
            Analyze environmental DNA sequences using BERT-like models with K-mer tokenization against BOLD, NCBI, SILVA, and MIDORI databases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sequence Input */}
          <div className="space-y-2">
            <Label htmlFor="sequence">DNA Sequence</Label>
            <Textarea
              id="sequence"
              placeholder="Enter your DNA sequence here (FASTA format accepted)..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
            <div className="text-xs text-gray-500">
              Sequence length: {sequence.replace(/\s/g, '').length} bp
            </div>
          </div>

          {/* Marker Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marker">Genetic Marker</Label>
              <Select value={marker} onValueChange={(value: any) => setMarker(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12S">12S rRNA (Fish)</SelectItem>
                  <SelectItem value="16S">16S rRNA (Bacteria/Archaea)</SelectItem>
                  <SelectItem value="COI">COI (Metazoans)</SelectItem>
                  <SelectItem value="ITS">ITS (Fungi)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                {getMarkerDescription(marker)}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region (optional)</Label>
              <Input
                id="region"
                placeholder="e.g., V4, V3-V4"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primer-set">Primer Set (optional)</Label>
            <Input
              id="primer-set"
              placeholder="e.g., 515F-806R"
              value={primerSet}
              onChange={(e) => setPrimerSet(e.target.value)}
            />
          </div>

          {/* Sample Metadata */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Sample Metadata (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sample-lat">Sample Latitude</Label>
                <Input
                  id="sample-lat"
                  type="number"
                  step="any"
                  placeholder="e.g., 12.9716"
                  value={location.latitude}
                  onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample-lng">Sample Longitude</Label>
                <Input
                  id="sample-lng"
                  type="number"
                  step="any"
                  placeholder="e.g., 77.5946"
                  value={location.longitude}
                  onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample-depth">Depth (m)</Label>
                <Input
                  id="sample-depth"
                  type="number"
                  placeholder="e.g., 50"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample-date">Sample Date</Label>
                <Input
                  id="sample-date"
                  type="date"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salinity">Salinity (PSU)</Label>
                <Input
                  id="salinity"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 35.0"
                  value={salinity}
                  onChange={(e) => setSalinity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">pH</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!sequence.trim() || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Sequence...
              </>
            ) : (
              <>
                <Dna className="w-4 h-4 mr-2" />
                Analyze eDNA Sequence
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
                  Sequence Analysis Results
                </CardTitle>
                <CardDescription>
                  Analysis completed in {results.processingTime}ms • Query length: {results.queryLength} bp • Quality score: {results.qualityScore.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.matches.length > 0 ? (
                  <div className="space-y-4">
                    {results.matches.map((match, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{match.scientificName}</h4>
                            {match.commonName && (
                              <p className="text-sm text-gray-600">{match.commonName}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {getDatabaseIcon(match.database)}
                              <Badge variant="outline">{match.database}</Badge>
                              <span className="text-xs text-gray-500">
                                {match.accessionNumber} • {match.sequenceLength} bp
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getSimilarityColor(match.similarity)}`}>
                              {(match.similarity * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Similarity</div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={match.similarity * 100} 
                          className="h-2"
                        />
                        
                        <div className="text-xs text-gray-600">
                          <div className="font-medium mb-1">Taxonomic Lineage:</div>
                          <div className="space-y-1">
                            <div>Kingdom: {match.taxonomicLineage.kingdom}</div>
                            <div>Phylum: {match.taxonomicLineage.phylum}</div>
                            <div>Class: {match.taxonomicLineage.class}</div>
                            <div>Order: {match.taxonomicLineage.order}</div>
                            <div>Family: {match.taxonomicLineage.family}</div>
                            <div>Genus: {match.taxonomicLineage.genus}</div>
                            <div>Species: {match.taxonomicLineage.species}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No significant matches found in the databases. The sequence may be from a novel species or contain sequencing errors.
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

export default eDNAAnalysis;