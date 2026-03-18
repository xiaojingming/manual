---
sidebar_position: 7
---

# FAQ

### Are there any version requirements for the IDE?

Due to technical framework limitations, you must upgrade to version 2023.3 or higher.

### Large model support?

You can use them directly. The impact on effectiveness is related to the deployed model parameter size. Models like qwen3-480b and deepseek-v3.2 will perform better. Currently, models that have shown good performance in experiments include: GLM-4.6, KIMI-K2.

### Computing resource requirements for large-scale use?

According to the recommended deployment of GLM 4.6 FP8, a scenario with 1,000 users in conversation requires at least 10 eight-card H20-141G servers. Based on the previous data standard version: Ascend 910B3-64B 8-card * 2, corresponding RPM: 6-8, supporting R&D personnel: 100. For 1,000 users, multiply the resources by about 10.

### Minimum deployment list for private deployment?

All components are microservices. If you need to deploy a minimal system, it requires targeted customization. Currently, we do not have plans for this.

### Xinchuang support status?

Currently, we only temporarily support hardware other than amd64. If it is indeed necessary to support it, additional development and testing will be required.

### Does it support adaptation and scenario optimization?

Please discuss specific application scenarios with us.

### Version iteration and upgrade directions?

On one hand, continue to improve the accuracy and code quality of AI-generated code in enterprise existing codebases. On the other hand, provide an AI-native development platform to support enterprises in their AI Native transformation.

### Payment model for private deployment?

If you don't need other services, you don't need to pay. All capabilities up to 2025 are free of charge. Subsequently, we will launch an AI Native platform in conjunction with CoStrict, which will be charged.

### Trigger conditions and customization for code intelligent completion?

Completion is automatically triggered during the input process, generally used to optimize the user's input experience. Due to the pursuit of response time, completion content is generally limited to outputting shorter content fragments. For structural content/large-scale code generation, it is recommended to complete it through the dialogue mechanism. Since users can provide more accurate intentions in dialogue, the generated code is more accurate (generally also slower).

### CodeReview support for different languages?

CoStrict's CodeReview adopts the Agent scanning scheme, which does not limit the scanning language. The plugin is open-source. The CodeReview feature is still in the closed-source polishing stage, and there will be open-source plans in the future. Please stay tuned.

### Does it support cross-file awareness and enterprise knowledge base?

Put the corresponding knowledge directly into the code repository, and use the @ function to specify reading files or file directories.

### Introduction to vibe, plan, and spec modes?

**vibe mode**: Focuses on human-computer interactive code, with code generation through dialogue interaction, focusing on step-by-step project completion. Reference: [Case Practice 2 - Code Generation, Project from 0 to 1 | costrict](./best-practices/best-practices2)

**plan mode**: Serious programming, following the "Plan → Step-by-step Implementation" process. Suitable for iterative development and task management, ensuring orderly project progression. Suitable for old project iteration development functions. Reference: [Plan Mode Manual](/plugin/product-features/plan)

**spec mode**: Serious programming, following the "Requirement Clarification → Design → Task Breakdown → Test Self-Verification and Self-Repair" process. Suitable for 0-1 development. Reference: [Serious Programming Mode](/plugin/product-features/strict-mode)