# Action Schema

Defines an action — an operation performed by an actor on a resource.

## Examples

### Submit Loan Application

```json
{
  "name": "Submit Loan Application",
  "key": "submitLoanApplication",
  "type": "Action",
  "description": "Borrower submits a completed loan application with required documentation"
}
```

### Verify Income

```json
{
  "name": "Verify Income",
  "key": "verifyIncome",
  "type": "Action",
  "description": "Loan officer verifies the borrower's income documentation"
}
```

### Check Credit Score

```json
{
  "name": "Check Credit Score",
  "key": "checkCreditScore",
  "type": "Action",
  "description": "System retrieves and analyzes borrower's credit score from credit bureau"
}
```

### Approve Loan

```json
{
  "name": "Approve Loan",
  "key": "approveLoan",
  "type": "Action",
  "description": "Loan officer or automated system approves the loan application"
}
```

