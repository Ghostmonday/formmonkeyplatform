# FromMonkey

A comprehensive form processing and management system structured as a monorepo.

## Project Structure

```
├── apps/
│   ├── cli/         # Command line interface application
│   └── frontend/    # Next.js frontend application
├── packages/
│   ├── core/        # Core business logic and functionality
│   ├── types/       # Shared TypeScript type definitions
│   ├── utils/       # Utility functions and helpers
│   └── validators/  # Form validation logic
├── scripts/         # Build and maintenance scripts
└── docs/            # Documentation
```

## Development

This project uses pnpm workspaces for package management.

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking across the monorepo
pnpm typecheck
```

## License

Proprietary - All rights reserved.
