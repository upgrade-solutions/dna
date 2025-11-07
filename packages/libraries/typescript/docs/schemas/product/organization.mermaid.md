```mermaid
classDiagram
  class organization {
    type: any
    *domain: string
    products: string[]
    metadata: object
  }
  base <|-- organization
```
