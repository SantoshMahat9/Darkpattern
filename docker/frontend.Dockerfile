FROM node:20-alpine

WORKDIR /app

# We are setting up for dev with hot reload
# The package.json will be copied via volume, but we can do an initial install if it exists.
# But since this is a blank setup right now, we'll just start a shell or generic command
# if package.json doesn't exist, to prevent failure.

CMD ["sh", "-c", "if [ -f package.json ]; then npm install && npm run dev -- --host; else echo 'No package.json found. Please initialize React app.' && tail -f /dev/null; fi"]
