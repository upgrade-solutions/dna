```mermaid
classDiagram
  class organization {
    type: any
    *domain: string
    domains: string[]
    metadata: object
  }
  base <|-- organization
```
