---
sidebar_position: 4
---

# Case Study 4 – CoStrict Strict Programming Mode

## 1. What is Strict Mode?

Strict mode is a structured artifact that standardizes the development workflow for complex features in an application. It provides a systematic way to transform high-level ideas into detailed implementation plans with clear tracking and full traceability.

With Strict mode you can:

- Deeply analyze a project and generate comprehensive project documentation  
- Break down requirements into user stories with acceptance criteria  
- Produce design documents using sequence diagrams and architecture planning  
- Track the implementation progress of independent tasks  
- Execute interface and unit tests independently  
- Automatically generate and run tests to ensure code reliability and stability  

## 2. Quick Start

Ready to create your first Strict-mode project? Here’s how to get started:

Project wiki → Requirements clarification → Design constraints → Task breakdown → Test cases, a five-stage workflow.

### 2.1. Before You Begin

Install the basic project environment, e.g. Go, Python runtime, database, etc.  
Install the git command-line tool: required when creating requirements, designs, or project changes.  
Open the corresponding project.

### 2.2. Project Wiki

The project wiki is intended to enhance the design and coding of an existing project; it is optional.  
It can also serve as a reference when first learning the codebase.

#### 2.2.1. Click “Project Wiki”

![alt text](img/manual/image1.webp)

#### 2.2.2. Wiki Generation in Progress

After a short wait, the project wiki will be generated under the `.cospec` directory.

![alt text](img/manual/image2.webp)

### 2.3. Strict Mode (without Test Cases)

Requirements clarification → Design constraints → Task breakdown: these three steps only need a one-sentence requirement. We recommend editing the generated results afterwards.

#### 2.3.1. Select Strict Mode

When you choose Strict mode you will see not only the strict agent but also requirement, task, test, and other agents. These agents will help you generate requirements, designs, tasks, test cases, and other auxiliary programming documents.

![alt text](img/manual/image3.webp)

#### 2.3.2. Enter Your Requirement

Simply enter your requirement in Strict mode. Multiple agents will then analyze your requirement, wiki, and code to produce appropriate documents and test cases.

![alt text](img/manual/image4.webp)

#### 2.3.3. Strict Agent Automatically Breaks Down 4 Tasks

Note: the strict agent will evaluate your requirement. If it is very simple (e.g. changing a small style), it may switch directly to code mode to complete the task.

![alt text](img/manual/image5.webp)

#### 2.3.4. Strict Agent Directs Each Agent to Complete Its Task

![alt text](img/manual/image6.webp)

#### 2.3.5. Generation Complete

Under `.cospec/{feature-name}` you will find the corresponding requirement, design, and task documents.

![alt text](img/manual/image7.webp)

#### 2.3.6. Linking Requirements and Tasks

![alt text](img/manual/image8.webp)

#### 2.3.7. Code Writing

Click “Run” on task.md to start coding the current task.

![alt text](img/manual/image9.webp)

#### 2.3.8. Code Writing in Progress

![alt text](img/manual/image10.webp)

#### 2.3.9. Task Complete

When a task finishes it is marked as done.  
If a conversation error causes abnormal termination, you can manually mark \[x\] as finished or retry.  
“Run all tasks” executes every task; we recommend running them one by one for better control.

![alt text](img/manual/image11.webp)

### 2.4. Document Changes

To keep changes controllable, follow the flow: requirement → design → task.

#### 2.4.1. Requirement Change

##### 2.4.1.1. Modify the Requirement

Edit `requirements.md` directly or converse with the requirements agent to change it.

![alt text](img/manual/image12.webp)

##### 2.4.1.2. Sync Changes to Design

Click any “Update” in the document to propagate the changed requirement to the design document.  
Here I delete FR-006; you can see on the right that the design is updated and a task to remove FR-006 is initiated.

![alt text](img/manual/image13.webp)

A change record is automatically appended at the end of the document.

![alt text](img/manual/image14.webp)

#### 2.4.2. Architecture Design Change

##### 2.4.2.1. Change the Architecture Design

Edit `design.md` directly or converse with the architect agent to change technical details.

![alt text](img/manual/image15.webp)

##### 2.4.2.2. Sync Changes to Tasks

Click any “Update” in the document to propagate the changed design to tasks.  
After the change, tasks are regenerated based on the new requirement and design.

![alt text](img/manual/image16.webp)

##### 2.4.2.3. Change Result

You can see that the FR-006 task has been removed.

![alt text](img/manual/image17.webp)

#### 2.4.3. Task Change

##### 2.4.3.1. Change a Task

Edit `task.md` directly or converse with the task agent to change execution details.  
Here you can refine task execution details to make them more controllable, or delete unnecessary tasks.

![alt text](img/manual/image18.webp)

#### 2.4.4. Task Execution

After the change, run the corresponding task block directly.

![alt text](img/manual/image19.webp)

### 2.5. Test Cases and Testing

#### 2.5.1. Generate Test Cases

Click the home page to generate test cases and a test plan for the project.

![alt text](img/manual/image20.webp)

#### 2.5.2. Link Test Tasks to Tasks

In Strict mode you can associate test cases with tasks through conversation and execute them step by step.  
If the file `TEST_GUIDE.md` already exists under `.cospec`, a test-case generation stage is automatically added after tasks are created.

![alt text](img/manual/image21.webp)
