# GMEnhance

为 GameMaker 8.0 IDE 的代码编辑器提供的增强模组。

## 功能

- **扩展函数帮助行**：光标位于扩展函数名上时显示其帮助行（GM8.0 原生能力，本插件通过原生链路调用，未改动其行为）。
- **`///` 脚本文档注释提示**：在脚本源码第一行写 `/// 说明文字`，代码编辑器把光标放到该脚本名上时，帮助行显示 `说明文字`。
- **补全参数列表**：脚本第一行写 `/// 说明文字 (a, b, c)`，代码补全下拉里该脚本项的参数段显示实际 `(a, b, c)`（原生固定显示 `(...)`；首行无括号则退回 `(...)`）。
- **trigger 常量补全**：代码补全里的 trigger 项改为显示 trigger **常量**（输入常量名即可匹配），参数段显示 ` 名称`。
- **中键跳转资源**：代码编辑器里把光标放在符号（对象/脚本/精灵等）上按中键，直接打开/显示对应资源。

## 如何使用

1. 确认 GameMaker 8.0 安装目录下有 `FoxPluginLoader.dll` 与 `FoxPlugin.txt`。
2. 把 `GMEnhance.dll` 放到 `(安装目录)\FoxPlugin\`。
3. 在 `FoxPlugin.txt` 新建一行写 `"FoxPlugin\GMEnhance.dll"`，保存。
4. 打开 GameMaker 8.0。

## 如何编译

使用 Visual Studio 2022，平台选择 `x86`：

```bash
MSBuild GMEnhance.sln /p:Configuration=Release /p:Platform=x86
```
