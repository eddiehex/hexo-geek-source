---
title: Null_Value_in_SQL
date: 2024-12-13
categories:
  - SQL
tags: [sql]
toc: true
excerpt: "空值在SQL应用的中的注意事项总结"
---

在 SQL 中处理 `NULL` 值需要格外小心，因为 `NULL` 代表“未知”或“缺失”，它的行为与其他值不同，可能会导致意想不到的结果。以下是一些在 SQL 中处理 `NULL` 值时需要注意的关键事项：

**1. `NULL` 值与比较运算符：**

   - **`NULL` 与任何值的比较（包括 `NULL` 本身）都返回 `UNKNOWN`，而不是 `TRUE` 或 `FALSE`。**
   - 这意味着：
      - `NULL = NULL`  返回 `UNKNOWN`
      - `NULL <> NULL` 返回 `UNKNOWN`
      - `NULL > 10`  返回 `UNKNOWN`
      - `NULL < 10`  返回 `UNKNOWN`
      - `NULL = 'abc'` 返回 `UNKNOWN`
   - 因此，**不能使用 `=` 或 `<>` 来直接判断一个值是否为 `NULL`。**

**2. `IS NULL` 和 `IS NOT NULL` 操作符：**

   - **使用 `IS NULL` 来判断一个值是否为 `NULL`：**
      ```sql
      SELECT * FROM your_table WHERE your_column IS NULL;
      ```
   - **使用 `IS NOT NULL` 来判断一个值是否不为 `NULL`：**
      ```sql
      SELECT * FROM your_table WHERE your_column IS NOT NULL;
      ```

**3. `NULL` 值在聚合函数中的行为：**

   - **大多数聚合函数（如 `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`）都会忽略 `NULL` 值。**
   - **`COUNT(*)` 会计算所有行数，包括包含 `NULL` 值的行，而 `COUNT(column_name)` 只计算非 `NULL` 值的行。**
   - 例如：
     - `SUM(your_column)` 只会对 `your_column` 中非 `NULL` 的值求和。
     - `AVG(your_column)` 只会对 `your_column` 中非 `NULL` 的值求平均值。
   - **如果 `MAX` 或 `MIN` 的所有值都是 `NULL`，则结果也是 `NULL`。**
   - **`COUNT(DISTINCT column_name)` 不会统计 `NULL` 值。**

**4. `NULL` 值在 `WHERE` 子句中的影响：**

   - **`WHERE` 子句的条件必须返回 `TRUE` 才能选择对应的行。由于 `NULL` 与比较运算符的结果为 `UNKNOWN`，因此 `WHERE` 条件中包含 `NULL` 的表达式通常不会返回 `TRUE`，导致对应的行被过滤掉。**
   - 例如：
      ```sql
      -- 假设 your_column 中存在 NULL 值
      SELECT * FROM your_table WHERE your_column = 10;  -- 不会选择 your_column 为 NULL 的行
      SELECT * FROM your_table WHERE your_column <> 10; -- 同样不会选择 your_column 为 NULL 的行
      SELECT * FROM your_table WHERE your_column = NULL; -- 不会选择任何行
      ```
   - **要选择 `NULL` 值的行，必须使用 `IS NULL`。**

**5. `COALESCE` 和 `IFNULL` 函数：**

   - **`COALESCE(value1, value2, value3, ...)`：返回第一个非 `NULL` 值。**
   - **`IFNULL(value1, value2)` (MySQL, MariaDB): 如果 `value1` 为 `NULL`，则返回 `value2`，否则返回 `value1`。**
   - 这两个函数可以用来替换 `NULL` 值，例如：
      ```sql
      SELECT COALESCE(your_column, 0) AS column_with_default FROM your_table; -- 将 NULL 替换为 0
      SELECT IFNULL(your_column, 'N/A') AS column_with_na FROM your_table; -- 将 NULL 替换为 'N/A'
      ```
   - **`COALESCE` 更通用，因为它接受多个参数。**

**6. `NULL` 值在连接操作中的影响：**

   - **`JOIN` 操作默认情况下会排除连接列中包含 `NULL` 值的行。**
   - **可以使用 `LEFT JOIN`, `RIGHT JOIN` 或 `FULL OUTER JOIN` 来包含 `NULL` 值相关的行。**
   - 例如，如果两个表连接的列中存在 `NULL` 值，`INNER JOIN` 将会排除这些行，而 `LEFT JOIN` 会保留左表的行，右表不匹配的行则填充为 `NULL`。

**7. 数据库特定的 `NULL` 值处理：**

   - 不同的数据库系统可能在某些细节上对 `NULL` 值的处理有所不同，请参考具体的数据库文档。

**8. 设计数据库时对 `NULL` 值的考虑：**

   - **应该仔细考虑哪些列允许 `NULL` 值，哪些列必须有值。**
   - **尽量避免在关键列中使用 `NULL` 值，因为这可能会导致数据不一致和查询问题。**
   - **可以使用约束 (constraints) 来强制某些列不允许 `NULL` 值。**
   - **在文档中明确说明哪些列可能包含 `NULL` 值，以及 `NULL` 值在业务逻辑中的含义。**

**总结：**

- `NULL` 值在 SQL 中是一种特殊的值，代表未知或缺失。
- 不能使用 `=` 或 `<>` 直接与 `NULL` 值进行比较，应使用 `IS NULL` 或 `IS NOT NULL`。
- 大多数聚合函数会忽略 `NULL` 值。
- `WHERE` 子句中包含 `NULL` 值的表达式通常不会返回 `TRUE`。
- 可以使用 `COALESCE` 或 `IFNULL` 函数来处理 `NULL` 值。
- 在设计数据库时，需要仔细考虑 `NULL` 值的用法。

理解 `NULL` 值的行为并正确处理它们对于编写可靠的 SQL 查询至关重要。
