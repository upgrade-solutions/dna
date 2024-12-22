import { assertEquals } from "@std/assert";
import { loadAjvSchemas } from "../utils/ajv-helper.ts";
const ajv = await loadAjvSchemas("./ui_components");

Deno.test("validate card schema", () => {
  const data = {
    key: "card1",
    title: "Card Title",
    subtitle: "Card Subtitle",
    content: "This is the main content of the card.",
    footer: "Footer content here",
    image: {
      src: "image-url.jpg",
      alt: "Image description"
    },
    actions: [
      {
        label: "Action 1",
        action_type: "button"
      },
      {
        label: "Action 2",
        action_type: "link"
      }
    ],
  };

  const validate = ajv.getSchema('card.json');
  assertEquals(validate?.(data), true, validate?.errors);
});

Deno.test("validate page schema", () => {
  const data = {
    key: "page1",
    title: "Page Title",
    layout: {
      header: {
        visible: true,
        height: "60px"
      },
      footer: {
        visible: true,
        height: "40px"
      },
      sidebar: {
        visible: true,
        width: "250px"
      },
      content: {
        padding: "20px"
      }
    },
    route: {
      path: "/home",
      component: "HomeComponent",
      exact: true,
      strict: false,
      sensitive: false
    }
  };
  
  const validate = ajv.getSchema('page.json');
  assertEquals(validate?.(data), true, validate?.errors);
});