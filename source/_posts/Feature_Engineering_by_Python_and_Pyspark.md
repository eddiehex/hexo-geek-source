---
title: Feature Engineering by Python and Pyspark
date: 2025-01-24
categories:
  - ML
tags: [Python,PySpark]
toc: true
excerpt: "特征工程操作及python和pyspark实现"
---

特征工程是机器学习流程中至关重要的环节，直接影响模型性能。以下是详细的步骤说明及对应的Python/PySpark实现代码：

---

### **一、数据理解与探索**
#### 1. 数据概览
```python
# Python (Pandas)
import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())        # 查看前5行
print(df.info())        # 数据类型和缺失值统计
print(df.describe())    # 数值型特征统计分布

# PySpark
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()
df = spark.read.csv('data.csv', header=True, inferSchema=True)
df.printSchema()        # 查看数据模式
df.show(5)              # 显示前5行
df.describe().show()    # 统计分布
```

#### 2. 可视化分析
```python
# Python (Matplotlib/Seaborn)
import matplotlib.pyplot as plt
import seaborn as sns

# 数值型特征分布
sns.histplot(df['age'], kde=True)
plt.show()

# 类别型特征分布
sns.countplot(x='gender', data=df)
plt.show()

# 相关性矩阵
corr_matrix = df.corr()
sns.heatmap(corr_matrix, annot=True)
plt.show()
```

---

### **二、数据清洗**
#### 1. 处理缺失值
```python
# Python (Pandas)
# 删除缺失值
df.dropna(subset=['age'], inplace=True)

# 填充缺失值（均值/众数）
df['income'].fillna(df['income'].mean(), inplace=True)
df['gender'].fillna(df['gender'].mode()[0], inplace=True)

# PySpark
from pyspark.sql.functions import mean, col

# 计算均值
mean_income = df.select(mean(col('income'))).collect()[0][0]
df = df.na.fill({'income': mean_income})

# 删除缺失值
df = df.na.drop(subset=['age'])
```

#### 2. 处理异常值
```python
# Python (Pandas)
# Z-Score方法
from scipy import stats
z_scores = stats.zscore(df['income'])
df = df[(z_scores < 3) & (z_scores > -3)]

# IQR方法
Q1 = df['age'].quantile(0.25)
Q3 = df['age'].quantile(0.75)
IQR = Q3 - Q1
df = df[~((df['age'] < (Q1 - 1.5*IQR)) | (df['age'] > (Q3 + 1.5*IQR)))]

# PySpark
from pyspark.sql.functions import avg, stddev

# 计算统计量
stats = df.select(avg('age'), stddev('age')).collect()
mean_age = stats[0][0]
std_age = stats[0][1]
df = df.filter((col('age') > mean_age - 3*std_age) & (col('age') < mean_age + 3*std_age))
```

---

### **三、特征构建**
#### 1. 数值型特征处理
```python
# Python (Pandas)
# 分箱（离散化）
df['age_bin'] = pd.cut(df['age'], bins=[0, 18, 35, 60, 100], labels=['child', 'youth', 'adult', 'senior'])

# 多项式特征
from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(degree=2, interaction_only=True)
poly_features = poly.fit_transform(df[['age', 'income']])

# PySpark
from pyspark.ml.feature import Bucketizer

# 分箱
bucketizer = Bucketizer(splits=[0, 18, 35, 60, 100], inputCol='age', outputCol='age_bin')
df = bucketizer.transform(df)
```

#### 2. 类别型特征编码
```python
# Python (Pandas)
# One-Hot Encoding
df = pd.get_dummies(df, columns=['gender'])

# Label Encoding
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['city'] = le.fit_transform(df['city'])

# PySpark
from pyspark.ml.feature import StringIndexer, OneHotEncoder

# StringIndexer
indexer = StringIndexer(inputCol='gender', outputCol='gender_index')
df = indexer.fit(df).transform(df)

# OneHotEncoder
encoder = OneHotEncoder(inputCol='gender_index', outputCol='gender_vec')
df = encoder.fit(df).transform(df)
```

#### 3. 时间序列特征
```python
# Python (Pandas)
df['date'] = pd.to_datetime(df['date'])
df['year'] = df['date'].dt.year
df['day_of_week'] = df['date'].dt.dayofweek

# 滑动窗口统计
df['7d_avg'] = df['sales'].rolling(window=7).mean()

# PySpark
from pyspark.sql.functions import year, dayofweek, window

df = df.withColumn('year', year('date'))
df = df.withColumn('day_of_week', dayofweek('date'))

# 窗口函数
from pyspark.sql.window import Window
window_spec = Window.orderBy('date').rowsBetween(-6, 0)
df = df.withColumn('7d_avg', avg('sales').over(window_spec))
```

---

### **四、特征变换**
#### 1. 标准化/归一化
```python
# Python (Scikit-Learn)
from sklearn.preprocessing import StandardScaler, MinMaxScaler

scaler = StandardScaler()
df['income_scaled'] = scaler.fit_transform(df[['income']])

minmax = MinMaxScaler()
df['age_normalized'] = minmax.fit_transform(df[['age']])

# PySpark
from pyspark.ml.feature import StandardScaler, MinMaxScaler
from pyspark.ml import Pipeline

scaler = StandardScaler(inputCol='income', outputCol='income_scaled')
pipeline = Pipeline(stages=[scaler])
df = pipeline.fit(df).transform(df)
```

#### 2. 非线性变换
```python
# Python (Pandas)
import numpy as np

df['log_income'] = np.log1p(df['income'])
df['sqrt_age'] = np.sqrt(df['age'])

# PySpark
from pyspark.sql.functions import log1p, sqrt

df = df.withColumn('log_income', log1p('income'))
df = df.withColumn('sqrt_age', sqrt('age'))
```

---

### **五、特征选择**
#### 1. 过滤法
```python
# Python (Scikit-Learn)
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif

# 低方差过滤
selector = VarianceThreshold(threshold=0.1)
df_selected = selector.fit_transform(df)

# 基于统计检验
selector = SelectKBest(f_classif, k=10)
X_new = selector.fit_transform(X, y)

# PySpark
from pyspark.ml.feature import ChiSqSelector

selector = ChiSqSelector(numTopFeatures=10, featuresCol='features', outputCol='selected', labelCol='label')
model = selector.fit(df)
df = model.transform(df)
```

#### 2. 包裹法（递归特征消除）
```python
# Python (Scikit-Learn)
from sklearn.feature_selection import RFE
from sklearn.linear_model import LogisticRegression

rfe = RFE(estimator=LogisticRegression(), n_features_to_select=5)
X_rfe = rfe.fit_transform(X, y)
```

#### 3. 嵌入法（基于模型）
```python
# Python (Scikit-Learn)
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
model.fit(X, y)
importances = model.feature_importances_
```

---

### **六、特征降维**
#### 1. PCA
```python
# Python (Scikit-Learn)
from sklearn.decomposition import PCA

pca = PCA(n_components=0.95)  # 保留95%方差
X_pca = pca.fit_transform(X)

# PySpark
from pyspark.ml.feature import PCA

pca = PCA(k=3, inputCol='features', outputCol='pca_features')
model = pca.fit(df)
df = model.transform(df)
```

#### 2. t-SNE
```python
# Python (Scikit-Learn)
from sklearn.manifold import TSNE

tsne = TSNE(n_components=2)
X_tsne = tsne.fit_transform(X)
```

---

### **七、特征存储**
#### 保存处理后的数据
```python
# Python (Pandas)
df.to_parquet('processed_data.parquet')

# PySpark
df.write.parquet('hdfs://path/to/processed_data')
```

---

### **八、高级技巧**
#### 1. 自动化特征工程
```python
# 使用FeatureTools
import featuretools as ft

es = ft.EntitySet(id='data')
es = es.entity_from_dataframe(entity_id='main', dataframe=df, index='id')

# 自动生成特征
feature_matrix, features = ft.dfs(entityset=es, target_entity='main', max_depth=2)
```

#### 2. 处理高基数类别特征
```python
# 目标编码（Target Encoding）
from category_encoders import TargetEncoder

encoder = TargetEncoder()
df['city_encoded'] = encoder.fit_transform(df['city'], y)

# PySpark实现需手动编码
from pyspark.sql.functions import mean

target_mean = df.groupBy('city').agg(mean('label').alias('city_target_encoded'))
df = df.join(target_mean, on='city', how='left')
```

---

### **总结**
特征工程需要结合具体业务场景灵活调整，核心原则包括：
1. 充分理解数据分布和业务含义
2. 优先处理数据质量问题（缺失值、异常值）
3. 通过特征交叉、变换挖掘隐藏信息
4. 使用自动化工具加速实验过程
5. 持续监控特征在生产环境的表现

建议将特征工程代码封装为可复用的Pipeline，便于后续维护和自动化部署。
