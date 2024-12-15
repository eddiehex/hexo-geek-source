---
title: Sql for Median
date: 2024-12-13
categories:
  - SQL
tags: [medain]
toc: false
excerpt: "Use SQL to calculate median"
---

在 SQL 中求中位数稍微比求平均数复杂一些，因为中位数需要找到排序后中间的那个值（或者中间两个值的平均值）。不同的数据库系统提供了不同的方法来实现，这里我将介绍几种常用的方法，并针对不同的数据库给出示例。

**核心思想：**

1. **排序:** 首先需要对数据进行排序。
2. **确定中位数位置:**
   - 如果数据量是奇数，中位数就是中间的那个值。
   - 如果数据量是偶数，中位数是中间两个值的平均值。

**方法和示例：**

**1. 使用窗口函数 (适用于 SQL Server, PostgreSQL, Oracle, MySQL 8+):**

   窗口函数可以方便地计算排序后的行号，然后根据行号来确定中位数。

   ```sql
   -- 假设表名为 `your_table`，需要求中位数的列名为 `your_column`
   WITH RankedData AS (
       SELECT 
           your_column,
           ROW_NUMBER() OVER (ORDER BY your_column) AS rn,
           COUNT(*) OVER () AS total_count
       FROM your_table
   )
   SELECT
       CASE
           WHEN total_count % 2 = 0 THEN  -- 偶数个数据
               (SELECT AVG(your_column) FROM RankedData WHERE rn IN (total_count/2, total_count/2 + 1))
           ELSE  -- 奇数个数据
               (SELECT your_column FROM RankedData WHERE rn = (total_count + 1)/2)
       END AS median
   FROM RankedData
   LIMIT 1;
   ```

   **解释:**

   - `ROW_NUMBER() OVER (ORDER BY your_column)`: 为每一行按照 `your_column` 的值排序并生成行号。
   - `COUNT(*) OVER ()`: 计算总共有多少行数据。
   - `CASE WHEN ... THEN ... ELSE ... END`: 根据数据总量是奇数还是偶数来选择不同的计算方式。
   - 偶数时，取中间两个行号的数值并计算平均值。
   - 奇数时，取中间行号的数值。
   - `LIMIT 1`: 因为所有行计算出的中位数是一样的，所以只需要返回一行。

**2. 使用子查询和变量 (适用于 MySQL 5.x - 7.x, MariaDB):**

   早期的 MySQL 版本没有窗口函数，需要使用变量来实现排序和行号计算。

   ```sql
   SET @row_number = 0;
   SET @total_count = (SELECT COUNT(*) FROM your_table);

   SELECT 
       CASE
           WHEN @total_count % 2 = 0 THEN  -- 偶数个数据
               (SELECT AVG(your_column) 
                FROM (SELECT @row_number := @row_number + 1 AS rn, your_column
                      FROM your_table
                      ORDER BY your_column) AS t
                WHERE t.rn IN (@total_count/2, @total_count/2 + 1))
           ELSE -- 奇数个数据
               (SELECT your_column
                FROM (SELECT @row_number := @row_number + 1 AS rn, your_column
                      FROM your_table
                      ORDER BY your_column) AS t
                WHERE t.rn = (@total_count + 1)/2)
       END AS median;
   ```

   **解释:**

   - `@row_number` 和 `@total_count`: 定义变量来存储行号和总行数。
   - `SELECT @row_number := @row_number + 1 AS rn`: 在子查询中计算行号。
   - 其余部分逻辑与使用窗口函数的版本类似。

**3. 使用 `PERCENTILE_CONT` 或 `PERCENTILE_DISC` (适用于 PostgreSQL, Oracle):**

   这些函数可以直接计算指定百分位数的值，中位数就是 50% 百分位数。

   ```sql
   -- 使用 PERCENTILE_CONT (连续百分位数，结果可能是小数)
   SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY your_column) AS median
   FROM your_table;

   -- 使用 PERCENTILE_DISC (离散百分位数，结果是实际数据中的值)
   SELECT PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY your_column) AS median
   FROM your_table;
   ```

   **解释:**

   - `PERCENTILE_CONT(0.5)`: 返回一个连续的 50% 百分位数，如果结果落在两个值之间，它会进行插值计算。
   - `PERCENTILE_DISC(0.5)`: 返回一个离散的 50% 百分位数，它会返回排序后实际存在的值。

**选择哪种方法？**

- **推荐使用窗口函数:** 简单易懂，性能通常也比较好，适用于支持窗口函数的数据库。
- **MySQL 5.x - 7.x 和 MariaDB 用户:** 只能使用变量和子查询的方式。
- **如果数据库支持 `PERCENTILE_CONT` 或 `PERCENTILE_DISC`:**  使用这些函数是最简洁的方法。

**注意事项:**

- **性能:**  对于大型数据集，排序操作可能会比较耗时，需要根据实际情况进行优化。
- **空值:**  需要考虑空值 (`NULL`) 的处理，通常在排序时会将其放在最前或最后，可以根据需求调整。
- **数据类型:** 确保需要求中位数的列是数值类型。

**总结：**

SQL 中求中位数有多种方法，选择哪种取决于你使用的数据库系统以及你的偏好。理解核心思想（排序和确定中位数位置）是关键。希望这些示例和解释能帮助你开始在 SQL 中求中位数。记得根据你使用的具体数据库系统选择相应的方法。
