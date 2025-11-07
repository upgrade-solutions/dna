```mermaid
classDiagram
  class workflow {
    type: any
    *product: string
    steps: array
    triggers: object[]
    outputs: string[]
  }
  base <|-- workflow
```
