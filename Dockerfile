# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
# This allows Docker to cache the npm install step if these files don't change
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your Node.js application listens on
EXPOSE 3000

# Define the command to run your application
CMD [ "node", "index.js" ]