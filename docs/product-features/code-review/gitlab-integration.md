---
sidebar_position: 2
---

# 企业集成 (Enterprise Integration)

Supports deep integration with enterprise GitLab for automated quality review of merge requests, flexibly adapting to personal development and team collaboration workflows (for private deployment only)

## 创建访问令牌

![Access token step 1](./img/1.png)

![Access token step 2](./img/2.png)

![Access token step 3](./img/3.png)

![Access token step 4](./img/4.png)

**Note:** After generating the token, do not close the page immediately. Once the page is refreshed or closed, the token cannot be retrieved again.

## 配置 Webhook

- Configuration entry:

![Webhook configuration](./img/5.png)

- Required parameters:

Webhook URL: `https://xxx/code-review/api/v1/webhooks/gitlab`

Secret Token: Use the token created above, **can be left blank**

![Webhook step 1](./img/6.png)

![Webhook step 2](./img/7.png)

![Webhook step 3](./img/8.png)

![Webhook step 4](./img/9.png)

![Webhook step 5](./img/10.png)

![Webhook step 6](./img/11.png)

**Return 200 indicates successful test**
