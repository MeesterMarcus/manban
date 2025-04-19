# Stage 1: Build the React application using workspace context
FROM node:22-alpine as builder

# Set the working directory to the root of the monorepo
WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install ALL workspace dependencies (including root devDependencies)
RUN npm install --workspaces --include-workspace-root

# Copy the entire frontend source code
COPY frontend/ ./frontend/

# Build the React app for production using the workspace command
RUN npm run build --workspace=frontend

# Stage 2: Serve the built app with Nginx
FROM nginx:stable-alpine

# Copy the build output from Stage 1 (adjust path relative to root)
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Copy the custom Nginx configuration (path relative to build context)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Nginx will start automatically when the container launches
CMD ["nginx", "-g", "daemon off;"] 