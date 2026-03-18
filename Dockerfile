FROM node:20.20.1 AS builder

WORKDIR /workshop

# 安装必要的构建工具
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# 设置 npm 镜像并安装依赖，显式补装 Linux x64 native binding（lockfile 由 Windows 生成，缺少该包）
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install --no-audit --prefer-offline && \
    npm install --no-save --no-audit @node-rs/jieba-linux-x64-gnu@1.10.4

COPY . .

# 构建时设置环境变量优化内存使用
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV CI=true

RUN npm run build
FROM --platform=$BUILDPLATFORM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

COPY --from=builder /workshop/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]