/**
 * Sample Loan Application Schema
 * Used for demonstrating the DNA schema renderer
 */

import { UISchema } from '@/components/schema'

export const sampleLoanApplicationSchema: UISchema = {
  id: 'loan-ui-layer',
  name: 'Loan UI Layer',
  key: 'loanUiLayer',
  type: 'UI',
  description:
    'Comprehensive user interface for loan application management including multi-step flows, dashboard views, and interactive components',

  pages: [
    {
      id: 'borrower-info-page',
      name: 'Borrower Information',
      key: 'borrowerInfo',
      type: 'Page',
      description: 'Page for collecting borrower personal and employment information',
      resourceId: 'borrower-12345',
      resourceName: 'Borrower Profile',
      layout: {
        id: 'borrower-info-layout',
        name: 'Borrower Information Layout',
        key: 'borrowerInfoLayout',
        type: 'Layout',
        structure: 'flexbox',
        containers: [
          {
            id: 'form-container',
            name: 'Form',
            key: 'form',
            type: 'Container',
            position: {
              row: 1,
              column: 1,
              columnSpan: 12,
            },
            padding: '24px',
            components: [
              {
                componentId: 'borrower-form-component',
                componentName: 'Borrower Form',
                order: 1,
              },
            ],
          },
        ],
      },
      sections: [
        {
          id: 'borrower-details-section',
          containerId: 'form-container',
          type: 'Section',
          attributes: ['firstName', 'lastName', 'email', 'phone'],
        },
      ],
    },
    {
      id: 'loan-details-page',
      name: 'Loan Details',
      key: 'loanDetails',
      type: 'Page',
      description: 'Page for specifying loan amount, purpose, and term',
      resourceId: 'loan-details-12345',
      resourceName: 'Loan Details Form',
      layout: {
        id: 'loan-details-layout',
        name: 'Loan Details Layout',
        key: 'loanDetailsLayout',
        type: 'Layout',
        structure: 'flexbox',
        containers: [
          {
            id: 'loan-form-container',
            name: 'Loan Form',
            key: 'loanForm',
            type: 'Container',
            position: {
              row: 1,
              column: 1,
              columnSpan: 12,
            },
            padding: '24px',
            components: [
              {
                componentId: 'loan-form-component',
                componentName: 'Loan Form',
                order: 1,
              },
            ],
          },
        ],
      },
      sections: [
        {
          id: 'loan-form-section',
          containerId: 'loan-form-container',
          type: 'Section',
          attributes: ['loanAmount', 'loanPurpose', 'loanTerm'],
        },
      ],
    },
    {
      id: 'review-page',
      name: 'Review & Submit',
      key: 'review',
      type: 'Page',
      description: 'Review page for confirming all application details before submission',
      resourceId: 'review-12345',
      resourceName: 'Application Review',
      layout: {
        id: 'review-layout',
        name: 'Review Layout',
        key: 'reviewLayout',
        type: 'Layout',
        structure: 'flexbox',
        containers: [
          {
            id: 'review-container',
            name: 'Review',
            key: 'review',
            type: 'Container',
            position: {
              row: 1,
              column: 1,
              columnSpan: 12,
            },
            padding: '24px',
            components: [
              {
                componentId: 'review-component',
                componentName: 'Review Component',
                order: 1,
              },
            ],
          },
        ],
      },
      sections: [
        {
          id: 'review-summary-section',
          containerId: 'review-container',
          type: 'Section',
          attributes: ['borrowerName', 'email', 'loanAmount', 'loanPurpose', 'loanTerm'],
        },
      ],
    },
  ],

  components: [
    {
      id: 'borrower-form-component',
      name: 'Borrower Form',
      key: 'borrowerForm',
      type: 'Component',
      description: 'Form component for collecting borrower personal information',
      fields: [
        {
          id: 'first-name-field',
          name: 'First Name',
          key: 'firstName',
          type: 'Field',
          dataType: 'string',
          required: true,
        },
        {
          id: 'last-name-field',
          name: 'Last Name',
          key: 'lastName',
          type: 'Field',
          dataType: 'string',
          required: true,
        },
        {
          id: 'email-field',
          name: 'Email Address',
          key: 'email',
          type: 'Field',
          dataType: 'string',
          required: true,
          validation: {
            format: 'email',
          },
        },
        {
          id: 'phone-field',
          name: 'Phone Number',
          key: 'phone',
          type: 'Field',
          dataType: 'string',
          required: true,
        },
      ],
      handlers: [
        {
          id: 'form-submit-handler',
          name: 'On Submit',
          key: 'onSubmit',
          type: 'EventHandler',
          action: 'submitBorrowerInfo',
          validation: true,
        },
      ],
    },
    {
      id: 'loan-form-component',
      name: 'Loan Form',
      key: 'loanForm',
      type: 'Component',
      description: 'Form component for specifying loan amount, purpose, and term',
      fields: [
        {
          id: 'loan-amount-field',
          name: 'Loan Amount',
          key: 'loanAmount',
          type: 'Field',
          dataType: 'number',
          required: true,
          validation: {
            minimum: 1000,
            maximum: 500000,
          },
        },
        {
          id: 'loan-purpose-field',
          name: 'Loan Purpose',
          key: 'loanPurpose',
          type: 'Field',
          dataType: 'string',
          required: true,
          validation: {
            enum: [
              'home-improvement',
              'debt-consolidation',
              'auto-purchase',
              'education',
              'other',
            ],
          },
        },
        {
          id: 'loan-term-field',
          name: 'Loan Term (months)',
          key: 'loanTerm',
          type: 'Field',
          dataType: 'integer',
          required: true,
          validation: {
            enum: [12, 24, 36, 48, 60],
          },
        },
      ],
      handlers: [
        {
          id: 'form-submit-handler',
          name: 'On Submit',
          key: 'onSubmit',
          type: 'EventHandler',
          action: 'submitLoanDetails',
          validation: true,
        },
      ],
    },
    {
      id: 'review-component',
      name: 'Review Component',
      key: 'review',
      type: 'Component',
      description: 'Component for displaying application summary and confirming submission',
      fields: [
        {
          id: 'summary-field',
          name: 'Application Summary',
          key: 'summary',
          type: 'Field',
          dataType: 'string',
          required: true,
        },
      ],
      handlers: [
        {
          id: 'submit-handler',
          name: 'On Submit',
          key: 'onSubmit',
          type: 'EventHandler',
          action: 'submitApplication',
          validation: true,
        },
      ],
    },
  ],

  flows: [
    {
      id: 'application-submission-flow',
      name: 'Application Submission Flow',
      key: 'applicationSubmissionFlow',
      type: 'Flow',
      description: 'Step-by-step flow for submitting a complete loan application',
      startStep: 'borrower-info-step',
      steps: [
        {
          id: 'borrower-info-step',
          name: 'Borrower Information',
          key: 'borrowerInfo',
          type: 'Step',
          description: 'Collect borrower personal information',
          pageId: 'borrower-info-page',
          componentId: 'borrower-form-component',
          action: 'collectBorrowerInfo',
        },
        {
          id: 'loan-details-step',
          name: 'Loan Details',
          key: 'loanDetails',
          type: 'Step',
          description: 'Collect loan specifications',
          pageId: 'loan-details-page',
          componentId: 'loan-form-component',
          action: 'collectLoanDetails',
        },
        {
          id: 'review-step',
          name: 'Review & Submit',
          key: 'review',
          type: 'Step',
          description: 'Review all information before final submission',
          pageId: 'review-page',
          componentId: 'review-component',
          action: 'reviewApplication',
          isEnd: true,
        },
      ],
      transitions: [
        {
          from: 'borrower-info-step',
          to: 'loan-details-step',
          trigger: 'formSubmitted',
          condition: 'borrowerInfoValid',
        },
        {
          from: 'loan-details-step',
          to: 'review-step',
          trigger: 'formSubmitted',
          condition: 'loanDetailsValid',
        },
      ],
    },
  ],
}
