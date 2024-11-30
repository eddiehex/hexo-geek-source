---
title: python学习记录
date: 2023-11-30
categories: 
  - Python
tags: [python]
toc: true
excerpt: "Python 常用处理操作."
---
## 1

1. 数据创建和读取
2. 数据查看和选择
3. 数据清洗和处理
4. 数据统计和聚合
5. 数据合并和重塑

```python 
import pandas as pd
import numpy as np

# 1. 创建数据
df = pd.DataFrame({
    '姓名': ['张三', '李四', '王五', '赵六'],
    '年龄': [25, 30, 35, 40],
    '城市': ['北京', '上海', '广州', '深圳'],
    '工资': [10000, 20000, 15000, 25000]
})

# 2. 基础查看方法
df.head()        # 查看前几行
df.shape        # 查看维度
df.info()       # 查看基本信息
df.describe()   # 统计描述

# 3. 数据选择
df['姓名']                  # 选择单列
df[['姓名', '年龄']]        # 选择多列
df.loc[0]                  # 按标签选择行
df.iloc[0:2]              # 按位置选择行
df.loc[df['年龄'] > 30]     # 条件筛选

# 4. 数据处理
df['工资'].fillna(0)        # 填充空值
df.drop_duplicates()      # 删除重复行
df['工资等级'] = df['工资'].apply(lambda x: '高' if x > 20000 else '低')  # 添加新列

# 5. 统计聚合
df.groupby('城市')['工资'].mean()    # 分组计算平均值
df.sort_values('工资', ascending=False)  # 排序
df['工资'].value_counts()           # 计数统计

# 6. 数据合并
df2 = pd.DataFrame({
    '城市': ['北京', '上海', '广州', '深圳'],
    '人口': [2100, 2400, 1600, 1700]
})
pd.merge(df, df2, on='城市')        # 合并数据框

# 7. 数据重塑
df.pivot_table(                    # 透视表
    values='工资',
    index='城市',
    aggfunc='mean'
)
```

## 2

1. 创建含缺失值的示例数据
2. 展示isnull/isna检测方法
3. 展示dropna删除方法
4. 展示drop删除行列方法

```python
import pandas as pd
import numpy as np

# 创建带有缺失值的数据框
df = pd.DataFrame({
    '姓名': ['张三', '李四', np.nan, '赵六'],
    '年龄': [25, np.nan, 35, 40],
    '城市': ['北京', '上海', None, '深圳'],
    '工资': [10000, 20000, np.nan, 25000]
})

# 1. isnull()/isna() - 检测缺失值
print("检查缺失值:")
print(df.isnull())  # 返回布尔矩阵
print("\n缺失值统计:")
print(df.isnull().sum())  # 每列缺失值计数

# 2. dropna() - 删除缺失值
# 删除任何含有缺失值的行
print("\n删除所有含缺失值的行:")
print(df.dropna())

# 删除全部为缺失值的行
print("\n删除全部为缺失值的行:")
print(df.dropna(how='all'))

# 仅当特定列有缺失值时删除
print("\n仅当年龄列缺失时删除:")
print(df.dropna(subset=['年龄']))

# 3. drop() - 删除指定行或列
# 删除指定列
print("\n删除'工资'列:")
print(df.drop(columns=['工资']))

# 删除指定行（基于索引）
print("\n删除第0行:")
print(df.drop(index=0))

# 删除多个列
print("\n删除多个列:")
print(df.drop(columns=['工资', '城市']))
```

**检测缺失值:**

- `isnull()`/`isna()`: 检测每个元素是否为缺失值
- `isnull().sum()`: 统计每列缺失值数量

**dropna()参数:**

- `axis=0/1`: 0删除行，1删除列
- `how='any'/'all'`: any-任何缺失值都删除，all-全部缺失才删除
- `subset=[列名]`: 仅检查指定列的缺失值
- `thresh=n`: 至少有n个非空值才保留

**drop()参数:**

- `labels`: 要删除的行标签或列名
- `axis=0/1`: 0删除行，1删除列
- `index`: 要删除的行索引
- `columns`: 要删除的列名
- `inplace=True/False`: 是否修改原数据

## 3

1. 数据转换方法
2. 索引操作
3. 时间序列处理
4. 字符串处理

```python
import pandas as pd
import numpy as np

# 创建示例数据
df = pd.DataFrame({
    '日期': pd.date_range('2024-01-01', periods=4),
    '产品': ['A产品', 'B产品', 'A产品', 'B产品'],
    '数量': [100, 200, 150, 250],
    '价格': [10.5, 20.5, 15.5, 25.5],
    '描述': ['好评-优秀', '好评-良好', '差评-一般', '好评-优秀']
})

# 1. 数据转换
# astype() - 类型转换
df['数量'] = df['数量'].astype('float64')

# reset_index() - 重置索引
df_reset = df.reset_index(drop=True)

# set_index() - 设置索引
df_indexed = df.set_index('日期')

# 2. 字符串操作 (str)
# 分割字符串
df['评价类型'] = df['描述'].str.split('-').str[0]
df['评价等级'] = df['描述'].str.split('-').str[1]

# 包含判断
mask = df['描述'].str.contains('好评')
print("好评数据：\n", df[mask])

# 3. 时间序列操作 (dt)
# 提取日期组件
df['年份'] = df['日期'].dt.year
df['月份'] = df['日期'].dt.month
df['星期'] = df['日期'].dt.day_name()

# 4. 数据计算
# 算术运算
df['总价'] = df['数量'] * df['价格']

# 累计统计
df['累计数量'] = df['数量'].cumsum()

# 5. 数据替换
# replace() - 值替换
df['产品'] = df['产品'].replace({'A产品': 'A', 'B产品': 'B'})

# 6. 数据排序
# sort_values() - 多列排序
df_sorted = df.sort_values(['产品', '数量'], ascending=[True, False])

# 7. 数据采样
# sample() - 随机采样
df_sample = df.sample(n=2)  # 随机抽取2行

# 8. 数据统计
print("\n基本统计：")
print(df.agg({
    '数量': ['sum', 'mean', 'max', 'min'],
    '价格': ['mean', 'std']
}))
```

**数据转换：**

- `astype()`: 类型转换
- `reset_index()`: 重置索引
- `set_index()`: 设置索引

**字符串操作：**

- `str.split()`: 分割字符串
- `str.contains()`: 包含判断
- `str.replace()`: 替换字符串

**时间序列：**

- `dt.year/month/day`: 提取日期组件
- `dt.day_name()`: 获取星期名称

**数据计算：**

- 直接算术运算
- `cumsum()/cumprod()`: 累计统计
- `agg()`: 聚合统计

**其他操作：**

- `replace()`: 值替换
- `sort_values()`: 排序
- `sample()`: 随机采样

## 4

1. 高级分组操作
2. 窗口函数
3. 数据重塑操作
4. 多索引处理

```python
import pandas as pd
import numpy as np

# 创建示例数据
df = pd.DataFrame({
    '部门': ['技术', '技术', '销售', '销售', '技术', '销售'],
    '日期': pd.date_range('2024-01-01', periods=6),
    '姓名': ['张三', '李四', '王五', '赵六', '张三', '王五'],
    '销售额': [1000, 2000, 3000, 4000, 1500, 3500],
    '成本': [800, 1500, 2000, 3000, 1200, 2500]
})

# 1. 高级分组操作
# transform - 广播计算结果
df['部门平均销售额'] = df.groupby('部门')['销售额'].transform('mean')

# agg - 多重聚合
result = df.groupby('部门').agg({
    '销售额': ['sum', 'mean', 'count'],
    '成本': ['sum', 'mean']
})

# 2. 窗口函数
# rolling - 滚动窗口
df['销售额_3日均值'] = df['销售额'].rolling(window=3).mean()

# expanding - 扩展窗口
df['销售额_累计均值'] = df['销售额'].expanding().mean()

# 3. 数据重塑
# pivot - 数据透视
pivot_table = df.pivot_table(
    values='销售额',
    index='部门',
    columns='姓名',
    aggfunc='sum',
    fill_value=0
)

# melt - 宽转长
melted_df = pivot_table.reset_index().melt(
    id_vars=['部门'],
    var_name='姓名',
    value_name='销售额'
)

# 4. 多索引操作
# 创建多索引DataFrame
multi_idx = pd.MultiIndex.from_product([
    ['技术', '销售'],
    ['一季度', '二季度']
], names=['部门', '季度'])

df_multi = pd.DataFrame(
    np.random.randn(4, 2),
    index=multi_idx,
    columns=['收入', '支出']
)

# 多索引选择
tech_data = df_multi.loc['技术']
q1_data = df_multi.xs('一季度', level='季度')

# 5. 高级计算
# pct_change - 计算环比变化
df['销售额环比'] = df['销售额'].pct_change()

# diff - 计算差值
df['销售额增量'] = df['销售额'].diff()

# shift - 数据移位
df['上期销售额'] = df['销售额'].shift(1)
```

**高级分组：**

- `transform()`: 广播聚合结果
- `agg()`: 多重聚合运算

**窗口函数：**

- `rolling()`: 滑动窗口计算
- `expanding()`: 扩展窗口计算

**数据重塑：**

- `pivot_table()`: 数据透视表
- `melt()`: 宽格式转长格式

**多索引操作：**

- `MultiIndex`: 创建多级索引
- `xs()`: 跨层级选择数据

**高级计算：**

- `pct_change()`: 计算变化百分比
- `diff()`: 计算差值
- `shift()`: 数据移位