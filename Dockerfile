FROM node:20

# Install Python and build tools for canvas
# RUN apk add --no-cache python3 make g++ libtool

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000
RUN if [ "$(uname)" != "Linux" ]; then echo "Skipping unsupported steps for Linux"; fi

# Run the app
CMD ["npm", "run", "start:prod"]
