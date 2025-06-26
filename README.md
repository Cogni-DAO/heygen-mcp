# Runway MCP Server

A Model Context Protocol (MCP) server for integrating with Runway AI's API to generate images and videos using their Gen4 models.

## Features

### Image Generation
- **Basic Text-to-Image**: Generate images from text prompts using Gen4 Image
- **Reference-based Image Generation**: Generate images with reference images and @ syntax for precise control

### Video Generation
- **Text-to-Video**: Generate videos from text descriptions using Gen4 Turbo
- **Image-to-Video**: Animate existing images into videos
- **Video Upscaling**: Enhance video quality and resolution

### Task Management
- **Task Status Monitoring**: Check the progress of generation tasks
- **Task Listing**: View recent generation history
- **Task Cancellation**: Stop running tasks when needed

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Runway API Key**
   - Sign up at [Runway Developer Portal](https://dev.runwayml.com/)
   - Create an API key from your dashboard

3. **Configure Environment**
   Create a `.env` file in the project root:
   ```bash
   RUNWAY_API_KEY=your_runway_api_key_here
   ```

4. **Test the Server**
   ```bash
   # List available tools
   npm run list-tools
   
   # Run in stdio mode (for MCP clients)
   node mcpServer.js
   
   # Run in SSE mode (for web interfaces)
   node mcpServer.js --sse
   ```

## Usage Examples

### Generate Image from Text
```javascript
{
  "name": "GenerateImage",
  "arguments": {
    "promptText": "A beautiful sunset over a calm ocean with vibrant colors",
    "ratio": "1920:1080"
  }
}
```

### Generate Image with References
```javascript
{
  "name": "GenerateImageWithReferences",
  "arguments": {
    "promptText": "@EiffelTower painted in the style of @StarryNight",
    "referenceImages": [
      {
        "uri": "https://example.com/eiffel-tower.jpg",
        "tag": "EiffelTower"
      },
      {
        "uri": "https://example.com/starry-night.jpg", 
        "tag": "StarryNight"
      }
    ],
    "ratio": "1920:1080"
  }
}
```

### Generate Video from Image
```javascript
{
  "name": "GenerateVideoFromImage",
  "arguments": {
    "promptImage": "https://example.com/my-image.jpg",
    "promptText": "The waves gently move and the clouds drift slowly",
    "duration": 5,
    "ratio": "1280:720"
  }
}
```

### Check Task Status
```javascript
{
  "name": "GetTaskStatus",
  "arguments": {
    "taskId": "your-task-id-here"
  }
}
```

## Available Tools

| Tool Name | Description | Required Parameters |
|-----------|-------------|-------------------|
| `GenerateImage` | Generate image from text | `promptText` |
| `GenerateImageWithReferences` | Generate image with reference images | `promptText`, `referenceImages` |
| `GenerateVideoFromText` | Generate video from text prompt | `promptText` |
| `GenerateVideoFromImage` | Generate video from image | `promptImage` |
| `UpscaleVideo` | Upscale video quality | `promptVideo` |
| `GetTaskStatus` | Check task progress | `taskId` |
| `ListTasks` | List recent tasks | None |
| `CancelTask` | Cancel running task | `taskId` |

## Supported Models

- **gen4_image**: Advanced image generation with reference support
- **gen4_turbo**: Fast video generation from text or images  
- **upscale_video**: Video quality enhancement

## Supported Formats

### Images
- JPEG, PNG, WebP
- URLs or base64 data URIs
- Max size: 10MB per image

### Videos
- MP4, MOV, WebM
- URLs or base64 data URIs  
- Max size: 100MB per video

## Error Handling

The server includes comprehensive error handling for:
- Invalid API keys
- Network connectivity issues
- Task failures and timeouts
- Invalid input parameters
- Rate limiting

## Development Notes

### Legacy Support
The old Luma API tools are preserved in `tools/luma-api/` for reference. To switch back to Luma tools, uncomment the Luma section in `tools/paths.js`.

### API Integration
- Uses official `@runwayml/sdk` v2.4.0
- Implements async task polling with proper error handling
- Supports both URL and data URI inputs for media files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run list-tools`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues with this MCP server, please create an issue on GitHub.
For Runway API questions, visit the [Runway Developer Documentation](https://docs.dev.runwayml.com/).
