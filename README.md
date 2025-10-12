# Digital DNA
Digital DNA unifies scattered business knowledge into a single source of truth. Once defined, your DNA can be used to generate documentation, workflows, and robust software automatically. Your digital blueprint for building business applications.

The BizOps-as-Code platform that encodes how your business works, Digital DNA captures everything from meetings to models and generates everything from docs to microservices. It's not another workflow tool--it's your company's living blueprint.

## Documentation

- **[Positioning](docs/positioning.md)** - Market positioning and competitive differentiation

## Packages
- **[Core Library (TypeScript)](packages/core/ts/README.md)** - TypeScript implementation of DNA core
- **[Core Library (Python)](packages/core/py/README.md)** - Python implementation of DNA core
- **[Schemas](packages/schemas/)** - JSON schemas for DNA specifications

## Structure
```
dna/
├── docs/
├── packages/
│   ├── core/
│   │   ├── ts/                    # dna-core
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── types/
│   │   │   │   ├── parsers/
│   │   │   │   ├── validators/
│   │   │   │   └── utils/
│   │   │   └── package.json
│   │   └── py/                    # dna_core
│   │       ├── dna_core/
│   │       │   ├── __init__.py
│   │       │   ├── types/
│   │       │   ├── parsers/
│   │       │   ├── validators/
│   │       │   └── utils/
│   │       ├── pyproject.toml
│   │       └── README.md
│   │
│   ├── build/
│   │   ├── ts/                    # dna-build
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ui/            # codegen: DNA → React/Vue/etc.
│   │   │   │   ├── api/           # codegen: DNA → OpenAPI / server stubs
│   │   │   │   ├── docs/          # DNA → Markdown / diagrams
│   │   │   │   └── utils/
│   │   │   └── package.json
│   │   └── py/                    # dna_build
│   │       ├── dna_build/
│   │       │   ├── __init__.py
│   │       │   ├── ui/
│   │       │   ├── api/
│   │       │   └── docs/
│   │       ├── pyproject.toml
│   │       └── README.md
│   │
│   ├── runtime/
│   │   ├── ts/                    # dna-runtime
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── evaluators/    # conditions, logic, workflows
│   │   │   │   ├── resolvers/     # resolve actors/resources dynamically
│   │   │   │   ├── storage/       # DB adapters
│   │   │   │   └── utils/
│   │   │   └── package.json
│   │   └── py/                    # dna_runtime
│   │       ├── dna_runtime/
│   │       │   ├── __init__.py
│   │       │   ├── evaluators/
│   │       │   ├── resolvers/
│   │       │   ├── storage/
│   │       │   └── utils/
│   │       ├── pyproject.toml
│   │       └── README.md
│   │
│   ├── schemas/                   # dna-schemas / dna_schemas
│   │   ├── base.json
│   │   ├── actor.json
│   │   ├── action.json
│   │   ├── resource.json
│   │   ├── workflow.json
│   │   └── index.json
│   │
│   ├── utils/
│   │   ├── ts/                    # dna-utils
│   │   └── py/                    # dna_utils
│   │
│   └── docs/                      # documentation generators or specs
│
└── examples/
    ├── ts/
    └── py/
```