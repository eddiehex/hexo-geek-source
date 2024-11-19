---
title: oracle_centos引导卷扩增
date: 2023-11-01
categories: 
  - Linux
tags: [centos, oracle]
toc: true
excerpt: "Learn how to expand the boot volume on Oracle CentOS. This guide provides step-by-step instructions for increasing the boot volume size to ensure your system has enough space for optimal performance."
---

### 1 调整引导卷大小

路径：存储-引导卷-选择编辑引导卷-调整大小



### 2 运行重新扫描命令

```shell
sudo dd iflag=direct if=/dev/sda of=/dev/null count=1
echo "1" | sudo tee /sys/class/block/sda/device/rescan
echo "y" | sudo /usr/libexec/oci-growfs
```



因为centos中没有 `` /usr/libexec/oci-growfs``

所以通过以下命令进行分区扩展

```shell
sudo yum -y install cloud-utils-growpart
growpart /dev/sda 3 (需要扩展的 partition)
xfs_growfs /
lsblk (查看情况)
```



### 3 调整逻辑分区`centosvolum-root`

```
sda                     8:0    0   100G  0 disk
├─sda1                  8:1    0   100M  0 part /boot/efi
├─sda2                  8:2    0     1G  0 part /boot
└─sda3                  8:3    0  98.9G  0 part
  └─centosvolume-root 253:0    0  39.1G  0 lvm  /
```

- **将 `sda3` 的未使用空间添加到逻辑卷组**

``` shell
sudo pvresize /dev/sda3
# Physical volume "/dev/sda3" changed
#  1 physical volume(s) resized or updated / 0 physical volume(s) not resized
```

- **将未使用的空间添加到逻辑卷**

```shell
sudo lvextend -l +100%FREE /dev/mapper/centosvolume-root
  # Size of logical volume centosvolume/root changed from <39.06 GiB (9999 extents) to <98.90 GiB (25318 extents).
  # Logical volume centosvolume/root successfully resized.
```

- **调整文件系统大小**

```shell
sudo xfs_growfs /dev/mapper/centosvolume-root
# data blocks changed from 10238976 to 25925632
```

