FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of your app
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose the port your app listens on (matches PORT in .env)
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
