---
title: python 学习笔记
date: 2023-11-01
categories: 
  - Python
tags: [python]
toc: true
excerpt: "A comprehensive collection of Python learning notes. This guide covers various Python concepts, tips, and best practices to help you enhance your programming skills."
---

## python环境安装

### python 语言介绍

* python是一种面对对戏那个的解释型计算机程序设计语言
* python是纯粹的自由软件
* 源代码和解释器遵循GPL协议
* python语法简洁清晰，强制用空白符作为语句锁进 （标准四个空格）

### python语言发展

20世界90年代初诞生，可以做后台开发，应用领域非常广泛（专业数据采集与处理即数据爬虫、自动化测试运维领域、人工智能与机器学习领域、数据计算与分析领域等）

2017年python超越C#语言升至第四名；

### python语言特点

+ 简单易学
+ 开发效率高
+ 典型的工具语言
+ 强大丰富的模块库——*最重要*
+ 跨平台

### python版本介绍

- 常见版本python2.x 和python3.x
- 对比：2.x很多依赖模块基本不更新；3.x没有考虑到向下兼容

### 验证python开发环境

```python
python -V #反显的是python2
```

### python 开发环境&开发工具

- python编译环境anaconda安装和使用
- 文本编辑器 sublime text3
- pycharm python IDE 集成开发环境

## 第一个python程序

### 步骤

- 常见工程以及源文件
- 编写*.py文件
- 运行程序

``` python
print ("hello,world") #第一个程序
```

## python变量与循环定义

### 变量

- 什么是变量 -- 计算机语言能存储计算结果或能表示值的一个抽象概念
- 变量的特点
  - 变量可以通过变量名访问
  - 在指令式语言中，变量通常是可变的

- 变量命名的规范

  变量名就是一个非常典型的标志符 必须是*** 字母、下划线开头 后续必须包括字母数字下划线  ***

- python中的变量赋值不需要类型声明

- 每个变量在内存中创建，包括变量的标志，名称和数据这些信息

- 每个变量在使用前都必须赋值，变量赋值以后改变量才会被创建

### 变量赋值

- 等号（=）用来给变量赋值

- 等号左边是一个变量名，右边是储存在变量中的值

- 赋值语法 变量名 = 值

- ```python
  #示例
  counter = 100 #整型变量
  miles = 1000.0  #浮点型
  name = "john" #字符串
  ```

### 循环控制

- 控制流语句用来实现对程序流程的选择、循环、转向和返回等进行控制
- 控制语句可以用来控制程序的流程，以实现程序的各种结构方式
- 常见的*条件控制语句* 和*循环控制语句*

#### 循环控制语句

- 在某条件下，循环执行某段程序，处理重复的相同任务
- 循环控制语句回使用到 while 或 for 关键字

##### 循环基本规则

- 需要循环变量（可以为数字类型，字符或字符串类型）
- 循环条件（可以为表达式或布尔值）
- 循环语句块中修改循环变量（否则无限循环）

### 循环分类和关键字

- while循环 在给定的判断条件为ture时执行循环体，否则退出循环
- for循环 重复执行语句
- 嵌套循环 在while循环中嵌套for循环  *python中没有 do while 循环*
- break 在语句执行过程中终止循环，并且跳出整个循环
- conitnue 在语句执行过程中终止当前循环，跳出该次循环，执行下一次循环 *python支持循环控制语句关键字更改语句执行的顺序*

### while循环

```python
while 判断条件:
  执行语句块
  pass
```

#### while循环例子

eg1 从一个列表中分别筛选出奇数和偶数，并分别放到不同的列表中

```python
numbers = [12, 37, 5, 42, 8, 3]
even = []
odd = []
while len(numbers)> 0: #计算列表的个数
    number = numbers.pop() #从列表中取出一个数赋值给number
    if number % 2 == 0:
        odd.append(number) #为数组添加一个数据
    else:
        even.append(number)
print (even,odd)
```

eg2 输出0-9

```python
num = []
a = 0
while a <= 9 :
    num.append(a)
    a=a+1
print(num);

num = 0
while num <= 9 :
    num= num+1
    print (num);
```

eg 3 输出数字1-10 的偶数

```python
a = 1
even = []
while a < 11:
    if a % 2 == 0:
        even.append(a)
        a=a+1
    else:
        print(a)
        a=a+1
print (even)
```

```python
num = 1
while True:
    if num > 10:
        break
    if num % 2 != 0:
        num += 1
        continue
        pass
    else:
        print('num:> %d' %num)
        num += 1
        pass
    pass
```

### for循环

- range使用

  range也是一种类型，他是一个数字的序列（sequence of numbers），而且是不可变的，通常用在for循环中

  range（）默认返回一个列表的对象

  创建语法： range（stop）：list 创建一个列表，**默认从0开始到stop指定范围的前一个结束，每次递增步长为1**

  ​				  range（start，stop，step）：list 创建一个列表，**从start到stop前一个结束每次按照step增长**



- ```python
  for in range()
  ```

## python数据结构

### 序列

- 序列对象（sequence）：“序列是程序设计中经常用到的数据存储方式，在其他程序设计语言中，”序列”通常被称为数组，用于存储相关数据项的数据结构。几乎每一种设计语言都提供了序列数据接哦股，

  **python中本身没有数组的概念，但在numpy中提供了数组对象，也祢补了python的不足**

- 序列和数组的区别：

  数组提供了能存放**同一数据类型且连续的**内存空间；

  序列虽然是连续的存储空间，但可以存放不同类型数据，更加高级的数组

- python中常用的序列对象

  - 列表list 可变数据类型

  - 元祖 tuple（不可变数据类型）

  - 集合 sets（可变）

  - 字典 dictinary（可变）

  - 字符串string（不可变）

  - range（）

### 列表基础

- list（列表）是python中使用最频繁的数据类型

  - 列表是一种有序的集合，可以随时添加和删除其中的元素
  - 列表可以完成大多数集合类的数据结构实现
  - 它支持字符，数字，字符串甚至可以包含列表（即多维列表）
  - 立标用[]标志，是python最通用的复合数据类型

- 如何创建列表

  - 默认方法 语法：列表对象名称=[元素1， 元素2， 元素3，……， 元素N]

    ```python
    list1 = [0,1,2,3]
    list2= ['a','b','c']
    list3= ['a',2,True,'hello']
    print(list1)
    print(list2)
    print(list3)
    ```

  - 使用range（）内置函数

    ```python
    list1 = range(10)
    ```

- 如何访问列表

  - 列表中的值的切割也可以用到[头下标：尾下标：步长]，就可以截取相对应的列表

  - 从左到右下标索引默认0开始，从右到左下标索引默认-1开始，下标可以为空表示截取到头或尾

  - ```python
    list1= list(range(10))
    print (list1)
    print (list1[0])
    print(list1[1:7])
    print(list1[1:10:2])
    print(list1[-5:-1])
    ```

- 列表更新

  - 所谓列表更新是指对列表元素重新赋值、删除、添加等相关操作

  - ```python
    # 定义列表
    list1=['html','css','xml','databas']
  
    # 更新列表某元素
    list1[1] = 'css3'
    print (list1)
    # 删除累表的database
    del list1[-1]
    print (list1)
    # 使用remove来移除指定元素
    list1.remove('xml')
    list1.remove(list1[0])
    print (list1)
    # 向列表增加一个元素
    list1.append('python')
    print (list1)
    # 向列表增加一子列表
    list1.append(list(range(3)))
    print(list1)
    ```

  - ```python
    # 常用函数
    len(list):获取列表元素的个数
    max(list)：获取列表最大值
    min(list)
    list(seq):将元祖对象转化成列表对象
    ```

- 元祖

  - 元祖是不可变的
  - 元祖作为序列的一种，支持分片
  - 元祖可以在映射中作为键（key）使用，而列表不行
  - 元祖作为很多内建函数和方法的返回值存在

- 元祖创建 相当只读列表

- 字典

  - 字典由多个键及对应的值组成，每个键及其对应的值为一项
  - dict函数能将（key->value）形式的序列转换为字典
  - 字典也是序列的一种，很多基本操作和序列类似
  - 字典是除列表以外python之中最灵活的内置数据结构类型
  - 字典中元素是通过键来截取的，而不是通过偏移存取
  - 字典用{}标志，典型的k-v值数据结构

- 如何创建字典

  ```python
  定义创建
  字典对象名称 = {}
  字典对象名称 = {key1:value1,key2:value2……}
  字典[key] =
  字典.keys 字典.values
  ```

- 集合set
  - 集合是一个无序不重复元素的集，可删除重复值，检测成员
  - 可以用大括号{}创建，注意**要创建一个空集合必须使用set()而不是set{}**

## python条件

### 控制语句

- 控制流语句用来实现对程序流程的选择、循环、转向和返回等进行控制
- 控制语句可以用于控制程序的流程，以使心啊程序的各种结构方式
  - 一般情况下程序按照编写顺序依次执行，形成一个标准的面向过程的结构化形式。
  - 当需要非顺序执行的时候，我们就需要控制流语句
  - 在python中最常见的两种控制流语句是：条件控制语句 和 循环控制语句

### 条件控制语句

- 条件控制语句根据是否满足自定义的条件选择性执行条件下的语句块

- ``` python
  #基本语法
  1 if 条件表达式：
  		条件语句块
    	pass #pass是python中的关键字，代表一个空行（也可以不写），代表条件语句块结束
  
  2 if 条件表达式：
  		条件语句块
    	pass
  else：
  		条件语句库
    	pass
  
  3 if 条件表达式1:
    		条件语句块
      	pass
    elif 条件表达式2:
      		条件语句块
        	pass
    else：
    		条件语句块
      	pass
  ```

- if elif 可以与if 嵌套互相替代

## python函数

### 函数定义

- 函数是组织好的，可重复使用的，用来实现单一，或相关联功能的代码段

- 函数能提高应用的模块性，和代码的重复利用率

- python提供许多内建函数 如print

- python提供用户自定义函数接口

- 自定义函数

  - def 关键词开头

  - 函数标志符名称和圆括号

  - 任何传入参数和自变量必须放在圆括号中间

  - 函数的第一行可以选择性地使用文档字符串用于存放函数说明

  - 函数内容以冒号起始，并且缩紧

  - return[表达式]结束函数，选择性地返回一个值给调用方

  - **不带表带是的热突然相当返回none**

    ```python
    def sum(arg1,arg2):
      total = arg1+arg2
      return tatal
    total = sum(10+20)
    print 'tatal',total
    ```

### 参数传递

- python函数的参数传递
  - 不可变类型：在程序编程中的值传递，如整数、字符串、元祖。如fun（a），传递的只是a的值，没有影响a对象本身，比如在fun（a）内部修改a的值，只是修改另一个复制的对象，不会影响a的本身，我经常称为值传递
  - 可变类型：类似编程中的引用传递（址传递），如累表，字典。如fun（a），则是将a真正的传过去，修改后fun外部的a也会受影响
  - python中一切都是对戏那个，严格意义我们不能说值传递还是引用传递，我们应该说传不可变对戏那个和传可变对象

## python模块化

### 模块定义

- python模块
  - 模块是一种组织形式，将许多有关联的代码组织放到单独的独立文件
  - 模块能定义函数，类和变量
  - 模块可以理解为一个包含了许多强大功能的包
  - 一个完整饿大型的python程序是由模块和包的形式组织起来的
  - python标准库中就包含许多模块，有很多模块内的方法都会被经常使用到
- python模块的作用
  - 模块内有许多函数方法
  - 模块可以在文件中永久保存代码
  - 模块可以跨系统平台使用

### 模块导入

- python模块包含包含标准库和第三方库

- 倒入python模块，可以使用下列语句

  ```python
  #下载 终端命令 （自动安装） pip install 模块名 /pip3 install pandas
  #导入
  import pandas
  import pandas as pd
  from import
  from import*
  ```

## python类概念

### 类基础

- 面对对象编程
  - 时间万物皆是对象
  - 任何对象都存在自己独有的状态和行为
  - 状态：描述事务的名词形式
  - 行为：描述事务的动词形式
- 对象的状态称为属性，对象的行为称为方法

- 类就是类别的意思，是对现实事物的抽象
  - 同一类别的事物都是会有共同的属性或方法
- 对戏那个就是类的一个具体表现事物
  - 任何对象都拥有相同的属性和方法
  - 每个对象的属性或方法会有独特的异性
- 类的创建
  - class是关键字，表示类
  - 类的创建语法 class person：
- 对象的创建
  - 对象使用类名进行创建
- 属性的定义有两种方式
  - 装饰器：在方法上应用装饰器
  - 静态字段：在类中定义值为property对象的静态字段
- 方法包括：普通方法、静态方法和类方法
  - 普通方法：由对象调用；至少一个self参数；执行普通方法是，自动将该方法的对象赋值给self
  - 类方法：由类调用；至少一个cls参数；执行类方法时，自动将调用该方法的类复制给cls
  - 静态方法：由类调用；无默认参数
- 构造方法
  - 构造方法时类成员方法中特殊的一种方法
  - 该方法在类实例化对象的过程中自动调用
- 类成员类型
  - 公有成员，在任何地方都能访问
  - 私有成员，只有在类的内部才能方法
  - 受保护的成员
  - 私有成员的命名，前两个字符是下划线（特殊成员除外）

### 类的继承

- 继承：子类可以继承父类的内容
- 继承是面对对象开发的重要特性，可以提高代码的重用性
- 继承关系下，子类拥有父类全部方法
- 继承关系下，super（）用于调用父类的方法
- 多继承
  - python的类可以继承多个类
  - 多继承，对象调用方法的方式有两种：深度优先和广度优先
  - 当类经典类，多继承会按照深度优先
  - 当类是新式，多继承会按照广度优先

## python的IO流

### 文件操作

- 文件介绍

  - 可分为文本文件和二进制文件两类
    - 文本文件，在不同操作系统下，可以用文本编辑器仅需读写的操作
    - 二进制文件，二进制的文件的处理效率更高
  - 文件的路径
    - 绝对路径
    - 相对路径 ./** 点 杠

  - 文件读写操作

  - ``` python
    input = open ('文件路径'，'读写模式'，[encoding=编码格式])
    #open 在获取文件若无则创建
    ```

  - 文件读取的模式主要有5种

    - r读取模式，r+读写文件模式

    - w写入模式

    - a追加模式

    - rb二进制数据读取模式

    - wb二进制数据写入模式

      - +的作用在原有基础上完善所有操作

    - ```python
      input.write
      input.read
      ```

  ## python异常处理

  ### 异常

  - 异常是一个事件，在程序执行过程中发生，影响程序的正常执行
  - 异常时python对象，表示一个错误

  - 错误分为两种，一种是编译报错；另一种是运行报错
  - 无论哪种都称为异常情况
    - 语法错误 error -syntaxerror
    - 异常- except indexerror

  ### 异常处理

  - 处理的关键字及语法结构

  - ```python
    try:
      # 可能出现异常的语句块#
    except 捕获异常的名词:
      #处理异常的语句块
    finally:
      #异常结束后续执行语句块
    ```

  - try中的龃龉一旦发生异常，则后续语句将会中止执行，程序控制流直接跳转至except块中。except若未能捕获异常，则系统报错。finally中的语句无论是否出现异常均会执行。try必须伴随except出现，不能独立出现。
