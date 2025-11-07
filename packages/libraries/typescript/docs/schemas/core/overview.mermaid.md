```mermaid
classDiagram
  class statetransition
  class action
  base <|-- action
  class attribute
  base <|-- attribute
  class task
  base <|-- task
  task --> operation : operation
  task --> actor : actor
  task --> resource : resource
  class actor
  base <|-- actor
  class resource
  base <|-- resource
  class operation
  base <|-- operation
```
