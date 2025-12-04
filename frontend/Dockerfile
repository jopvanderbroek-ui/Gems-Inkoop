FROM nginx:stable-alpine
# Copy already-built static site (run `yarn build` before building this image)
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
