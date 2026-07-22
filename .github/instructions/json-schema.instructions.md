---
applyTo: "**/*.schema.json"
---

# JSON Schema Standards — API Designer

## Format

- All schemas MUST use `"$schema": "https://json-schema.org/draft/2020-12/schema"`.
- All schemas MUST have a `$id` following the pattern `https://api.financial-entity.com/schemas/<use-case>/<name>.schema.json`.
- All schemas MUST have `title` and `description`.

## Governance metadata

- Every schema MUST include `x-gov-owner` and `x-gov-version`.
- Schemas mapped to ISO 20022 MUST include `x-iso20022-ref` with the Business Component or Data Type name.
- Schemas tied to a specific use case MUST include `x-gov-use-case`.
- Schemas restricted to specific geographies MUST include `x-gov-geographies` as an array of ISO 3166-1 alpha-2 codes.

## Composition

- Shared types go in `output/api/schemas/common/` and are referenced via `$ref`.
- Geography-specific extensions use `allOf` referencing the canonical schema plus local overrides.
- Never duplicate a type definition that already exists in common.

## Properties

- Every property MUST have `type` and `description`.
- Every property SHOULD have `examples` with realistic values (not `"string"` or `0`).
- String properties with known patterns MUST include `pattern` or `format`.
- String properties with known limits MUST include `maxLength`.

## Validation

- `required` MUST list all mandatory fields.
- `additionalProperties` SHOULD be set explicitly (prefer `false` for strict schemas).
