---
sidebar_position: 8
---

# 常见问题

## 1、输入框无法粘贴

由于 CS 内置 TUI 框架会劫持快捷键，直接使用快捷键粘贴可能失效，需按系统及终端类型操作：

Windows 系统（cmd / PowerShell 等终端）
终端顶部点击鼠标右键 → 编辑 → 粘贴

![img](img/FAQ/png.webp)

Linux 系统
取决于所用终端，通常按下 Shift + 右键，即可弹出包含粘贴选项的菜单，选择对应粘贴项即可。

![img](img/FAQ/linux-paste.webp)

## 2、Tab键无法切换问卷中的问题

使用左右方向键进行切换。

![img](img/FAQ/png-17700999595561.webp)

## 3、linux出现GLIB版本问题导致无法执行

使用Centos 8、Ubuntu 20.0 以上版本linux 机器或者容器。

## 4、进入子Agent会话后使用快捷键无法回到父Agent

鼠标左键点击左上角的Parent。

## 5、linux登录无法打开浏览器

- 方法一：在vscode中打开终端，远程连接linux。vscode可打开浏览器；

- 方法二：复制界面上的url，手动在浏览器中打开使用。（注意Mobaxterm无法复制，需要切换其它终端，比如直接用ssh命令连接服务器）

- 方法三：先在windows上登录CoStrict（cli或者插件均可），然后将 `%USER_PROFILE%/.costrict/share/auth.json` 复制到服务器 `${HOME}/.costrict/share/auth.json`，然后进行使用即可（过期后，再次执行同样操作）。目录不存在，请自动创建。

## 6、win7无法使用

在远程linux服务器上启动 costrict-cli的web模式，然后在浏览器中打开使用；或者使用 vscode远程连接服务器开发。
