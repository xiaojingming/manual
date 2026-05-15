---
sidebar_position: 5
---

# Case Study 5 – Project Development from 0 to 1

This case study explains how to use CoStrict to go from a project idea to a running application, covering requirements analysis, system design, task breakdown, code generation, and debugging. It suits new project kick-offs, prototype development, course projects, internal tool builds, and similar scenarios.

Example project: Thesis Management System  
Target capabilities: paper upload, auto-classification, full-text search, team collaboration

---

## 1. When to Use

You should prefer **Spec mode** for 0–1 development when:

- You only have an idea and no complete design yet.
- You need AI to help clarify requirements, design architecture, and split tasks.
- The project has multiple modules and is not suitable for one-shot code generation.
- You want planning documents first, then gradual implementation.

For minor code tweaks, use **Vibe mode**; for adding a feature to an existing project, use **Plan mode**.

---

## 2. Model & Mode Selection

### Model Selection

0–1 development involves requirement understanding, multi-agent collaboration, code generation, and context management. Choose a model with strong overall capability, such as GLM5.1 or another model that performs steadily in complex task planning and code generation.

### Mode Selection

| Mode | Scenario | Estimated Time | Notes |
|------|----------|---------------|-------|
| Vibe | Code tweaks, instant debugging, small fixes | ~10 min | Good for quick, well-defined fixes |
| Plan | Implement or refactor a small feature | ~30 min | Good for feature-level changes in existing projects |
| Spec | Plan a new project from 0 to 1 | Depends on scale | Good when requirements, design, and task splitting all need systematic planning |

Simple rule:

```text
Few lines of code → Vibe
One feature → Plan
Start from scratch → Spec
```

---

## 3. 0–1 Development Workflow

### Step 1: Prepare Project Inputs

Prepare the following materials first:

- **Requirements doc**: What problem the project solves and what features it has.
- **Tech-stack doc**: Front-end, back-end, database, and other technology choices.
- **Architecture doc**: Module relationships, interface constraints, data models, etc.
- **References**: Prototypes, tables, historical project descriptions, chat transcripts, etc.

If the raw materials are Word, Excel, or chat logs, convert them to **Markdown** first so CoStrict can read and reference them easily.

Example:

```text
@requirements.md @tech-stack.md @architecture.md

Please design a thesis management system based on these documents.
The system needs to support paper upload, auto-classification, full-text search, and team collaboration.
Please complete requirements analysis, technical design, and task breakdown first. Do not write code directly.
```

If you do not have formal documents yet, you can start with a one-sentence description:

```text
I want to build a thesis management system that supports paper upload, auto-classification, full-text search, and team collaboration.
Please help me clarify requirements, design system architecture, and split development tasks.
```

---

### Step 2: Use Spec Mode to Generate Planning Documents

Switch to **Spec mode** and let CoStrict complete the project planning first.

Spec mode usually produces three core documents:

| Document | Content | Responsible Agent |
|----------|---------|-------------------|
| requirements.md | Requirement definition | Requirements Agent |
| design.md | Technical design | Design Agent |
| tasks.md | Task breakdown and planning | Task Agent |

The goal of this step is not to write code immediately, but to make the project structure clear first.

---

### Step 3: Review and Adjust Planning Documents

After the planning documents are generated, check three things first:

1. **Is requirements.md accurate?**
   - Are the features complete?
   - Are there unnecessary features?
   - Are abnormal scenarios missing?

2. **Is design.md reasonable?**
   - Does the tech stack meet expectations?
   - Is the database design complete?
   - Are APIs and module relationships clear?

3. **Is tasks.md executable?**
   - Are tasks too large?
   - Can they be developed one by one in order?
   - Does each task have a clear deliverable?

If adjustments are needed, you can modify the documents directly or let the corresponding Agent assist.

Examples:

```text
Please supplement the requirement boundaries of the thesis classification module, focusing on how to handle auto-classification failures.
```

```text
Please adjust the database design in design.md to add paper tags, uploader, and team permission fields.
```

```text
Please re-split tasks.md into independently developable and verifiable tasks for paper upload, full-text search, and team collaboration.
```

---

### Step 4: Execute Development According to tasks.md

After the plan is confirmed, open `tasks.md` and execute development task by task in order.

Recommended development rhythm:

| Strategy | Practice | Suitable Scenario |
|----------|----------|-------------------|
| One by one | Develop one feature → Debug one feature → Develop the next | New projects, many feature dependencies |
| Batch then debug | Generate multiple features at once, debug uniformly at the end | Relatively independent features, want to see the overall framework quickly |

For 0–1 projects, it is recommended to prioritize **one-by-one development and debugging**. This makes it easier to locate problems and avoids the difficulty of troubleshooting after generating a large amount of code at once.

Example order:

1. Complete the basic project structure first.
2. Then complete the paper upload module.
3. Then complete the paper classification module.
4. Then complete the full-text search module.
5. Finally supplement team collaboration, permissions, page optimization, and other features.

---

### Step 5: Run the Project and Debug

After code generation, start the project and check whether the functions meet expectations.

Choose different modes according to problem types during debugging:

| Problem Type | Recommended Mode | Handling Method |
|--------------|------------------|-----------------|
| Clear, small errors | Vibe | Paste the error directly and let AI fix it |
| Large gap between implementation and expectation | Plan | Re-plan the feature and supplement development |
| Front-end page or interaction issues | Vibe + Playwright / MCP | Let AI assist in checking pages and interactions |

Examples:

```text
The following error occurred after project startup. Please help analyze the cause and fix it.
Requirement: Only modify necessary files, do not refactor the overall project structure.
```

```text
The current paper upload page layout is not clear enough. Please optimize the page structure and form interaction without changing the existing interface logic.
```

---

## 4. Practical Results

Through this practice, CoStrict mainly played four roles in 0–1 project development:

| Capability | Specific Performance |
|------------|----------------------|
| Requirement structuring | Turn a one-sentence idea into clear functional requirements |
| System design | Automatically generate technical solutions, module designs, data models, and interface designs |
| Task breakdown | Split complex projects into step-by-step executable development tasks |
| Development & debugging | Support code generation, bug fixing, feature supplementation, and page optimization |

For new projects, CoStrict's value is not just "generating code," but helping developers push the project from idea to executable plan, and from plan to runnable code.

---

## 5. Recommendations

### 1. Do not ask AI to write the complete project at the beginning

The most error-prone part of 0–1 projects is not the code, but unclear requirements and design. It is recommended to complete planning in Spec mode first, then enter development.

### 2. The clearer the document input, the more stable the output

Try to organize requirements, tech stack, business rules, and interface constraints into Markdown. The more explicit the input, the more controllable the AI-generated structure.

### 3. Prioritize task-by-task development and verification

Do not blindly batch-generate all features for new projects. It is recommended to run, check, and fix after completing each task.

### 4. Developers still need to review key results

AI can assist in generating requirements, designs, and code, but key content such as database design, permission logic, exception handling, and business rules still requires manual confirmation.

### 5. Flexibly switch between different modes

- Use **Spec** for project planning.
- Use **Plan** for feature supplementation.
- Use **Vibe** for quick debugging.

Switching modes according to task stages is more stable than using a single mode throughout.

---

## 6. Summary

For complex projects, AI should not be treated as a tool for "one-shot generation of the complete project," but as a development assistant that can collaborate continuously. Plan first, then execute, then verify, to complete the development process from idea to runnable project more stably.

Recommended path:

```text
Prepare Markdown documents
↓
Spec mode generates requirements / design / tasks
↓
Review and adjust planning documents
↓
Execute development task by task according to tasks.md
↓
Use Vibe / Plan to debug and supplement features
```
