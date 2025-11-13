```mermaid
classDiagram
  class platform
  base <|-- platform
  class application
  base <|-- application
  application --> ui : ui
  application --> api : api
```
