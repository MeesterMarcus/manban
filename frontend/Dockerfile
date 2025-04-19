# Stage 1: Build the React application
FROM node:22-alpine as builder

WORKDIR /app/frontend

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend app source code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:stable-alpine

# Copy the build output from Stage 1
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Optional: Copy a custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Expose port 80
EXPOSE 80

# Nginx will start automatically when the container launches
CMD ["nginx", "-g", "daemon off;"] 