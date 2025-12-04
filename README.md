# Backlog-Interface
### Version 1.0

Vue.js Single Page Application with a Node.js Middleware, deployed using Azure Static Web Apps.
Developed as a companion interface for the [Backlog API](https://github.com/dirttop/Backlog-API).

## Version Specific Features
- Middleware Proxy

## Introduction

This interface provides a simple way to catalog and track Steam Games in your backlog. It interacts with the Backlog API via a middleware proxy to ensure API keys are never exposed to the client.

## Getting Started
This section will get you started with running the interface locally or deploying it to Azure.

>If you want to learn how to use the Backlog-Interface, go [here](#using-the-interface).

### Prerequisites
- Node.js (v18+)
- npm
- Azure Account
- Azure Functions Core Tools

### Dependencies
- Vue 3
- Vite
- TypeScript
- Azure Static Web Apps CLI (Recommended)

### Setup

> **Ensure that all dependencies are installed.** <br>

&emsp;Clone the repository and navigate to the root directory.

&emsp;First, we need to set up the frontend dependencies. Navigate to the `App` directory.

```
cd App
npm install
```

&emsp;Next, set up the middleware dependencies. Navigate to the `Middleware` directory.

```
cd Middleware
npm install
```

### Project Structure

**App** - Contains the Vue.js frontend application source code.

**Middleware** - Contains the Azure Functions proxy code.

**components** - UI elements like `GameCard.vue` and `TheCreateGameModal.vue`.

**composables** - Shared state logic, primarily `useGames.ts` for API interaction.

### Configuration

> **This requires the API Key and URL from your backend service.** <br>

&emsp;To run the middleware locally, you must create a `local.settings.json` file in the `Middleware` directory.

&emsp;Add your secrets to the file as follows:

```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "BACKLOG_API_KEY": "YOUR_API_KEY_HERE",
    "BACKLOG_API_URL": "YOUR_API_URL_HERE"
  }
}
```

### Running Locally

> **Prerequisite:** Ensure `local.settings.json` is configured.

&emsp;To run the frontend with Vite:
```
cd App
npm run dev
```

&emsp;To run the middleware functions:
```
cd Middleware
npm start
```

### Deployment

&emsp;Create a Static Web App resource within Azure.

&emsp;Connect it to your GitHub repository. Azure will automatically detect the `App` location and the `Middleware` location (Azure Functions).

&emsp;Once deployed, navigate to **Configuration** -> **Application Settings** in the Azure Portal for your Static Web App.

&emsp;Add the following settings:
- `BACKLOG_API_KEY`
- `BACKLOG_API_URL`

> Your deployed domain will now be available on Azure.

### Governance Features

This project implements the best practices for security that can be accessed for free. With a paid SWA plan, you can assigned User Assigned Identites and hide secrets within a Key Vault, which is recommended for production.

#### 1. Middleware Proxy Pattern
*   **Implementation**: Direct API calls are never made from the browser. All requests go through the Azure Function middleware.
*   **Security**: The API Key is stored only on the server side (Azure App Settings), preventing exposure to end-users.

#### 2. Environment Variable Isolation
*   **Local Development**: Secrets are stored in `local.settings.json`, which is git-ignored.
*   **Production**: Secrets are stored in Azure Application Settings, encrypted at rest.

## Using the Interface

### Dashboard
&emsp;The main view shows your current backlog. Games are color-coded based on status:
- **White**: Backlog
- **Green**: Completed
- **Red**: Dropped

### Management
&emsp;**Add Game**: Click the "Add Game" button to open the modal.
&emsp;**Edit**: Click the "Edit" button on any game card.
&emsp;**Search**: Use the search bar to filter by Title or ID.

## Screenshots

### Main View

### Add Game Modal

## Sources

[Vue.js Documentation](https://vuejs.org/)
[Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
