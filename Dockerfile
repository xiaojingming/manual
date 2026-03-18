FROM --platform=$BUILDPLATFORM node:18.20 AS builder

WORKDIR /workshop

# 接收构建参数
ARG NODE_OPTIONS=--max-old-space-size=6144
ENV NODE_OPTIONS=${NODE_OPTIONS}
ENV CI=true

# 安装必要的构建工具
RUN apt-get update && apt-get install -y python3 make g++ libc6-dev && rm -rf /var/lib/apt/lists/*

COPY package.json ./

# 设置 npm 镜像并安装依赖
# lockfile 在 Windows 生成，不含 Linux 平台原生包，直接用 npm install 重新解析
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install --no-audit

COPY . .

# 构建
RUN npm run build

FROM --platform=$BUILDPLATFORM nginx:stable-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

COPY --from=builder /workshop/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
