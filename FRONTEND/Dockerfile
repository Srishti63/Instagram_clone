# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy build files to Nginx folder
COPY --from=build /app/dist /usr/share/nginx/html
# (Note: Use /app/build if you aren't using Vite)

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]