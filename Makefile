build:
	docker build -t heygen-mcp:latest .

thv-run:
	thv run heygen-mcp:latest
		--env OPENAI_API_KEY=${OPENAI_API_KEY}