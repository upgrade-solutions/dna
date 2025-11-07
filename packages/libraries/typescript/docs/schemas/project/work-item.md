# WorkItem

A specific work item within a project that contributes to achieving the project's objectives.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `project` | `string` | - | ✓ | Reference to the project this task belongs to |
| `category` | `string` | enum: `analysis`, `design`, `development`, `testing`, `documentation`, `research`, `review`, `deployment`, `maintenance` | ✓ | Category of work this task represents |
| `status` | `string` | enum: `planned`, `in-progress`, `blocked`, `review`, `completed`, `cancelled` | ✓ | Current status of the task |
| `priority` | `string` | enum: `low`, `medium`, `high`, `critical` |  | Priority level of the task |
| `assignee` | `string` | - | ✓ | Reference to the actor assigned to this task |
| `estimatedHours` | `number` | min: 0 |  | Estimated effort in hours to complete the task |
| `actualHours` | `number` | min: 0 |  | Actual hours spent on the task |
| `timeline` | `object` | - |  | Task timeline and dates |
| `dependencies` | `string[]` | - |  | Other tasks that must be completed before this task can start |
| `subtasks` | `array` | - |  | Smaller work items within this task |
| `deliverables` | `string[]` | - |  | Expected outputs or artifacts from this task |
| `acceptance_criteria` | `string[]` | - |  | Criteria that must be met for the task to be considered complete |
| `tags` | `string[]` | - |  | Labels for categorizing and searching tasks |
| `notes` | `object[]` | - |  | Progress notes and updates |
| `risks` | `object[]` | - |  | Task-specific risks and mitigation strategies |
| `blockers` | `object[]` | - |  | Current blockers preventing task progress |
| `effort_tracking` | `object` | - |  | Detailed effort tracking information |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Analyze Current Income Verification Process

```json
{
  "name": "Analyze Current Income Verification Process",
  "key": "analyzeCurrentIncomeProcess",
  "type": "Task",
  "description": "Document and analyze the existing manual income verification process to identify bottlenecks and improvement opportunities",
  "project": "borrower-onboarding-improvement",
  "category": "analysis",
  "status": "completed",
  "priority": "high",
  "assignee": "business-analyst-lending",
  "estimatedHours": 16,
  "actualHours": 14,
  "timeline": {
    "startDate": "2025-09-01",
    "dueDate": "2025-09-10",
    "completedDate": "2025-09-08"
  },
  "dependencies": [],
  "deliverables": [
    "current-process-documentation",
    "bottleneck-analysis-report",
    "improvement-recommendations"
  ],
  "acceptance_criteria": [
    "Complete process flow diagram created",
    "All stakeholders interviewed",
    "Performance metrics documented",
    "At least 3 improvement opportunities identified"
  ]
}
```

### Design Automated Income Verification System

```json
{
  "name": "Design Automated Income Verification System",
  "key": "designAutomatedVerification",
  "type": "Task",
  "description": "Design the technical architecture and integration points for automated income verification using bank data APIs",
  "project": "borrower-onboarding-improvement",
  "category": "design",
  "status": "in-progress",
  "priority": "high",
  "assignee": "senior-developer-backend",
  "estimatedHours": 32,
  "actualHours": 18,
  "timeline": {
    "startDate": "2025-09-11",
    "dueDate": "2025-09-25"
  },
  "dependencies": [
    "task-analyze-current-process"
  ],
  "subtasks": [
    "research-bank-api-providers",
    "design-data-flow-architecture",
    "create-security-requirements",
    "design-fallback-mechanisms"
  ],
  "deliverables": [
    "technical-architecture-document",
    "api-integration-specifications",
    "security-requirements-document",
    "prototype-wireframes"
  ],
  "acceptance_criteria": [
    "Architecture review completed and approved",
    "Security requirements validated by compliance team",
    "Performance requirements defined",
    "Integration points clearly documented"
  ],
  "tags": [
    "backend",
    "integration",
    "security"
  ],
  "notes": [
    {
      "date": "2025-09-15",
      "author": "senior-developer-backend",
      "content": "Identified Plaid and Yodlee as primary API candidates. Need to review compliance requirements."
    }
  ]
}
```

### Implement AI Risk Assessment Step

```json
{
  "name": "Implement AI Risk Assessment Step",
  "key": "implementRiskAssessment",
  "type": "Task",
  "description": "Develop and integrate the new AI-powered risk assessment step into the loan application workflow",
  "project": "borrower-onboarding-improvement",
  "category": "development",
  "status": "planned",
  "priority": "medium",
  "assignee": "ml-engineer-risk",
  "estimatedHours": 40,
  "timeline": {
    "startDate": "2025-10-01",
    "dueDate": "2025-10-20"
  },
  "dependencies": [
    "task-design-automated-verification"
  ],
  "deliverables": [
    "risk-assessment-algorithm",
    "model-training-pipeline",
    "integration-endpoints",
    "monitoring-dashboard"
  ],
  "acceptance_criteria": [
    "Model achieves 85% accuracy on test dataset",
    "Response time under 2 seconds",
    "Proper error handling and fallback logic",
    "Monitoring and alerting configured"
  ],
  "risks": [
    {
      "description": "Model training data may be insufficient",
      "mitigation": "Prepare synthetic data generation as backup"
    }
  ]
}
```

