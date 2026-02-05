export interface CloudflareConfig {
  apiToken: string;
  zoneId?: string;
}

export interface Zone {
  id: string;
  name: string;
  status: string;
  account: {
    id: string;
    name: string;
  };
  created_on: string;
  modified_on: string;
  activated_on: string;
  name_servers: string[];
  original_name_servers: string[];
  original_registrar?: string;
  original_dnshost?: string;
  development_mode?: number;
}

export interface DNSRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  priority?: number;
  comment?: string;
  created_on: string;
  modified_on: string;
  data?: any;
  meta?: {
    auto_added?: boolean;
    managed_by_apps?: boolean;
    managed_by_argo_tunnel?: boolean;
  };
}

export interface CloudflareResponse<T = any> {
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: Array<{
    code: number;
    message: string;
    type?: string;
  }>;
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
    total_pages: number;
  };
}

export interface CreateDNSRecordInput {
  type: string;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
  comment?: string;
}

export interface UpdateDNSRecordInput extends Partial<CreateDNSRecordInput> {
  // All fields from CreateDNSRecordInput are optional for updates
}