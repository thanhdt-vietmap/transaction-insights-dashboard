FROM node:18.17.1

WORKDIR /usr/src/app

# Copy package trước để tận dụng cache
COPY package*.json ./

# Cài tất cả dependencies (bao gồm dev)
RUN npm install

ENV NODE_ENV=production

# Copy toàn bộ mã nguồn
COPY . .

# Phân quyền (tùy chọn)
RUN chown -R node /usr/src/app

# Build Vite app
RUN npm run build

USER node
EXPOSE 3000
CMD ["npm", "start"]
