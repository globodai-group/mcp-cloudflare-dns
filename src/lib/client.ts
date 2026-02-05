import { CloudflareConfig, Zone, DNSRecord, CloudflareResponse, CreateDNSRecordInput, UpdateDNSRecordInput } from '../types/index.js';

export class CloudflareClient {
  private config: CloudflareConfig;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: CloudflareConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json() as CloudflareResponse<T>;

    if (!data.success) {
      const errorMessage = data.errors.length > 0 
        ? data.errors.map(e => e.message).join(', ')
        : 'Unknown error';
      throw new Error(`Cloudflare API Error: ${errorMessage}`);
    }

    return data.result;
  }

  /**
   * List all zones accessible to the API token
   */
  async listZones(): Promise<Zone[]> {
    return this.makeRequest<Zone[]>('/zones');
  }

  /**
   * Get a specific zone by ID
   */
  async getZone(zoneId: string): Promise<Zone> {
    return this.makeRequest<Zone>(`/zones/${zoneId}`);
  }

  /**
   * List DNS records for a zone
   */
  async listDNSRecords(zoneId?: string, type?: string, name?: string): Promise<DNSRecord[]> {
    const resolvedZoneId = zoneId || this.config.zoneId;
    if (!resolvedZoneId) {
      throw new Error('Zone ID is required. Provide it in the method call or set it in the config.');
    }

    let endpoint = `/zones/${resolvedZoneId}/dns_records`;
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (name) params.append('name', name);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeRequest<DNSRecord[]>(endpoint);
  }

  /**
   * Get a specific DNS record
   */
  async getDNSRecord(recordId: string, zoneId?: string): Promise<DNSRecord> {
    const resolvedZoneId = zoneId || this.config.zoneId;
    if (!resolvedZoneId) {
      throw new Error('Zone ID is required. Provide it in the method call or set it in the config.');
    }

    return this.makeRequest<DNSRecord>(`/zones/${resolvedZoneId}/dns_records/${recordId}`);
  }

  /**
   * Create a new DNS record
   */
  async createDNSRecord(record: CreateDNSRecordInput, zoneId?: string): Promise<DNSRecord> {
    const resolvedZoneId = zoneId || this.config.zoneId;
    if (!resolvedZoneId) {
      throw new Error('Zone ID is required. Provide it in the method call or set it in the config.');
    }

    return this.makeRequest<DNSRecord>(`/zones/${resolvedZoneId}/dns_records`, 'POST', record);
  }

  /**
   * Update an existing DNS record
   */
  async updateDNSRecord(recordId: string, record: UpdateDNSRecordInput, zoneId?: string): Promise<DNSRecord> {
    const resolvedZoneId = zoneId || this.config.zoneId;
    if (!resolvedZoneId) {
      throw new Error('Zone ID is required. Provide it in the method call or set it in the config.');
    }

    return this.makeRequest<DNSRecord>(`/zones/${resolvedZoneId}/dns_records/${recordId}`, 'PATCH', record);
  }

  /**
   * Delete a DNS record
   */
  async deleteDNSRecord(recordId: string, zoneId?: string): Promise<{ id: string }> {
    const resolvedZoneId = zoneId || this.config.zoneId;
    if (!resolvedZoneId) {
      throw new Error('Zone ID is required. Provide it in the method call or set it in the config.');
    }

    return this.makeRequest<{ id: string }>(`/zones/${resolvedZoneId}/dns_records/${recordId}`, 'DELETE');
  }
}

/**
 * Get Cloudflare credentials from environment variables
 */
export function getCloudflareCredentials(): CloudflareConfig {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "Cloudflare API token is required. Set the CLOUDFLARE_API_TOKEN environment variable."
    );
  }

  return {
    apiToken,
    zoneId: process.env.CLOUDFLARE_ZONE_ID
  };
}