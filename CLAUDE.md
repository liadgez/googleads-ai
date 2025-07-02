# Claude Code AI-Accelerated Development Workflow

## Overview
This document defines a systematic workflow for AI-accelerated development using Claude Code with GitHub integration, persistent knowledge management, and quality gates.

## Current MCP Configuration
- **filesystem**: File operations in `/Users/liadgez/Documents`
- **git**: Local Git repository operations
- **github**: Remote GitHub API access (token configured)

## Workflow Commands

### Core Slash Commands
```bash
/plan <issue#>     # Generate implementation plan from GitHub issue
/code <issue#>     # Execute code implementation from plan
/review-pr         # AI-powered pull request review
/clear             # Clear context for next issue
```

### Standard Development Flow
1. **Initialize Repository**
   ```bash
   gh repo create <name> --public --clone
   cd <name>
   mkdir scratchpad
   touch scratchpad/.gitkeep
   git add . && git commit -m "Initial setup with scratchpad"
   ```

2. **Create Issue**
   ```bash
   gh issue create --title "Feature: Description" --body "Acceptance Criteria:\n- [ ] Item 1\n- [ ] Item 2"
   ```

3. **Plan Phase**
   ```bash
   /plan <issue#>
   # Review generated plan in scratchpad/<issue>-plan.md
   # Human review and editing required
   ```

4. **Implementation Phase**
   ```bash
   git switch -c issue-<#>-<slug>
   /code <issue#>
   # Code generation based on plan
   git add . && git commit -m "feat: conventional commit message"
   ```

5. **Testing & PR Phase**
   ```bash
   npm test  # or appropriate test command
   git push -u origin HEAD
   gh pr create --title "Title" --body "Description"
   /review-pr
   ```

6. **Merge & Cleanup**
   ```bash
   gh pr merge --squash
   git switch main && git pull
   /clear
   ```

## Directory Structure
```
Documents/
├── CLAUDE.md                    # This file - persistent memory
├── .workflow/                   # Workflow tools
│   ├── orchestrator.sh         # Main workflow script
│   ├── commands/               # Individual command scripts
│   └── templates/              # Code templates
└── scratchpad/                 # Global knowledge base
    ├── plans/                  # Issue implementation plans
    ├── context/               # Session context files
    ├── patterns/              # Reusable code patterns
    └── knowledge/             # Accumulated insights
```

## Environment Setup
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_..."
export CLAUDE_WORKFLOW_ROOT="/Users/liadgez/Documents"
```

## Quality Gates
- All issues ≤2 days effort
- All PRs single-purpose
- CI must pass before merge
- Human review mandatory
- Context cleared between issues

## Airtable Database Operations - PROVEN METHODS

### ✅ SUCCESSFUL OPERATIONS (Verified 2025-07-02)

#### 1. Creating New Tables
**Method**: Direct Airtable Metadata API
```javascript
// POST to /v0/meta/bases/{BASE_ID}/tables
const tableData = {
    name: "TableName",
    description: "Table description",
    fields: [
        { name: "Field Name", type: "singleLineText" },
        { name: "URL Field", type: "url" },
        { name: "Email Field", type: "email" },
        { name: "Date Field", type: "date", options: { dateFormat: { name: "us" } } },
        { name: "Long Text", type: "multilineText" }
    ]
};
```
**✅ Verified Success**: Created "Prospects" table with 9 fields (ID: tblsQ3CpIHMojro2g)

#### 2. Creating New Fields in Existing Tables
**Method**: Direct Airtable Metadata API
```javascript
// POST to /v0/meta/bases/{BASE_ID}/tables/{TABLE_ID}/fields
const fieldData = {
    name: "New Field Name",
    type: "singleLineText"  // or url, email, multilineText, date, etc.
};
```
**✅ Verified Success**: Added 7 fields to existing table (Platform Name, Industry, Company Size, etc.)

#### 3. Populating Data in Multi-Field Structure
**Method**: Regular Airtable API with proper field mapping
```javascript
const recordData = {
    fields: {
        'Field Name 1': 'Value 1',
        'Field Name 2': 'Value 2',
        'URL Field': 'https://example.com'
    }
};
```
**✅ Verified Success**: 5 records with proper 8-field structure populated

### 🔧 TECHNICAL REQUIREMENTS

#### Authentication
- Use Personal Access Token (PAT): `patljOcRArDbxHkXx.b1d4fd2214a224bbf075a0e7fc643b95357e6cb5f2c9d79aba9a23fed360e2a0`
- Base ID: `appasoEeqPiKbTOeI`
- Authorization header: `Bearer {PAT}`

#### Field Type Requirements
- **Date fields**: Must include `options: { dateFormat: { name: "us" } }`
- **Select fields**: Avoid complex color configurations during creation
- **URL fields**: Use type "url" 
- **Email fields**: Use type "email"
- **Long text**: Use "multilineText"

#### API Endpoints
- **Create Table**: `POST /v0/meta/bases/{BASE_ID}/tables`
- **Create Field**: `POST /v0/meta/bases/{BASE_ID}/tables/{TABLE_ID}/fields`
- **List Tables**: `GET /v0/meta/bases/{BASE_ID}/tables`
- **Create Records**: `POST /v0/{BASE_ID}/{TABLE_ID}`

### 📊 Current Database State
- **Tasks Table** (ID: tbl9fgwrM2panZiyu): 8 fields, 31 records (5 proper structure, 26 single-field)
- **Prospects Table** (ID: tblsQ3CpIHMojro2g): 9 fields, 0 records (newly created)

### Database Work Verification Protocol

**MANDATORY RULE**: Before claiming ANY database structure change, I MUST:

1. **ALWAYS run verification check** using the database check script
2. **Count actual fields** in the database structure  
3. **Verify field separation** - confirm data is NOT crammed into single field
4. **Report EXACT field count** and field names
5. **Never claim "proper structure" unless multiple separate fields exist**

### Enforcement Protocol

**Before making ANY claim about database improvements:**
```bash
node check_database.js
```

**Required verification outputs:**
- Exact number of fields per table
- Field names list
- Sample record showing field separation
- Proof that data is NOT in single field with separators

**Banned phrases until verification:**
- "proper database structure"
- "eliminated single-field mess" 
- "normalized tables"
- "separate fields"
- "professional database"

**Only allowed after showing:**
- Multiple field names (not just "Name")
- Data spread across separate fields
- Actual relational structure

### Accountability Measure
- **Every database claim must include field count**
- **Every database change must be followed by immediate verification**
- **False claims about structure = immediate correction and re-verification**

## Usage Notes
- This workflow is available across all projects under Documents/
- Scratchpad serves as persistent knowledge base
- Human oversight required at plan review and PR merge stages
- Context isolation prevents prompt pollution between issues

## Troubleshooting
- If GitHub MCP fails: Check token permissions and network connectivity
- If Git MCP fails: Ensure repository is initialized and permissions are correct
- If scratchpad is missing: Run setup commands to recreate structure

---
Last updated: 2025-06-30
Claude Code Version: Latest with MCP support