#!/usr/bin/env node

/**
 * Cloudflare MCP Server
 * 
 * Standalone server for managing Cloudflare DNS zones and records via API.
 * 
 * Required environment variables:
 * - CLOUDFLARE_API_TOKEN (required) - Your Cloudflare API token
 * - CLOUDFLARE_ZONE_ID (optional) - Default zone ID for operations
 * 
 * Available tools:
 * - cloudflare_list_zones: List all DNS zones
 * - cloudflare_get_zone: Get details for a specific zone
 * - cloudflare_list_dns_records: List DNS records for a zone
 * - cloudflare_create_dns_record: Create a new DNS record
 * - cloudflare_update_dns_record: Update an existing DNS record
 * - cloudflare_delete_dns_record: Delete a DNS record
 */

import { createMCPServer, startMCPServer, type Tool } from "./lib/mcp-core.js";
import { CloudflareClient, getCloudflareCredentials } from "./lib/client.js";
import { createDomainTools } from "./tools/domains.js";

async function initServer() {
  try {
    // Get credentials from environment variables
    const credentials = getCloudflareCredentials();
    
    // Create client with credentials
    const client = new CloudflareClient(credentials);
    
    // Create tools
    const tools: Tool[] = [
      ...createDomainTools(client),
    ];

    const server = createMCPServer(
      {
        name: "cloudflare-mcp",
        version: "1.0.0",
        description: "Cloudflare DNS zones and records management via API",
      },
      tools
    );

    // Start server
    await startMCPServer(server);
    console.error(`[MCP] Cloudflare server ready with ${tools.length} tools`);
  } catch (error) {
    console.error('[MCP] Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize and start server
initServer().catch(console.error);