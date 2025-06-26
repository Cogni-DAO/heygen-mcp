/**
 * Function to get a specific generation by ID from the Luma API.
 *
 * @param {Object} args - Arguments for getting the generation.
 * @param {string} args.generation_id - The ID of the generation to retrieve.
 * @returns {Promise<Object>} - The generation object with full details.
 */
const executeFunction = async ({ generation_id }) => {
    const baseUrl = 'https://api.lumalabs.ai';
    const token = process.env.LUMA_API_KEY;

    if (!token) {
        return { error: 'LUMA_API_KEY environment variable is not set.' };
    }

    try {
        // Construct the URL for the request
        const url = `${baseUrl}/dream-machine/v1/generations/${generation_id}`;

        // Set up headers for the request
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Perform the fetch request
        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        // Check if the response was successful
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = JSON.stringify(errorData);
            } catch (e) {
                // Response wasn't JSON, use the HTTP status message
            }
            throw new Error(errorMessage);
        }

        // Parse and return the response data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting generation:', error);
        return { error: 'An error occurred while retrieving the generation.' };
    }
};

/**
 * Tool configuration for getting a specific generation from the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'GetGeneration',
            description: 'Get a specific generation by ID from the Luma API.',
            parameters: {
                type: 'object',
                properties: {
                    generation_id: {
                        type: 'string',
                        description: 'The ID of the generation to retrieve.',
                        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                    }
                },
                required: ['generation_id']
            }
        }
    }
};

export { apiTool }; 