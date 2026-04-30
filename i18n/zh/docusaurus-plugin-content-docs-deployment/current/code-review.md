---
sidebar_position: 4
---

# 在 Docker Compose 上部署 Code Review 子系统

> **Code Review 子系统为闭源商业组件，部署前请联系 CoStrict 官方获取镜像凭证与授权信息。**

本文档介绍如何使用 [review-deploy](https://github.com/zgsm-sangfor/review-deploy) 在单机环境中部署 CoStrict 平台的 Code Review 子系统，**假定 CoStrict 主平台已部署完毕**（若尚未部署，请先阅读 [CoStrict 后端部署工具](./introduction.md)）。

---

## 项目概述

CoStrict 平台提供三种代码扫描模式：**交互扫描**（IDE/CLI 实时扫描）、**增量扫描**（CI 流水线自动扫描）、**全量扫描**（平台侧完整仓库扫描）。其中交互扫描在客户端本地完成，由主平台 chat-rag 提供模型能力；本文档部署的 Code Review 子系统专门承载后两种：

- **增量扫描**：监听 GitLab MR 事件，由 AI Agent 对代码变更进行差异化扫描，扫描结果以 GitLab Issue 或 MR 评论形式回写，便于跟踪闭环。
- **全量扫描**：通过独立的扫描平台对完整代码仓库进行集中扫描，支持指定目录或文件范围，扫描报告在平台中统一查看与审计。

子系统由 9 个核心服务组成：

```
GitLab Webhook
    │
    ▼
review-manager        → 接收 MR 事件，分发异步任务
    │
    ▼
review-worker         → 消费 Redis 队列，调度审查
    │
    ▼
review-checker        → AI Agent 执行代码审查（可横向扩展）
    │
    ▼
issue-manager         → 缺陷去重、行号纠偏、推送评论

security-manager      → 全量 SAST 后端
security-platform     → 全量 SAST 前端
security-checker      → 安全扫描引擎

PostgreSQL × 2 (主库 + SAST 库) + Redis (任务队列)
```

子系统对外依赖 CoStrict 主平台提供的 **Higress AI 网关**（模型路由）和 **APISIX**（统一入口）；GitLab 可使用客户已有实例或在主平台中自建。

---

## 快速开始

### 1. 获取部署配置

克隆 review-deploy 仓库到部署机器：

```bash
git clone https://github.com/zgsm-sangfor/review-deploy.git
cd review-deploy/docker-compose
```

后续命令均在 `docker-compose/` 目录下执行。

### 2. 准备镜像

在线环境下，使用脚本拉取全部镜像：

```bash
bash scripts/util/pull-images.sh
```

镜像清单维护在 `images.list` 中，包含 6 个业务镜像（review-manager / issue-manager / review-checker / security-manager / security-platform / security-checker）和 3 个基础设施镜像（postgres × 2、redis）。如果使用自建 GitLab，还会拉取 `gitlab-ce`。

如需修改镜像版本，编辑 `images.list`：

```bash
IMAGE_REVIEW_MANAGER=zgsm/review-manager:2.2.1
IMAGE_LLM_SAST_BACKEND=zgsm/security-manager:1.0.4
# ...
```

> **重要**：`images.list` 中的镜像名和 Tag 必须与本地 Docker 中实际存在的镜像完全一致（包括仓库前缀、镜像名、Tag 三段）。`docker compose` 不会自动重命名或拉取，名称对不上会直接启动失败。修改后建议执行 `docker images | grep -E "zgsm|postgres|redis"` 比对一遍。

> 离线环境请跳到 [附录 A：离线部署](#附录-a离线部署)。

### 3. 环境配置

`configure.sh` 集中维护所有环境变量。**部署前必须修改的项**只有大模型相关三项：

```bash
# AI 模型配置（指向 Higress AI 网关）
REVIEW_MODEL_BASEURL="http://higress:8080/v1"
REVIEW_MODEL_APIKEY="<在 Higress 中配置的 API Key>"
REVIEW_MODEL_NAME="<具体模型名，如 GLM-5.1>"
```

`REVIEW_MODEL_NAME` 必须与 Higress 侧配置保持一致，至少要同时对齐以下三处：

- Higress AI Route 中按请求体 `model` 字段匹配的模型名。
- Higress 模型列表 / AI 配额管理中暴露给客户端的模型 `name`。
- `configure.sh` 中传给 review-checker 的 `REVIEW_MODEL_NAME`。

三处任意一处不一致，都可能导致请求已经到达 Higress，但路由不到目标模型，常见表现是 404、model not found，或 review-checker 日志中出现模型不可用。

其他可按需调整：

```bash
# 端口
PORT_REVIEW_MANAGER="8080"
PORT_ISSUE_MANAGER="8081"
PORT_LLM_SAST_FRONTEND="8082"

# 数据库密码（生产环境务必修改默认值）
POSTGRES_PASSWORD="password"
LLM_POSTGRES_PASSWORD="sdl_db@sangfor"

# 横向扩展副本数（在大型仓库或并发 MR 场景下调高）
REVIEW_CHECKER_INSTANCES=1
CI_SERVICE_INSTANCES=1

# APISIX 入口（用于注册路由）
PORT_APISIX_API="39180"
APIKEY_APISIX_ADMIN="<APISIX Admin Key>"
```

修改完成后保存即可，`configure.sh` 会被部署脚本自动加载。

### 4. 启动部署

```bash
bash costrict.sh install
```

`install` 是一站式入口，依次完成环境检查、配置模板渲染、数据目录创建、容器启动以及 APISIX 路由注册。完成后用 `docker compose ps` 确认全部容器处于 `Up` 状态。如果 `review-checker` 启动较慢（首次需要拉取大模型 prompt 配置），属正常现象。

### 5. 验证

部署成功后，通过以下方式验证各服务：

```bash
# 服务健康检查
curl http://localhost:8080/health   # review-manager
curl http://localhost:8081/health   # issue-manager

# Web 控制台
open http://localhost:8080/swagger/                  # review-manager Swagger UI
open http://localhost:8080/code-review/monitor/      # Asynq 任务队列监控
open http://localhost:8082                           # 全量 SAST 前端（默认账号 admin / Admin@Sast_1.00）

# 端到端验证
# 在 GitLab 配置 Webhook 指向 http://<host>:39180/code-review/api/v1/webhooks/gitlab
# 创建一个测试 MR，观察 review-checker 容器日志
docker compose logs -f review-checker
```

`bash costrict.sh info` 会打印当前部署的所有访问地址，可作为速查。

---

## 服务配置

### 大模型配置

review-checker 通过 Higress AI 网关调用 LLM。三项关键配置已在快速开始中介绍：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `REVIEW_MODEL_BASEURL` | Higress 提供的 OpenAI 兼容入口 | `http://higress:8080/v1` |
| `REVIEW_MODEL_APIKEY` | 在 Higress 配置的 API Key | `sk-xxx` |
| `REVIEW_MODEL_NAME` | 模型名，由 Higress 路由提供 | `GLM-5.1` |

`REVIEW_MODEL_NAME` 不是任意展示名。它必须和 Higress AI Route 的模型匹配条件、Higress 模型列表 / AI 配额管理中的模型 `name` 完全一致。若新增模型，请先确认 Higress 侧已完成 provider、route、模型列表 / 配额配置，再同步修改 `configure.sh`。

如果 Higress 与 review-deploy 不在同一 Docker 网络，请使用宿主机可达地址替代 `higress` 主机名。Higress 端模型与路由的配置参见 [如何配置 Higress](./old-version-config/higress.md)。

### GitLab 接入

GitLab 既可以用客户已有实例，也可以使用 review-deploy 栈中自带的 `gitlab-ce`。本节以自带的 GitLab 为例，外部 GitLab 配置同理。

#### 1. 登录 GitLab

review-deploy 自带的 GitLab 默认通过宿主机 `8090` 端口暴露：

```
浏览器访问：http://<部署机器 IP>:8090
默认账号：  root / Sangfor@123
```

如果客户修改过 root 密码，可从容器中读取初始密码：

```bash
docker exec -it <gitlab 容器名> cat /etc/gitlab/initial_root_password 2>/dev/null | grep Password
```

#### 2. 创建 Personal Access Token

review-manager 通过 PAT 克隆仓库、读取 MR、回写评论。

进入 **右上头像 → Edit profile → Access Tokens → Add new token**：

| 字段 | 值 |
|------|-----|
| Token name | `costrict-review` |
| Expiration date | 按客户要求，一般 1 年 |
| Scopes | **`api` / `read_api` / `read_repository` / `read_user`**（4 项缺一不可）|

点 **Create personal access token** 后，**立即复制** token（页面刷新即丢失）。

#### 3. 把 Token 填到 review-manager 配置

```bash
vi config/codereview/review-manager-config.yaml
```

找到 `git_repo` 段，填入刚才复制的 token：

```yaml
git_repo:
  gitlab_token: "glpat-xxxxxxxxxxxx"
```

> **注意**：此文件是 `prepare` 阶段从模板渲染出来的，重新执行 `costrict.sh install` 或 `costrict.sh prepare` 都会被覆盖。维护方式参见 [镜像更新](#镜像更新) 一节，升级时改用 `costrict.sh up`，避免重新渲染配置。

修改后重启服务让配置生效：

```bash
docker compose -p costrict restart review-manager review-worker
```

#### 4. 在项目上挂 Webhook

在被扫描项目的 **Settings → Webhooks → Add webhook** 中添加：

| 字段 | 值 |
|------|-----|
| URL | `http://<APISIX 地址>:39180/code-review/api/v1/webhooks/gitlab` |
| Trigger | Merge request events（增量扫描）|
| Secret Token | 留空或填自定义校验值 |
| SSL verification | 内网 HTTP 部署可关闭 |

保存后点 **Test → Merge request events**，期望返回 HTTP 200。之后每次 MR 创建/更新都会触发一次审查，审查结果以 GitLab 评论或 Issue 形式回写到 MR 页面。

### 数据库与端口

默认端口和数据库账号见 `configure.sh`，注意以下几点：

- 主库与 SAST 库是两个独立 Postgres 实例（版本不同，分别为 15 和 13），不能合并。
- 数据持久化目录在 `data/`，`docker compose down` 不会删除数据；需要彻底清空时手工 `rm -rf data/`。
- 生产环境请把 `POSTGRES_PASSWORD` 和 `LLM_POSTGRES_PASSWORD` 改为强密码。

---

## 镜像更新

线上需要升级某个服务镜像（例如把 `security-manager` 从 `1.0.2` 升到 `1.0.4`），**不要重新跑 `costrict.sh install`**。`install` 会再次执行 `prepare`（重渲染配置模板）并重新注册 APISIX 路由，可能覆盖部署后手工调整过的配置或路由。正确的姿势是：只更新镜像 + 重启对应服务。

### 在线更新

```bash
# 1. 编辑 images.list，把对应行的 Tag 改为新版本
vi images.list
# 例：IMAGE_LLM_SAST_BACKEND=zgsm/security-manager:1.0.4

# 2. 拉取新镜像
bash scripts/util/pull-images.sh

# 3. 仅重启受影响的服务（不动其他容器、不重渲染配置）
bash costrict.sh up
# 或更精细：docker compose -p costrict up -d --no-deps b-llm-sast
```

### 离线更新（新镜像通过 tar 包送达）

新镜像往往以 tar 包形式给到现场，且包内 RepoTag 通常是上游构建名（如 `llm_sast_plat_backend:latest`），需要重新打 Tag 让它和 `images.list` 对齐：

```bash
# 1. 加载 tar 包
docker load -i /path/to/llm_sast_plat_backend-1.0.4.tar
# 输出会提示：Loaded image: llm_sast_plat_backend:latest

# 2. 重新打 Tag 到 images.list 对应的镜像名
docker tag llm_sast_plat_backend:latest zgsm/security-manager:1.0.4

# 3. 验证镜像已存在
docker images | grep security-manager

# 4. 编辑 images.list 把版本号同步更新
vi images.list

# 5. 重启服务
bash costrict.sh up
```

> **常见坑**：`images.list` 里写 `zgsm/security-manager:1.0.4`，但本地镜像还停留在 `llm_sast_plat_backend:latest`，`docker compose` 不会自动重命名，会以"找不到镜像"失败。务必走完上面 step 2 的 `docker tag`。

升级完成后，确认旧镜像不再使用，可以清理：

```bash
docker rmi zgsm/security-manager:1.0.2   # 旧版本
docker rmi llm_sast_plat_backend:latest  # 上游原始 Tag（如不再需要）
```

---

## 附录 A：离线部署

完全无外网的环境下，部署分两步：先在联网机器上打包镜像，再传到离线机器加载。

### 在联网机器上打包

```bash
cd review-deploy/docker-compose

# 拉取镜像（如果是企业镜像，先 export GHCR_TOKEN=<your-token>）
bash scripts/util/pull-images.sh

# 导出为 tar 文件到指定目录
bash scripts/util/save-images.sh ./offline-images
```

`offline-images/` 下会得到全部镜像的 tar 文件，连同整个 `review-deploy/` 目录一起拷贝到离线机器。

### 在离线机器上加载并部署

```bash
cd review-deploy/docker-compose

# 加载镜像
bash scripts/util/load-images.sh ../offline-images

# 验证镜像完整性
bash scripts/util/verify-images.sh

# 后续步骤与在线部署一致
vi configure.sh                    # 编辑模型地址等
bash costrict.sh install
bash scripts/apisix_router/codereview.sh
```

镜像清单（共 10 个，包含可选的 GitLab）维护在 `images.list`，离线传输前请核对版本号与 `configure.sh` 一致。

---

## 附录 B：故障排查

### B.1 基础状态检查

先确认容器状态和关键服务日志，避免直接从模型侧开始猜：

```bash
docker compose ps

docker compose logs -f review-manager
docker compose logs -f review-worker
docker compose logs -f review-checker
docker compose logs -f issue-manager
```

如果 Webhook 已收到但任务卡住，优先看 Asynq 队列：

```text
http://<host>:8080/code-review/monitor/
```

常见方向：

| 现象 | 排查方向 |
|------|---------|
| Webhook 收到但任务卡住不执行 | 检查 Redis 是否可达；访问 Asynqmon 查看队列是否堆积、任务是否反复重试 |
| 评论没有推送到 GitLab | 看 `issue-manager` 日志是否有 GitLab token 鉴权失败；确认 Webhook URL 中的 APISIX 路由已注册 |
| 全量 SAST 扫描启动失败 | 看 `security-checker` 日志；若出现 OOM 或进程被 kill，调高资源或减少并发任务 |
| `costrict.sh check` 提示 docker compose 不可用 | 升级到 Docker Engine 20.10+ 并安装 compose 插件 |

### B.2 review-deploy 到 Higress 的网络连通

review-checker 通过 `REVIEW_MODEL_BASEURL` 调用 Higress。若 `REVIEW_MODEL_BASEURL` 使用默认值 `http://higress:8080/v1`，需要确保 review-deploy 容器和主平台 Higress 位于同一个 Docker 网络，且容器内能解析 `higress`。

任选一个正在运行的 review-checker 容器：

```bash
docker compose ps review-checker
```

在容器内检查域名解析和端口连通：

```bash
docker exec <review-checker容器名> getent hosts higress
docker exec <review-checker容器名> sh -c "(echo >/dev/tcp/higress/8080) && echo CONNECT_OK"
```

如果 `getent hosts higress` 无输出，说明容器内解析不到 Higress，通常是两套 compose 没有接入同一个 Docker 网络。

如果域名能解析但端口不通，检查 Higress 容器是否运行、是否监听 8080、以及 Docker 网络是否正确接入：

```bash
docker ps | grep -E "higress|review"
docker network inspect <主平台网络名>
```

### B.3 Higress 模型路由对齐

模型请求能到 Higress 但返回 404、model not found、模型不可用时，优先检查三处是否一致：

| 配置位置 | 要求 |
|---------|------|
| `configure.sh` | `REVIEW_MODEL_NAME` 为实际要调用的模型名 |
| Higress AI Route | 请求体 `model` 匹配条件与 `REVIEW_MODEL_NAME` 完全一致 |
| Higress 模型列表 / AI 配额管理 | 对外暴露的模型 `name` 与 `REVIEW_MODEL_NAME` 完全一致 |

可从 review-checker 容器内直接打 Higress 做最小验证：

```bash
docker exec <review-checker容器名> sh -c '
curl -v --max-time 30 http://higress:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Higress中配置的API Key>" \
  -d "{\"model\":\"<REVIEW_MODEL_NAME>\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}"
'
```

结果判断：

| 返回 | 常见原因 |
|------|---------|
| 200 且有模型回复 | Higress 路由和模型基本可用 |
| 401 / 403 | API Key 不一致，或 Higress 鉴权配置不匹配 |
| 404 / model not found | AI Route 匹配条件、模型列表、`REVIEW_MODEL_NAME` 没对齐 |
| connection refused / timeout | Higress 未运行、网络不通，或 `REVIEW_MODEL_BASEURL` 不可达 |

### B.4 模型服务响应协议排查

如果 CS、chat-rag 或 review-checker 返回以下错误：

```text
chat-rag.invalid_response_content
The model is unable to perform inference or makes errors during inference.
```

不要只按网络或 API Key 排查。该错误可能表示模型服务已经返回了响应，但响应内容不符合 chat-rag 期望。

重点抓取 Higress 或反代后的模型原始流式响应，确认普通文本回答是否包含：

```text
choices[0].delta.content
```

普通文本流式响应应类似：

```text
data: {"choices":[{"delta":{"content":"你好"}}]}
data: {"choices":[{"delta":{"content":"，我是..."}}]}
data: {"choices":[{"finish_reason":"stop","delta":{}}]}
data: [DONE]
```

如果抓到的是下面这种形式：

```text
data: {"choices":[{"delta":{"tool_calls":[{"function":{"arguments":"正文内容片段"}}]}}]}
data: {"choices":[{"finish_reason":"tool_calls","delta":{"tool_calls":[...]}}]}
data: [DONE]
```

则说明普通回答被模型服务放进了 `tool_calls[].function.arguments`，而不是 `delta.content`。`zgsm/chat-rag:v1.5.8` 在该场景下会判定没有有效正文，并返回 `chat-rag.invalid_response_content`。

处理方式：

- 优先要求模型服务提供 OpenAI 兼容的 `/v1/chat/completions` 文本流式响应。
- 若模型侧支持关闭工具调用 / 函数调用模式，普通对话请求应关闭该模式。
- 若模型服务无法调整，在 Higress、反代或独立适配层中把普通文本从 `tool_calls[].function.arguments` 转换为 `delta.content` 后再交给 chat-rag。

### B.5 主平台 chat-rag 启动依赖

本文档部署的是 Code Review 子系统，默认 CoStrict 主平台已部署完成。若需要单独排查主平台 chat-rag，注意 `zgsm/chat-rag:v1.5.8` 不只依赖本地 `chat-api.yaml`，还会从 Nacos 加载以下配置：

```text
agent_rules
tools_prompt
precise_context
model_router
```

缺少这些 Nacos 配置时，chat-rag 可能在启动阶段直接失败。此类问题应回到主平台部署目录检查 Nacos 初始化 SQL、配置导入和 chat-rag 启动日志。

---

## 相关链接

- [CoStrict 后端部署工具](./introduction.md)
- [如何配置 Higress](./old-version-config/higress.md)
- [review-deploy 仓库](https://github.com/zgsm-sangfor/review-deploy)
