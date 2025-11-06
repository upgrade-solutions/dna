# Project Schema

Defines a project — a focused initiative that highlights and modifies a specific slice of a product's DNA graph.

## Examples

### Borrower Onboarding Improvement

```json
{
  "name": "Borrower Onboarding Improvement",
  "key": "borrowerOnboardingImprovement",
  "type": "Project",
  "description": "Streamline the borrower onboarding process by optimizing steps 2 & 3 of the loan application workflow",
  "product": "loan-origination-system",
  "targetWorkflows": [
    {
      "workflow": "loan-application-workflow",
      "targetSteps": [
        "step-2",
        "step-3"
      ],
      "modifications": [
        {
          "type": "update",
          "stepId": "step-2",
          "changes": {
            "action": "automated-income-verification",
            "description": "Replace manual income verification with automated bank data integration"
          }
        },
        {
          "type": "add",
          "afterStep": "step-3",
          "newStep": {
            "name": "Risk Assessment",
            "actor": "risk-assessment-ai",
            "action": "assess-risk",
            "resource": "loan-application"
          }
        }
      ]
    }
  ],
  "status": "in-progress",
  "priority": "high",
  "timeline": {
    "startDate": "2025-09-01",
    "targetEndDate": "2025-12-15",
    "milestones": [
      {
        "name": "Requirements Analysis Complete",
        "date": "2025-09-30",
        "status": "completed"
      },
      {
        "name": "Development Phase Complete",
        "date": "2025-11-30",
        "status": "in-progress"
      },
      {
        "name": "Testing and Validation Complete",
        "date": "2025-12-10",
        "status": "planned"
      }
    ]
  },
  "team": [
    {
      "role": "Project Manager",
      "actor": "project-manager-onboarding"
    },
    {
      "role": "Business Analyst",
      "actor": "business-analyst-lending"
    },
    {
      "role": "Developer",
      "actor": "senior-developer-backend"
    }
  ],
  "stakeholders": [
    "product-manager-loans",
    "compliance-officer",
    "customer-experience-lead"
  ],
  "success_metrics": [
    {
      "metric": "Application Processing Time",
      "baseline": "45 minutes",
      "target": "25 minutes",
      "measurement": "average time from submission to initial decision"
    },
    {
      "metric": "Customer Satisfaction Score",
      "baseline": "7.2",
      "target": "8.5",
      "measurement": "post-application survey rating (1-10 scale)"
    }
  ],
  "risks": [
    {
      "description": "Integration with bank data providers may face regulatory delays",
      "impact": "high",
      "probability": "medium",
      "mitigation": "Prepare fallback to existing manual process"
    }
  ]
}
```

