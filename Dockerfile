# node 빌드
FROM node:22-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 정적 파일 제공 (nginx)
FROM nginx:alpine

# 3. 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 4. 수정된 Nginx 설정 파일 복사 (추가)
COPY ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]