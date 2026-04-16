FROM node:18-alpine

WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm install

# 코드 복사
COPY . .

# 업로드 디렉토리
RUN mkdir -p uploads

EXPOSE 8080

CMD ["node", "src/server.js"]