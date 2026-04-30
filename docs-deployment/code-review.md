---
sidebar_position: 4
---

# Deploy the Code Review Subsystem on Docker Compose

> **The Code Review subsystem is a closed-source commercial component. Contact CoStrict before deployment to obtain image credentials and license information.**

This document describes how to deploy the Code Review subsystem of the CoStrict platform on a single host using [review-deploy](https://github.com/zgsm-sangfor/review-deploy), and **assumes the CoStrict main platform is already deployed** (if not, deploy it first by following [Backend Deployment](./introduction.md)).

---

## Overview

The CoStrict platform supports three code-scanning modes: **Interactive Scan** (real-time scanning from the IDE/CLI), **Incremental Scan** (automatic scanning in CI pipelines), and **Full Scan** (centralized scanning of an entire repository on the platform). Interactive Scan runs locally on the client and is powered by chat-rag on the main platform; the Code Review subsystem covered by this document hosts the latter two:

- **Incremental Scan**: Listens to GitLab MR events and runs an AI Agent against the diff. Findings are written back as GitLab Issues or MR comments to make the loop easy to track and close.
- **Full Scan**: Runs centralized scans against complete repositories from a dedicated platform UI. Scan scopes can target specific directories or files, and reports are reviewed and audited from the platform.

The subsystem is composed of nine core services:

```
GitLab Webhook
    │
    ▼
review-manager        → Receives MR events, dispatches async tasks
    │
    ▼
review-worker         → Consumes the Redis queue, schedules reviews
    │
    ▼
review-checker        → AI Agent that performs the code review (horizontally scalable)
    │
    ▼
issue-manager         → Deduplicates findings, fixes line numbers, posts comments

security-manager      → Full-scan SAST backend
security-platform     → Full-scan SAST frontend
security-checker      → Security scanning engine

PostgreSQL × 2 (main DB + SAST DB) + Redis (task queue)
```

The subsystem depends on two services provided by the main platform: **Higress AI Gateway** (model routing) and **APISIX** (unified ingress). GitLab can be either the customer's existing instance or one bundled with the main platform.

---

## Quick Start

### 1. Get the Deployment Configuration

Clone review-deploy onto the deployment host:

```bash
git clone https://github.com/zgsm-sangfor/review-deploy.git
cd review-deploy/docker-compose
```

All subsequent commands are run from `docker-compose/`.

### 2. Prepare Images

In an online environment, pull all images with the helper script:

```bash
bash scripts/util/pull-images.sh
```

The image manifest lives in `images.list`: six business images (review-manager, issue-manager, review-checker, security-manager, security-platform, security-checker) plus three infrastructure images (postgres × 2, redis). If you use the bundled GitLab, `gitlab-ce` is pulled as well.

To change image versions, edit `images.list`:

```bash
IMAGE_REVIEW_MANAGER=zgsm/review-manager:2.2.1
IMAGE_LLM_SAST_BACKEND=zgsm/security-manager:1.0.4
# ...
```

> **Important**: Each entry in `images.list` must match a local Docker image *exactly* — repository prefix, image name, and tag. `docker compose` does not auto-rename or auto-pull, and a mismatch causes the service to fail at start. After editing, run `docker images | grep -E "zgsm|postgres|redis"` to confirm.

> For air-gapped environments, jump to [Appendix A: Offline Deployment](#appendix-a-offline-deployment).

### 3. Configure the Environment

`configure.sh` centralizes every environment variable. **The only mandatory edits before deployment** are the three model-related fields:

```bash
# AI model (points at the Higress AI gateway)
REVIEW_MODEL_BASEURL="http://higress:8080/v1"
REVIEW_MODEL_APIKEY="<API key configured in Higress>"
REVIEW_MODEL_NAME="<exact model name, e.g. GLM-5.1>"
```

`REVIEW_MODEL_NAME` must agree with the Higress side. Three places must use the same value:

- The `model` match condition on the Higress AI Route.
- The model `name` exposed in the Higress model list / AI quota management.
- `REVIEW_MODEL_NAME` passed to review-checker via `configure.sh`.

If any of the three drifts, the request reaches Higress but cannot be routed. Typical symptoms are HTTP 404, "model not found", or review-checker logs reporting the model is unavailable.

Other settings can be tuned as needed:

```bash
# Ports
PORT_REVIEW_MANAGER="8080"
PORT_ISSUE_MANAGER="8081"
PORT_LLM_SAST_FRONTEND="8082"

# Database passwords (always replace defaults in production)
POSTGRES_PASSWORD="password"
LLM_POSTGRES_PASSWORD="sdl_db@sangfor"

# Replica counts (raise for large repositories or high MR concurrency)
REVIEW_CHECKER_INSTANCES=1
CI_SERVICE_INSTANCES=1

# APISIX entry (used to register routes)
PORT_APISIX_API="39180"
APIKEY_APISIX_ADMIN="<APISIX Admin Key>"
```

Save the file; `configure.sh` is sourced automatically by the deployment scripts.

### 4. Deploy

```bash
bash costrict.sh install
```

`install` is the one-stop entry point: it runs environment checks, renders config templates, creates data directories, starts containers, and registers APISIX routes. Once it finishes, run `docker compose ps` to confirm every container is `Up`. `review-checker` may take longer on its first start because it pulls model prompt configuration; this is normal.

### 5. Verify

After deployment, validate each service:

```bash
# Service health
curl http://localhost:8080/health   # review-manager
curl http://localhost:8081/health   # issue-manager

# Web consoles
open http://localhost:8080/swagger/                  # review-manager Swagger UI
open http://localhost:8080/code-review/monitor/      # Asynq queue monitor
open http://localhost:8082                           # Full-scan SAST frontend (default credentials: admin / Admin@Sast_1.00)

# End-to-end check
# In GitLab, point a webhook at http://<host>:39180/code-review/api/v1/webhooks/gitlab
# Open a test MR and watch the review-checker container logs
docker compose logs -f review-checker
```

`bash costrict.sh info` prints the access URLs for the current deployment.

---

## Service Configuration

### Model Configuration

review-checker calls the LLM through the Higress AI Gateway. The three key fields were introduced in Quick Start:

| Field | Description | Example |
|-------|-------------|---------|
| `REVIEW_MODEL_BASEURL` | OpenAI-compatible endpoint exposed by Higress | `http://higress:8080/v1` |
| `REVIEW_MODEL_APIKEY` | API key configured in Higress | `sk-xxx` |
| `REVIEW_MODEL_NAME` | Model name routed by Higress | `GLM-5.1` |

`REVIEW_MODEL_NAME` is not a free-form display name. It must match the Higress AI Route match condition and the model `name` in the Higress model list / AI quota management *exactly*. When introducing a new model, configure the provider, route, and model list / quota on the Higress side first, then update `configure.sh`.

If Higress and review-deploy live on different Docker networks, replace the `higress` host with a reachable address. See [How to Configure Higress](./old-version-config/higress.md) for the gateway-side configuration.

### GitLab Integration

GitLab can be the customer's existing instance or the `gitlab-ce` bundled with review-deploy. The steps below use the bundled GitLab; external GitLab is configured in the same way.

#### 1. Log in to GitLab

The bundled GitLab is exposed on host port `8090` by default:

```
URL:               http://<deployment host IP>:8090
Default account:   root / Sangfor@123
```

If the customer changed the root password, read the initial password from the container:

```bash
docker exec -it <gitlab container name> cat /etc/gitlab/initial_root_password 2>/dev/null | grep Password
```

#### 2. Create a Personal Access Token

review-manager uses a PAT to clone repositories, read MRs, and post comments back.

Go to **Avatar → Edit profile → Access Tokens → Add new token**:

| Field | Value |
|-------|-------|
| Token name | `costrict-review` |
| Expiration date | Per customer policy (commonly one year) |
| Scopes | **`api` / `read_api` / `read_repository` / `read_user`** (all four required) |

Click **Create personal access token** and **copy the token immediately** — it disappears as soon as the page reloads.

#### 3. Plug the Token into review-manager

```bash
vi config/codereview/review-manager-config.yaml
```

Find the `git_repo` block and paste the token:

```yaml
git_repo:
  gitlab_token: "glpat-xxxxxxxxxxxx"
```

> **Note**: This file is rendered from a template during `prepare`. Re-running `costrict.sh install` or `costrict.sh prepare` overwrites it. See [Image Updates](#image-updates) for the safe upgrade workflow — use `costrict.sh up` so the templates are not regenerated.

Restart the affected services so the new token takes effect:

```bash
docker compose -p costrict restart review-manager review-worker
```

#### 4. Add a Webhook on the Project

In the project's **Settings → Webhooks → Add webhook**:

| Field | Value |
|-------|-------|
| URL | `http://<APISIX host>:39180/code-review/api/v1/webhooks/gitlab` |
| Trigger | Merge request events (incremental scan) |
| Secret Token | Empty or a custom validation value |
| SSL verification | Disable for internal HTTP deployments |

After saving, click **Test → Merge request events** — the response should be HTTP 200. From then on, every MR creation/update triggers a scan and the result is posted back as a comment or Issue on the MR page.

### Databases and Ports

Default ports and database accounts are documented in `configure.sh`. A few details worth highlighting:

- The main DB and the SAST DB are two separate Postgres instances (versions 15 and 13 respectively) and cannot be merged.
- Persistent data lives under `data/`. `docker compose down` does not delete it; remove `data/` manually if a clean wipe is required.
- In production, replace `POSTGRES_PASSWORD` and `LLM_POSTGRES_PASSWORD` with strong passwords.

---

## Image Updates

When upgrading a single service image (for example, `security-manager` from `1.0.2` to `1.0.4`), **do not re-run `costrict.sh install`**. `install` re-executes `prepare`, which re-renders config templates and re-registers APISIX routes, potentially overwriting any post-deployment customizations. The right approach is to update the image and restart only the affected service.

### Online Update

```bash
# 1. Edit images.list and bump the tag for the affected entry
vi images.list
# Example: IMAGE_LLM_SAST_BACKEND=zgsm/security-manager:1.0.4

# 2. Pull the new image
bash scripts/util/pull-images.sh

# 3. Restart only what changed (no other containers, no template re-render)
bash costrict.sh up
# Or, more granular: docker compose -p costrict up -d --no-deps b-llm-sast
```

### Offline Update (image delivered as a tar)

New images often arrive as tar files whose internal RepoTag is the upstream build name (e.g. `llm_sast_plat_backend:latest`). Re-tag the image to align with `images.list`:

```bash
# 1. Load the tar
docker load -i /path/to/llm_sast_plat_backend-1.0.4.tar
# Output: Loaded image: llm_sast_plat_backend:latest

# 2. Re-tag to the name expected by images.list
docker tag llm_sast_plat_backend:latest zgsm/security-manager:1.0.4

# 3. Confirm the image exists
docker images | grep security-manager

# 4. Bump the tag in images.list
vi images.list

# 5. Restart the service
bash costrict.sh up
```

> **Common pitfall**: `images.list` says `zgsm/security-manager:1.0.4` but the only local image is still `llm_sast_plat_backend:latest`. `docker compose` does not auto-rename and the service fails with "image not found". Always run the `docker tag` step.

After the upgrade, clean up images that are no longer referenced:

```bash
docker rmi zgsm/security-manager:1.0.2   # old version
docker rmi llm_sast_plat_backend:latest  # original upstream tag, if no longer needed
```

---

## Appendix A: Offline Deployment

For environments without internet access, deployment is a two-step process: package images on a connected machine, then transfer and load them on the target machine.

### Package Images on a Connected Machine

```bash
cd review-deploy/docker-compose

# Pull images (for private registries, export GHCR_TOKEN=<your-token> first)
bash scripts/util/pull-images.sh

# Export tar files into a target directory
bash scripts/util/save-images.sh ./offline-images
```

Copy the `offline-images/` directory along with the entire `review-deploy/` tree to the offline machine.

### Load and Deploy on the Offline Machine

```bash
cd review-deploy/docker-compose

# Load images
bash scripts/util/load-images.sh ../offline-images

# Verify image integrity
bash scripts/util/verify-images.sh

# The remaining steps mirror an online deployment
vi configure.sh                    # Set the model endpoint, etc.
bash costrict.sh install
bash scripts/apisix_router/codereview.sh
```

The image manifest (10 images including the optional GitLab) lives in `images.list`. Before transfer, double-check that its versions match `configure.sh`.

---

## Appendix B: Troubleshooting

### B.1 Basic Health Checks

Confirm container state and service logs first; do not start guessing from the model side:

```bash
docker compose ps

docker compose logs -f review-manager
docker compose logs -f review-worker
docker compose logs -f review-checker
docker compose logs -f issue-manager
```

If the webhook is received but tasks stall, check the Asynq queue first:

```text
http://<host>:8080/code-review/monitor/
```

Common patterns:

| Symptom | Where to look |
|---------|---------------|
| Webhook received but tasks never run | Verify Redis connectivity; open Asynqmon to see queue backlog and retry counts |
| Comments never reach GitLab | Check `issue-manager` logs for GitLab token auth failures; confirm the APISIX route in the webhook URL is registered |
| Full-scan SAST fails to start | Inspect `security-checker` logs; if you see OOM or a killed process, raise resources or lower concurrency |
| `costrict.sh check` reports docker compose unavailable | Upgrade to Docker Engine 20.10+ and install the compose plugin |

### B.2 Network Connectivity from review-deploy to Higress

review-checker calls Higress through `REVIEW_MODEL_BASEURL`. If that value is the default `http://higress:8080/v1`, the review-deploy containers and the main-platform Higress must share a Docker network and the container must resolve `higress`.

Pick any running review-checker container:

```bash
docker compose ps review-checker
```

Verify DNS resolution and TCP reachability from inside the container:

```bash
docker exec <review-checker container> getent hosts higress
docker exec <review-checker container> sh -c "(echo >/dev/tcp/higress/8080) && echo CONNECT_OK"
```

Empty output from `getent hosts higress` means the container cannot resolve Higress — typically because the two compose stacks are not on the same Docker network.

If DNS resolves but the port is unreachable, confirm Higress is running, listening on 8080, and on the right network:

```bash
docker ps | grep -E "higress|review"
docker network inspect <main platform network>
```

### B.3 Aligning the Higress Model Route

When requests reach Higress but return HTTP 404, "model not found", or "model unavailable", check the three places below for consistency:

| Location | Requirement |
|----------|-------------|
| `configure.sh` | `REVIEW_MODEL_NAME` is the actual model to call |
| Higress AI Route | The `model` match condition equals `REVIEW_MODEL_NAME` exactly |
| Higress model list / AI quota management | The published model `name` equals `REVIEW_MODEL_NAME` exactly |

A minimal verification shot from inside the review-checker container:

```bash
docker exec <review-checker container> sh -c '
curl -v --max-time 30 http://higress:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API key configured in Higress>" \
  -d "{\"model\":\"<REVIEW_MODEL_NAME>\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}"
'
```

Interpreting the response:

| Response | Likely cause |
|----------|--------------|
| 200 with a model reply | Higress route and model are basically working |
| 401 / 403 | API key mismatch, or Higress auth misconfigured |
| 404 / model not found | The AI Route condition, model list, and `REVIEW_MODEL_NAME` are not aligned |
| connection refused / timeout | Higress is not running, network is blocked, or `REVIEW_MODEL_BASEURL` is unreachable |

### B.4 Model Response Protocol

If chat-rag, the CS layer, or review-checker returns:

```text
chat-rag.invalid_response_content
The model is unable to perform inference or makes errors during inference.
```

Do not start by assuming a network or API-key problem. The error means the model service *did* answer, but the response shape does not match what chat-rag expects.

Capture the raw streaming response from Higress (or the reverse proxy in front of the model) and confirm a plain text response carries:

```text
choices[0].delta.content
```

A normal text stream looks like this:

```text
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":", how can I help?"}}]}
data: {"choices":[{"finish_reason":"stop","delta":{}}]}
data: [DONE]
```

If the captured stream looks like this instead:

```text
data: {"choices":[{"delta":{"tool_calls":[{"function":{"arguments":"plain text fragment"}}]}}]}
data: {"choices":[{"finish_reason":"tool_calls","delta":{"tool_calls":[...]}}]}
data: [DONE]
```

then the model service has placed the plain reply into `tool_calls[].function.arguments` instead of `delta.content`. `zgsm/chat-rag:v1.5.8` treats this as missing content and returns `chat-rag.invalid_response_content`.

What to do:

- Prefer fixing the model service to return OpenAI-compatible text streams via `/v1/chat/completions`.
- If the model side supports it, disable tool/function calling for plain chat requests.
- If the model service cannot be changed, add an adapter in Higress, the reverse proxy, or a sidecar that rewrites `tool_calls[].function.arguments` into `delta.content` before forwarding to chat-rag.

### B.5 chat-rag Startup Dependencies

This document deploys the Code Review subsystem and assumes the main platform is up. If you do need to debug chat-rag itself, note that `zgsm/chat-rag:v1.5.8` reads more than `chat-api.yaml` — it also pulls these configurations from Nacos:

```text
agent_rules
tools_prompt
precise_context
model_router
```

Missing Nacos configuration can cause chat-rag to fail at startup. Such issues belong in the main platform deployment area: verify the Nacos initialization SQL, the imported configuration, and the chat-rag startup logs.

---

## See Also

- [Backend Deployment](./introduction.md)
- [How to Configure Higress](./old-version-config/higress.md)
- [review-deploy repository](https://github.com/zgsm-sangfor/review-deploy)
