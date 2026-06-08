FROM node:20.20.1 AS builder

WORKDIR /workshop

# 安装必要的构建工具
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# 启用 corepack 以使用 pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 设置 pnpm 镜像并安装依赖，显式补装 Linux x64 native binding（lockfile 由 Windows 生成，缺少该包）
RUN pnpm config set registry https://registry.npmmirror.com/ && \
    pnpm install --frozen-lockfile && \
    pnpm add --save-dev @node-rs/jieba-linux-x64-gnu@1.10.4

COPY . .

# 构建时设置环境变量优化内存使用
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV CI=true

RUN pnpm run build
FROM --platform=$BUILDPLATFORM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

COPY --from=builder /workshop/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]