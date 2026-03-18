FROM --platform=$BUILDPLATFORM node:18.20-slim AS builder

WORKDIR /workshop

# 安装必要的构建工具
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

# 设置 npm 镜像并安装依赖
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm ci --frozen-lockfile --prefer-offline --no-audit

COPY . .

# 构建时设置环境变量优化内存使用
ENV NODE_OPTIONS="--max-old-space-size=6144"
ENV CI=true

RUN npm run build
FROM --platform=$BUILDPLATFORM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

COPY --from=builder /workshop/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]