# Stage 1: Build the backend application using workspace context
FROM node:22-alpine as builder

# Set the working directory to the root of the monorepo within the container
WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install ALL workspace dependencies (including root devDependencies like typescript)
RUN npm install --workspaces --include-workspace-root

# Copy the entire backend source code
COPY backend/ ./backend/

# Run the build command for the specific backend workspace
RUN npm run build --workspace=backend

# --- Production Stage ---
FROM node:22-alpine

WORKDIR /app/backend

# Copy production dependencies node_modules from builder stage
# This includes modules installed for the backend workspace
COPY --from=builder /app/backend/node_modules ./node_modules
# Also copy root production dependencies if backend relies on them
# Check if any root dependencies are needed for runtime
# COPY --from=builder /app/node_modules ./node_modules # Likely not needed unless backend imports from root directly

# Copy built code (dist) from builder stage
COPY --from=builder /app/backend/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "dist/server.js" ] 