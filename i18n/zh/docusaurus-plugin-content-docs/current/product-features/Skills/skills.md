---
sidebar_position: 8
---

# SKILLS技能

Skills 将特定任务的指令打包，当你的请求与 skill 的目的匹配时，CoStrict 会按需加载这些指令。与适用于所有工作的自定义指令不同，skills 仅在需要时激活——使 CoStrict 在专业任务上更加高效，而不会使基础提示词变得臃肿。

## 为什么 Skills 很重要​

**自定义指令适用范围广泛**，涵盖你的所有工作。它们非常适合通用编码标准或风格偏好，但不适合特定工作流程，如"处理 PDF 文件"或"生成 API 文档"。

**Skills 解决了这个问题**：创建一个 PDF 处理 skill，CoStrict 仅在你实际请求处理 PDF 时才加载这些指令。这使系统提示词保持专注，并使 CoStrict 在特定领域拥有深厚的专业知识，而不会影响无关的任务。

你无法将打包资源（脚本、模板、参考文件）与自定义指令一起使用。Skills 允许你将相关文件与指令一起存储，创建自包含的工作流程包。

## Skills 能做什么​

- **特定任务专业知识**：为专业工作流程打包详细指令（数据处理、文档生成、代码迁移模式）
- **打包资源**：在指令旁边包含辅助脚本、模板或参考文件
- **模式定向**：创建仅在特定模式下激活的 skills（例如，代码重构 skills 仅在代码模式下）
- **团队共享**：在 `.roo/skills/` 中对项目 skills 进行版本控制，以实现一致的团队工作流程
- **个人库**：在 `~/.roo/skills/` 中构建适用于所有项目的全局 skills 库
- **覆盖控制**：项目 skills 覆盖全局 skills，特定模式覆盖通用模式

## Skills 如何工作​

Skills 使用**渐进式**来高效地仅在需要时加载内容：

**级别 1：发现** - CoStrict 读取每个 `SKILL.md` 文件并解析其前置元数据以提取 `name` 和 `description`。仅存储此元数据用于匹配——在需要之前不会将完整内容保存在内存中。

**级别 2：指令** - 当你的请求匹配 skill 描述时，CoStrict 使用 `read_file` 将完整的 SKILL.md 指令加载到上下文中。

**级别 3：资源** - 提示词告诉 CoStrict 它可以访问 skill 对应的打包文件（脚本、模板、参考文件）。没有单独的资源清单——当指令引用这些文件时，CoStrict 会按需发现它们。

这种架构意味着 skills 在激活之前保持休眠状态——它们不会使你的基础提示词膨胀。你可以安装许多 skills，CoStrict 仅加载与每个任务相关的内容。

## 创建你的第一个 Skill​

#### 1. 选择位置​

**全局 skills**（在所有项目中可用）：

```md
# Linux/macOS
~/.roo/skills/{skill-name}/SKILL.md

# Windows
%USERPROFILE%\.roo\skills\{skill-name}\SKILL.md
```

**项目 skills**（特定于当前工作区）：

```md
<project-root>/.roo/skills/{skill-name}/SKILL.md
```

#### 2. 创建 skill 目录和文件​

```md
# 示例：PDF 处理 skill
mkdir -p ~/.roo/skills/pdf-processing
touch ~/.roo/skills/pdf-processing/SKILL.md
```

#### 3. 编写 SKILL.md 文件​

文件需要包含 `name` 和 `description` 的前置元数据：

```md
---
name: pdf-processing
description: 使用 Python 库从 PDF 文件中提取文本和表格
---

# PDF 处理指令

当用户请求 PDF 处理时：

1. 检查是否安装了 PyPDF2 或 pdfplumber
2. 对于文本提取，使用 pdfplumber 以获得更好的表格检测
3. 对于仅文本的简单 PDF，PyPDF2 就足够了
4. 始终优雅地处理编码错误
5. 提供将提取的内容保存到文件的选项

## 代码模板

[在此处添加详细的代码模式]

## 常见问题

- 加密的 PDF：解释它们需要密码参数
- 扫描的 PDF：推荐 OCR 工具如 pytesseract
- 大文件：建议逐页处理
```

**命名规则**：

- `name` 字段必须与目录名称（或符号链接名称）完全匹配
- 名称必须为 1-64 个字符，仅限小写字母/数字/连字符
- 不允许前导/尾随连字符，不允许连续连字符（例如，`my--skill` 无效）
- `name` 和 `description` 都是必需的
- 描述必须为 1-1024 个字符
- 描述告诉 CoStrict 何时使用此 skill——要具体

#### 4. 测试 skill​

询问 CoStrict 与描述匹配的内容：

```"你能帮我从这个 PDF 文件中提取表格吗？"```

CoStrict 应该识别出请求与你的 skill 描述匹配，加载 SKILL.md 文件，并按照其指令操作。

## 目录结构​

#### 基本结构​

```commandline
~/.roo/skills/                    # 全局 skills
├── pdf-processing/
│   ├── SKILL.md                 # 必需
│   ├── extract.py               # 可选：打包的脚本
│   └── templates/               # 可选：相关文件
│       └── output-template.md
└── api-docs-generator/
    └── SKILL.md

.roo/skills/                      # 项目 skills（覆盖全局）
└── custom-pdf-workflow/
    └── SKILL.md
```

#### 特定模式的 skills​

创建仅在特定模式下激活的 skills：

```commandline
~/.roo/skills-code/              # 仅在代码模式下
└── refactoring-patterns/
    └── SKILL.md

.roo/skills-architect/           # 仅在架构师模式下
└── system-design-templates/
    └── SKILL.md

~/.roo/skills-{modeSlug}/        # 任何模式
```

**何时使用特定模式的 skills**：

- 代码重构模式（仅代码模式）
- 系统设计模板（仅架构师模式）
- 文档标准（特定于文档编写模式）

## 覆盖优先级​

当多个位置存在同名 skill 时，适用以下优先级（首先评估项目 vs 全局，然后在每个源中评估特定模式 vs 通用）：

1. **项目特定模式**（`.roo/skills-code/my-skill/`）
2. **项目通用**（`.roo/skills/my-skill/`）
3. **全局特定模式**（`~/.roo/skills-code/my-skill/`）
4. **全局通用**（`~/.roo/skills/my-skill/`）

这意味着**项目通用** skill 会覆盖**全局特定模式** skill——项目位置优先于模式特异性。

这让你可以：

- 设置适用于所有地方的全局标准
- 在需要时按项目覆盖它们（即使使用通用 skills）
- 在每个位置内为特定模式专门化 skills

## Skill 发现​

CoStrict 自动发现 skills：

- **启动时**：通过读取和解析每个 SKILL.md 来索引所有 skills
- **开发期间**：文件监视器检测 SKILL.md 文件的更改
- **模式过滤**：仅提供与当前模式相关的 skills

你不需要注册或配置 skills——只需创建目录结构即可。

**自定义系统提示词会覆盖 Skills**

如果你有基于文件的自定义系统提示词（`.roo/system-prompt-{mode-slug}`），它会完全替换标准系统提示词——包括 skills 部分。当自定义系统提示词处于活动状态时，skills 将不可用。

#### 符号链接支持​

Skills 支持符号链接，用于跨项目共享 skills 库：

```md
# 跨项目共享 skills 库
ln -s /shared/company-skills ~/.roo/skills/company-standards
```

Skill 名称来自符号链接名称（如果未符号链接，则为目录名称）。前置元数据的 `name` 字段必须与此名称完全匹配——你不能创建指向同一 skill 的不同名称的别名。

## 故障排除​

#### Skill 未加载​

**现象**：即使你请求的内容与描述匹配，CoStrict 也不使用你的 skill。

**原因和解决方法**：

1. **名称不匹配**：前置元数据的 `name` 字段必须与目录名称完全匹配

```md
# ✗ 错误 - 目录是 "pdf-processing"
---
name: pdf_processing
---

# ✓ 正确
---
name: pdf-processing
---
```

2. **缺少必需字段**：前置元数据中需要 `name` 和 `description`

3. **错误的模式**：如果技能在 `skills-code/` 中但你处于架构师模式，它将不会加载。移至 `skills/` 以适用于所有模式，或创建特定模式的变体。

4. **描述太模糊**：使描述具体化，以便 CoStrict 可以将它们与请求匹配

```md
# ✗ 模糊
description: 处理文件

# ✓ 具体
description: 使用 Python 库从 PDF 文件中提取文本和表格
```

#### Skill 已加载但没有帮助​

**现象**：CoStrict 读取了 skill 但不遵循指令。

**原因**：指令可能过于笼统或缺少关键细节。

**解决方法**：使指令可操作：

- 包含特定的函数名称或库选择
- 提供代码模板
- 列出常见的边缘情况以及如何处理它们
- 为特定任务添加故障排除指导

#### 多个 skills 冲突​

**现象**：当多个 skills 可能匹配时，不清楚 CoStrict 将使用哪个。

**原因**：重复的描述或模式配置。

**预防**：

- 使描述清晰且具体
- 使用特定模式的目录来分离关注点
- 依赖覆盖优先级——项目 skills 覆盖全局 skills

#### 无法与团队共享 skills​

**现象**：希望团队成员使用相同的 skills。

**解决方案**：将 skills 放置在项目内的 `.roo/skills/` 中并提交到版本控制。每个团队成员会自动获得相同的 skills。

## Skills vs 自定义指令 vs 斜杠命令​

| 功能 | Skills | 自定义指令 | 斜杠命令 |
| ------- | ------ | ------------------- | -------------- |
| **何时加载** | 按需（当请求匹配时） | 始终（基础提示词的一部分） | 按需（当调用时） |
| **最适合** | 特定任务工作流程 | 通用编码标准 | 检索预先编写的内容 |
| **可以打包文件** | 是 | 否 | 否 |
| **模式定向** | 是（`skills-{mode}` 目录） | 是（`rules-{mode}` 目录） | 否 |
| **覆盖优先级** | 项目 > 全局，模式 > 通用 | 项目 > 全局 | 项目 > 全局 |
| **格式** | 带前置元数据的 SKILL.md | 任何文本文件 | JSON 元数据 + 内容 |
| **发现** | 自动（目录扫描） | 自动（目录扫描） | 自动（目录扫描） |

**何时使用每个**：

- **Skills**："按照 OpenAPI 规范生成 API 文档" → 仅在需要时加载详细的 OpenAPI 处理指令
- **自定义指令**："始终使用 TypeScript 严格模式" → 适用于所有 TypeScript 工作
- **斜杠命令**：`/init` → 返回标准化的项目设置指令

## Skills 规范​

CoStrict skills 遵循 Agent Skills 格式进行 skill 打包和元数据管理。Skills 是**带有可选打包文件的指令包**——它们不会注册新的可执行工具。

**必需约定**：

- 前置元数据的 `name` 必须与目录（或符号链接）名称完全匹配
- 前置元数据中需要 `name` 和 `description` 字段
- 名称：1-64 个字符，小写字母数字 + 连字符，无前导/尾随/连续连字符
- 描述：1-1024 个字符

#### CoStrict 特定增强​

CoStrict 在基本格式之外添加了特定模式定向：

- **标准位置**：`.roo/skills/` 和 `~/.roo/skills/`
- **特定模式目录**：`skills-{mode}/`（例如，`skills-code/`、`skills-architect/`）启用模式定向

## 另请参阅​

- [斜杠命令](../slash-command.md) - 执行返回内容的命令
- [自定义模式](../rules.md) - 创建具有特定工具访问权限的专业模式
