```mermaid
classDiagram
  class process {
    type: any
    *domain: string
    steps: array
    triggers: object[]
    outputs: string[]
  }
  base <|-- process
```
