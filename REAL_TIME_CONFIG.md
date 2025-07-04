# Real-Time Coding Platform Configuration Guide

## Overview
The platform now uses a fully dynamic configuration system for real-time code execution. All static elements have been removed and replaced with environment-driven configuration.

## Required Environment Variables

### Judge0 API Configuration
```bash
# Primary execution engine endpoint
JUDGE0_ENDPOINT=https://judge0-ce.p.rapidapi.com

# Your Judge0 API key (required for real execution)
JUDGE0_API_KEY=your_api_key_here

# Judge0 API host
JUDGE0_HOST=judge0-ce.p.rapidapi.com

# Execution timeout (milliseconds)
JUDGE0_TIMEOUT=30000

# Polling interval for results (milliseconds)
JUDGE0_POLL_INTERVAL=1000

# Maximum polling attempts
JUDGE0_MAX_ATTEMPTS=30
```

### Language Configuration
Configure supported languages dynamically:
```bash
SUPPORTED_LANGUAGES={
  "javascript": {"id": 63, "extension": "js", "compiler": "Node.js"},
  "python": {"id": 71, "extension": "py", "compiler": "Python 3"},
  "java": {"id": 62, "extension": "java", "compiler": "OpenJDK"},
  "cpp": {"id": 54, "extension": "cpp", "compiler": "GCC"},
  "c": {"id": 50, "extension": "c", "compiler": "GCC"}
}
```

### Real-Time Features
```bash
# Enable WebSocket support (future)
ENABLE_WEBSOCKET=false

# Stream results in real-time (future)
STREAM_RESULTS=false

# Cache execution results
CACHE_RESULTS=true

# Enable fallback mode for development
ENABLE_FALLBACK=true
```

## Setting Up Judge0 API

### Option 1: RapidAPI (Recommended for Production)
1. Go to [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to a plan
3. Get your API key
4. Set `JUDGE0_API_KEY=your_rapidapi_key`

### Option 2: Self-Hosted Judge0
```bash
# For self-hosted instances
JUDGE0_ENDPOINT=http://your-judge0-server.com
JUDGE0_API_KEY=your_self_hosted_key
JUDGE0_HOST=your-judge0-server.com
```

## Dynamic Features

### Problem Type Detection
The system automatically detects problem types:
- `array_with_param`: `[1,2,3]\n5`
- `array`: `[1,2,3]`
- `matrix`: `[[1,2],[3,4]]`
- `two_numbers`: `5 3`
- `single_number`: `42`
- `string`: `"hello"`
- `custom`: Any other pattern

### Template Generation
Templates are generated dynamically based on:
- Programming language
- Problem type detected
- Input format

### Language Support
Add new languages by updating `SUPPORTED_LANGUAGES`:
```json
{
  "rust": {"id": 73, "extension": "rs", "compiler": "Rust"},
  "go": {"id": 60, "extension": "go", "compiler": "Go"},
  "kotlin": {"id": 78, "extension": "kt", "compiler": "Kotlin"}
}
```

## Real-Time Execution Flow

1. **Dynamic Configuration**: System reads environment variables
2. **Language Validation**: Checks if language is supported
3. **Problem Detection**: Analyzes input patterns
4. **Template Generation**: Creates execution wrapper dynamically
5. **Judge0 Execution**: Submits to configured Judge0 instance
6. **Result Polling**: Waits for execution completion
7. **Response Processing**: Returns formatted results

## Development vs Production

### Development Mode
```bash
JUDGE0_API_KEY=demo-key  # Will use fallback mode
ENABLE_FALLBACK=true
DEBUG_MODE=true
```

### Production Mode
```bash
JUDGE0_API_KEY=your_real_api_key
ENABLE_FALLBACK=false
DEBUG_MODE=false
CACHE_RESULTS=true
```

## Performance Optimization

### Caching
```bash
CACHE_RESULTS=true
CACHE_TTL=300  # 5 minutes
```

### Concurrent Execution
```bash
MAX_CONCURRENT_EXECUTIONS=10
API_REQUEST_TIMEOUT=60000
```

### Rate Limiting
```bash
RATE_LIMIT_RPM=100  # Requests per minute per IP
```

## Security Settings

```bash
MAX_CODE_LENGTH=10000
ALLOWED_EXTENSIONS=.js,.py,.java,.cpp,.c
ENABLE_CORS=true  # Development only
```

## Monitoring

```bash
ENABLE_EXECUTION_LOGS=true
LOG_LEVEL=info
```

## Quick Start

1. Copy the configuration template to `.env.local`
2. Set your Judge0 API key
3. Configure MongoDB connection
4. Run the application

```bash
# Minimum required for development
JUDGE0_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/coder
JWT_SECRET=your_jwt_secret
```

## Troubleshooting

### No API Key
- System will use fallback mode
- Limited functionality for development only

### API Key Issues
- Check RapidAPI subscription status
- Verify key format
- Check rate limits

### Execution Timeouts
- Increase `JUDGE0_TIMEOUT`
- Adjust `JUDGE0_MAX_ATTEMPTS`
- Check network connectivity

### Language Not Supported
- Add to `SUPPORTED_LANGUAGES` config
- Verify Judge0 language ID
- Update template generation if needed

## Migration from Static Setup

The system has been completely refactored:
- ❌ Static language mappings removed
- ❌ Hardcoded Judge0 endpoints removed
- ❌ Static template generation removed
- ❌ Fixed configuration values removed
- ✅ Dynamic environment-driven configuration
- ✅ Real-time execution engine
- ✅ Configurable language support
- ✅ Flexible template generation system 