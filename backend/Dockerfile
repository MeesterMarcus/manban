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

# Copy the entire node_modules structure from the builder stage.
# This includes dependencies for root and all workspaces as installed in the builder.
# It might include devDependencies but guarantees runtime dependencies are present.
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend/node_modules ./node_modules 
# Note: The second copy might overwrite parts of the first if modules exist in both,
# but this ensures backend-specific versions take precedence if needed.

# Copy built code (dist) from builder stage
COPY --from=builder /app/backend/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "dist/server.js" ] 