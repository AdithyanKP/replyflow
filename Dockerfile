
# Use the official Node.js LTS (Long Term Support) runtime as a base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the Prisma schema file and other necessary Prisma files from the src directory
COPY src/prisma ./src/prisma

# Copy the rest of the application code to the working directory
COPY . .

# Generate Prisma Client using the schema from the src directory
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# If necessary, run any migrations or push the database schema
RUN npx prisma db push --schema=./src/prisma/schema.prisma

# Set an environment variable for the port
ENV PORT=4001


# Expose the port that the app will run on
EXPOSE 4001

# Command to start the application
CMD npx prisma generate --schema=./src/prisma/schema.prisma && \
    npx prisma db push --schema=./src/prisma/schema.prisma && \
    npm start
