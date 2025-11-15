import type { FormSchema } from "./schema-driven-form"
import type { FormVersion } from "./build-mode"

export const formVersions: FormVersion[] = [
  {
    version: "v1.2.1",
    label: "Fixed email validation",
    date: "2025-07-22",
    status: "released",
    schema: {
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter full name",
          required: true,
          defaultValue: "",
          disabled: false,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address",
          required: true,
          defaultValue: "",
          disabled: false,
          validation: {
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
        },
        {
          name: "agreeToTerms",
          type: "checkbox",
          label: "I agree to the terms and conditions",
          defaultValue: false,
        },
      ],
      submitButton: {
        label: "Submit",
        disabledUntil: "agreeToTerms",
      },
      onSubmit: (data) => console.log("Form submitted:", data),
    },
  },
  {
    version: "v1.2.0",
    label: "Terms & Conditions",
    date: "2025-06-10",
    status: "released",
    schema: {
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter full name",
          required: true,
          defaultValue: "",
          disabled: false,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address",
          required: true,
          defaultValue: "",
          disabled: false,
          validation: {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          },
        },
        {
          name: "agreeToTerms",
          type: "checkbox",
          label: "I agree to the terms and conditions",
          defaultValue: false,
        },
      ],
      submitButton: {
        label: "Submit",
        disabledUntil: "agreeToTerms",
      },
      onSubmit: (data) => console.log("Form submitted:", data),
    },
  },
  {
    version: "v1.1.0",
    label: "Added Validation",
    date: "2025-03-22",
    status: "deprecated",
    schema: {
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter full name",
          required: true,
          defaultValue: "",
          disabled: false,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address",
          required: true,
          defaultValue: "",
          disabled: false,
          validation: {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          },
        },
      ],
      submitButton: {
        label: "Submit",
      },
      onSubmit: (data) => console.log("Form submitted:", data),
    },
  },
  {
    version: "v1.0.0",
    label: "Initial Release",
    date: "2025-01-15",
    status: "deprecated",
    schema: {
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter full name",
          defaultValue: "",
          disabled: false,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address",
          defaultValue: "",
          disabled: false,
        },
      ],
      submitButton: {
        label: "Submit",
      },
      onSubmit: (data) => console.log("Form submitted:", data),
    },
  },
]
