const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Manager API (v2)",
            version: "2.0.0",
            description: `
## 🛠️ API Guide & Testing Instructions

Welcome to the **Task Manager API (v2)**. Follow the steps below to test the authentication flow:

---

### 1. Account Creation
*   Go to **Auth** section.
*   Use the \`POST /api/users/register\` endpoint.
*   Provide a name, email, and password.

### 2. Authentication
*   Use the \`POST /api/users/login\` endpoint with your registered email.
*   **Copy** the \`token\` value from the response body.

### 3. Authorization (The Key Step)
*   Scroll to the top and click the **Authorize** button.
*   Paste your token into the input field.
*   Click **Authorize** then **Close**.

> **Note:** The system uses Bearer Authentication. You only need to paste the token; the prefix is added automatically.

### 4. Manage Tasks
*   Now you can use any endpoint under the **Tasks** section.
*   All tasks created will be linked to your account.

---
`,
        },
        servers: [
            {
                url: "/",
            },
        ],
    },
    apis: ["./src/routes/*.js"], // 👈 path to route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
