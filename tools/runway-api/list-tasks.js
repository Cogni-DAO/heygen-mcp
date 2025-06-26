/**
 * Function to list recent tasks using the Runway API.
 *
 * @param {Object} args - Arguments for listing tasks.
 * @param {number} [args.limit=10] - The number of tasks to retrieve (max 100).
 * @param {string} [args.status] - Filter tasks by status (PENDING, RUNNING, SUCCEEDED, FAILED, CANCELED).
 * @param {string} [args.cursor] - Pagination cursor for getting more results.
 * @returns {Promise<Object>} - The list of tasks.
 */
const executeFunction = async ({
    limit = 10,
    status,
    cursor
}) => {
    try {
        // Dynamic import to handle potential module loading issues
        const RunwayMLModule = await import('@runwayml/sdk');
        const RunwayML = RunwayMLModule.default;

        const apiKey = process.env.RUNWAY_API_KEY;
        if (!apiKey) {
            return {
                success: false,
                error: 'RUNWAY_API_KEY environment variable is not set.'
            };
        }

        const client = new RunwayML({ apiKey });

        // Prepare the request parameters
        const params = {
            limit: Math.min(limit, 100) // Ensure we don't exceed API limits
        };

        // Add optional parameters if provided
        if (status) params.status = status;
        if (cursor) params.cursor = cursor;

        // The Runway API does not provide a list tasks endpoint
        // Users need to track task IDs manually and use GetTaskStatus for individual tasks
        return {
            success: false,
            error: 'Task listing not supported',
            message: 'The Runway API does not provide a list tasks endpoint. You need to track task IDs from generation responses and use GetTaskStatus to check individual tasks.',
            suggestion: 'Use GetTaskStatus with task IDs returned from generation methods (GenerateImage, GenerateVideo, etc.)'
        };

    } catch (error) {
        console.error('Error listing tasks:', error);

        return {
            success: false,
            error: 'An error occurred while listing tasks',
            message: error.message
        };
    }
};

/**
 * Tool configuration for listing tasks using the Runway API.
 * @type {Object}
 */
const apiTool = {
    function: executeFunction,
    definition: {
        type: 'function',
        function: {
            name: 'ListTasks',
            description: 'List recent tasks from the Runway API. Useful for tracking generation history and finding task IDs.',
            parameters: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'The number of tasks to retrieve (maximum 100).',
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    },
                    status: {
                        type: 'string',
                        description: 'Filter tasks by their status.',
                        enum: ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED']
                    },
                    cursor: {
                        type: 'string',
                        description: 'Pagination cursor for getting more results. Use the nextCursor from a previous response.'
                    }
                },
                required: []
            }
        }
    }
};

export { apiTool }; 