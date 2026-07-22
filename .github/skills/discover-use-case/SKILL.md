# Discover Use Case

## When to use

When the `business-analyst` agent needs to understand a business use case and extract structured information from a natural language description.

## Inputs

- Natural language description of the use case from the business user.
- Optionally: existing process documents, functional requirements, or business rules.

## Procedure

1. **Parse the user input:**
   a. Identify the use case name (noun phrase, e.g., "International Remittances").
   b. Identify business processes (verb phrases, e.g., "create a remittance", "approve a batch").
   c. Identify entities (nouns, e.g., "sender", "beneficiary", "transaction").
   d. Identify constraints (geographies, regulations, business rules).

2. **Classify the ISO 20022 domain:**
   a. Map the use case to one or more ISO 20022 message domains:
      - Payments → `pain` (initiation), `pacs` (clearing), `camt` (reporting)
      - Securities → `sese`, `seev`, `semt`
      - Trade Finance → `tsmt`, `tsin`
      - Foreign Exchange → `fxtr`
      - Account Management → `acmt`
   b. Identify the primary message type (e.g., `pain.001` for payment initiation).

3. **Derive API resources:**
   a. Each main entity becomes an API resource (e.g., `/remittances`, `/payments`, `/accounts`).
   b. Each process becomes an operation:
      - "Create X" → `POST /resources`
      - "List X" → `GET /resources`
      - "Get X details" → `GET /resources/{id}`
      - "Update X" → `PATCH /resources/{id}`
      - "Delete/Cancel X" → `DELETE /resources/{id}`
      - "Approve X" → `POST /resources/{id}/approve` (action sub-resource)
      - "Submit X" → `POST /resources/{id}/submit`
   c. Identify sub-resources for nested entities (e.g., `/remittances/{id}/payments`).

4. **Identify required fields per resource:**
   a. For each resource, list the fields needed based on the business process.
   b. Classify each field:
      - **Identity fields:** IDs, references → `Max35Text`
      - **Temporal fields:** dates, timestamps → `ISODateTime` / `ISODate`
      - **Monetary fields:** amounts → `ActiveCurrencyAndAmount`
      - **Party fields:** sender, receiver → `PartyIdentification`
      - **Account fields:** account numbers → `AccountIdentification`
      - **Status fields:** state → enum type
      - **Descriptive fields:** names, descriptions → `Max140Text` / `Max256Text`

5. **Ask clarifying questions** if any of the following is unclear:
   - What triggers the process? (user action, scheduled, event-driven)
   - Who are the participants? (roles, permissions)
   - What are the possible statuses and transitions?
   - Are there batch operations?
   - Are there approval workflows?
   - What are the error scenarios?

## Outputs

- Structured use case summary (entities, processes, constraints)
- ISO 20022 domain classification
- Proposed API paths with HTTP methods
- Initial field list per resource with ISO 20022 type suggestions
- List of open questions for the user
