# Use an official Node runtime as a parent image
# Using Alpine for a smaller image size
FROM node:22-alpine as builder

# Set the working directory in the container
WORKDIR /app/backend

# Copy package.json and package-lock.json (or npm-shrinkwrap.json) to leverage Docker cache
COPY package*.json ./

# Install app dependencies
# Using ci for potentially faster and more reliable installs in CI/CD
RUN npm ci

# Copy the rest of the backend app source code
COPY . .

# Compile TypeScript
RUN npm run build

# --- Production Stage --- 
FROM node:22-alpine

WORKDIR /app/backend

# Copy built artifacts and production dependencies from the builder stage
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "dist/server.js" ] 