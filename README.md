# Aurora DSQL + Drizzle ORM Demo

A minimal demo showing how to use [Drizzle ORM](https://orm.drizzle.team/) with [Amazon Aurora DSQL](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/) — a serverless, PostgreSQL-compatible distributed SQL database.

## What This Demonstrates

- **Connecting** to DSQL using the official [DSQL node-postgres connector](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/SECTION_program-with-dsql-connector-for-node-postgres.html) (automatic IAM auth)
- **DSQL-compatible schema** design with Drizzle (UUIDs, no FKs, JSON via native `json` type)
- **Migration linting** with [`dsql-lint`](https://github.com/awslabs/aurora-dsql-tools/tree/main/dsql-lint) to catch incompatible SQL
- **CRUD operations** using Drizzle's type-safe query builder
- **Application-layer referential integrity** (DSQL doesn't enforce Foreign Keys constraints)

## Prerequisites

- An [Aurora DSQL cluster](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/getting-started.html)
- AWS CLI configured with credentials that have `dsql:DbConnectAdmin` permission
- Node.js 20+
- (Optional) [`dsql-lint`](https://github.com/awslabs/aurora-dsql-tools/tree/main/dsql-lint) for migration linting

## Quick Start

```bash
# Install dependencies
npm install

# Set your cluster endpoint
export CLUSTER_ENDPOINT="<your-cluster-id>.dsql.<region>.on.aws"

# Generate migrations from the Drizzle schema
npm run db:generate

# (Optional) Lint migrations for DSQL compatibility
npm run db:lint
# Auto-fix issues:
npm run db:lint:fix

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Run the demo
npm run demo
```

## Project Structure

```
├── src/
│   ├── db/
│   │   ├── schema.ts      # Drizzle schema (DSQL-compatible)
│   │   └── connection.ts   # DSQL connector + Drizzle setup
│   ├── migrate.ts          # Run migrations
│   ├── seed.ts             # Seed sample data
│   └── index.ts            # Demo: CRUD operations
├── drizzle/                # Generated SQL migrations
├── drizzle.config.ts       # Drizzle Kit config
└── package.json
```

## DSQL Compatibility Notes

> **Disclaimer:** The compatibility information below reflects Aurora DSQL behavior as of April 23, 2026. Check the [official documentation](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility.html) for the latest supported features.

Drizzle works with DSQL via its `node-postgres` driver. Key things to keep in mind:

| Feature | DSQL Status | Drizzle Workaround |
|---|---|---|
| `serial()` / `bigserial()` | ❌ Not supported | Use `uuid().defaultRandom()` |
| `.references()` (foreign keys) | ❌ Not supported | Validate in app code before insert |
| `json()` | ✅ Supported | Use `json()` directly — no workaround needed |
| `jsonb()` | ❌ Not supported | Use `json()` instead |
| `pgEnum()` | ❌ Not supported | Use `varchar` + CHECK constraint |
| Index creation | Must be ASYNC | `dsql-lint --fix` rewrites `CREATE INDEX` → `CREATE INDEX ASYNC` |
| Transactions | 3,000 rows max | Batch large operations |

## Migration Workflow

The recommended workflow for Drizzle + DSQL:

1. Define schema in `src/db/schema.ts` using DSQL-compatible types
2. `npm run db:generate` — generate SQL migration files
3. `npm run db:lint:fix` — auto-fix DSQL incompatibilities (e.g., `CREATE INDEX` → `CREATE INDEX ASYNC`)
4. `npm run db:migrate` — apply to your DSQL cluster

## Resources

- [Aurora DSQL Documentation](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/)
- [DSQL PostgreSQL Compatibility](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-postgresql-compatibility.html)
- [DSQL node-postgres Connector](https://github.com/aws-samples/aurora-dsql-samples/tree/main/javascript/node-postgres)
- [dsql-lint](https://github.com/awslabs/aurora-dsql-tools/tree/main/dsql-lint) — Lint & auto-fix SQL for DSQL compatibility
- [Drizzle ORM Docs](https://orm.drizzle.team/)
