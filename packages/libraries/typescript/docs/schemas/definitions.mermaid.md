```mermaid
graph LR
  subgraph platformmanagement["platform-management"]
    platform["platform"]
    application["application"]
  end
  subgraph core["core"]
    statetransition["state-transition"]
    action["action"]
    attribute["attribute"]
    task["task"]
    actor["actor"]
    resource["resource"]
    operation["operation"]
  end
  subgraph projectmanagement["project-management"]
    project["project"]
    program["program"]
    workitem["work-item"]
  end
  subgraph value["value"]
    outcome["outcome"]
    opportunity["opportunity"]
    metric["metric"]
    solution["solution"]
  end
  subgraph productmanagement["product-management"]
    workflow["workflow"]
    step["step"]
    organization["organization"]
    product["product"]
  end
  base --> platform
  base --> application
  base --> action
  base --> attribute
  base --> task
  base --> actor
  base --> resource
  base --> operation
  base --> project
  base --> program
  base --> workitem
  base --> outcome
  base --> opportunity
  base --> metric
  base --> solution
  base --> workflow
  base --> step
  base --> organization
  base --> product
```
