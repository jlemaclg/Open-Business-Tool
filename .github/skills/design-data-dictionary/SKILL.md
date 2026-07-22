# Design Data Dictionary

## When to use

When the `business-analyst` agent needs to propose and iterate on a data dictionary with ISO 20022 field mappings based on discovered use case information.

## Inputs

- Validated use case summary (from `discover-use-case` skill)
- User feedback from iteration rounds

## Procedure

1. **Build initial field inventory:**
   For each API resource, create a comprehensive field list:

   a. **Standard fields** (always include for main resources):
      - `id` — unique identifier (`Max35Text`)
      - `status` — current state (enum)
      - `createdAt` — creation timestamp (`ISODateTime`)
      - `updatedAt` — last modification timestamp (`ISODateTime`)

   b. **Domain-specific fields** based on ISO 20022 message structure:
      - For payments: `paymentId`, `endToEndId`, `instructedAmount`, `debtor`, `creditor`, `remittanceInformation`, `purposeCode`
      - For accounts: `accountId`, `iban`, `currency`, `accountType`, `servicer`
      - For securities: `instrumentId`, `isin`, `quantity`, `price`, `tradeDate`, `settlementDate`
      - For FX: `sourceCurrency`, `targetCurrency`, `exchangeRate`, `valueDate`

   c. **Nested objects** — group related fields:
      - `debtor` → `{ name, account, agent, postalAddress }`
      - `creditor` → `{ name, account, agent, postalAddress }`
      - `amount` → `{ value, currency }`
      - `postalAddress` → `{ streetName, buildingNumber, postCode, townName, country }`

2. **Map each field to ISO 20022:**
   For each field, determine:
   - `iso20022Ref`: The Business Component or Business Element name (e.g., `PaymentIdentification.EndToEndIdentification`)
   - `iso20022Type`: The ISO 20022 Data Type (e.g., `Max35Text`, `ISODateTime`)
   - If no ISO 20022 equivalent exists, set `iso20022Ref: null` and add a note explaining it is a local/custom field.

3. **Determine cardinality and constraints:**
   - Mandatory fields → add to `required` array
   - Optional fields → document as optional
   - Arrays → specify `minItems`, `maxItems` if known
   - Strings → specify `maxLength` based on ISO 20022 type
   - Enums → list all possible values with descriptions

4. **Generate Mermaid diagrams:**

   a. **API Flow Diagram:**
   ```mermaid
   flowchart LR
       User([Business User]) -->|1. Describe use case| BA[Business Analyst Agent]
       BA -->|2. Propose paths & dictionary| User
       User -->|3. Iterate & approve| BA
       BA -->|4. Save dictionary| DD[(data-dictionary.json)]
       DD -->|5. Generate| AB[API Builder Agent]
       AB -->|6. Deliver| API[OpenAPI YAML + Schemas]
   ```

   b. **Resource Diagram:**
   ```mermaid
   graph TD
       subgraph "API Resources"
           R1[POST /resources] --> RES[Resource]
           R2[GET /resources] --> RES
           R3[GET /resources/:id] --> RES
           R4[PATCH /resources/:id] --> RES
       end
       subgraph "Data Model"
           RES --> F1[id: Max35Text]
           RES --> F2[amount: ActiveCurrencyAndAmount]
           RES --> F3[debtor: PartyIdentification]
           RES --> F4[creditor: PartyIdentification]
           RES --> F5[status: StatusCode]
       end
   ```

   c. **Entity-Relationship Diagram:**
   ```mermaid
   erDiagram
       RESOURCE {
           string id PK
           string status
           datetime createdAt
       }
       PARTY {
           string name
           string identification
       }
       ACCOUNT {
           string iban
           string currency
       }
       RESOURCE ||--|| PARTY : "debtor"
       RESOURCE ||--|| PARTY : "creditor"
       PARTY ||--o| ACCOUNT : "has"
   ```

5. **Present to user for validation:**
   - Show the field table with ISO 20022 mappings
   - Show the Mermaid diagrams
   - Ask specific validation questions:
     - "Are all mandatory fields correct?"
     - "Do you need additional fields not listed here?"
     - "Are the ISO 20022 mappings appropriate?"
     - "Should any field have different constraints?"

6. **Apply user feedback:**
   - Add requested fields with appropriate ISO 20022 mapping
   - Remove unnecessary fields
   - Modify types, constraints, or descriptions as requested
   - Re-present the updated dictionary
   - Repeat until the user confirms

7. **Save the approved dictionary:**
   Save as `output/discovery/data-dictionary.json` with the structure defined in the `business-analyst` agent specification.

## Field Naming Conventions

- Use camelCase for field names: `endToEndId`, `bookingDateTime`
- Use ISO 20022 naming when possible: prefer `debtor` over `sender`, `creditor` over `receiver`
- Nested objects use dot notation in documentation: `debtor.name`, `debtor.account.iban`
- IDs should end with `Id`: `remittanceId`, `transactionId`
- Timestamps should end with appropriate suffix: `createdAt`, `bookingDateTime`
- Booleans should start with `is` or `has`: `isUrgent`, `hasAttachments`

## Outputs

- Data dictionary field tables (for user review)
- Mermaid diagrams (API flow, resource model, ER diagram)
- `output/discovery/data-dictionary.json` (final approved version)
- `output/discovery/api-design.md` (design document with all diagrams and tables)
