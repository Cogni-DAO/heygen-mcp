/**
 * Function to delete a generation by ID from the Luma API.
 *
 * @param {Object} args - Arguments for deleting the generation.
 * @param {string} args.generation_id - The ID of the generation to delete.
 * @returns {Promise<Object>} - The deletion confirmation.
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
            method: 'DELETE',
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

        // For DELETE operations, the response might be empty
        // Return a success confirmation
        return {
            success: true,
            message: `Generation ${generation_id} deleted successfully.`,
            generation_id: generation_id
        };
    } catch (error) {
        console.error('Error deleting generation:', error);
        return { error: 'An error occurred while deleting the generation.' };
    }
};

/**
 * Tool configuration for deleting a generation from the Luma API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'DeleteGeneration',
            description: 'Delete a generation by ID from the Luma API.',
            parameters: {
                type: 'object',
                properties: {
                    generation_id: {
                        type: 'string',
                        description: 'The ID of the generation to delete.',
                        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                    }
                },
                required: ['generation_id']
            }
        }
    }
};

export { apiTool }; 