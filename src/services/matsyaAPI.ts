// MATSYA Platform API Service
import { 
  MarineDataRecord, 
  SpeciesIdentificationRequest, 
  SpeciesIdentificationResponse,
  eDNASequenceRequest,
  eDNASequenceResponse,
  OceanographicData,
  DataIngestionRequest,
  DataIngestionResponse,
  EcosystemAnalysis,
  ResearchVessel,
  APIResponse 
} from '@/types/matsya';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

class MatsyaAPIService {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Data Ingestion APIs
  async ingestData(request: DataIngestionRequest): Promise<APIResponse<DataIngestionResponse>> {
    const formData = new FormData();
    
    if (request.data instanceof File) {
      formData.append('file', request.data);
    } else {
      formData.append('data', request.data);
    }
    
    formData.append('format', request.format);
    formData.append('metadata', JSON.stringify(request.metadata));
    
    if (request.mapping) {
      formData.append('mapping', JSON.stringify(request.mapping));
    }
    
    if (request.validation) {
      formData.append('validation', JSON.stringify(request.validation));
    }

    return this.request<DataIngestionResponse>('/data/ingest', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        'Accept': 'application/json',
      },
      body: formData,
    });
  }

  async getIngestionStatus(jobId: string): Promise<APIResponse<DataIngestionResponse>> {
    return this.request<DataIngestionResponse>(`/data/ingest/${jobId}/status`);
  }

  // Marine Data APIs
  async searchMarineData(params: {
    scientificName?: string;
    location?: { lat: number; lng: number; radius: number };
    dateRange?: { start: string; end: string };
    depth?: { min: number; max: number };
    dataSource?: string[];
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<{ records: MarineDataRecord[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.request<{ records: MarineDataRecord[]; total: number }>(
      `/data/marine?${queryParams.toString()}`
    );
  }

  async getMarineDataById(id: string): Promise<APIResponse<MarineDataRecord>> {
    return this.request<MarineDataRecord>(`/data/marine/${id}`);
  }

  // AI/ML APIs
  async identifySpecies(request: SpeciesIdentificationRequest): Promise<APIResponse<SpeciesIdentificationResponse>> {
    return this.request<SpeciesIdentificationResponse>('/ai/identify-species', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async analyzeeDNA(request: eDNASequenceRequest): Promise<APIResponse<eDNASequenceResponse>> {
    return this.request<eDNASequenceResponse>('/ai/edna-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async correlateData(params: {
    species?: string[];
    environmentalParams: string[];
    location?: { lat: number; lng: number; radius: number };
    timeRange: { start: string; end: string };
    method?: 'pearson' | 'spearman' | 'kendall';
  }): Promise<APIResponse<{
    correlations: Array<{
      species: string;
      parameter: string;
      correlation: number;
      pValue: number;
      significance: 'high' | 'medium' | 'low' | 'none';
    }>;
  }>> {
    return this.request('/ai/correlate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Oceanographic Data APIs
  async getOceanographicData(params: {
    location?: { lat: number; lng: number; radius: number };
    timeRange?: { start: string; end: string };
    parameters?: string[];
    dataSource?: string[];
    limit?: number;
  }): Promise<APIResponse<{ data: OceanographicData[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.request<{ data: OceanographicData[]; total: number }>(
      `/oceanographic?${queryParams.toString()}`
    );
  }

  async getRealTimeData(sensorId?: string): Promise<APIResponse<OceanographicData[]>> {
    const endpoint = sensorId ? `/oceanographic/realtime/${sensorId}` : '/oceanographic/realtime';
    return this.request<OceanographicData[]>(endpoint);
  }

  // Ecosystem Analysis APIs
  async analyzeEcosystem(params: {
    region: { north: number; south: number; east: number; west: number };
    timeRange: { start: string; end: string };
    includeThreats?: boolean;
    includeCorrelations?: boolean;
  }): Promise<APIResponse<EcosystemAnalysis>> {
    return this.request<EcosystemAnalysis>('/analysis/ecosystem', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Research Vessel APIs
  async getResearchVessels(params?: {
    region?: { north: number; south: number; east: number; west: number };
    active?: boolean;
  }): Promise<APIResponse<ResearchVessel[]>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const endpoint = queryParams.toString() ? `/vessels?${queryParams.toString()}` : '/vessels';
    return this.request<ResearchVessel[]>(endpoint);
  }

  async getVesselById(id: string): Promise<APIResponse<ResearchVessel>> {
    return this.request<ResearchVessel>(`/vessels/${id}`);
  }

  // Data Export APIs
  async exportData(params: {
    format: 'csv' | 'json' | 'dwc-a';
    dataType: 'marine' | 'oceanographic' | 'analysis';
    filters?: any;
  }): Promise<APIResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.request('/data/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // System Health APIs
  async getSystemHealth(): Promise<APIResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, {
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      lastCheck: string;
    }>;
    version: string;
    uptime: number;
  }>> {
    return this.request('/health');
  }

  // WebSocket connection for real-time data
  connectRealTimeStream(onMessage: (data: OceanographicData) => void): WebSocket {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}

export const matsyaAPI = new MatsyaAPIService();
export default matsyaAPI;