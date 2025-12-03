const { app } = require('@azure/functions');

app.http('getBacklogData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const apiKey = process.env.BACKLOG_API_KEY; 
        const apiUrl = process.env.BACKLOG_API_URL;

        if (!apiKey || !apiUrl) {
            return { status: 500, body: "Server Misconfiguration: Missing Keys" };
        }

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": apiKey 
                }
            });

            if (!response.ok) {
                return { status: response.status, body: `Upstream error: ${response.statusText}` };
            }

            const data = await response.json();

            return {
                status: 200,
                jsonBody: data
            };

        } catch (error) {
            context.log.error("Fetch error:", error);
            return { status: 500, body: "Failed to connect to backend API" };
        }
    }
});