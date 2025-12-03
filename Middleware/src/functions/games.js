const { app } = require('@azure/functions');

app.http('games', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Proxying ${request.method} request to backend API`);
        context.log(`Request URL: ${request.url}`);

        const apiKey = process.env.BACKLOG_API_KEY;
        const apiUrl = process.env.BACKLOG_API_URL;

        // Log environment variable status (without exposing values)
        context.log(`API Key present: ${!!apiKey}`);
        context.log(`API URL present: ${!!apiUrl}`);
        if (apiUrl) {
            context.log(`API URL value: ${apiUrl}`);
        }

        if (!apiKey || !apiUrl) {
            context.log.error("Missing environment variables!");
            return {
                status: 500,
                jsonBody: { 
                    error: "Server misconfiguration: Missing API credentials",
                    details: {
                        hasApiKey: !!apiKey,
                        hasApiUrl: !!apiUrl
                    }
                }
            };
        }

        try {
            // Parse the URL to get the path after /api/games
            const url = new URL(request.url);
            const pathMatch = url.pathname.match(/\/api\/games\/?(.*)$/);
            const path = pathMatch ? pathMatch[1] : '';
            
            // Construct the full URL to the backend API
            const fullUrl = path ? `${apiUrl}/games/${path}` : `${apiUrl}/games`;
            
            context.log(`Forwarding to: ${fullUrl}`);

            // Prepare headers
            const headers = {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            };

            // Prepare fetch options
            const fetchOptions = {
                method: request.method,
                headers: headers
            };

            // Add body for POST and PUT requests
            if (request.method === 'POST' || request.method === 'PUT') {
                const body = await request.text();
                if (body) {
                    fetchOptions.body = body;
                }
            }

            // Make the request to the backend API
            const response = await fetch(fullUrl, fetchOptions);

            // Handle different response scenarios
            if (response.status === 404) {
                return {
                    status: 404,
                    jsonBody: { error: "Resource not found" }
                };
            }

            if (!response.ok) {
                return {
                    status: response.status,
                    jsonBody: { error: `Backend API error: ${response.statusText}` }
                };
            }

            // Parse JSON response from backend
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return {
                    status: response.status,
                    jsonBody: data
                };
            } else {
                // If backend doesn't return JSON, return success without body
                return {
                    status: response.status,
                    body: response.ok ? "Success" : "Error"
                };
            }

        } catch (error) {
            context.log.error("Proxy error:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to connect to backend API", details: error.message }
            };
        }
    }
});
