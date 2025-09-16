// MATSYA Platform Type Definitions
export interface MarineDataRecord {
  id: string;
  scientificName: string;
  commonName?: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate: string;
  depth?: number;
  temperature?: number;
  salinity?: number;
  ph?: number;
  dissolvedOxygen?: number;
  dataSource: 'OBIS' | 'GBIF' | 'EMODnet' | 'WoRMS' | 'IndOBIS' | 'Sensor';
  recordedBy?: string;
  institutionCode?: string;
  collectionCode?: string;
  catalogNumber?: string;
  basisOfRecord: string;
  occurrenceStatus: 'present' | 'absent';
  individualCount?: number;
  samplingProtocol?: string;
  habitat?: string;
  waterBody?: string;
  country?: string;
  stateProvince?: string;
  locality?: string;
  coordinateUncertaintyInMeters?: number;
  geodeticDatum?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpeciesIdentificationRequest {
  imageData: string; // base64 encoded image
  imageType: 'otolith' | 'specimen' | 'microscopy';
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    depth?: number;
    captureDate?: string;
    equipment?: string;
  };
}

export interface SpeciesIdentificationResponse {
  predictions: Array<{
    scientificName: string;
    commonName?: string;
    confidence: number;
    taxonomicRank: string;
    aphiaId?: number;
  }>;
  processingTime: number;
  modelVersion: string;
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface eDNASequenceRequest {
  sequence: string;
  marker: '12S' | '16S' | 'COI' | 'ITS';
  region?: string;
  primerSet?: string;
  metadata?: {
    sampleLocation?: {
      latitude: number;
      longitude: number;
    };
    sampleDate?: string;
    depth?: number;
    environmentalData?: {
      temperature?: number;
      salinity?: number;
      ph?: number;
    };
  };
}

export interface eDNASequenceResponse {
  matches: Array<{
    scientificName: string;
    commonName?: string;
    similarity: number;
    database: 'BOLD' | 'NCBI' | 'SILVA' | 'MIDORI';
    accessionNumber: string;
    sequenceLength: number;
    taxonomicLineage: {
      kingdom: string;
      phylum: string;
      class: string;
      order: string;
      family: string;
      genus: string;
      species: string;
    };
  }>;
  queryLength: number;
  processingTime: number;
  qualityScore: number;
}

export interface OceanographicData {
  id: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    depth: number;
  };
  parameters: {
    temperature: number;
    salinity: number;
    ph: number;
    dissolvedOxygen: number;
    turbidity?: number;
    chlorophyllA?: number;
    nutrients?: {
      nitrate?: number;
      phosphate?: number;
      silicate?: number;
    };
  };
  dataSource: 'buoy' | 'vessel' | 'satellite' | 'autonomous_vehicle';
  sensorId: string;
  qualityFlags: {
    temperature: 'good' | 'questionable' | 'bad';
    salinity: 'good' | 'questionable' | 'bad';
    ph: 'good' | 'questionable' | 'bad';
    dissolvedOxygen: 'good' | 'questionable' | 'bad';
  };
}

export interface DataIngestionRequest {
  format: 'csv' | 'json' | 'dwc-a' | 'obis-env';
  data: string | File;
  mapping?: Record<string, string>;
  validation?: {
    strict: boolean;
    skipErrors: boolean;
  };
  metadata: {
    source: string;
    contributor: string;
    license: string;
    citation?: string;
  };
}

export interface DataIngestionResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsValid: number;
  recordsInvalid: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  processingTime?: number;
  dataQualityReport?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    validity: number;
  };
}

export interface EcosystemAnalysis {
  region: {
    name: string;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  timeRange: {
    start: string;
    end: string;
  };
  biodiversityMetrics: {
    speciesRichness: number;
    shannonDiversity: number;
    simpsonDiversity: number;
    evenness: number;
  };
  dominantSpecies: Array<{
    scientificName: string;
    commonName?: string;
    abundance: number;
    frequency: number;
    biomass?: number;
  }>;
  environmentalCorrelations: Array<{
    parameter: string;
    correlation: number;
    significance: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  threats: Array<{
    type: 'pollution' | 'overfishing' | 'climate_change' | 'habitat_loss';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
}

export interface ResearchVessel {
  id: string;
  name: string;
  callSign: string;
  country: string;
  institution: string;
  currentPosition: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    timestamp: string;
  };
  capabilities: Array<'ctd' | 'net_sampling' | 'acoustic' | 'imaging' | 'coring'>;
  activeProjects: Array<{
    id: string;
    name: string;
    principalInvestigator: string;
    startDate: string;
    endDate?: string;
  }>;
  sensors: Array<{
    id: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance';
    lastReading: string;
  }>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
    processingTime: number;
  };
}