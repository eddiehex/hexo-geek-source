---
title: Machine Leaning (XGBoost)
date: 2025-01-23
categories:
  - ML
tags: [xgboost]
toc: true
excerpt: "XGboost 的原理和计算总结"
---

## XGBoost

XGBoost（Extreme Gradient Boosting）是一个高效的、可扩展的树模型实现，广泛用于结构化数据（表格数据）场景的机器学习任务，如分类和回归问题。它以其高性能、灵活性和优化的实现赢得了广泛使用，尤其是在Kaggle竞赛和工业应用中。

### 1. 什么是XGBoost？
XGBoost是基于梯度提升（Gradient Boosting）算法优化后的提升树（Boosted Trees）模型。梯度提升是一种集成学习方法，它通过将多个弱学习器（比如决策树）串联起来，从而构建出一个强学习器。XGBoost对梯度提升进行了许多工程化、数学优化和高效实现，使其具有以下特点：
- **更高效的计算**：通过增量式的优化，充分利用多线程和存储资源。
- **正则化**：引入了L1和L2正则化，增加了控制过拟合的能力。
- **处理缺失值**：自动处理缺失值，使其适用于更复杂的数据场景。
- **可并行计算**：支持分布式计算，适合大规模数据集。
- **灵活性强**：可用于分类、回归、排序（Ranking）等任务。

---

### 2. 核心思路
XGBoost基于梯度提升树（Gradient Boosting Decision Trees, GBDT），而梯度提升树的主要思想是通过迭代地优化一个损失函数，逐步构建出一组弱学习器（通常是决策树），每一棵树用于修正上一棵树的残差（预测误差）。XGBoost在此基础上进行了一系列增强：

1. **加速计算**：通过内存感知的块存储结构、高效分裂点查找、支持多线程等手段，提升训练速度。
2. **自定义损失函数**：可使用一阶梯度（原始梯度）和二阶梯度（Hessian矩阵）来优化目标函数，提高拟合准确性。
3. **正则化**：在目标函数中加入正则化项，从而控制模型复杂度。
4. **独特的分裂节点优化**：优先选择总增益最大的分裂点，同时适配加权数据。
5. **处理稀疏数据**：通过启发式的算法处理缺失值，同时支持稀疏输入矩阵。

---

### 3. 数学公式

#### (1) 模型目标函数
XGBoost的核心在于最小化目标函数 \( \mathcal{L} \)，包括损失函数和正则化项：
$$
\mathcal{L} = \sum_{i=1}^n l(y_i, \hat{y}_i) + \sum_{k=1}^K \Omega(f_k)
$$

- $l(y_i, \hat{y}_i)$ ：损失函数，用于衡量预测值与真实值之间的差距。
-  $\Omega(f_k)$ ：正则化项，用于控制树的复杂度。
  $$
  \Omega(f_k) = \gamma T + \frac{1}{2} \lambda \| w \|^2
  $$
  
  - \( $T$ \)：树的叶节点数量。
  - \( $w$ \)：叶节点的权重。
  - \( $\gamma, \lambda$ \)：正则化系数，控制树的复杂度。

#### (2) 二阶近似优化
XGBoost使用泰勒展开公式，对损失函数在当前模型处取二阶展开，从而更高效地找到最优分裂点：
$$
\mathcal{L}^{(t)} \approx \sum_{i=1}^n \big[ g_i w_i + \frac{1}{2} h_i w_i^2 \big] + \Omega(f)
$$

- \( $g_i = \partial_{\hat{y}^{(t-1)}} l(y_i, \hat{y}^{(t-1)})$ \)：一阶梯度 （梯度下降的方向）。
- \( $h_i = \partial^2_{\hat{y}^{(t-1)}} l(y_i, \hat{y}^{(t-1)})$ \)：二阶梯度（梯度下降的变化率）。

#### (3) 分裂增益计算
伪装节点的分裂增益公式为：

$Gain=(分裂后损失的减少)=(左子树的损失 + 右子树的损失) - 分裂前的总损失$
$$
\text{Gain} = \frac{1}{2} \bigg[ \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L+G_R)^2}{H_L + H_R + \lambda} \bigg] - \gamma
$$

- \( G_L, G_R \)：左、右子节点的一阶梯度和。
- \( H_L, H_R \)：左、右子节点的二阶梯度和。
- \( $\lambda, \gamma$ \)：正则化参数。

​	**实际操作过程**：

​	遍历所有特征的所有可能分裂点。

​	在每个分裂点上计算分裂增益。

​	选择增益最大的分裂点作为最佳分裂点。

​	如果最大的增益 GainGain 小于 𝛾*γ*，则停止分裂。

#### (4) 叶子节点的权重计算

- XGBoost 为了计算各叶子节点的最终权重，使用以下公式：

  $$
  w_j = -\frac{\sum_{i \in j} g_i}{\sum_{i \in j} h_i + \lambda}
  $$

  - \($j$\)：表示某一个具体的叶子节点。
  - \($i \in j$\)：指代所有分配到节点 \(j\) 的样本索引。
  - \($g_i$\)：样本 \(i\) 对应的一阶梯度，代表模型的误差方向。
  - \($h_i$\)：样本 \(i\) 对应的二阶梯度，衡量误差的曲率。
  - \($\lambda$\)：L2 正则化参数，用于控制权重的大小，防止模型过拟合。

  这公式的含义是：通过优化一阶梯度（误差方向）的和，同时结合样本的二阶梯度（曲率），来决定当前叶子节点的最佳输出值。

---

### 4. XGBoost的优点

1. **速度快**：利用多核、多线程、增量式的计算方法，训练效率极高。
2. **性能优**：通过正则化和对目标函数的高级优化，能有效控制过拟合。
3. **灵活性高**：支持分类、回归、排序、特定的自定义目标函数。
4. **处理缺失值**：可**自动选择最优方向完成缺失值**填充。
5. **特征选择能力强**：通过树模型的结构，能够有效识别重要特征。
6. **支持分布式计算**：具备良好的扩展性，适用大规模数据集。

### 5. XGboost Summary

1. **Start with an initial prediction (e.g., mean or prior values):**
    Initialize the model predictions $𝑦^𝑖*y*^*i*$ with a base value, such as the average of the target variable in a regression task or the logarithmic odds in a classification task.
2. **Calculate residuals:**
    For each iteration, calculate the residuals or gradients that represent the model's errors with respect to the current predictions.
3. **Train a new tree to minimize residuals:**
    Fit a new decision tree using the residuals/gradients as the target variable. The tree learns how to correct the current errors in the prediction.
4. **Adjust leaf weights based on gradients and second-order gradients:**
    Once the structure of the tree is determined, calculate the weights for each leaf based on the gradients and second-order gradients for the samples falling into that leaf. The tree's predictions are scaled by the learning rate and added to the cumulative predictions.
5. **Update predictions iteratively:**
    Repeat steps 2–4 iteratively, so that each new tree gradually improves the model's overall prediction by correcting the previous residuals.

---

### 6. XGBoost的参数详解

XGBoost的参数分为三类：**通用参数**、**树参数**、**学习目标参数**。

#### (1) 通用参数
- `booster`：选择基础模型（默认值为`gbtree`），支持`gbtree`（树模型）、`gblinear`（线性模型）、`dart`（带Dropout的树模型）。
- `nthread`：设置线程数。

#### (2) 树参数
- `max_depth`：树的最大深度，控制模型复杂性，默认值为6。
- `eta`（Learning Rate）：学习率，控制每棵树对最终模型的贡献，默认值为`0.3`。
- `min_child_weight`：最小叶节点样本权重和，用于防止过拟合，默认值为`1`。
- `subsample`：训练数据的采样比例（默认值`1`）。
- `colsample_bytree`：每棵树随机采样的特征比例，防止过拟合。
- `lambda`：L2正则化系数，默认值`1`。
- `gamma`：最小分裂增益，默认值`0`。

#### (3) 学习目标参数
- `objective`：定义学习任务（如分类、回归、排序等）。
  - `reg:linear`：线性回归。
  - `binary:logistic`：二分类问题。
  - `multi:softmax`：多分类，返回类别。
  - `multi:softprob`：多分类，返回类别概率。

### 7. 使用XGBoost的步骤

以下是典型的XGBoost建模流程：

#### (1) 数据预处理
- 清洗、处理缺失值和异常值。
- 分割训练集和测试集。
- 特征工程（如编码、归一化、特征选择）。

#### (2) 模型构建
- 导入XGBoost库（如`xgboost`或`sklearn`接口）。
- 定义超参数（包括树深、学习率等）。
- 使用DMatrix数据格式加载输入特征和目标。

#### (3) 模型训练
- 使用`xgb.train()`或`XGBClassifier`训练模型。
- 定义早停条件（如`early_stopping_rounds`）。

#### (4) 模型评估
- 使用交叉验证或测试集，评估性能指标（如AUC、F1-score）。

#### (5) 模型调优
- 调整超参数（如`max_depth`、`min_child_weight`、`colsample_bytree`等）。
- 结合网格搜索（Grid Search）或贝叶斯优化。

---

### 8. 代码示例

以下是一个简单的二分类任务的XGBoost示例：

```python
import xgboost as xgb
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# 加载数据
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 转换为XGBoost专用的DMatrix数据格式
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

# 定义参数
params = {
    'objective': 'binary:logistic',
    'max_depth': 6,
    'eta': 0.1,
    'eval_metric': 'auc'
}

# 训练模型
evals = [(dtrain, 'train'), (dtest, 'eval')]
model = xgb.train(params, dtrain, num_boost_round=100, evals=evals, early_stopping_rounds=10)

# 预测
y_pred = model.predict(dtest)
auc_score = roc_auc_score(y_test, y_pred)
print(f"AUC Score: {auc_score}")
```

---

### 9. 结论
XGBoost是一种强大的机器学习工具，特别适合梯度提升树模型的场景。通过优化计算方法、自定义目标函数、正则化和扩展性等特点，XGBoost在工业界与学术界均有卓越应用。掌握其原理和参数调优，能够有效提升数据科学项目的性能和效率。

### 10 GBDT 和 XGboost

XGBoost 是众多实现 **Gradient Boosting Decision Tree** (GBDT，梯度提升决策树) 的一种，但它在 GBDT 的基础上引入了多种优化和改进，使其在工程高效性、性能表现和鲁棒性方面超越了传统的 GBDT。下面我们来详细讲解 **XGBoost 和传统 GBDT 的主要区别**。

#### **损失函数优化：引入二阶导数信息**

**传统 GBDT**：

- 仅使用目标函数的一阶梯度（即残差）来指导新树的生成。
- 目标是基于一阶梯度，使模型不断逼近最优解。

**XGBoost**：

- **引入了二阶梯度（Hessian，目标函数的曲率）进行优化。**
- 树节点的划分不仅依赖于一阶梯度，还考虑了二阶梯度（即损失函数的曲率特性），引入了更精确的梯度信息。
- 二阶梯度进一步提升了分裂点计算的准确性和优化性，帮助模型更好地拟合复杂数据。

**二阶信息的改进：**

XGBoost 在目标函数中加入二阶梯度的累加项，分裂点决策时的公式为：
$\text{Gain} = \frac{1}{2} \left( \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_P)^2}{H_P + \lambda} \right) - \gamma$

- \( G \)：一阶梯度的累加。
- \( H \)：二阶梯度的累加。
- **效果**：比单纯基于一阶残差的传统 GBDT 提供更准确的分裂评估，同时二阶信息能更好地避免梯度方向过冲（Overstepping）。

#### **正则化：控制模型复杂度（防止过拟合）**

**传统 GBDT：**

- 通常没有明确的正则化项，较难控制模型的复杂度。
- 因为迭代训练中如果树的深度很深或切分过多，传统 GBDT 往往容易过拟合。

**XGBoost：**

- 在目标函数中显式引入了正则化项，通过控制模型复杂度来防止过拟合：
  \[
  $\mathcal{L}(q) = -\frac{1}{2}(\text{目标函数中的一阶和二阶梯度优化}) + \Omega(f)$
  \]
  正则化项：
  \[
  $\Omega(f) = \gamma T + \frac{\lambda}{2} \sum_j w_j^2$
  \]
  - \( \gamma T \)：控制叶子节点个数 \(T\) 的惩罚，用于限制树的深度；
  - \( \lambda \sum w_j^2 \)：控制叶子节点权重 \(w_j\) 的惩罚，用于避免过大的权重值。
  - **效果**：正则化项可以防止模型在训练时过拟合，同时提升泛化能力。

#### **并行计算：优化训练效率**

**传统 GBDT：**

- 传统 GBDT 是 **串行** 的方法，即每棵树的训练必须依赖于上一棵树的输出，因此无法并行化。
- 效率相对较低，尤其是在大规模数据集上，耗时较长。

**XGBoost：**

- **全局搜索优化加并行化计算：**
  1. 引入了 **Block-wise 的分裂模型**：
     - 对于特定节点，XGBoost 使用直方图算法（Histogram）对特征值排序并离散化，计算每个分裂点的候选增益。
     - 一旦节点划分结束，其增益计算可以在多个线程间并行化。
  2. 将并行化落地到节点的分裂计算中：
     - 特征按区块划分，增益计算可以在每个区块中同时完成，显著提高效率。
  3. 对特征子集或样本做随机分割（列采样和行采样），进一步提升计算效率。

- **效果**：通过支持并行化，XGBoost 在大量数据和高维场景中计算速度远超传统 GBDT。

#### **支持行/列采样**

**传统 GBDT：**

- 大多数 GBDT 实现（如 sklearn 中的 GradientBoosting）对特征不支持列采样，对数据行采样的支持也有限。
- 只能依赖全部数据进行树分裂，容易导致过拟合，且计算成本高（因为所有列都要用于分裂）。

**XGBoost：**

- 支持 **列采样（feature sampling）**：随机选择部分特征用于分裂。
  - 类似于随机森林的特征子集选择方法（列采样）。
  - 帮助进行降维，缓解数据中冗余特征的干扰，同时提升效率并增强模型的鲁棒性。
- 支持 **行采样（row sampling）**：对数据进行随机采样，这种方法类似于传统 Bagging 的原理，进一步减轻了过拟合的风险。

#### **基于分裂的停止策略**

**传统 GBDT：**

- 传统 GBDT 通常没有细化的停止策略，通常用树的固定深度或样本个数等简单规则来决定分裂是否停止。
- 在某些场景下效果欠佳（可能过度分裂导致过拟合）。

**XGBoost：**

- XGBoost 的分裂停止标准更加严格：
  - 如果在某个节点进行分裂后的增益 \( \text{Gain} \) 小于阈值 \( \gamma \)，则停止分裂，当前节点变为叶子节点。
  - 结合正则化项 \( \mathcal{L}(q) + \Omega(f) \)，对分类叶子节点和树结构进行复杂度限制，从而显著减少树的冗余分裂。

#### **支持稀疏特征的处理**

**传统 GBDT：**

- 传统实现难以很好地处理稀疏数据（例如缺失值或很多特征值为零的场景），可能需要手动预处理。

**XGBoost：**

- 原生支持稀疏特征，通过使用默认方向（default direction）处理缺失值。
  - 每次分裂时，模型会学习在特征缺失情况下样本的默认去向（是分到左子节点还是右子节点）。
- 提供对稀疏特征计算效率的优化，同时提升模型的鲁棒性。

#### **支持自定义目标函数**

**传统 GBDT：**

- 大多数传统 GBDT 实现只支持少量固定的目标函数（如均方误差、二元对数损失）。

**XGBoost：**

- 提供接口支持自定义任意可微目标函数。
  - 用户只需要提供 **一阶导数** 和 **二阶导数**，即可将不同任务（如排序、目标优化、回归等）套用到 XGBoost 中。
  - 如排序任务的 LambdaRank、Pairwise Ranking 等可以轻松整合到 XGBoost。

#### 总结：XGBoost 对 GBDT 的优越性

| **特性**           | **传统 GBDT**          | **XGBoost**                                  |
| ------------------ | ---------------------- | -------------------------------------------- |
| **优化目标**       | 一阶梯度               | 一阶梯度 + 二阶梯度（目标函数曲率）          |
| **正则化**         | 无显式正则化           | 显式正则化（叶节点和树深度的惩罚）           |
| **并行化**         | 不支持                 | 支持特征和样本的并行化处理                   |
| **列/行采样**      | 不支持                 | 支持列采样和行采样，缓解过拟合并提升效率     |
| **稀疏数据处理**   | 不支持                 | 支持稀疏特征，自动处理缺失值                 |
| **分裂停止策略**   | 简单停深条件           | 自适应增益阈值 \( \gamma \) 用于分裂决策     |
| **自定义目标函数** | 不支持                 | 支持任意可微目标函数                         |
| **工程优化和效率** | 慢（因为无并行和优化） | 快（支持并行化、缓存优化、大规模分布式训练） |

可以总结为 **XGBoost 是工程优化、正则化处理更强的 GBDT 版本**，尤其在大规模数据、稀疏特征、有复杂任务需求时表现尤为突出。
