# mcp-osint OSINT Server

[![smithery badge](https://smithery.ai/badge/mcp-osint)](https://smithery.ai/server/mcp-osint)  
MCP server to perform various OSINT tasks by leveraging common network reconnaissance tools.

## Overview

The mcp-osint server provides a set of tools to perform open source intelligence (OSINT) investigations. It supports executing commands such as WHOIS lookups, Nmap scans, DNS reconnaissance (via dnsrecon, dig, and host), and domain permutation checks using dnstwist. Additionally, the server offers a consolidated tool to run all these functions in parallel for a comprehensive overview.

## OSINT Capabilities

1. **WHOIS Lookup**  
   - Retrieve domain registration information.

2. **Nmap Scan**  
   - Perform a fast Nmap scan to discover open ports and services.

3. **DNS Reconnaissance**  
   - Use `dnsrecon` to gather DNS information for a target domain.

4. **DNSTwist Lookup**  
   - Identify potential domain typosquatting or permutation issues using `dnstwist`.

5. **Dig Lookup**  
   - Query detailed DNS records with `dig`.

6. **Host Lookup**  
   - Retrieve DNS host information using the `host` command.

7. **OSINT Overview**  
   - Execute all of the above tools concurrently for a quick and comprehensive OSINT report.

## Example Prompts

When integrated with Claude, you can use natural language prompts like:

* "Get me the WHOIS information for example.com"
* "Perform a fast Nmap scan on 192.168.1.1"
* "Run DNS reconnaissance on mytarget.com"
* "Check for domain typos using DNSTwist on mytarget.com"
* "Show me all DNS records for example.com using dig"
* "Fetch host lookup details for example.com"
* "Give me an OSINT overview for example.com"

## Quickstart

### Install

#### Installing via Smithery

To install **mcp-osint** for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-osint):

```bash
npx -y @smithery/cli install mcp-osint --client claude
