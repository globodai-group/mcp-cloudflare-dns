import { Tool, ToolInput, ToolResult } from "../lib/mcp-core.js";
import { CloudflareClient } from "../lib/client.js";

interface DomainsToolsContext {
  client: CloudflareClient;
}

/**
 * List all DNS zones
 */
export class ListZonesTool extends Tool {
  name = "cloudflare_list_zones";
  description = "List all DNS zones accessible to the API token";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {},
      required: []
    } as const;
  }

  async execute(_input: ToolInput<{}>): Promise<ToolResult> {
    try {
      const zones = await this.context.client.listZones();
      
      const content = `Found ${zones.length} DNS zones:\n\n${zones
        .map(zone => 
          `• ${zone.name}\n` +
          `  - Zone ID: ${zone.id}\n` +
          `  - Status: ${zone.status}\n` +
          `  - Account: ${zone.account.name}\n` +
          `  - Name servers: ${zone.name_servers.join(', ')}`
        )
        .join('\n\n')}`;

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing zones: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * Get details for a specific zone
 */
export class GetZoneTool extends Tool {
  name = "cloudflare_get_zone";
  description = "Get details for a specific DNS zone";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        zoneId: {
          type: "string",
          description: "Zone ID to get details for"
        }
      },
      required: ["zoneId"]
    } as const;
  }

  async execute(input: ToolInput<{ zoneId: string }>): Promise<ToolResult> {
    try {
      if (!input.zoneId || typeof input.zoneId !== 'string') {
        return {
          content: [{ type: "text", text: "zoneId parameter must be a string" }],
          isError: true
        };
      }

      const zone = await this.context.client.getZone(input.zoneId);
      
      const content = `Zone Details for ${zone.name}:\n\n` +
        `Zone ID: ${zone.id}\n` +
        `Status: ${zone.status}\n` +
        `Account: ${zone.account.name} (${zone.account.id})\n` +
        `Created: ${new Date(zone.created_on).toLocaleString()}\n` +
        `Modified: ${new Date(zone.modified_on).toLocaleString()}\n` +
        `Activated: ${new Date(zone.activated_on).toLocaleString()}\n` +
        `Name servers: ${zone.name_servers.join(', ')}\n` +
        `Original name servers: ${zone.original_name_servers.join(', ')}\n` +
        (zone.original_registrar ? `Original registrar: ${zone.original_registrar}\n` : '') +
        (zone.development_mode ? `Development mode: ${zone.development_mode === 1 ? 'On' : 'Off'}\n` : '');

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error getting zone details: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * List DNS records for a zone
 */
export class ListDNSRecordsTool extends Tool {
  name = "cloudflare_list_dns_records";
  description = "List DNS records for a zone";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        zoneId: {
          type: "string",
          description: "Zone ID to list records for (optional if set in config)"
        },
        type: {
          type: "string",
          description: "Filter by record type (e.g., A, AAAA, CNAME, MX, TXT)"
        },
        name: {
          type: "string",
          description: "Filter by record name (e.g., www.example.com)"
        }
      },
      required: []
    } as const;
  }

  async execute(input: ToolInput<{ 
    zoneId?: string; 
    type?: string; 
    name?: string; 
  }>): Promise<ToolResult> {
    try {
      const records = await this.context.client.listDNSRecords(input.zoneId, input.type, input.name);
      
      if (records.length === 0) {
        return {
          content: [{ type: "text", text: "No DNS records found with the specified criteria." }]
        };
      }

      const content = `Found ${records.length} DNS records:\n\n${records
        .map(record => 
          `• ${record.name} (${record.type})\n` +
          `  - Content: ${record.content}\n` +
          `  - TTL: ${record.ttl === 1 ? 'Auto' : record.ttl}\n` +
          `  - Proxied: ${record.proxied ? 'Yes' : 'No'}\n` +
          `  - ID: ${record.id}\n` +
          (record.priority ? `  - Priority: ${record.priority}\n` : '') +
          (record.comment ? `  - Comment: ${record.comment}\n` : '') +
          `  - Modified: ${new Date(record.modified_on).toLocaleString()}`
        )
        .join('\n\n')}`;

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error listing DNS records: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * Create a new DNS record
 */
export class CreateDNSRecordTool extends Tool {
  name = "cloudflare_create_dns_record";
  description = "Create a new DNS record in a zone";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        zoneId: {
          type: "string",
          description: "Zone ID to create record in (optional if set in config)"
        },
        type: {
          type: "string",
          description: "Record type (e.g., A, AAAA, CNAME, MX, TXT)"
        },
        name: {
          type: "string",
          description: "Record name (e.g., www.example.com or @)"
        },
        content: {
          type: "string",
          description: "Record content (IP address, hostname, text content, etc.)"
        },
        ttl: {
          type: "number",
          description: "Time to live in seconds (1 = auto, 120-7200)",
          default: 1
        },
        priority: {
          type: "number",
          description: "Priority for MX records"
        },
        proxied: {
          type: "boolean",
          description: "Whether the record should be proxied through Cloudflare",
          default: false
        },
        comment: {
          type: "string",
          description: "Comment for the record"
        }
      },
      required: ["type", "name", "content"]
    } as const;
  }

  async execute(input: ToolInput<{ 
    zoneId?: string;
    type: string;
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
    comment?: string;
  }>): Promise<ToolResult> {
    try {
      const recordData = {
        type: input.type,
        name: input.name,
        content: input.content,
        ttl: input.ttl || 1,
        ...(input.priority && { priority: input.priority }),
        ...(input.proxied !== undefined && { proxied: input.proxied }),
        ...(input.comment && { comment: input.comment })
      };

      const record = await this.context.client.createDNSRecord(recordData, input.zoneId);
      
      const content = `✅ Successfully created DNS record:\n\n` +
        `Name: ${record.name}\n` +
        `Type: ${record.type}\n` +
        `Content: ${record.content}\n` +
        `TTL: ${record.ttl === 1 ? 'Auto' : record.ttl}\n` +
        `Proxied: ${record.proxied ? 'Yes' : 'No'}\n` +
        `Record ID: ${record.id}\n` +
        (record.priority ? `Priority: ${record.priority}\n` : '') +
        (record.comment ? `Comment: ${record.comment}\n` : '') +
        `Created: ${new Date(record.created_on).toLocaleString()}`;

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error creating DNS record: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * Update an existing DNS record
 */
export class UpdateDNSRecordTool extends Tool {
  name = "cloudflare_update_dns_record";
  description = "Update an existing DNS record";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        recordId: {
          type: "string",
          description: "DNS record ID to update"
        },
        zoneId: {
          type: "string",
          description: "Zone ID (optional if set in config)"
        },
        type: {
          type: "string",
          description: "Record type (e.g., A, AAAA, CNAME, MX, TXT)"
        },
        name: {
          type: "string",
          description: "Record name (e.g., www.example.com or @)"
        },
        content: {
          type: "string",
          description: "Record content (IP address, hostname, text content, etc.)"
        },
        ttl: {
          type: "number",
          description: "Time to live in seconds (1 = auto, 120-7200)"
        },
        priority: {
          type: "number",
          description: "Priority for MX records"
        },
        proxied: {
          type: "boolean",
          description: "Whether the record should be proxied through Cloudflare"
        },
        comment: {
          type: "string",
          description: "Comment for the record"
        }
      },
      required: ["recordId"]
    } as const;
  }

  async execute(input: ToolInput<{ 
    recordId: string;
    zoneId?: string;
    type?: string;
    name?: string;
    content?: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
    comment?: string;
  }>): Promise<ToolResult> {
    try {
      if (!input.recordId || typeof input.recordId !== 'string') {
        return {
          content: [{ type: "text", text: "recordId parameter must be a string" }],
          isError: true
        };
      }

      const updateData: any = {};
      if (input.type) updateData.type = input.type;
      if (input.name) updateData.name = input.name;
      if (input.content) updateData.content = input.content;
      if (input.ttl) updateData.ttl = input.ttl;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.proxied !== undefined) updateData.proxied = input.proxied;
      if (input.comment !== undefined) updateData.comment = input.comment;

      const record = await this.context.client.updateDNSRecord(input.recordId, updateData, input.zoneId);
      
      const content = `✅ Successfully updated DNS record:\n\n` +
        `Name: ${record.name}\n` +
        `Type: ${record.type}\n` +
        `Content: ${record.content}\n` +
        `TTL: ${record.ttl === 1 ? 'Auto' : record.ttl}\n` +
        `Proxied: ${record.proxied ? 'Yes' : 'No'}\n` +
        `Record ID: ${record.id}\n` +
        (record.priority ? `Priority: ${record.priority}\n` : '') +
        (record.comment ? `Comment: ${record.comment}\n` : '') +
        `Modified: ${new Date(record.modified_on).toLocaleString()}`;

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error updating DNS record: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * Delete a DNS record
 */
export class DeleteDNSRecordTool extends Tool {
  name = "cloudflare_delete_dns_record";
  description = "Delete a DNS record";

  constructor(private context: DomainsToolsContext) {
    super();
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        recordId: {
          type: "string",
          description: "DNS record ID to delete"
        },
        zoneId: {
          type: "string",
          description: "Zone ID (optional if set in config)"
        }
      },
      required: ["recordId"]
    } as const;
  }

  async execute(input: ToolInput<{ 
    recordId: string;
    zoneId?: string;
  }>): Promise<ToolResult> {
    try {
      if (!input.recordId || typeof input.recordId !== 'string') {
        return {
          content: [{ type: "text", text: "recordId parameter must be a string" }],
          isError: true
        };
      }

      const result = await this.context.client.deleteDNSRecord(input.recordId, input.zoneId);
      
      const content = `✅ Successfully deleted DNS record with ID: ${result.id}`;

      return {
        content: [{ type: "text", text: content }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error deleting DNS record: ${error.message}` }],
        isError: true
      };
    }
  }
}

/**
 * Create and export all domain tools for Cloudflare
 */
export function createDomainTools(client: CloudflareClient): Tool[] {
  const context = { client };
  
  return [
    new ListZonesTool(context),
    new GetZoneTool(context),
    new ListDNSRecordsTool(context),
    new CreateDNSRecordTool(context),
    new UpdateDNSRecordTool(context),
    new DeleteDNSRecordTool(context)
  ];
}