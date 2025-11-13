```mermaid
classDiagram
  class application {
    type: any
    ui: ui
    api: api
  }
  base <|-- application
  application --> ui : ui
  application --> api : api
```
