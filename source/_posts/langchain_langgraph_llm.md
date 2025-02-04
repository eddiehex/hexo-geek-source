---
title: 深入浅出 Langchain 与 LangGraph：LLM 应用开发的双剑客
date: 2025-02-05
categories:
  - LLM
tags: [Agent,LLMs,LangChain,LangGraph]
toc: true
excerpt: "随着大型语言模型 (LLM) 的飞速发展，构建基于 LLM 的应用程序变得越来越热门。Langchain 和 LangGraph 作为两个强大的开发框架，为开发者提供了构建 LLM 应用的强大工具。本文将深入探讨 Langchain 和 LangGraph 的核心概念、常见函数、使用示例以及两者之间的关键区别，帮助你更好地理解和选择适合你的 LLM 应用开发框架。"
---

## 一、核心概念对比：Chain vs. Graph

Langchain 和 LangGraph 的核心区别在于它们构建应用的**基本模型**：

*   **Langchain:** 专注于构建 **链式 (Chain)** 应用，将 LLM、Prompt、工具等组件 **线性串联**，形成一个顺序执行的工作流程。这种方式适合构建相对简单、流程固定的应用。
*   **LangGraph:** 专注于构建 **图状 (Graph)** 应用，将 LLM、Prompt、工具等组件视为 **节点 (Node)**，节点之间通过 **边 (Edge)** 连接，形成一个更复杂、更灵活、可定制、支持状态管理的图状工作流程。这种方式适合构建需要复杂逻辑控制、状态管理和灵活性的应用，例如复杂的 Agent、多轮对话系统等。

如果把 LLM 应用比作流程图，那么 Langchain 就像是 **流程图中的直线型流程**，而 LangGraph 则是 **带有分支、循环和复杂逻辑的流程图**。

## 二、常见函数分类与对比

本节将按照功能对 Langchain 和 LangGraph 的常见函数进行分类，并对比它们在类似功能上的实现方式。

### 1. LLM (语言模型) 相关

无论是 Langchain 还是 LangGraph，都需要与 LLM 进行交互。两者在这方面的处理方式类似，都是直接初始化 LLM 对象，例如 `ChatOpenAI`、`OpenAI` 等。

**示例 (Langchain & LangGraph 类似):**

```python
from langchain_openai import ChatOpenAI

# Langchain & LangGraph 中都一样
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
```

### 2. Prompt (提示词) 相关

Langchain 和 LangGraph 都使用 `PromptTemplate` 来构建提示词模板，方便管理和复用 Prompt。

**示例 (Langchain & LangGraph 类似):**

```python
from langchain.prompts import PromptTemplate

prompt = PromptTemplate.from_template("请用 {language} 总结以下内容：{text}")

# Langchain 中可以直接格式化 prompt
formatted_prompt_langchain = prompt.format(language="中文", text="Langchain 是一个用于构建 LLM 应用的框架...")
print(formatted_prompt_langchain)

# LangGraph 中通常在 Node 中格式化 prompt
# (后续 Node 示例会展示)
```

### 3. Chain (链) / Node (节点) 相关

这是 Langchain 和 LangGraph 最核心的区别所在。

#### 3.1 Langchain - Chain (链)

*   **概念:** 将多个组件 (LLM, Prompt, 工具等) 线性串联起来，形成一个工作流程。
*   **常见 Chain 类型:**
    *   `LLMChain`: 最基础的 Chain，将 Prompt 和 LLM 结合。
    *   `SequentialChain`: 将多个 Chain 顺序连接起来。
    *   `SimpleSequentialChain`: 简化版的 `SequentialChain`。
    *   `RetrievalQAChain`: 用于问答，结合检索器 (Retriever)。
    *   `AgentExecutor`: 用于执行 Agent 的 Chain。
*   **核心函数/类:**
    *   `LLMChain(llm=..., prompt=...)`
    *   `SequentialChain(chains=[...], input_variables=[...], output_variables=[...])`
    *   `SimpleSequentialChain(chains=[...])`
    *   `RetrievalQAChain.from_llm(llm=..., retriever=...)`
    *   `AgentExecutor.from_agent_and_tools(agent=..., tools=...)`

**示例 - Langchain Chain (`LLMChain`):**

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
prompt = PromptTemplate.from_template("请用 {language} 总结以下内容：{text}")

chain = LLMChain(llm=llm, prompt=prompt)

output = chain.run(language="中文", text="Langchain 是一个用于构建 LLM 应用的框架...")
print(output)
```

#### 3.2 LangGraph - Node (节点)

*   **概念:** 图中的一个计算单元，可以是 LLM 调用、函数调用、工具调用等。Node 是构建 Graph 的基本 building block。
*   **Node 的形式:** 可以是函数、Langchain Runnable (例如 `LLMChain`, `RetrievalQAChain`) 等。
*   **核心函数/类 (Graph 构建相关):**
    *   `StateGraph(AgentState)`: 创建状态图，`AgentState` 是自定义的状态类。
    *   `graph.add_node("node_name", node_function)`: 向图中添加节点。
    *   `graph.add_edge("node1_name", "node2_name")`: 添加节点之间的有向边，表示流程顺序。
    *   `graph.set_entry_point("node_name")`: 设置图的入口节点。
    *   `graph.set_conditional_edges("node_name", conditional_mapping)`: 添加条件边，根据节点输出决定下一步走向。
    *   `graph.set_finish_point("node_name")`: 设置图的结束节点。

**示例 - LangGraph Node (函数作为 Node):**

```python
from langgraph.graph import StateGraph
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.pregel import PregelProcess

# 定义状态类 (简单示例)
class AgentState:
    messages: list[dict] = []

# 定义一个 Node 函数
def summarize_node(state):
    messages = state.get("messages", [])
    text_to_summarize = messages[-1]["content"] # 假设最后一条消息是用户输入
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
    prompt = PromptTemplate.from_template("请用中文总结以下内容：{text}")
    chain = LLMChain(llm=llm, prompt=prompt)
    summary = chain.run(text=text_to_summarize)
    return {"messages": messages + [{"role": "assistant", "content": summary}]} # 更新状态

# 创建状态图
graph = StateGraph(AgentState)

# 添加 Node
graph.add_node("summarize", summarize_node)

# 设置入口节点
graph.set_entry_point("summarize")

# 设置结束节点 (这里简化，直接结束)
graph.set_finish_point("summarize")

# 编译图
app = graph.compile()

# 运行图
inputs = {"messages": [{"role": "user", "content": "Langgraph 是一个用于构建复杂 LLM 应用的框架..."}]}
result = app.invoke(inputs)
print(result)
```

**示例 - LangGraph Node (Langchain Runnable 作为 Node):**

```python
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# 定义状态类 (简单示例)
class AgentState:
    messages: list[dict] = []

# 创建 Langchain Runnable (LLMChain)
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
prompt = PromptTemplate.from_template("请用中文总结以下内容：{text}")
summarize_chain = LLMChain(llm=llm, prompt=prompt)

# 定义 Node 函数 (直接使用 Runnable)
def summarize_node(state):
    messages = state.get("messages", [])
    text_to_summarize = messages[-1]["content"] # 假设最后一条消息是用户输入
    summary = summarize_chain.run(text=text_to_summarize)
    return {"messages": messages + [{"role": "assistant", "content": summary}]} # 更新状态

# 创建状态图 (与上例相同)
graph = StateGraph(AgentState)
graph.add_node("summarize", summarize_node)
graph.set_entry_point("summarize")
graph.set_finish_point("summarize")
app = graph.compile()

# 运行图 (与上例相同)
inputs = {"messages": [{"role": "user", "content": "Langgraph 是一个用于构建复杂 LLM 应用的框架..."}]}
result = app.invoke(inputs)
print(result)
```

### 4. Agent (代理) 相关

#### 4.1 Langchain - Agent

*   **概念:** 能够根据用户输入和环境信息，自主决定下一步行动 (例如使用工具、调用 LLM)，并进行迭代，直到完成目标。
*   **核心组件:**
    *   `Agent`: 负责决策下一步行动。通常需要 `Prompt` 来指导 Agent 的行为。
    *   `Tools`: Agent 可以使用的工具 (例如搜索、计算器、数据库查询等)。
    *   `AgentExecutor`: 负责执行 Agent 的 Chain，管理 Agent 的状态和工具的使用。
*   **核心函数/类:**
    *   `create_react_agent(llm=..., tools=..., prompt=...)`: 创建 ReAct 类型的 Agent。
    *   `AgentExecutor.from_agent_and_tools(agent=..., tools=...)`: 创建 AgentExecutor。

**示例 - Langchain Agent (`ReAct Agent`):**

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import DuckDuckGoSearchRun

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
tools = [DuckDuckGoSearchRun()] # 使用 DuckDuckGo 搜索工具

prompt = PromptTemplate.from_template("""
你是一个有用的助手，可以使用工具回答问题。

{agent_scratchpad}
""") # 简化 Prompt，实际 ReAct Prompt 会更复杂

agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, verbose=True)

output = agent_executor.run("今天北京天气怎么样？")
print(output)
```

#### 4.2 LangGraph - Agent

*   **概念:** Agent 被视为 Graph 中的一个或多个 Node。LangGraph 提供了更灵活的方式来构建 Agent 的工作流程，可以实现更复杂的状态管理、条件判断和循环逻辑。
*   **核心概念:**
    *   `AgentState`: 用于管理 Agent 的状态，例如对话历史、工具使用记录、中间结果等。
    *   Agent 的决策和行动逻辑被分解到不同的 Node 中，并通过 Edge 连接。
*   **示例 (LangGraph Agent 框架):** LangGraph 提供了一个 `pregel_process` 模块，用于构建更复杂的 Agent 流程，例如：
    *   `pregel_process.from_functions(...)`: 从函数定义 Agent 的 Node 和 Edge。
    *   `pregel_process.add_node(...)`, `pregel_process.add_edge(...)`, `pregel_process.set_conditional_edges(...)` 等用于构建更细粒度的 Agent 图结构。

**示例 - LangGraph Agent (简化的概念示例，非完整可运行代码):**

```python
from langgraph.graph import StateGraph
from langchain_openai import ChatOpenAI
from langchain.tools import DuckDuckGoSearchRun
from langchain.prompts import PromptTemplate

# 定义 AgentState (包含对话历史和工具输出)
class AgentState:
    messages: list[dict] = []
    tool_output: str = None
    next_action: str = None # 例如 "search", "answer", "finalize"

# 定义 Node 函数 - 决策下一步行动
def agent_decision_node(state):
    messages = state.get("messages", [])
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
    prompt = PromptTemplate.from_template("""
    你是一个 Agent，根据对话历史决定下一步行动。
    可选行动： search, answer, finalize
    对话历史：{messages}
    请输出下一步行动 (search, answer, finalize):
    """)
    chain = LLMChain(llm=llm, prompt=prompt)
    next_action = chain.run(messages=messages)
    return {"next_action": next_action}

# 定义 Node 函数 - 使用搜索工具
def search_tool_node(state):
    messages = state.get("messages", [])
    query = messages[-1]["content"] # 假设最后一条消息是用户问题
    search_tool = DuckDuckGoSearchRun()
    tool_output = search_tool.run(query)
    return {"tool_output": tool_output}

# 定义 Node 函数 - 生成最终答案
def generate_answer_node(state):
    messages = state.get("messages", [])
    tool_output = state.get("tool_output")
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
    prompt = PromptTemplate.from_template("""
    根据搜索结果回答用户问题。
    用户问题：{user_question}
    搜索结果：{tool_output}
    请生成答案：
    """)
    chain = LLMChain(llm=llm, prompt=prompt)
    answer = chain.run(user_question=messages[-1]["content"], tool_output=tool_output)
    return {"messages": messages + [{"role": "assistant", "content": answer}]}

# 创建状态图
graph = StateGraph(AgentState)

# 添加 Node
graph.add_node("decision", agent_decision_node)
graph.add_node("search", search_tool_node)
graph.add_node("answer", generate_answer_node)

# 定义 Edge 和条件边 (简化示例)
graph.set_entry_point("decision")
graph.add_edge("decision", "search") # 假设 always 先 search
graph.add_edge("search", "answer")
graph.set_finish_point("answer")

# 编译图
app = graph.compile()

# 运行图
inputs = {"messages": [{"role": "user", "content": "今天北京天气怎么样？"}]}
result = app.invoke(inputs)
print(result)
```

### 5. 工具 (Tools) 相关

Langchain 和 LangGraph 在工具的使用方式上基本相同，都使用 `langchain.tools` 模块提供的工具，或者自定义工具。

**示例 (Langchain & LangGraph 类似):**

```python
from langchain.tools import DuckDuckGoSearchRun, CalculatorInput, CalculatorRun

# 搜索工具
search_tool = DuckDuckGoSearchRun()
search_output = search_tool.run("最新的 Langchain 版本")
print(f"搜索结果: {search_output}")

# 计算器工具
calculator_tool = CalculatorRun()
calculator_input = CalculatorInput(expression="2 + 2")
calculator_output = calculator_tool.run(calculator_input) # 或 calculator_tool.run("2 + 2")
print(f"计算结果: {calculator_output}")
```

在 Langchain Agent 中，工具会传递给 `AgentExecutor`。在 LangGraph 中，工具可以在 Node 函数中直接调用。

### 6. 状态管理 (State Management) (LangGraph 特有)

LangGraph 通过 `StateGraph` 和自定义的 `AgentState` 类来显式地管理状态。状态在图的节点之间传递和更新。`AgentState` 可以自定义，包含任何需要跟踪的信息，例如对话历史、工具输出、中间结果、用户偏好等。状态管理是 LangGraph 的核心优势之一，使得构建复杂的、状态化的 Agent 和工作流程成为可能。

**(在之前的 LangGraph Node 和 Agent 示例中已经展示了状态管理的使用，例如 `AgentState` 类和 Node 函数中对 `state` 参数的访问和更新。)**

### 7. 图结构构建 (Graph Construction) (LangGraph 特有)

LangGraph 通过 `StateGraph` 类提供的方法来构建图结构：`add_node()`, `add_edge()`, `set_entry_point()`, `set_conditional_edges()`, `set_finish_point()` 等方法用于定义节点、边和图的流程控制逻辑。这种显式的图结构构建方式使得 LangGraph 能够表达非常复杂的流程，例如循环、条件分支、并行处理等。

## 三、`run` 与 `invoke` 的区别

`run` 和 `invoke` 是 Langchain 和 LangGraph 中用于执行 Chain 或 Runnable 的两种方法，它们之间存在一些关键的区别：

*   **输入类型:** `run` 主要接受单个字符串作为输入，而 `invoke` 接受一个字典 (dict) 作为输入，允许更结构化的输入数据。
*   **输出类型:** `run` 主要返回单个字符串作为输出，而 `invoke` 返回一个字典 (dict) 作为输出，提供更结构化的输出数据。
*   **底层机制:** `run` 是 Langchain 较早版本中使用的方法，相对较为简单直接。`invoke` 是 Langchain **Runnable 协议** 的一部分，是更现代、更推荐的方法。`invoke` 更加灵活，支持更复杂的功能，例如异步调用、流式输出、中间结果访问等，并且与 Langchain 的 **Runnable 接口** 更好地集成。
*   **功能和灵活性:** `run` 功能相对有限，主要用于简单的字符串输入和输出场景。`invoke` 功能更强大，更灵活，支持更丰富的功能。
*   **是否推荐使用:** `run` 在一些简单的 Langchain 代码示例中仍然可以看到，但 **不推荐在新代码中使用**。**强烈推荐使用 `invoke` (以及 `ainvoke`, `stream`, `astream`)**，它是 Langchain 官方推荐的执行 Runnable 的方法。

**具体示例对比 (以 `LLMChain` 为例):**

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
prompt = PromptTemplate.from_template("请用 {language} 向 {name} 问好")
chain = LLMChain(llm=llm, prompt=prompt)

# 使用 run (不推荐)
# output_run = chain.run("中文", name="张三") # 错误使用，run 无法处理多个参数
# print(f"run 输出: {output_run}")

# 使用 invoke (推荐)
output_invoke = chain.invoke({"language": "中文", "name": "李四"})
print(f"invoke 输出: {output_invoke}")
```

**总结表格:**

| 特性           | `run`                                    | `invoke` (及 `ainvoke`, `stream`, `astream`)           |
| -------------- | ---------------------------------------- | ------------------------------------------------------ |
| **输入类型**   | 主要接受 **单个字符串**                  | 接受 **字典 (dict)**                                   |
| **输出类型**   | 主要返回 **单个字符串**                  | 返回 **字典 (dict)**                                   |
| **底层机制**   | 较早版本的方法，相对简单直接             | **Runnable 协议** 的一部分，更现代、更灵活             |
| **功能**       | 相对有限                                 | 更强大，支持异步、流式输出、结构化数据、中间结果访问等 |
| **灵活性**     | 较低，输入输出处理方式局限               | 较高，输入输出处理方式更结构化、更灵活                 |
| **是否推荐**   | **不推荐**在新代码中使用                 | **强烈推荐** 使用                                      |
| **异步支持**   | 间接异步 (可能依赖底层 LLM 库的异步支持) | 直接支持异步 (`ainvoke`)                               |
| **流式输出**   | 不支持直接流式输出                       | 支持流式输出 (`stream`, `astream`)                     |
| **结构化数据** | 处理结构化数据不方便                     | 更方便处理结构化数据 (通过字典输入输出)                |

## 四、深入理解 Runnable

Runnable 可以理解为 Langchain 框架的核心 **构建模块** 和 **统一接口**，用于构建复杂的 LLM 应用流程。Runnable 就像是乐高积木中的一块块标准砖，你可以将它们组合、连接，搭建出各种各样的应用。

**关键点：**

1. **Runnable 是一个接口 (Interface) 或协议 (Protocol):**  定义了一组标准方法，任何实现了这些方法的对象都可以被认为是 "Runnable"。
2. **Runnable 的核心能力：执行和组合:**  提供了一种统一的方式来执行组件，并且可以方便地将它们组合成更复杂的流程。
3. **Runnable 提供的标准方法:**  `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`。
4. **Runnable 的组合示例 (使用 `|` 管道操作符):**

```python
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

# 1. 定义 ResponseSchema，描述期望的输出结构
response_schemas = [
    ResponseSchema(name="summary", description="对 {topic} 的中文总结"),
    ResponseSchema(name="keywords", description="关于 {topic} 的三个中文关键词"),
]

# 2. 创建 StructuredOutputParser
output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

# 3. 创建 PromptTemplate，使用 ResponseSchema 的格式指令，并接受 topic 和 language 作为输入变量
prompt_template = PromptTemplate(
    template="请用 {language} 总结关于 {topic} 的内容，并提取关键词。\n{format_instructions}\n",
    input_variables=["language", "topic"],
    partial_variables={"format_instructions": output_parser.get_format_instructions()} # 注入格式指令
)

# 4. 创建 ChatOpenAI 实例
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

# 5. 组装 Runnable Chain： PromptTemplate -> LLM -> OutputParser
runnable_chain = prompt_template | llm | output_parser

# 6. 定义输入数据
input_data = {"topic": "猫", "language": "中文"}

# 7. 使用 invoke 执行整个链
output = runnable_chain.invoke(input_data)

# 8. 打印输出结果
print(output)
```

## 五、理解 `partial_variables`

`partial_variables` 在 Langchain 的 `PromptTemplate` 中是一个非常有用的特性，它允许你 **预先填充 (partially fill)** Prompt 模板中的 **一部分变量**，而将 **另一部分变量** 留到 **后续使用时再动态填充**。

**关键点：**

*   **Partial (部分的):** 只填充 *一部分* 变量。
*   **Variables (变量):** Prompt 模板中用花括号 `{}` 包裹的占位符。
*   **Pre-set (预设的):**  `partial_variables` 的值在 **创建 `PromptTemplate` 对象时就被设定好**。

**作用和用途：**

1. **固定 Prompt 模板的一部分内容。**
2. **简化 Prompt 模板的输入。**
3. **注入上下文信息或指令。**

**示例解释:**

```python
prompt_template = PromptTemplate(
    template="请用 {language} 总结关于 {topic} 的内容，并提取关键词。\n{format_instructions}\n",
    input_variables=["language", "topic"], # 声明了需要动态填充的变量
    partial_variables={"format_instructions": output_parser.get_format_instructions()} # 预先填充 format_instructions
)
```

在这个例子中，`format_instructions` 已经被预先设定，你只需要在 `format()` 或 `invoke()` 时 **提供 `language` 和 `topic` 的值** 即可。

## 六、Agent 和 AgentExecutor 详解

### 1. Agent vs. AgentExecutor

*   **Agent (代理): 决策者和规划者 (The Brain)**
    *   **核心职责:** **决定下一步应该做什么**。
    *   **思考过程:** Agent 内部通常包含一个 **Prompt (提示词)** 和一个 **LLM (语言模型)**。
    *   **输出:** **行动计划 (Action Plan)** 或 **下一步的指令**。
    *   **比喻:**  `Agent` 就像一个 **架构师** 或 **项目经理**。

*   **AgentExecutor (代理执行器): 执行者和协调者 (The Body)**
    *   **核心职责:** **执行 Agent 制定的行动计划** 并 **协调整个 Agent 的运行流程**。
    *   **执行流程:** `AgentExecutor` 的执行流程通常是一个 **循环 (Loop)**。
    *   **状态管理:** `AgentExecutor` 通常还负责 **管理 Agent 的运行状态**。
    *   **比喻:** `AgentExecutor` 就像一个 **施工队** 或 **执行团队**。

**关键区别总结:**

| 特性             | Agent (代理)                                      | AgentExecutor (代理执行器)                                  |
| ---------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **角色**         | **决策者、规划者 (The Brain)**                    | **执行者、协调者 (The Body)**                               |
| **核心职责**     | **决定下一步做什么 (What to do next?)**           | **执行行动计划，协调流程 (How to execute the plan?)**       |
| **内部组件**     | Prompt (提示词) + LLM (语言模型)                  | Agent + Tools (工具) +  (可选) Memory (记忆) + 执行循环逻辑 |
| **输入**         | 用户输入、工具、有时记忆                          | Agent 的行动计划、工具、当前状态                            |
| **输出**         | 行动计划 (Action Plan) 或 最终答案 (Final Answer) | 最终答案 (Final Answer)                                     |
| **是否直接执行** | **否**，需要 `AgentExecutor` 来执行               | **是**，可以使用 `run` 或 `invoke` 方法直接执行             |

### 2. `create_react_agent` vs. `create_with_tools_agent`

这两个函数都是 Langchain 中用于 **创建 Agent 的辅助函数**，它们的主要区别在于它们 **创建的 Agent 类型** 和 **使用的 Prompt 策略** 不同：

*   **`create_react_agent`:**
    *   **创建类型:** **ReAct Agent** (implicitly)。
    *   **Prompt 策略:** **ReAct (Reasoning and Acting)**。
    *   **Prompt 定制:** 允许可选地传入自定义的 `prompt`，但应该遵循 ReAct 风格。
    *   **适用场景:** 快速创建一个基于 ReAct 策略的 Agent。

*   **`create_with_tools_agent`:**
    *   **创建类型:** **通用 Agent** (explicitly controlled by prompt)。
    *   **Prompt 策略:** **用户自定义 Prompt 策略**。
    *   **Prompt 定制:** 强制要求提供 `prompt` 参数，完全定义 Agent 的行为。
    *   **适用场景:** 需要对 Agent 的行为进行高度定制，或者尝试不同的 Prompt 策略。

**关键区别总结:**

| 特性                  | `create_react_agent`                                   | `create_with_tools_agent`                                    |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| **Agent 类型**        | **ReAct Agent** (隐式创建)                             | **通用 Agent** (Prompt 完全控制)                             |
| **Prompt 策略**       | **ReAct 策略** (默认或自定义 ReAct 风格 Prompt)        | **用户自定义 Prompt 策略** (可以是任何风格)                  |
| **Prompt 定制程度**   | **较低**，主要使用预定义的 ReAct Prompt，可微调        | **较高**，完全由用户提供 Prompt，灵活度高                    |
| **Prompt 参数**       | `prompt` 参数 **可选** (不提供则使用默认 ReAct Prompt) | `prompt` 参数 **必选** (用户必须提供 Prompt)                 |
| **使用场景**          | **快速创建 ReAct Agent，简化 ReAct Agent 构建**        | **高度定制 Agent 行为，尝试不同 Prompt 策略，非 ReAct Agent** |
| **上手难度 (Prompt)** | **较低**，ReAct Prompt 结构相对固定，易于理解和使用    | **较高**，需要用户自行设计 Prompt 策略，Prompt 工程难度较高  |

### 3. Agent 中 `tools` 和 AgentExecutor 中 `tools` 的区别

*   **`Agent` 中的 `tools`:**  让 `Agent` 知道有哪些工具可以使用，以及每个工具的功能和描述。Agent 实际上并不 *直接* 执行 `tools`，它只是 *思考* 和 *计划* 如何使用 `tools`。
*   **`AgentExecutor` 中的 `tools`:** 让 `AgentExecutor` 拥有 *实际可执行的工具对象*。`AgentExecutor` 负责 *执行* `Agent` 输出的 Action (行动)。

**总结来说，`tools` 传递两次，但目的是不同的：**

*   **第一次传给 `Agent`：** 为了让 `Agent` **了解工具信息，用于思考和决策 (Planning & Reasoning)**。传递的是工具的 *描述性信息*。
*   **第二次传给 `AgentExecutor`：** 为了让 `AgentExecutor` **拥有可执行的工具实例，用于实际执行 Agent 的行动计划 (Execution)**。传递的是工具的 *可执行对象*。

### 4. AgentExecutor 的创建方法

除了 `AgentExecutor.from_agent_and_tools`，还有以下几种创建方法：

*   **`AgentExecutor(...)` (直接使用构造函数):**  更底层和灵活，可以直接控制 `AgentExecutor` 的各个参数。
*   **`initialize_agent(...)` (更早版本的方法，逐渐被 `create_xxx_agent` + `from_agent_and_tools` 替代):**  一步创建 `Agent` 和 `AgentExecutor`，灵活性稍差，逐渐被替代。

**最佳实践建议:**

**对于新的 Langchain Agent 项目，强烈推荐使用 `create_xxx_agent` (例如 `create_react_agent`, `create_conversational_agent` 等) 创建 `Agent`，然后使用 `AgentExecutor.from_agent_and_tools(agent=agent, tools=tools, ...)` 创建 `AgentExecutor` 的方式。**

### 5. Agent 和 LLM 的分离

将 `Agent` 和 `LLM` 分开设计带来了 **模块化、灵活性、可配置性、概念清晰** 等多方面的优势。这种分离使得 Langchain 能够更好地利用 LLM 的强大能力，构建出更强大、更灵活、更易于维护的 Agent 应用。

### 6. `AgentExecutor.from_agent_and_tools` 不接受 `llm` 参数

这是因为 `Agent` 对象在创建时就已经被赋予了 `llm`，`AgentExecutor` 通过 `agent` 参数间接获得了所需的 `llm`，无需再次传入。这种参数设计体现了 Langchain Agent 架构的职责分离和模块化原则。

## 七、Memory vs. StateGraph

| 特性              | Langchain `Memory`                                           | LangGraph `StateGraph` / `AgentState`                        |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **核心目的**      | **管理对话历史 (Conversational History)**，主要用于记住对话上下文，使 Chain 或 Agent 具有对话记忆能力。 | **管理更广泛的应用状态 (Application State)**，不仅限于对话历史，可以跟踪任何需要在图执行过程中维护和传递的数据。 |
| **状态类型**      | 主要关注 **消息 (Messages)** 序列，通常是对话的 `HumanMessage` 和 `AIMessage`。 | **自定义的状态类 `AgentState`**，可以包含任何类型的数据，例如消息历史、工具输出、中间结果、用户偏好、计数器等。 |
| **作用范围**      | 主要作用于 **Chain 或 AgentExecutor 级别**，为单个 Chain 或 Agent 提供记忆能力。 | 作用于 **整个 LangGraph 图级别**，状态在图中的各个节点之间传递和更新，影响整个图的执行流程。 |
| **数据结构**      | 通常使用 **列表 (List)** 来存储消息历史，例如 `ConversationBufferMemory` 使用消息列表。 | 使用 **自定义的 `AgentState` 类**，其内部数据结构可以根据需求灵活定义，例如可以使用字典、列表、对象属性等。 |
| **灵活性/定制性** | 相对 **较低**，主要关注对话历史管理，提供的 Memory 类型和配置选项相对有限。 | 相对 **较高**，`AgentState` 是完全自定义的，可以根据应用需求设计任何复杂的状态结构和管理逻辑。 |
| **复杂性**        | 相对 **简单**，易于上手和使用，配置和集成比较直接。          | 相对 **复杂**，需要理解图的概念、状态类定义、节点间状态传递等，学习曲线稍高。 |
| **适用场景**      | **对话型应用 (Chatbots, Conversational Agents)**，需要记住对话上下文以实现连贯对话。 | **复杂状态化应用 (Complex Agents, Multi-step Workflows, Decision Processes)**，需要跟踪和管理多维度的状态信息，并基于状态控制流程。 |
| **与流程控制**    | 主要影响 Chain 或 Agent 的输入，间接影响流程，但本身不直接控制流程。 | **直接控制图的执行流程**，状态变化可以决定图的下一步走向 (通过条件边等)，是图流程控制的核心组成部分。 |

**如何选择:**

*   如果你的应用是简单的对话型应用，只需要基本的对话记忆功能，并且希望快速上手，那么 Langchain `Memory` 通常是更合适的选择。
*   如果你的应用是复杂的 Agent 或工作流程，需要管理多维度的状态信息，并需要基于状态进行流程控制，那么 LangGraph `StateGraph` / `AgentState` 是更强大的选择。

## 八、Agent 嵌套

Agent 中可以嵌套 Agent，实现的核心思路是： **将一个 Agent 封装成一个 Langchain Tool，然后让另一个 Agent 可以使用这个 Tool**。

**代码示例 (概念性示例):**

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor, Tool
from langchain.prompts import PromptTemplate

# 1. 创建内层 Agent (Inner Agent) - 假设是一个简单的总结 Agent
inner_llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.0)
inner_prompt_template = PromptTemplate.from_template("请总结以下内容：{text}")
inner_agent = create_react_agent(llm=inner_llm, tools=[], prompt=inner_prompt_template) # Inner Agent 没有 tools
inner_agent_executor = AgentExecutor.from_agent_and_tools(agent=inner_agent, tools=[], verbose=False)

# 2. 创建 Agent Tool - 封装内层 Agent
class SummaryAgentTool(Tool):
    name = "SummaryAgent"
    description = "用于总结文本内容的 Agent. 输入应该是要总结的文本。"

    def _run(self, text: str) -> str:
        """使用 Summary Agent
