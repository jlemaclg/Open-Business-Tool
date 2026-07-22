# Generate OAS API from Data Dictionary

## When to use

When the `api-builder` agent needs to transform an approved data dictionary into OpenAPI 3.1.0 artifacts.

## Inputs

- `output/discovery/data-dictionary.json` — approved data dictionary from Phase 1

## Procedure

### 1. Parse the Data Dictionary

Read `output/discovery/data-dictionary.json` and extract:
- `useCase` → API title and tags
- `paths[]` → OpenAPI path items
- `schemas{}` → Component schemas

### 2. Build Common Type Schemas

Scan all schema fields for reusable types. Create standalone schema files for:

| Common Type | File | Trigger |
|-------------|------|---------|
| Amount | `common/Amount.schema.json` | Any field with `iso20022Type: "ActiveCurrencyAndAmount"` |
| Party | `common/Party.schema.json` | Any field with `iso20022Ref` containing "PartyIdentification" |
| Account | `common/Account.schema.json` | Any field with `iso20022Ref` containing "AccountIdentification" |
| PostalAddress | `common/PostalAddress.schema.json` | Any field with `iso20022Ref` containing "PostalAddress" |
| Agent | `common/Agent.schema.json` | Any field with `iso20022Ref` containing "FinancialInstitution" |

Each common schema must follow JSON Schema Draft 2020-12 with:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.financial-entity.com/schemas/common/Amount.schema.json",
  "title": "Amount",
  "description": "ISO 20022 ActiveCurrencyAndAmount representation",
  "type": "object",
  "x-iso20022-ref": "ActiveCurrencyAndAmount",
  "x-gov-owner": "API Governance",
  "x-gov-version": "1.0.0",
  "properties": { ... },
  "required": [...],
  "additionalProperties": false
}
```

### 3. Build Resource Schemas

For each schema in the data dictionary:

1. Create the main resource schema file.
2. For each field:
   - If the field maps to a common type, use `$ref`.
   - Otherwise, build the property inline with correct JSON Schema types.
3. Add `x-iso20022-ref` metadata per field.
4. Set `required` from mandatory fields.
5. Add `examples` with realistic values.

Save to `output/api/schemas/<SchemaName>.schema.json`.

### 4. Build Request/Response Schemas

For each path that has a `requestBody`:
1. Create a `<SchemaName>CreateRequest.schema.json` — subset of the main schema excluding server-generated fields (`id`, `status`, `createdAt`, `updatedAt`).
2. For PATCH operations, create `<SchemaName>PatchRequest.schema.json` — all fields optional.

For error responses, create standard schemas:
- `BadRequest.schema.json` — 400 errors
- `NotFound.schema.json` — 404 errors
- `InternalServerError.schema.json` — 500 errors

Error schema structure:
```json
{
  "type": "object",
  "properties": {
    "code": { "type": "string", "description": "Error code" },
    "message": { "type": "string", "description": "Human-readable error message" },
    "details": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": { "type": "string" },
          "reason": { "type": "string" }
        }
      }
    }
  },
  "required": ["code", "message"]
}
```

### 5. Assemble OpenAPI YAML

Build the OpenAPI document:

```yaml
openapi: "3.1.0"
info:
  title: "[useCase] API"
  version: "1.0.0"
  description: "..."
  contact:
    name: API Governance Team
  x-gov-use-case: "[useCase]"
  x-gov-generated-by: api-builder-agent
  x-gov-generation-date: "[ISO date]"

servers:
  - url: https://api.financial-entity.com/v1
    description: Production
  - url: https://api-sandbox.financial-entity.com/v1
    description: Sandbox

tags:
  - name: "[resource]"
    description: "[resource description]"

paths:
  /[resource]:
    post:
      operationId: create[Resource]
      summary: "Create a new [resource]"
      tags: ["[resource]"]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/[Resource]CreateRequest'
      responses:
        '201':
          description: "[Resource] created successfully"
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/[Resource]'
        '400':
          $ref: '#/components/responses/BadRequest'
    get:
      operationId: list[Resources]
      summary: "List [resources]"
      tags: ["[resource]"]
      parameters:
        - name: page
          in: query
          schema: { type: integer, minimum: 1, default: 1 }
        - name: pageSize
          in: query
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
        - name: status
          in: query
          schema: { type: string }
      responses:
        '200':
          description: "List of [resources]"
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/[Resource]'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    # ... all schemas referenced via $ref to schema files
  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BadRequest'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/NotFound'
```

### 6. Generate Data Dictionary Markdown

Create `output/api/data-dictionary.md`:

```markdown
# Data Dictionary — [Use Case]

Generated: [date]
Source: output/discovery/data-dictionary.json

## Overview
- Total resources: N
- Total fields: N
- ISO 20022 coverage: X%

## [Resource Name]

| # | Field | Type | ISO 20022 Reference | ISO 20022 Type | Mandatory | Description | Example |
|---|-------|------|---------------------|----------------|-----------|-------------|---------|
| 1 | id | string | ... | Max35Text | Yes | ... | ... |
```

### 7. Generate Report

Create `output/api/generation-report.md` with:
- List of all generated files
- Schema validation results
- $ref resolution check
- Field coverage statistics
- Any warnings or issues

## Outputs

- `output/api/openapi.yaml`
- `output/api/schemas/*.schema.json`
- `output/api/schemas/common/*.schema.json`
- `output/api/data-dictionary.md`
- `output/api/generation-report.md`
