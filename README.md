# Cloudflare DNS MCP Server

[![npm version](https://badge.fury.io/js/@artik0din%2Fmcp-cloudflare-dns.svg)](https://badge.fury.io/js/@artik0din%2Fmcp-cloudflare-dns)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

A powerful [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for managing Cloudflare DNS zones and records via API. This server enables AI assistants like Claude to manage DNS records directly through Cloudflare's API.

## Features

- 🌐 **Zone Management**: List and inspect DNS zones
- 📝 **DNS Records**: Create, read, update, and delete DNS records
- 🔍 **Smart Filtering**: Filter records by type, name, or zone
- ☁️ **Cloudflare Proxy**: Support for Cloudflare's proxy features
- 🛡️ **Secure**: Environment-based authentication
- ⚡ **Fast**: Direct API integration with minimal overhead

## Quick Start

Run the server directly with npx (requires Node.js 18+):

```bash
npx @artik0din/mcp-cloudflare-dns
```

Or install locally:

```bash
npm install -g @artik0din/mcp-cloudflare-dns
mcp-cloudflare-dns
```

## Environment Variables

Create a `.env` file in your working directory:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | ✅ | Your Cloudflare API token with Zone:Read and DNS:Edit permissions |
| `CLOUDFLARE_ZONE_ID` | ❌ | Default zone ID (can be provided per request) |

### Getting Your Cloudflare API Token

1. Go to [Cloudflare Dashboard > My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom Token" with these permissions:
   - **Zone Resources**: Include All zones (or specific zones)
   - **Permissions**: Zone:Read, DNS:Edit

## MCP Client Configuration

### Claude Desktop

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "cloudflare-dns": {
      "command": "npx",
      "args": ["@artik0din/mcp-cloudflare-dns"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_api_token_here",
        "CLOUDFLARE_ZONE_ID": "your_zone_id_here"
      }
    }
  }
}
```

### Other MCP Clients

Use the command `npx @artik0din/mcp-cloudflare-dns` with the appropriate environment variables set.

## Available Tools

### cloudflare_list_zones
List all DNS zones accessible to your API token.

**Parameters:** None

**Example:**
```
List all my Cloudflare zones
```

### cloudflare_get_zone
Get detailed information about a specific DNS zone.

**Parameters:**
- `zoneId` (string, required): Zone ID to get details for

**Example:**
```
Get details for zone abc123def456
```

### cloudflare_list_dns_records
List DNS records for a specific zone with optional filtering.

**Parameters:**
- `zoneId` (string, optional): Zone ID (uses default if not provided)
- `type` (string, optional): Filter by record type (A, AAAA, CNAME, MX, TXT, etc.)
- `name` (string, optional): Filter by record name

**Example:**
```
List all A records for my zone
List DNS records of type MX for zone abc123def456
Show all records for www.example.com
```

### cloudflare_create_dns_record
Create a new DNS record in a zone.

**Parameters:**
- `type` (string, required): Record type (A, AAAA, CNAME, MX, TXT, etc.)
- `name` (string, required): Record name (e.g., www.example.com or @)
- `content` (string, required): Record content (IP, hostname, text, etc.)
- `zoneId` (string, optional): Zone ID (uses default if not provided)
- `ttl` (number, optional): TTL in seconds (1 = auto, 120-7200)
- `priority` (number, optional): Priority for MX records
- `proxied` (boolean, optional): Enable Cloudflare proxy
- `comment` (string, optional): Comment for the record

**Example:**
```
Create an A record for www pointing to 1.2.3.4
Create a CNAME record for blog pointing to www.example.com with TTL 3600
Add an MX record for @ pointing to mail.example.com with priority 10
```

### cloudflare_update_dns_record
Update an existing DNS record.

**Parameters:**
- `recordId` (string, required): DNS record ID to update
- `type` (string, optional): New record type
- `name` (string, optional): New record name
- `content` (string, optional): New record content
- `zoneId` (string, optional): Zone ID (uses default if not provided)
- `ttl` (number, optional): New TTL in seconds
- `priority` (number, optional): New priority for MX records
- `proxied` (boolean, optional): Enable/disable Cloudflare proxy
- `comment` (string, optional): New comment

**Example:**
```
Update record abc123 to point to IP 5.6.7.8
Change the TTL of record def456 to 3600 seconds
Enable proxy for record ghi789
```

### cloudflare_delete_dns_record
Delete a DNS record.

**Parameters:**
- `recordId` (string, required): DNS record ID to delete
- `zoneId` (string, optional): Zone ID (uses default if not provided)

**Example:**
```
Delete DNS record abc123
Remove record def456 from zone ghi789
```

## Security Considerations

- **API Token Security**: Never commit your API token to version control
- **Minimal Permissions**: Use API tokens with minimal required permissions
- **Zone Restrictions**: Consider restricting API tokens to specific zones
- **Regular Rotation**: Rotate API tokens regularly
- **Environment Variables**: Always use environment variables for credentials

## Development

```bash
# Clone the repository
git clone https://github.com/artik0din/mcp-cloudflare-dns.git
cd mcp-cloudflare-dns

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Built with the [Model Context Protocol SDK](https://modelcontextprotocol.io/) and [Cloudflare API](https://developers.cloudflare.com/api/).