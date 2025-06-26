/**
 * Function to list video generations from the Luma API.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of video generations.
 */
const executeFunction = async () => {
  const baseUrl = 'https://api.lumalabs.ai';
  const token = process.env.LUMA_API_KEY;

  if (!token) {
    return { error: 'LUMA_API_KEY environment variable is not set.' };
  }

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/dream-machine/v1/generations`;

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
    console.error('Error listing video generations:', error);
    return { error: 'An error occurred while listing video generations.' };
  }
};

/**
 * Tool configuration for listing video generations from the Luma API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_generations',
      description: 'List video generations from the Luma API.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
};

export { apiTool };