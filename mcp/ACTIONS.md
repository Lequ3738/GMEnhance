# GM8 D&D 动作总表（自动生成，勿手改）

来源：GM8 安装目录 `lib\*.lib`（9 个文件，共 262 条模板），
由 `node server.mjs actions-md` 从二进制 .lib 解析生成。查询请用 MCP 工具 `action_info`。

字段说明：`kind` 0=普通 1=分组开始 2=分组结束 3=Else 4=退出事件 5=Repeat 6=变量 7=执行代码 8=空占位 9=分隔线 10=分组标题；
参数类型：0=表达式 1=字符串 2=字符串或表达式 3=布尔 4=菜单 5=精灵 6=声音 7=背景 8=路径 9=脚本 10=物体 11=房间 12=字体 13=颜色 14=时间轴 15=字体描述串。

## 控制（lib_id=1，28 项）

### 999 条件

```
动作 999「条件」 — 控制（01_control.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 401 如果位置为空[action_if_empty] `action_if_empty`

```
动作 401「如果位置为空[action_if_empty]」（标签 action_if_empty） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果位置为空
参数提示：@w如果 @r 位置 (@0,@1) 是 @N 空,物体类型 @2 
类型：普通（kind 0）｜执行：函数 action_if_empty
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：是
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [菜单] 物体: 默认 "0" 可选值: 固体物体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=401
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 402 如果位置存在物体[action_if_collision] `action_if_collision`

```
动作 402「如果位置存在物体[action_if_collision]」（标签 action_if_collision） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果位置存在物体
参数提示：@w如果 @r 位置 (@0,@1)  @N存在 @2 物体
类型：普通（kind 0）｜执行：函数 action_if_collision
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：是
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [菜单] 物体: 默认 "0" 可选值: 固体物体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=402
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 403 如果物体在位置上[action_if_object] `action_if_object`

```
动作 403「如果物体在位置上[action_if_object]」（标签 action_if_object） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果物体在位置上
参数提示：@w如果@N 物体 @0 在 @r位置 (@1,@2) 上
类型：普通（kind 0）｜执行：函数 action_if_object
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：是
参数：
  arg0 [物体] 物体: 默认 "-100"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=403
relative=0
applies_to=self
invert=0
arg0=-100
arg1=0
arg2=0
*/

```

### 404 如果物体的数目[action_if_number] `action_if_number`

```
动作 404「如果物体的数目[action_if_number]」（标签 action_if_number） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果物体的数目
参数提示：如果物体 @0 的数目 @N@2 @1
类型：普通（kind 0）｜执行：函数 action_if_number
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [物体] 物体: 默认 "-100"
  arg1 [表达式] 数目: 默认 "0"
  arg2 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=404
invert=0
arg0=-100
arg1=0
arg2=0
*/

```

### 405 随机一定几率为真[action_if_dice] `action_if_dice`

```
动作 405「随机一定几率为真[action_if_dice]」（标签 action_if_dice） — 控制（01_control.lib，lib_id=1）
动作列表显示：随机 @0 分之一 几率为真 @N
参数提示：随机 @0 分之一 几率为真 @N
类型：普通（kind 0）｜执行：函数 action_if_dice
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] sides: 默认 "2"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=405
invert=0
arg0=2
*/

```

### 407 如果提出问题为真[action_if_question] `action_if_question`

```
动作 407「如果提出问题为真[action_if_question]」（标签 action_if_question） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果提出问题为真
参数提示：如果 @N提出问题为: @0
类型：普通（kind 0）｜执行：函数 action_if_question
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [字符串或表达式] 问题: 默认 ""
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=407
invert=0
arg0=
*/

```

### 408 如果表达式为真[action_if] `action_if`

```
动作 408「如果表达式为真[action_if]」（标签 action_if） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果表达式为真
参数提示：@w如果表达式 @0 为 @N 真
类型：普通（kind 0）｜执行：函数 action_if
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 表达式: 默认 ""
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=408
applies_to=self
invert=0
arg0=
*/

```

### 409 如果鼠标按下[action_if_mouse] `action_if_mouse`

```
动作 409「如果鼠标按下[action_if_mouse]」（标签 action_if_mouse） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果鼠标@0按下 @N
参数提示：如果鼠标@0按下 @N
类型：普通（kind 0）｜执行：函数 action_if_mouse
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [菜单] 按钮: 默认 "1" 可选值: <无按钮>|左键|右键|中键
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=409
invert=0
arg0=1
*/

```

### 410 如果物体已经对齐网格[action_if_aligned] `action_if_aligned`

```
动作 410「如果物体已经对齐网格[action_if_aligned]」（标签 action_if_aligned） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果物体已经对齐网格
参数提示：@w如果物体@N已经对齐网格单元 [@0 , @1] 象素
类型：普通（kind 0）｜执行：函数 action_if_aligned
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 水平吸附: 默认 "16"
  arg1 [表达式] 垂直吸附: 默认 "16"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=410
applies_to=self
invert=0
arg0=16
arg1=16
*/

```

### 999 -----------

```
动作 999「-----------」 — 控制（01_control.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 其他

```
动作 999「其他」 — 控制（01_control.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 422 开始

```
动作 422「开始」 — 控制（01_control.lib，lib_id=1）
动作列表显示：{
参数提示：开始 {
类型：分组开始（kind 1）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=422
*/

```

### 421 否则

```
动作 421「否则」 — 控制（01_control.lib，lib_id=1）
参数提示：否则 else
类型：Else（kind 3）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=421
*/

```

### 425 退出事件

```
动作 425「退出事件」 — 控制（01_control.lib，lib_id=1）
参数提示：退出事件
类型：退出事件（kind 4）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=425
*/

```

### 424 结束

```
动作 424「结束」 — 控制（01_control.lib，lib_id=1）
动作列表显示：}
参数提示：结束 }
类型：分组结束（kind 2）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=424
*/

```

### 423 循环下一行动

```
动作 423「循环下一行动」 — 控制（01_control.lib，lib_id=1）
动作列表显示：循环 @0 次
参数提示：循环下一个行动或者行动集合{} @0 次
类型：Repeat（kind 5）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] times: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=423
repeats=1
*/

```

### 604 访问继承事件[action_inherited] `action_inherited`

```
动作 604「访问继承事件[action_inherited]」（标签 action_inherited） — 控制（01_control.lib，lib_id=1）
动作列表显示：访问继承事件
参数提示：访问继承事件从父类里面
类型：普通（kind 0）｜执行：函数 action_inherited
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=604
invert=0
*/

```

### 999 ----------

```
动作 999「----------」 — 控制（01_control.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 代码

```
动作 999「代码」 — 控制（01_control.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 603 执行代码

```
动作 603「执行代码」 — 控制（01_control.lib，lib_id=1）
参数提示：执行代码:##@0
类型：执行代码（kind 7）｜执行：代码（GML 存在动作实例里）
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
(kind 7：模板之后直接接着写这个动作要执行的 GML 代码)
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=603
applies_to=self
*/

```

### 601 执行脚本[action_execute_script] `action_execute_script`

```
动作 601「执行脚本[action_execute_script]」（标签 action_execute_script） — 控制（01_control.lib，lib_id=1）
动作列表显示：执行脚本: @0
参数提示：@w执行脚本 @0 参数是 (@1,@2,@3,@4,@5)
类型：普通（kind 0）｜执行：函数 action_execute_script
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [脚本] 脚本: 默认 "-1"
  arg1 [表达式] 参数0: 默认 "0"
  arg2 [表达式] 参数1: 默认 "0"
  arg3 [表达式] 参数2: 默认 "0"
  arg4 [表达式] 参数3: 默认 "0"
  arg5 [表达式] 参数4: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=601
applies_to=self
invert=0
arg0=-1
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 605 添加注释

```
动作 605「添加注释」 — 控制（01_control.lib，lib_id=1）
动作列表显示：@FI@0
参数提示：注释: @0
类型：普通（kind 0）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串] comment: 默认 ""
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=605
invert=0
arg0=
*/

```

### 999 -----------------

```
动作 999「-----------------」 — 控制（01_control.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 变量

```
动作 999「变量」 — 控制（01_control.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 611 设置变量

```
动作 611「设置变量」 — 控制（01_control.lib，lib_id=1）
动作列表显示：设置变量 @0 为 @1
参数提示：@w设置变量 @0 @r为 @1
类型：变量（kind 6）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [字符串] variable: 默认 ""
  arg1 [表达式] value: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=611
relative=0
applies_to=self
var_name=
var_value=0
*/

```

### 612 如果变量[action_if_variable] `action_if_variable`

```
动作 612「如果变量[action_if_variable]」（标签 action_if_variable） — 控制（01_control.lib，lib_id=1）
动作列表显示：如果变量 @0 是 @N@2 @1
参数提示：如果变量@0 是 @N@2 @1
类型：普通（kind 0）｜执行：函数 action_if_variable
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 变量: 默认 ""
  arg1 [表达式] 值: 默认 "0"
  arg2 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=612
applies_to=self
invert=0
arg0=
arg1=0
arg2=0
*/

```

### 613 绘制变量[action_draw_variable] `action_draw_variable`

```
动作 613「绘制变量[action_draw_variable]」（标签 action_draw_variable） — 控制（01_control.lib，lib_id=1）
动作列表显示：绘制变量@0
参数提示：绘制变量: @0 在@r位置 (@1,@2) 
类型：普通（kind 0）｜执行：函数 action_draw_variable
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 变量: 默认 ""
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=613
relative=0
applies_to=self
invert=0
arg0=
arg1=0
arg2=0
*/

```

## 移动（lib_id=1，32 项）

### 247              

```
动作 247「             」 — 移动（02_move.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=247
relative=0
applies_to=self
*/

```

### 999 移动

```
动作 999「移动」 — 移动（02_move.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 101 开始移动并设定方向和速度[action_move] `action_move`

```
动作 101「开始移动并设定方向和速度[action_move]」（标签 action_move） — 移动（02_move.lib，lib_id=1）
动作列表显示：移动
参数提示：@w移动方向 @0 速度 @r 为 @1
类型：普通（kind 0）｜执行：函数 action_move
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [字符串] Argument 1: 默认 "000000000"
  arg1 [表达式] Argument 2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=101
relative=0
applies_to=self
invert=0
arg0=000000000
arg1=0
*/

```

### 102 设置移动方向和速度[action_set_motion] `action_set_motion`

```
动作 102「设置移动方向和速度[action_set_motion]」（标签 action_set_motion） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置移动
参数提示：@w速度@r 为 @1 方向为 @0
类型：普通（kind 0）｜执行：函数 action_set_motion
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 方向: 默认 "0"
  arg1 [表达式] 速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=102
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 105 向位置方向移动[action_move_point] `action_move_point`

```
动作 105「向位置方向移动[action_move_point]」（标签 action_move_point） — 移动（02_move.lib，lib_id=1）
动作列表显示：向位置 (@0,@1)方向移动
参数提示：@w @r 向位置 (@0,@1)方向移动以速度@2
类型：普通（kind 0）｜执行：函数 action_move_point
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [表达式] 速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=105
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 103 设置水平速度[action_set_hspeed] `action_set_hspeed`

```
动作 103「设置水平速度[action_set_hspeed]」（标签 action_set_hspeed） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置水平速度
参数提示：@w设置水平速度 @r为@0
类型：普通（kind 0）｜执行：函数 action_set_hspeed
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 水平速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=103
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 104 设置垂直速度[action_set_vspeed] `action_set_vspeed`

```
动作 104「设置垂直速度[action_set_vspeed]」（标签 action_set_vspeed） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置垂直速度
参数提示：@w设置垂直速度 @r为 @0
类型：普通（kind 0）｜执行：函数 action_set_vspeed
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 垂直速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=104
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 107 设置重力[action_set_gravity] `action_set_gravity`

```
动作 107「设置重力[action_set_gravity]」（标签 action_set_gravity） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置重力
参数提示：@w设置重力 @r为 @1 在方向 @0
类型：普通（kind 0）｜执行：函数 action_set_gravity
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 方向: 默认 "0"
  arg1 [表达式] 重力: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=107
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 113 水平反向[action_reverse_xdir] `action_reverse_xdir`

```
动作 113「水平反向[action_reverse_xdir]」（标签 action_reverse_xdir） — 移动（02_move.lib，lib_id=1）
动作列表显示：水平反向
参数提示：@w水平反向
类型：普通（kind 0）｜执行：函数 action_reverse_xdir
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=113
applies_to=self
invert=0
*/

```

### 114 垂直反向[action_reverse_ydir] `action_reverse_ydir`

```
动作 114「垂直反向[action_reverse_ydir]」（标签 action_reverse_ydir） — 移动（02_move.lib，lib_id=1）
动作列表显示：垂直反向
参数提示：@w垂直反向
类型：普通（kind 0）｜执行：函数 action_reverse_ydir
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=114
applies_to=self
invert=0
*/

```

### 108 设置摩擦力[action_set_friction] `action_set_friction`

```
动作 108「设置摩擦力[action_set_friction]」（标签 action_set_friction） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置摩擦力
参数提示：@w设置摩擦力@r 为 @0
类型：普通（kind 0）｜执行：函数 action_set_friction
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 摩擦力: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=108
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 999 -------------

```
动作 999「-------------」 — 移动（02_move.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 跳转

```
动作 999「跳转」 — 移动（02_move.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 109 跳转到位置[action_move_to] `action_move_to`

```
动作 109「跳转到位置[action_move_to]」（标签 action_move_to） — 移动（02_move.lib，lib_id=1）
动作列表显示：跳转到位置
参数提示：@w跳转 @r到位置 (@0,@1)
类型：普通（kind 0）｜执行：函数 action_move_to
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=109
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 110 跳转到初始位置[action_move_start] `action_move_start`

```
动作 110「跳转到初始位置[action_move_start]」（标签 action_move_start） — 移动（02_move.lib，lib_id=1）
动作列表显示：跳转到初始位置
参数提示：@w跳转到初始位置
类型：普通（kind 0）｜执行：函数 action_move_start
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=110
applies_to=self
invert=0
*/

```

### 111 随机跳转到位置[action_move_random] `action_move_random`

```
动作 111「随机跳转到位置[action_move_random]」（标签 action_move_random） — 移动（02_move.lib，lib_id=1）
动作列表显示：随机跳转到位置
参数提示：@w随机跳转到位置 以网格划分 水平吸附为 @0 垂直吸附 @1
类型：普通（kind 0）｜执行：函数 action_move_random
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 水平吸附: 默认 "0"
  arg1 [表达式] 垂直吸附: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=111
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 117 吸附网格[action_snap] `action_snap`

```
动作 117「吸附网格[action_snap]」（标签 action_snap） — 移动（02_move.lib，lib_id=1）
动作列表显示：吸附到网格 [@0 , @1]
参数提示：@w吸附到网格,单元设置 [@0 , @1]  象素
类型：普通（kind 0）｜执行：函数 action_snap
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 水平吸附: 默认 "16"
  arg1 [表达式] 垂直吸附: 默认 "16"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=117
applies_to=self
invert=0
arg0=16
arg1=16
*/

```

### 112 设置房间贯通 [放在离开房间事件里面][action_wrap] `action_wrap`

```
动作 112「设置房间贯通 [放在离开房间事件里面][action_wrap]」（标签 action_wrap） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置 @0 房间贯通
参数提示：@w设置 @0 房间贯通,当离开房间时从房间反方向进入房间
类型：普通（kind 0）｜执行：函数 action_wrap
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 方向: 默认 "0" 可选值: 水平方向|垂直方向|全部方向
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=112
applies_to=self
invert=0
arg0=0
*/

```

### 116 移动到接触位置[action_move_contact] `action_move_contact`

```
动作 116「移动到接触位置[action_move_contact]」（标签 action_move_contact） — 移动（02_move.lib，lib_id=1）
动作列表显示：移动到接触位置在方向 @0
参数提示：@w移动到接触位置在方向 @0 最大值 @1 接触类型 @2
类型：普通（kind 0）｜执行：函数 action_move_contact
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 方向: 默认 "0"
  arg1 [表达式] 最大值: 默认 "-1"
  arg2 [菜单] 类型: 默认 "0" 可选值: 固体物体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=116
applies_to=self
invert=0
arg0=0
arg1=-1
arg2=0
*/

```

### 115 反弹物体[action_bounce] `action_bounce`

```
动作 115「反弹物体[action_bounce]」（标签 action_bounce） — 移动（02_move.lib，lib_id=1）
动作列表显示：反弹在碰撞@1时
参数提示：@w反弹在碰撞@1时,精度@0 
类型：普通（kind 0）｜执行：函数 action_bounce
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 精度: 默认 "0" 可选值: 不精确|精确
  arg1 [菜单] 类型: 默认 "0" 可选值: 固体物体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=115
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 999 -------------

```
动作 999「-------------」 — 移动（02_move.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 路径

```
动作 999「路径」 — 移动（02_move.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 119 设置路径[action_path] `action_path`

```
动作 119「设置路径[action_path]」（标签 action_path） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置路径
参数提示：@w设置路径 @0 ,速度为@1 结束时 @2 相关性为@3
类型：普通（kind 0）｜执行：函数 action_path
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [路径] 路径: 默认 "-1"
  arg1 [表达式] 速度: 默认 "0"
  arg2 [菜单] 结束时: 默认 "0" 可选值: 停止路径|回到起始位置继续|现在位置继续|翻转方向继续
  arg3 [菜单] 相关性: 默认 "0" 可选值: 相对|绝对
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=119
applies_to=self
invert=0
arg0=-1
arg1=0
arg2=0
arg3=0
*/

```

### 124 结束路径[action_path_end] `action_path_end`

```
动作 124「结束路径[action_path_end]」（标签 action_path_end） — 移动（02_move.lib，lib_id=1）
动作列表显示：结束路径
参数提示：@w结束路径
类型：普通（kind 0）｜执行：函数 action_path_end
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=124
applies_to=self
invert=0
*/

```

### 122 跳转至路径位置[action_path_position] `action_path_position`

```
动作 122「跳转至路径位置[action_path_position]」（标签 action_path_position） — 移动（02_move.lib，lib_id=1）
动作列表显示：跳转至路径位置 @0
参数提示：&w跳转至路径位置 @r 为 @0
类型：普通（kind 0）｜执行：函数 action_path_position
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 位置 (0-1): 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=122
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 123 设置路径速度[action_path_speed] `action_path_speed`

```
动作 123「设置路径速度[action_path_speed]」（标签 action_path_speed） — 移动（02_move.lib，lib_id=1）
动作列表显示：设置路径速度为 @0
参数提示：@w设置路径速度 @r 为 @0
类型：普通（kind 0）｜执行：函数 action_path_speed
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=123
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 999 -------------

```
动作 999「-------------」 — 移动（02_move.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 步

```
动作 999「步」 — 移动（02_move.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 120 在步中向位置方向移动[action_linear_step] `action_linear_step`

```
动作 120「在步中向位置方向移动[action_linear_step]」（标签 action_linear_step） — 移动（02_move.lib，lib_id=1）
动作列表显示：在步中向位置 (@0,@1) 方向移动
参数提示：@w在步中 @r向位置 (@0,@1) 方向移动以速度 @2 碰到 @3 则停止
类型：普通（kind 0）｜执行：函数 action_linear_step
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [表达式] 速度: 默认 "0"
  arg3 [菜单] 停止类型: 默认 "0" 可选值: 固体物体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=120
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
*/

```

### 121 在步中向位置方向移动并绕开物体[放置在步中][action_potential_step] `action_potential_step`

```
动作 121「在步中向位置方向移动并绕开物体[放置在步中][action_potential_step]」（标签 action_potential_step） — 移动（02_move.lib，lib_id=1）
动作列表显示：在步中向位置 (@0,@1) 方向移动
参数提示：@w在步中 @r向位置 (@0,@1) 方向移动以速度 @2 并绕开 @3
类型：普通（kind 0）｜执行：函数 action_potential_step
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [表达式] 速度: 默认 "0"
  arg3 [菜单] 绕开: 默认 "0" 可选值: 仅固体|全部物体
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=121
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
*/

```

## 主要一（lib_id=1，26 项）

### 999 物体

```
动作 999「物体」 — 主要一（03_main1.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 201 创造物体[action_create_object] `action_create_object`

```
动作 201「创造物体[action_create_object]」（标签 action_create_object） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：创造物体 @0
参数提示：@w创造物体 @0 在 @r位置 (@1,@2)
类型：普通（kind 0）｜执行：函数 action_create_object
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [物体] 物体: 默认 "-100"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=201
relative=0
applies_to=self
invert=0
arg0=-100
arg1=0
arg2=0
*/

```

### 206 创造移动物体[action_create_object_motion] `action_create_object_motion`

```
动作 206「创造移动物体[action_create_object_motion]」（标签 action_create_object_motion） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：创造移动物体 @0
参数提示：@w创造物体 @0 在 @r 位置 (@1,@2) 物体速度为 @3 方向为 @4
类型：普通（kind 0）｜执行：函数 action_create_object_motion
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [物体] 物体: 默认 "-100"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] 速度: 默认 "0"
  arg4 [表达式] 方向: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=206
relative=0
applies_to=self
invert=0
arg0=-100
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 207 随机选择物体创造[action_create_object_random] `action_create_object_random`

```
动作 207「随机选择物体创造[action_create_object_random]」（标签 action_create_object_random） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：随机选择物体创造
参数提示：@w随机选择物体@0, @1, @2, or @3 创造在 @r位置 (@4,@5)
类型：普通（kind 0）｜执行：函数 action_create_object_random
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [物体] 物体1: 默认 "-100"
  arg1 [物体] 物体2: 默认 "-100"
  arg2 [物体] 物体3: 默认 "-100"
  arg3 [物体] 物体4: 默认 "-100"
  arg4 [表达式] x: 默认 "0"
  arg5 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=207
relative=0
applies_to=self
invert=0
arg0=-100
arg1=-100
arg2=-100
arg3=-100
arg4=0
arg5=0
*/

```

### 202 改变物体[action_change_object] `action_change_object`

```
动作 202「改变物体[action_change_object]」（标签 action_change_object） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：改变物体为 @0
参数提示：@w改变物体 @0, @1 完成事件
类型：普通（kind 0）｜执行：函数 action_change_object
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [物体] 改变物体: 默认 "-100"
  arg1 [菜单] 完成事件: 默认 "0" 可选值: 否|是
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=202
applies_to=self
invert=0
arg0=-100
arg1=0
*/

```

### 203 破坏物体[action_kill_object] `action_kill_object`

```
动作 203「破坏物体[action_kill_object]」（标签 action_kill_object） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：破坏物体
参数提示：@w破坏物体
类型：普通（kind 0）｜执行：函数 action_kill_object
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=203
applies_to=self
invert=0
*/

```

### 204 破坏位置上所有物体[action_kill_position] `action_kill_position`

```
动作 204「破坏位置上所有物体[action_kill_position]」（标签 action_kill_position） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：破坏位置上所有物体
参数提示：破坏位置(@0,@1)上@r 所有物体 
类型：普通（kind 0）｜执行：函数 action_kill_position
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=204
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 999 --------------

```
动作 999「--------------」 — 主要一（03_main1.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 精灵

```
动作 999「精灵」 — 主要一（03_main1.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 541 改变精灵[action_sprite_set] `action_sprite_set`

```
动作 541「改变精灵[action_sprite_set]」（标签 action_sprite_set） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：改变精灵为 @0
参数提示：@w改变精灵为 @0 帧数是 @1 速度 @2
类型：普通（kind 0）｜执行：函数 action_sprite_set
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [表达式] 帧数: 默认 "0"
  arg2 [表达式] 速度: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=541
applies_to=self
invert=0
arg0=-1
arg1=0
arg2=1
*/

```

### 542 变形精灵[action_sprite_transform] `action_sprite_transform`

```
动作 542「变形精灵[action_sprite_transform]」（标签 action_sprite_transform） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：变形精灵
参数提示：@w精灵尺寸 x比例 @0 ,y比例 @1 旋转 @2, 翻转 @3
类型：普通（kind 0）｜执行：函数 action_sprite_transform
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x比例: 默认 "1"
  arg1 [表达式] y比例: 默认 "1"
  arg2 [表达式] 角度: 默认 "0"
  arg3 [菜单] 翻转: 默认 "0" 可选值: 不翻转|水平翻转|垂直翻转|水平和垂直翻转
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=542
applies_to=self
invert=0
arg0=1
arg1=1
arg2=0
arg3=0
*/

```

### 543 设置精灵混合[action_sprite_color] `action_sprite_color`

```
动作 543「设置精灵混合[action_sprite_color]」（标签 action_sprite_color） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：设置精灵混合
参数提示：@w精灵混合颜色@0 透明度 @1
类型：普通（kind 0）｜执行：函数 action_sprite_color
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [颜色] 颜色: 默认 "16777215"
  arg1 [表达式] 透明度[0-1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=543
applies_to=self
invert=0
arg0=16777215
arg1=1
*/

```

### 205 改变精灵尺寸[action_set_sprite] `action_set_sprite`

```
动作 205「改变精灵尺寸[action_set_sprite]」（标签 action_set_sprite） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：改变精灵尺寸 @0
参数提示：@w改变精灵 @0 尺寸为 @1
类型：普通（kind 0）｜执行：函数 action_set_sprite
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否｜隐藏动作（调色板不显示）
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [表达式] 尺寸: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=205
applies_to=self
invert=0
arg0=-1
arg1=1
*/

```

### 999 -----------

```
动作 999「-----------」 — 主要一（03_main1.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 声音

```
动作 999「声音」 — 主要一（03_main1.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 211 播放声音[action_sound] `action_sound`

```
动作 211「播放声音[action_sound]」（标签 action_sound） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：播放声音 @0
参数提示：播放声音 @0; 循环: @1
类型：普通（kind 0）｜执行：函数 action_sound
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
  arg1 [布尔] 循环: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=211
invert=0
arg0=-1
arg1=0
*/

```

### 212 停止声音[action_end_sound] `action_end_sound`

```
动作 212「停止声音[action_end_sound]」（标签 action_end_sound） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：停止声音 @0
参数提示：停止声音 @0
类型：普通（kind 0）｜执行：函数 action_end_sound
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=212
invert=0
arg0=-1
*/

```

### 213 如果声音正在播放[action_if_sound] `action_if_sound`

```
动作 213「如果声音正在播放[action_if_sound]」（标签 action_if_sound） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：如果声音 @0  @N 正在播放
参数提示：如果声音@0  @N 正在播放
类型：普通（kind 0）｜执行：函数 action_if_sound
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [声音] 声音: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=213
invert=0
arg0=-1
*/

```

### 999 ----------

```
动作 999「----------」 — 主要一（03_main1.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 房间

```
动作 999「房间」 — 主要一（03_main1.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 221 跳转到上一个房间[action_previous_room] `action_previous_room`

```
动作 221「跳转到上一个房间[action_previous_room]」（标签 action_previous_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：跳转到上一个房间
参数提示：跳转到上一个房间过渡效果为 @0
类型：普通（kind 0）｜执行：函数 action_previous_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 过渡效果: 默认 "0" 可选值: <无效果>|从左创建|从右创建|从上创建|从下创建|从中心创建|从左变换|从右变换|从上变换|从下变换|从左交织|从右交织|从上交织|从下交织
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=221
invert=0
arg0=0
*/

```

### 222 跳转到下一个房间[action_next_room] `action_next_room`

```
动作 222「跳转到下一个房间[action_next_room]」（标签 action_next_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：跳转到下一个房间
参数提示：跳转到下一个房间过渡效果为@0
类型：普通（kind 0）｜执行：函数 action_next_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 过渡效果: 默认 "0" 可选值: <无效果>|从左创建|从右创建|从上创建|从下创建|从中心创建|从左变换|从右变换|从上变换|从下变换|从左交织|从右交织|从上交织|从下交织
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=222
invert=0
arg0=0
*/

```

### 223 重新载入现在房间[action_current_room] `action_current_room`

```
动作 223「重新载入现在房间[action_current_room]」（标签 action_current_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：重新载入现在房间
参数提示：重新载入现在房间过渡效果为 @0
类型：普通（kind 0）｜执行：函数 action_current_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 过渡效果: 默认 "0" 可选值: <无效果>|从左创建|从右创建|从上创建|从下创建|从中心创建|从左变换|从右变换|从上变换|从下变换|从左交织|从右交织|从上交织|从下交织
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=223
invert=0
arg0=0
*/

```

### 224 跳转到自定义房间[action_another_room] `action_another_room`

```
动作 224「跳转到自定义房间[action_another_room]」（标签 action_another_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：跳转到@0 房间
参数提示：跳转到@0 房间过渡效果为 @1
类型：普通（kind 0）｜执行：函数 action_another_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [房间] 跳转房间: 默认 "-1"
  arg1 [菜单] 过渡效果: 默认 "0" 可选值: <无效果>|从左创建|从右创建|从上创建|从下创建|从中心创建|从左变换|从右变换|从上变换|从下变换|从左交织|从右交织|从上交织|从下交织
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=224
invert=0
arg0=-1
arg1=0
*/

```

### 225 如果上一个房间存在[action_if_previous_room] `action_if_previous_room`

```
动作 225「如果上一个房间存在[action_if_previous_room]」（标签 action_if_previous_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：如果上一个房间存在
参数提示：如果上一个房间存在
类型：普通（kind 0）｜执行：函数 action_if_previous_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=225
invert=0
*/

```

### 226 如果下一个房间存在[action_if_next_room] `action_if_next_room`

```
动作 226「如果下一个房间存在[action_if_next_room]」（标签 action_if_next_room） — 主要一（03_main1.lib，lib_id=1）
动作列表显示：如果下一个房间存在
参数提示：如果下一个房间存在
类型：普通（kind 0）｜执行：函数 action_if_next_room
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=226
invert=0
*/

```

## 主要二（lib_id=1，23 项）

### 999 时间

```
动作 999「时间」 — 主要二（04_main2.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 301 设置计时器[action_set_alarm] `action_set_alarm`

```
动作 301「设置计时器[action_set_alarm]」（标签 action_set_alarm） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：设置 @1 @r计时器步数为 @0
参数提示：@w设置 @1 @r计时器步数为 @0
类型：普通（kind 0）｜执行：函数 action_set_alarm
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 步数: 默认 "0"
  arg1 [菜单] 计时器: 默认 "0" 可选值: 定时器 0|定时器 1|定时器 2|定时器 3|定时器 4|定时器 5|定时器 6|定时器 7|定时器 8|定时器 9|定时器 10|定时器 11
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=301
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 302 休眠[action_sleep] `action_sleep`

```
动作 302「休眠[action_sleep]」（标签 action_sleep） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：休眠 @0 毫秒
参数提示：休眠 @0 毫秒; 重复窗口为: @1
类型：普通（kind 0）｜执行：函数 action_sleep
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 毫秒: 默认 "1000"
  arg1 [布尔] 重绘: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=302
invert=0
arg0=1000
arg1=1
*/

```

### 303 设置时间轴[action_set_timeline] `action_set_timeline`

```
动作 303「设置时间轴[action_set_timeline]」（标签 action_set_timeline） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：设置时间轴 @0
参数提示：@w设置时间轴 @0 在位置 @1
类型：普通（kind 0）｜执行：函数 action_set_timeline
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [时间轴] 时间轴: 默认 "-1"
  arg1 [表达式] 位置: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=303
applies_to=self
invert=0
arg0=-1
arg1=0
*/

```

### 304 设置时间轴位置[action_set_timeline_position] `action_set_timeline_position`

```
动作 304「设置时间轴位置[action_set_timeline_position]」（标签 action_set_timeline_position） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：设置时间轴位置 @0
参数提示：@w设置时间轴位置 @r为 @0
类型：普通（kind 0）｜执行：函数 action_set_timeline_position
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 位置: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=304
relative=0
applies_to=self
invert=0
arg0=0
*/

```

### 999 ----------

```
动作 999「----------」 — 主要二（04_main2.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 信息

```
动作 999「信息」 — 主要二（04_main2.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 321 显示消息框[action_message] `action_message`

```
动作 321「显示消息框[action_message]」（标签 action_message） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：显示消息框
参数提示：显示消息框: @0
类型：普通（kind 0）｜执行：函数 action_message
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 消息框: 默认 ""
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=321
invert=0
arg0=
*/

```

### 322 显示游戏信息[action_show_info] `action_show_info`

```
动作 322「显示游戏信息[action_show_info]」（标签 action_show_info） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：显示游戏信息
参数提示：显示游戏信息
类型：普通（kind 0）｜执行：函数 action_show_info
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=322
invert=0
*/

```

### 323 播放视频文件[action_show_video] `action_show_video`

```
动作 323「播放视频文件[action_show_video]」（标签 action_show_video） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：播放视频文件 @0
参数提示：播放视频文件@0 显示设置为@1 循环设置为 @2
类型：普通（kind 0）｜执行：函数 action_show_video
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文件地址: 默认 "video.avi"
  arg1 [菜单] 显示模式: 默认 "0" 可选值: 窗口|全屏
  arg2 [菜单] 循环: 默认 "0" 可选值: 不循环|循环
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=323
invert=0
arg0=video.avi
arg1=0
arg2=0
*/

```

### 999 ---------

```
动作 999「---------」 — 主要二（04_main2.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 游戏

```
动作 999「游戏」 — 主要二（04_main2.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 331 重新启动游戏[action_restart_game] `action_restart_game`

```
动作 331「重新启动游戏[action_restart_game]」（标签 action_restart_game） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：重新启动游戏
参数提示：重新启动游戏
类型：普通（kind 0）｜执行：函数 action_restart_game
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=331
invert=0
*/

```

### 332 结束游戏[action_end_game] `action_end_game`

```
动作 332「结束游戏[action_end_game]」（标签 action_end_game） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：结束游戏
参数提示：结束游戏
类型：普通（kind 0）｜执行：函数 action_end_game
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=332
invert=0
*/

```

### 333 保存游戏[action_save_game] `action_save_game`

```
动作 333「保存游戏[action_save_game]」（标签 action_save_game） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：保存游戏
参数提示：保存游戏到地址 @0
类型：普通（kind 0）｜执行：函数 action_save_game
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文件地址: 默认 "savegame"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=333
invert=0
arg0=savegame
*/

```

### 334 读取游戏存档[action_load_game] `action_load_game`

```
动作 334「读取游戏存档[action_load_game]」（标签 action_load_game） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：读取游戏存档
参数提示：读取游戏存档从地址 @0
类型：普通（kind 0）｜执行：函数 action_load_game
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文件地址: 默认 "savegame"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=334
invert=0
arg0=savegame
*/

```

### 999 -----------------

```
动作 999「-----------------」 — 主要二（04_main2.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 资源

```
动作 999「资源」 — 主要二（04_main2.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 803 从文件替换精灵[action_replace_sprite] `action_replace_sprite`

```
动作 803「从文件替换精灵[action_replace_sprite]」（标签 action_replace_sprite） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：从文件@1 替换精灵 @0 
参数提示：从文件@1 替换精灵 @0  到帧数@2 
类型：普通（kind 0）｜执行：函数 action_replace_sprite
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [字符串或表达式] 文件地址: 默认 "sprite.gif"
  arg2 [表达式] 帧数: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=803
invert=0
arg0=-1
arg1=sprite.gif
arg2=1
*/

```

### 804 从文件替换声音[action_replace_sound] `action_replace_sound`

```
动作 804「从文件替换声音[action_replace_sound]」（标签 action_replace_sound） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：从文件@1替换声音 @0 
参数提示：从文件@1替换声音 @0 
类型：普通（kind 0）｜执行：函数 action_replace_sound
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
  arg1 [字符串或表达式] 文件地址: 默认 "sound.mid"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=804
invert=0
arg0=-1
arg1=sound.mid
*/

```

### 805 从文件替换背景[action_replace_background] `action_replace_background`

```
动作 805「从文件替换背景[action_replace_background]」（标签 action_replace_background） — 主要二（04_main2.lib，lib_id=1）
动作列表显示：从文件@1替换背景 @0 
参数提示：从文件@1替换背景 @0 
类型：普通（kind 0）｜执行：函数 action_replace_background
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [背景] 背景: 默认 "-1"
  arg1 [字符串或表达式] 文件地址: 默认 "background.bmp"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=805
invert=0
arg0=-1
arg1=background.bmp
*/

```

## 分数（lib_id=1，18 项）

### 999 分数

```
动作 999「分数」 — 分数（05_score.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 701 设置分数[action_set_score] `action_set_score`

```
动作 701「设置分数[action_set_score]」（标签 action_set_score） — 分数（05_score.lib，lib_id=1）
动作列表显示：设置分数 @r为 @0
参数提示：设置分数 @r为 @0
类型：普通（kind 0）｜执行：函数 action_set_score
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 分数: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=701
relative=0
invert=0
arg0=0
*/

```

### 702 如果分数[action_if_score] `action_if_score`

```
动作 702「如果分数[action_if_score]」（标签 action_if_score） — 分数（05_score.lib，lib_id=1）
动作列表显示：如果分数 @N@1 @0
参数提示：如果分数 @N@1 @0
类型：普通（kind 0）｜执行：函数 action_if_score
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 值: 默认 "0"
  arg1 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=702
invert=0
arg0=0
arg1=0
*/

```

### 703 绘制分数[action_draw_score] `action_draw_score`

```
动作 703「绘制分数[action_draw_score]」（标签 action_draw_score） — 分数（05_score.lib，lib_id=1）
动作列表显示：绘制分数
参数提示：绘制分数的标题 @2 在@r位置 (@0,@1) 
类型：普通（kind 0）｜执行：函数 action_draw_score
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [字符串] 标题: 默认 "Score: "
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=703
relative=0
invert=0
arg0=0
arg1=0
arg2=Score: 
*/

```

### 709 显示高分表[action_highscore_show] `action_highscore_show`

```
动作 709「显示高分表[action_highscore_show]」（标签 action_highscore_show） — 分数（05_score.lib，lib_id=1）
动作列表显示：显示高分表
参数提示：显示高分表#    背景: @0#     @1 边框#     新记录颜色: @2, 旧记录颜色: @3#     字体: @4
类型：普通（kind 0）｜执行：函数 action_highscore_show
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [背景] 背景: 默认 "-1"
  arg1 [菜单] 边框: 默认 "1" 可选值: 不显示|显示
  arg2 [颜色] 新记录颜色: 默认 "255"
  arg3 [颜色] 旧记录颜色: 默认 "0"
  arg4 [字体描述串] 字体: 默认 "\"Times New Roman\",10,0,0,0,0,0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=709
invert=0
arg0=-1
arg1=1
arg2=255
arg3=0
arg4="Times New Roman",10,0,0,0,0,0
*/

```

### 707 清空高分表[action_highscore_clear] `action_highscore_clear`

```
动作 707「清空高分表[action_highscore_clear]」（标签 action_highscore_clear） — 分数（05_score.lib，lib_id=1）
动作列表显示：清空高分表
参数提示：清空高分表
类型：普通（kind 0）｜执行：函数 action_highscore_clear
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=707
invert=0
*/

```

### 999 ------------

```
动作 999「------------」 — 分数（05_score.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 生命

```
动作 999「生命」 — 分数（05_score.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 711 设置生命[action_set_life] `action_set_life`

```
动作 711「设置生命[action_set_life]」（标签 action_set_life） — 分数（05_score.lib，lib_id=1）
动作列表显示：设置生命 @r 为 @0
参数提示：设置生命数目  @r为 @0
类型：普通（kind 0）｜执行：函数 action_set_life
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 生命: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=711
relative=0
invert=0
arg0=0
*/

```

### 712 如果生命[action_if_life] `action_if_life`

```
动作 712「如果生命[action_if_life]」（标签 action_if_life） — 分数（05_score.lib，lib_id=1）
动作列表显示：如果生命 @N@1 @0
参数提示：如果生命 @N@1 @0
类型：普通（kind 0）｜执行：函数 action_if_life
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 值: 默认 "0"
  arg1 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=712
invert=0
arg0=0
arg1=0
*/

```

### 713 绘制生命数目[action_draw_life] `action_draw_life`

```
动作 713「绘制生命数目[action_draw_life]」（标签 action_draw_life） — 分数（05_score.lib，lib_id=1）
动作列表显示：绘制生命数目
参数提示： 绘制生命标题 @2 在 @r位置 (@0,@1)
类型：普通（kind 0）｜执行：函数 action_draw_life
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [字符串] 标题: 默认 "Lives: "
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=713
relative=0
invert=0
arg0=0
arg1=0
arg2=Lives: 
*/

```

### 714 用精灵绘制生命数目[action_draw_life_images] `action_draw_life_images`

```
动作 714「用精灵绘制生命数目[action_draw_life_images]」（标签 action_draw_life_images） — 分数（05_score.lib，lib_id=1）
动作列表显示：绘制生命数目用精灵@2
参数提示：用图片绘制生命数目 @r在位置 (@0,@1) 用精灵 @2
类型：普通（kind 0）｜执行：函数 action_draw_life_images
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [精灵] 精灵: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=714
relative=0
invert=0
arg0=0
arg1=0
arg2=-1
*/

```

### 999 ------------

```
动作 999「------------」 — 分数（05_score.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 健康

```
动作 999「健康」 — 分数（05_score.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 721 设置健康[action_set_health] `action_set_health`

```
动作 721「设置健康[action_set_health]」（标签 action_set_health） — 分数（05_score.lib，lib_id=1）
动作列表显示：设置健康 @r为 @0
参数提示：设置健康 @r为 @0
类型：普通（kind 0）｜执行：函数 action_set_health
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 值 (0-100): 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=721
relative=0
invert=0
arg0=0
*/

```

### 722 如果生命值[action_if_health] `action_if_health`

```
动作 722「如果生命值[action_if_health]」（标签 action_if_health） — 分数（05_score.lib，lib_id=1）
动作列表显示：如果生命值 @N@1 @0
参数提示：如果生命值 @N@1 @0
类型：普通（kind 0）｜执行：函数 action_if_health
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 值: 默认 "0"
  arg1 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=722
invert=0
arg0=0
arg1=0
*/

```

### 723 绘制健康条[action_draw_health] `action_draw_health`

```
动作 723「绘制健康条[action_draw_health]」（标签 action_draw_health） — 分数（05_score.lib，lib_id=1）
动作列表显示：绘制健康条
参数提示：绘制健康条 @r 以尺寸 (@0,@1,@2,@3) 背景色 @4 血条颜色 @5
类型：普通（kind 0）｜执行：函数 action_draw_health
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [菜单] 背景色: 默认 "0" 可选值: 无|黑色|灰色|银色|白色|赤褐色|绿色|橄榄色|深蓝色|紫色|茶色|红色|石灰色|黄色|蓝色|紫红色|水色
  arg5 [菜单] 血条颜色: 默认 "0" 可选值: 绿色到红色|白色到黑色|黑色|灰色|银色|白色|赤褐色|绿色|橄榄色|深蓝色|紫色|茶色|红色|石灰色|黄色|蓝色|紫红色|水色
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=723
relative=0
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 731 设置窗口标题信息[action_set_caption] `action_set_caption`

```
动作 731「设置窗口标题信息[action_set_caption]」（标签 action_set_caption） — 分数（05_score.lib，lib_id=1）
动作列表显示：设置窗口标题信息
参数提示：设置窗口标题信息:# @0 分数标题 @1# @2 生命标题 @3# @4 健康标题 @5
类型：普通（kind 0）｜执行：函数 action_set_caption
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 显示分数: 默认 "1" 可选值: 隐藏|显示
  arg1 [字符串] 分数标题: 默认 "score: "
  arg2 [菜单] 显示生命: 默认 "0" 可选值: 隐藏|显示
  arg3 [字符串] 生命标题: 默认 "lives: "
  arg4 [菜单] 显示健康: 默认 "0" 可选值: 隐藏|显示
  arg5 [字符串] 健康标题: 默认 "health: "
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=731
invert=0
arg0=1
arg1=score: 
arg2=0
arg3=lives: 
arg4=0
arg5=health: 
*/

```

## 高级（lib_id=1，27 项）

### 999 粒子系统

```
动作 999「粒子系统」 — 高级（06_extra.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 820 创建粒子系统 (必须首先被创建)[action_partsyst_create] `action_partsyst_create`

```
动作 820「创建粒子系统 (必须首先被创建)[action_partsyst_create]」（标签 action_partsyst_create） — 高级（06_extra.lib，lib_id=1）
动作列表显示：创建粒子系统
参数提示：创建粒子系统,绘制深度 @0
类型：普通（kind 0）｜执行：函数 action_partsyst_create
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 深: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=820
invert=0
arg0=0
*/

```

### 821 破坏粒子系统[action_partsyst_destroy] `action_partsyst_destroy`

```
动作 821「破坏粒子系统[action_partsyst_destroy]」（标签 action_partsyst_destroy） — 高级（06_extra.lib，lib_id=1）
动作列表显示：破坏粒子系统
参数提示：破坏粒子系统
类型：普通（kind 0）｜执行：函数 action_partsyst_destroy
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=821
invert=0
*/

```

### 822 清除粒子系统中的粒子[action_partsyst_clear] `action_partsyst_clear`

```
动作 822「清除粒子系统中的粒子[action_partsyst_clear]」（标签 action_partsyst_clear） — 高级（06_extra.lib，lib_id=1）
动作列表显示：清除粒子系统
参数提示：清除粒子系统中的粒子
类型：普通（kind 0）｜执行：函数 action_partsyst_clear
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=822
invert=0
*/

```

### 825 创建一种粒子[action_parttype_create_old] `action_parttype_create_old`

```
动作 825「创建一种粒子[action_parttype_create_old]」（标签 action_parttype_create_old） — 高级（06_extra.lib，lib_id=1）
动作列表显示：创建粒子 @0
参数提示：创建粒子 @0 形状 @1, 尺寸在 @2  @3之间, 颜色是从 @4 变化到 @5
类型：普通（kind 0）｜执行：函数 action_parttype_create_old
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否｜隐藏动作（调色板不显示）
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [菜单] 形状: 默认 "0" 可选值: 点|圆盘|方形|线|星形|圆形|椭圆形|球形|闪光形|火花形|爆炸|云|烟
  arg2 [表达式] 最小尺寸: 默认 "1"
  arg3 [表达式] 最大尺寸: 默认 "1"
  arg4 [颜色] 起始颜色: 默认 "16777215"
  arg5 [颜色] 结束颜色: 默认 "16777215"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=825
invert=0
arg0=0
arg1=0
arg2=1
arg3=1
arg4=16777215
arg5=16777215
*/

```

### 823 创建一种粒子[action_parttype_create] `action_parttype_create`

```
动作 823「创建一种粒子[action_parttype_create]」（标签 action_parttype_create） — 高级（06_extra.lib，lib_id=1）
动作列表显示：创建粒子 @0
参数提示：创建粒子 @0 形状 @1 精灵 @2, 尺寸在 @3  @4之间, 增加值 @5
类型：普通（kind 0）｜执行：函数 action_parttype_create
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [菜单] 形状: 默认 "0" 可选值: 点|圆盘|方形|线|星形|圆形|椭圆形|球形|闪光形|火花形|爆炸|云|烟|雪花
  arg2 [精灵] 精灵: 默认 "-1"
  arg3 [表达式] 最小尺寸: 默认 "1"
  arg4 [表达式] 最大尺寸: 默认 "1"
  arg5 [表达式] 尺寸增加值: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=823
invert=0
arg0=0
arg1=0
arg2=-1
arg3=1
arg4=1
arg5=0
*/

```

### 824 设置粒子颜色属性[action_parttype_color] `action_parttype_color`

```
动作 824「设置粒子颜色属性[action_parttype_color]」（标签 action_parttype_color） — 高级（06_extra.lib，lib_id=1）
动作列表显示：设置粒子颜色为 @0
参数提示：设置粒子@0 类型 形状 @1 颜色 @2 和 @3 透明度变化从 @4 到 @5
类型：普通（kind 0）｜执行：函数 action_parttype_color
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [菜单] 颜色模式: 默认 "0" 可选值: 混合|变化
  arg2 [颜色] 颜色1: 默认 "16777215"
  arg3 [颜色] 颜色2: 默认 "16777215"
  arg4 [表达式] 初始透明度: 默认 "1"
  arg5 [表达式] 结束透明度: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=824
invert=0
arg0=0
arg1=0
arg2=16777215
arg3=16777215
arg4=1
arg5=1
*/

```

### 826 设置粒子生命属性[action_parttype_life] `action_parttype_life`

```
动作 826「设置粒子生命属性[action_parttype_life]」（标签 action_parttype_life） — 高级（06_extra.lib，lib_id=1）
动作列表显示：设置粒子@0生命
参数提示：设置粒子@0生命为从 @1 到 @2
类型：普通（kind 0）｜执行：函数 action_parttype_life
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [表达式] 最小生命: 默认 "50"
  arg2 [表达式] 最大生命: 默认 "50"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=826
invert=0
arg0=0
arg1=50
arg2=50
*/

```

### 827 设置粒子移动属性[action_parttype_speed] `action_parttype_speed`

```
动作 827「设置粒子移动属性[action_parttype_speed]」（标签 action_parttype_speed） — 高级（06_extra.lib，lib_id=1）
动作列表显示：设置粒子@0移动属性 
参数提示：设置粒子@0移动 速度在 @1  @2之间, 方向在 @3  @4之间, 摩擦力为 @5
类型：普通（kind 0）｜执行：函数 action_parttype_speed
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [表达式] 最小速度: 默认 "0"
  arg2 [表达式] 最大速度: 默认 "0"
  arg3 [表达式] 最小角度: 默认 "0"
  arg4 [表达式] 最大角度: 默认 "0"
  arg5 [表达式] 摩擦力: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=827
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 828 设置粒子重力属性[action_parttype_gravity] `action_parttype_gravity`

```
动作 828「设置粒子重力属性[action_parttype_gravity]」（标签 action_parttype_gravity） — 高级（06_extra.lib，lib_id=1）
动作列表显示：设置粒子@0重力属性 
参数提示：设置粒子@0重力 @1 在方向 @2 上
类型：普通（kind 0）｜执行：函数 action_parttype_gravity
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [表达式] 值: 默认 "0"
  arg2 [表达式] 方向: 默认 "270"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=828
invert=0
arg0=0
arg1=0
arg2=270
*/

```

### 829 创建第二粒子[action_parttype_secondary] `action_parttype_secondary`

```
动作 829「创建第二粒子[action_parttype_secondary]」（标签 action_parttype_secondary） — 高级（06_extra.lib，lib_id=1）
动作列表显示：创建第二粒子 @0
参数提示：创建第二粒子@0 在每@2步创造 粒子 @1 当结束时创造 @4 粒子@3 个
类型：普通（kind 0）｜执行：函数 action_parttype_secondary
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg1 [菜单] 步创建粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg2 [表达式] 步数: 默认 "0"
  arg3 [菜单] 结束时创造粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg4 [表达式] 结束时创造数目: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=829
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 831 创造粒子发射器[action_partemit_create] `action_partemit_create`

```
动作 831「创造粒子发射器[action_partemit_create]」（标签 action_partemit_create） — 高级（06_extra.lib，lib_id=1）
动作列表显示：创造粒子发射器@0
参数提示：创造粒子发射器@0 形状为 @1 尺寸为 [@2 ,@4 ] [@3 , @5]
类型：普通（kind 0）｜执行：函数 action_partemit_create
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 发射器: 默认 "0" 可选值: 发射器0|发射器1|发射器2|发射器3|发射器4|发射器5|发射器6|发射器7
  arg1 [菜单] 形状: 默认 "0" 可选值: 方形|椭圆形|菱形|线形
  arg2 [表达式] 最小x: 默认 "0"
  arg3 [表达式] 最大x: 默认 "0"
  arg4 [表达式] 最小y: 默认 "0"
  arg5 [表达式] 最大y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=831
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 832 破坏发射器[action_partemit_destroy] `action_partemit_destroy`

```
动作 832「破坏发射器[action_partemit_destroy]」（标签 action_partemit_destroy） — 高级（06_extra.lib，lib_id=1）
动作列表显示：破坏发射器 @0
参数提示：破坏发射器@0
类型：普通（kind 0）｜执行：函数 action_partemit_destroy
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 发射器: 默认 "0" 可选值: 发射器0|发射器1|发射器2|发射器3|发射器4|发射器5|发射器6|发射器7
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=832
invert=0
arg0=0
*/

```

### 833 设置发射器[爆发式][action_partemit_burst] `action_partemit_burst`

```
动作 833「设置发射器[爆发式][action_partemit_burst]」（标签 action_partemit_burst） — 高级（06_extra.lib，lib_id=1）
动作列表显示：爆发发射器@0发射@1  
参数提示：发射器@0发射@1  数目为 @2 
类型：普通（kind 0）｜执行：函数 action_partemit_burst
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 发射器: 默认 "0" 可选值: 发射器0|发射器1|发射器2|发射器3|发射器4|发射器5|发射器6|发射器7
  arg1 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg2 [表达式] 数目: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=833
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 834 设置发射器[流发式][action_partemit_stream] `action_partemit_stream`

```
动作 834「设置发射器[流发式][action_partemit_stream]」（标签 action_partemit_stream） — 高级（06_extra.lib，lib_id=1）
动作列表显示：流发射器@0发射@1  
参数提示：流发射器@0发射@1  数目为@2
类型：普通（kind 0）｜执行：函数 action_partemit_stream
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 发射器: 默认 "0" 可选值: 发射器0|发射器1|发射器2|发射器3|发射器4|发射器5|发射器6|发射器7
  arg1 [菜单] 粒子: 默认 "0" 可选值: 类型 0|类型 1|类型 2|类型 3|类型 4|类型 5|类型 6|类型 7|类型 8|类型 9|类型 10|类型 11|类型 12|类型 13|类型 14|类型 15
  arg2 [表达式] 数目: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=834
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 999 -----------

```
动作 999「-----------」 — 高级（06_extra.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 CD

```
动作 999「CD」 — 高级（06_extra.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 808 播放CD[action_cd_play] `action_cd_play`

```
动作 808「播放CD[action_cd_play]」（标签 action_cd_play） — 高级（06_extra.lib，lib_id=1）
动作列表显示：播放 CD 从 @0首开始
参数提示：播放 CD 从 @0首开始
类型：普通（kind 0）｜执行：函数 action_cd_play
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 开始: 默认 "1"
  arg1 [表达式] 结束: 默认 "1000"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=808
invert=0
arg0=1
arg1=1000
*/

```

### 809 停止播放CD[action_cd_stop] `action_cd_stop`

```
动作 809「停止播放CD[action_cd_stop]」（标签 action_cd_stop） — 高级（06_extra.lib，lib_id=1）
动作列表显示：停止播放CD
参数提示：停止播放 CD
类型：普通（kind 0）｜执行：函数 action_cd_stop
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=809
invert=0
*/

```

### 810 暂停播放 CD[action_cd_pause] `action_cd_pause`

```
动作 810「暂停播放 CD[action_cd_pause]」（标签 action_cd_pause） — 高级（06_extra.lib，lib_id=1）
动作列表显示：暂停播放 CD
参数提示：暂停播放 CD
类型：普通（kind 0）｜执行：函数 action_cd_pause
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=810
invert=0
*/

```

### 811 继续播放 CD[action_cd_resume] `action_cd_resume`

```
动作 811「继续播放 CD[action_cd_resume]」（标签 action_cd_resume） — 高级（06_extra.lib，lib_id=1）
动作列表显示：继续播放 CD
参数提示：继续播放 CD
类型：普通（kind 0）｜执行：函数 action_cd_resume
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=811
invert=0
*/

```

### 812 如果 CD在 驱动器中[action_cd_present] `action_cd_present`

```
动作 812「如果 CD在 驱动器中[action_cd_present]」（标签 action_cd_present） — 高级（06_extra.lib，lib_id=1）
动作列表显示：如果 CD存在
参数提示：如果 CD在 驱动器中
类型：普通（kind 0）｜执行：函数 action_cd_present
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=812
invert=0
*/

```

### 813 如果 CD正在 播放[action_cd_playing] `action_cd_playing`

```
动作 813「如果 CD正在 播放[action_cd_playing]」（标签 action_cd_playing） — 高级（06_extra.lib，lib_id=1）
动作列表显示：如果 CD正在 播放
参数提示：如果 CD正在 播放
类型：普通（kind 0）｜执行：函数 action_cd_playing
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=813
invert=0
*/

```

### 999 ---------------

```
动作 999「---------------」 — 高级（06_extra.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
*/

```

### 999 其他

```
动作 999「其他」 — 高级（06_extra.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 801 设置鼠标图标[action_set_cursor] `action_set_cursor`

```
动作 801「设置鼠标图标[action_set_cursor]」（标签 action_set_cursor） — 高级（06_extra.lib，lib_id=1）
动作列表显示：设置鼠标图标 @0
参数提示：设置鼠标图标为精灵 @0 window鼠标显示模式 @1 
类型：普通（kind 0）｜执行：函数 action_set_cursor
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [菜单] 显示模式: 默认 "0" 可选值: 隐藏|显示
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=801
invert=0
arg0=-1
arg1=0
*/

```

### 807 打开网页在浏览器中[action_webpage] `action_webpage`

```
动作 807「打开网页在浏览器中[action_webpage]」（标签 action_webpage） — 高级（06_extra.lib，lib_id=1）
动作列表显示：打开网页 @0
参数提示：打开网页 @0 在浏览器中
类型：普通（kind 0）｜执行：函数 action_webpage
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 网页地址: 默认 "http://"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=807
invert=0
arg0=http://
*/

```

## 绘制（lib_id=1，25 项）

### 999 --------------

```
动作 999「--------------」 — 绘制（07_draw.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 绘制

```
动作 999「绘制」 — 绘制（07_draw.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 501 绘制精灵[action_draw_sprite] `action_draw_sprite`

```
动作 501「绘制精灵[action_draw_sprite]」（标签 action_draw_sprite） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制精灵 @0
参数提示：@w  绘制精灵 @0 帧数 @3 在 @r位置 (@1,@2)
类型：普通（kind 0）｜执行：函数 action_draw_sprite
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] 帧数: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=501
relative=0
applies_to=self
invert=0
arg0=-1
arg1=0
arg2=0
arg3=-1
*/

```

### 502 绘制背景[action_draw_background] `action_draw_background`

```
动作 502「绘制背景[action_draw_background]」（标签 action_draw_background） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制背景 @0
参数提示：绘制背景 @0; 贴图模式: @3 在 @r位置 (@1,@2) 
类型：普通（kind 0）｜执行：函数 action_draw_background
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [背景] 背景: 默认 "-1"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [布尔] 贴图模式: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=502
relative=0
invert=0
arg0=-1
arg1=0
arg2=0
arg3=0
*/

```

### 514 绘制文本[action_draw_text] `action_draw_text`

```
动作 514「绘制文本[action_draw_text]」（标签 action_draw_text） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制文本
参数提示：@w 绘制文本: @0 在 @r位置 (@1,@2) 
类型：普通（kind 0）｜执行：函数 action_draw_text
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文本: 默认 ""
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=514
relative=0
applies_to=self
invert=0
arg0=
arg1=0
arg2=0
*/

```

### 519 绘制变形文本[action_draw_text_transformed] `action_draw_text_transformed`

```
动作 519「绘制变形文本[action_draw_text_transformed]」（标签 action_draw_text_transformed） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制变形文本
参数提示：@w在 @r位置 (@1,@2) 绘制文本: @0 水平比例 @3, 垂直比例 @4, 旋转 @5 度
类型：普通（kind 0）｜执行：函数 action_draw_text_transformed
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文本: 默认 ""
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] x比例: 默认 "1"
  arg4 [表达式] y比例: 默认 "1"
  arg5 [表达式] 角度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=519
relative=0
applies_to=self
invert=0
arg0=
arg1=0
arg2=0
arg3=1
arg4=1
arg5=0
*/

```

### 511 绘制方形[action_draw_rectangle] `action_draw_rectangle`

```
动作 511「绘制方形[action_draw_rectangle]」（标签 action_draw_rectangle） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制方形
参数提示：@w绘制方形 @r 尺寸 (@0,@1) (@2,@3), 填充模式@4
类型：普通（kind 0）｜执行：函数 action_draw_rectangle
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [菜单] 填充模式: 默认 "0" 可选值: 填充|外框
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=511
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 516 绘制水平渐变方形[action_draw_gradient_hor] `action_draw_gradient_hor`

```
动作 516「绘制水平渐变方形[action_draw_gradient_hor]」（标签 action_draw_gradient_hor） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制水平渐变方形
参数提示：@w绘制水平渐变填充方形 @r 尺寸(@0,@1)  (@2,@3) 颜色从 @4 到 @5
类型：普通（kind 0）｜执行：函数 action_draw_gradient_hor
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [颜色] 颜色1: 默认 "255" 可选值: filled|outline
  arg5 [颜色] 颜色2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=516
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=255
arg5=0
*/

```

### 517 绘制垂直渐变方形[action_draw_gradient_vert] `action_draw_gradient_vert`

```
动作 517「绘制垂直渐变方形[action_draw_gradient_vert]」（标签 action_draw_gradient_vert） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制垂直渐变方形
参数提示：@w绘制垂直渐变填充方形 @r尺寸 (@0,@1)  (@2,@3) 颜色从 @4 到 @5
类型：普通（kind 0）｜执行：函数 action_draw_gradient_vert
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [颜色] 颜色1: 默认 "255" 可选值: filled|outline
  arg5 [颜色] 颜色2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=517
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=255
arg5=0
*/

```

### 512 绘制椭圆形[action_draw_ellipse] `action_draw_ellipse`

```
动作 512「绘制椭圆形[action_draw_ellipse]」（标签 action_draw_ellipse） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制椭圆形
参数提示：@w绘制椭圆形 @r尺寸 (@0,@1)  (@2,@3), 填充模式@4
类型：普通（kind 0）｜执行：函数 action_draw_ellipse
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [菜单] 填充模式: 默认 "0" 可选值: 填充|外框
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=512
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 518 绘制渐变圆形[action_draw_ellipse_gradient] `action_draw_ellipse_gradient`

```
动作 518「绘制渐变圆形[action_draw_ellipse_gradient]」（标签 action_draw_ellipse_gradient） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制渐变圆形
参数提示：@w绘制渐变填充圆形 @r尺寸 (@0,@1)  (@2,@3) 颜色从 @4 到 @5
类型：普通（kind 0）｜执行：函数 action_draw_ellipse_gradient
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [颜色] 颜色1: 默认 "255" 可选值: filled|outline
  arg5 [颜色] 颜色2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=518
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=255
arg5=0
*/

```

### 513 绘制线条[action_draw_line] `action_draw_line`

```
动作 513「绘制线条[action_draw_line]」（标签 action_draw_line） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制线条
参数提示：@w绘制线条 @r在 (@0,@1) (@2,@3)之间
类型：普通（kind 0）｜执行：函数 action_draw_line
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=513
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
*/

```

### 515 绘制箭头[action_draw_arrow] `action_draw_arrow`

```
动作 515「绘制箭头[action_draw_arrow]」（标签 action_draw_arrow） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：绘制箭头
参数提示：@w绘制箭头 @r在 (@0,@1) (@2,@3)之间  尺寸 @4
类型：普通（kind 0）｜执行：函数 action_draw_arrow
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [表达式] 箭头尺寸: 默认 "12"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=515
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=12
*/

```

### 999 ----------------

```
动作 999「----------------」 — 绘制（07_draw.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 设定

```
动作 999「设定」 — 绘制（07_draw.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 524 设置颜色[action_color] `action_color`

```
动作 524「设置颜色[action_color]」（标签 action_color） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：设置颜色@0
参数提示：设置绘制颜色 @0
类型：普通（kind 0）｜执行：函数 action_color
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [颜色] 颜色: 默认 "16777215"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=524
invert=0
arg0=16777215
*/

```

### 526 设置字体[action_font] `action_font`

```
动作 526「设置字体[action_font]」（标签 action_font） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：设置字体 @0
参数提示：设置字体 @0 对齐方式 @1
类型：普通（kind 0）｜执行：函数 action_font
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字体] 字体: 默认 "-1"
  arg1 [菜单] 对齐: 默认 "0" 可选值: 左对齐|居中|右对齐
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=526
invert=0
arg0=-1
arg1=0
*/

```

### 531 改变屏幕显示[窗口/全屏][action_fullscreen] `action_fullscreen`

```
动作 531「改变屏幕显示[窗口/全屏][action_fullscreen]」（标签 action_fullscreen） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：改变屏幕显示
参数提示：改变屏幕显示为: @0
类型：普通（kind 0）｜执行：函数 action_fullscreen
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 模式: 默认 "0" 可选值: 选择|窗口|全屏
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=531
invert=0
arg0=0
*/

```

### 999 ----------------

```
动作 999「----------------」 — 绘制（07_draw.lib，lib_id=1）
类型：分隔线（kind 9）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 999 其他

```
动作 999「其他」 — 绘制（07_draw.lib，lib_id=1）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=999
relative=0
applies_to=self
*/

```

### 802 从游戏截图[action_snapshot] `action_snapshot`

```
动作 802「从游戏截图[action_snapshot]」（标签 action_snapshot） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：截图保存到 @0
参数提示：从游戏截图保存到地址 @0
类型：普通（kind 0）｜执行：函数 action_snapshot
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文件地址: 默认 "snapshot.bmp"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=802
invert=0
arg0=snapshot.bmp
*/

```

### 532 创建特效[action_effect] `action_effect`

```
动作 532「创建特效[action_effect]」（标签 action_effect） — 绘制（07_draw.lib，lib_id=1）
动作列表显示：创建特效 @0 在位置 (@1,@2)
参数提示：@w创建特效 @0 尺寸 @3 @r 在位置 (@1,@2)  颜色@4  层次@5
类型：普通（kind 0）｜执行：函数 action_effect
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [菜单] 类型: 默认 "0" 可选值: 爆炸|环|椭圆|烟花|烟|上升的烟|星型|火花型|闪光型|云|雨|雪
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [菜单] 尺寸: 默认 "1" 可选值: 小|中|大
  arg4 [颜色] 颜色: 默认 "16777215"
  arg5 [菜单] 层次: 默认 "0" 可选值: 物体下面|物体上面
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=1
action_id=532
relative=0
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=1
arg4=16777215
arg5=0
*/

```

## 增强一（lib_id=740409，38 项）

### 999 移动

```
动作 999「移动」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 3 停止移动

```
动作 3「停止移动」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w停止移动
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=3
applies_to=self
invert=0
*/

```

### 5 向位置反方向移动

```
动作 5「向位置反方向移动」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：向位置 (@0,@1)反方向移动
参数提示：@w 向@r位置 (@0,@1)反方向移动以速度 @2
类型：普通（kind 0）｜执行：代码包装 action_move_point
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
  arg2 [表达式] 速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=5
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
*/

```

### 26 圆形路径移动

```
动作 26「圆形路径移动」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：圆形路径移动 : @0 速度@2
参数提示：@w圆形路径移动 @0 圆形半径: @1 速度 @2 方向@3
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [物体] 物体: 默认 "-1"
  arg1 [表达式] 半径: 默认 "33"
  arg2 [表达式] 速度: 默认 "5"
  arg3 [菜单] 方向: 默认 "0" 可选值: 顺时针|逆时针
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=26
invert=0
arg0=-1
arg1=33
arg2=5
arg3=0
*/

```

### 27 向鼠标方向移动

```
动作 27「向鼠标方向移动」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w向鼠标方向移动以速度:@1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=27
applies_to=self
invert=0
arg0=0
*/

```

### 998 跳转

```
动作 998「跳转」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=998
relative=0
applies_to=self
*/

```

### 28 跳转至鼠标位置

```
动作 28「跳转至鼠标位置」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w跳转至鼠标位置
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=28
applies_to=self
invert=0
*/

```

### 19 设置房间边缘反弹 [放在与房间边界碰撞触发事件]

```
动作 19「设置房间边缘反弹 [放在与房间边界碰撞触发事件]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：设置房间边缘反弹
参数提示：设置房间边缘反弹
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=19
invert=0
*/

```

### 112 步 - 寻路

```
动作 112「步 - 寻路」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=112
relative=0
applies_to=self
*/

```

### 6 向位置方向移动并避开固体物体 [放置在 步 中]

```
动作 6「向位置方向移动并避开固体物体 [放置在 步 中]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：向位置方向移动 (@1,@2) 并避开固体物体
参数提示：@w移动 @r向位置 (@1,@2) 速度 @0 并避开固体物体
类型：普通（kind 0）｜执行：代码包装 action_path
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "0"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] 最大角度: 默认 "30"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=6
applies_to=self
invert=0
arg0=0
arg1=0
arg2=0
arg3=30
*/

```

### 999 物体

```
动作 999「物体」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 32 设置是否可见

```
动作 32「设置是否可见」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置可见为 @0 
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 可见: 默认 "1" 可选值: 否|是
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=32
applies_to=self
invert=0
arg0=1
*/

```

### 33 设置物体深度

```
动作 33「设置物体深度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置物体深度 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 深度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=33
applies_to=self
invert=0
arg0=0
*/

```

### 34 设置物体固体属性

```
动作 34「设置物体固体属性」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置物体固体属性为:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 固体: 默认 "0" 可选值: 否|是
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=34
applies_to=self
invert=0
arg0=0
*/

```

### 999 时间

```
动作 999「时间」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 36 暂停并等待键盘按下

```
动作 36「暂停并等待键盘按下」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：暂停并等待键盘按下
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=36
invert=0
*/

```

### 37 暂停并等待鼠标按下

```
动作 37「暂停并等待鼠标按下」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：暂停并等待鼠标按下
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=37
invert=0
*/

```

### 39 设置时间轴速度

```
动作 39「设置时间轴速度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：设置时间轴速度 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=39
applies_to=self
invert=0
arg0=1
*/

```

### 999 房间

```
动作 999「房间」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 46 记忆现在房间名

```
动作 46「记忆现在房间名」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：记忆现在房间名到:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 接口: 默认 "0" 可选值: 接口0|接口1|接口2|接口3|接口4|接口5
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=46
invert=0
arg0=0
*/

```

### 47 跳转房间到接口位置[先要记忆房间名]

```
动作 47「跳转房间到接口位置[先要记忆房间名]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：跳转房间到接口位置
参数提示：跳转房间到:@1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 过渡效果: 默认 "0" 可选值: <无效果>|从左创建|从右创建|从上创建|从下创建|从中心创建|从左变换|从右变换|从上变换|从下变换|从左交织|从右交织|从上交织|从下交织
  arg1 [菜单] 接口: 默认 "0" 可选值: 接口0|接口1|接口2|接口3|接口4|接口5
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=47
invert=0
arg0=0
arg1=0
*/

```

### 48 设置房间速度

```
动作 48「设置房间速度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：设置房间速度为:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "30"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=48
invert=0
arg0=30
*/

```

### 999 精灵

```
动作 999「精灵」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 49 设置精灵蒙版

```
动作 49「设置精灵蒙版」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：设置精灵@1蒙版
参数提示：@w设置精灵@1蒙版@2
类型：普通（kind 0）｜执行：代码包装 action_set_sprite
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [精灵] 精灵: 默认 "-1"
  arg1 [精灵] 蒙板: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=49
invert=0
arg0=-1
arg1=-1
*/

```

### 50 设置动画速度

```
动作 50「设置动画速度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置动画速度为 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 速度: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=50
relative=0
applies_to=self
invert=0
arg0=1
*/

```

### 51 设置精灵帧数

```
动作 51「设置精灵帧数」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置精灵帧数 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 帧数: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=51
applies_to=self
invert=0
arg0=-1
*/

```

### 54 设置精灵透明度

```
动作 54「设置精灵透明度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：@w设置精灵透明度 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [表达式] 透明度 [0 - 1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=54
relative=0
applies_to=self
invert=0
arg0=1
*/

```

### 999 背景

```
动作 999「背景」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 56 改变背景

```
动作 56「改变背景」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：改变背景@0 为 @1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 背景 ID: 默认 "0" 可选值: 背景0|背景1|背景2|背景3|背景4|背景5|背景6|背景7
  arg1 [背景] 背景: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=56
invert=0
arg0=0
arg1=-1
*/

```

### 57 背景是否可见

```
动作 57「背景是否可见」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：背景可见为 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 背景 ID: 默认 "0" 可选值: 背景0|背景1|背景2|背景3|背景4|背景5|背景6|背景7
  arg1 [菜单] 可见: 默认 "1" 可选值: 否|是
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=57
invert=0
arg0=0
arg1=1
*/

```

### 58 设置背景透明度

```
动作 58「设置背景透明度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：设置背景 @0 透明度为 @1 
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 背景 ID: 默认 "0" 可选值: 背景0|背景1|背景2|背景3|背景4|背景5|背景6|背景7
  arg1 [表达式] 透明度 [0 - 1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=58
invert=0
arg0=0
arg1=1
*/

```

### 59 设置背景水平速度

```
动作 59「设置背景水平速度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：设置背景水平速度为 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 背景 ID: 默认 "0" 可选值: 背景0|背景1|背景2|背景3|背景4|背景5|背景6|背景7
  arg1 [表达式] 水平速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=59
invert=0
arg0=0
arg1=0
*/

```

### 60 设置背景垂直速度

```
动作 60「设置背景垂直速度」 — 增强一（08_advance_1.lib，lib_id=740409）
参数提示：设置背景垂直速度为 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 背景 ID: 默认 "0" 可选值: 背景0|背景1|背景2|背景3|背景4|背景5|背景6|背景7
  arg1 [表达式] 垂直速度: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=60
invert=0
arg0=0
arg1=0
*/

```

### 999 声音

```
动作 999「声音」 — 增强一（08_advance_1.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 64 增加2D游戏的3D音效 [被选择的声音必须标明3D音效属性,放置在结束步事件中]

```
动作 64「增加2D游戏的3D音效 [被选择的声音必须标明3D音效属性,放置在结束步事件中]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：增加2D游戏的3D音效
参数提示：增加2D游戏的3D音效:@0 [放置在监听物体的结束步事件中]
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：是｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
  arg1 [表达式] 最小距离: 默认 "0"
  arg2 [表达式] 最大距离: 默认 "0"
  arg3 [表达式] x: 默认 "0"
  arg4 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=64
relative=0
invert=0
arg0=-1
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 65 为单个声音或全部声音设置音量 [Wave 和 Midis]

```
动作 65「为单个声音或全部声音设置音量 [Wave 和 Midis]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：设置 @0  声音  @1 音量 @2
参数提示：设置 @0  声音  @1 音量 @2
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 设置: 默认 "0" 可选值: 单首|全部
  arg1 [声音] 声音: 默认 "-1"
  arg2 [表达式] 音量 [0 - 1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=65
invert=0
arg0=0
arg1=-1
arg2=1
*/

```

### 66 设置声道 [Wave 和 Midis]

```
动作 66「设置声道 [Wave 和 Midis]」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：设置声道
参数提示：设置声道 @1 为声音@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
  arg1 [表达式] 声道 [0 - 1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=66
invert=0
arg0=-1
arg1=1
*/

```

### 67 在声音开头和结束时衰减

```
动作 67「在声音开头和结束时衰减」 — 增强一（08_advance_1.lib，lib_id=740409）
动作列表显示：衰减声音 @0
参数提示：衰减声音 @0 音量@1 时间@2
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [声音] 声音: 默认 "-1"
  arg1 [表达式] 音量 [0 - 1]: 默认 "0"
  arg2 [表达式] 时间(毫秒): 默认 "2000"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=67
invert=0
arg0=-1
arg1=0
arg2=2000
*/

```

## 增强二（lib_id=740409，45 项）

### 999 绘制

```
动作 999「绘制」 — 增强二（09_advance_2.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 75 设置颜色和透明度

```
动作 75「设置颜色和透明度」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置颜色 @0,  透明度:@1
类型：普通（kind 0）｜执行：代码包装 action_color
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [颜色] 颜色: 默认 "0" 可选值: fill|outline
  arg1 [表达式] 透明度[0-1]: 默认 "1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=75
invert=0
arg0=0
arg1=1
*/

```

### 80 绘制填充三角形

```
动作 80「绘制填充三角形」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：@w绘制填充三角形 @r 顶点 (@0,@1) , (@2,@3) , (@4,@5)
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [表达式] x3: 默认 "0"
  arg5 [表达式] y3: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=80
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 81 绘制边框三角形

```
动作 81「绘制边框三角形」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：@w绘制边框三角形 @r 顶点 (@0,@1) , (@2,@3) , (@4,@5)
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
  arg4 [表达式] x3: 默认 "0"
  arg5 [表达式] y3: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=81
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
arg4=0
arg5=0
*/

```

### 87 绘制高分表

```
动作 87「绘制高分表」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：绘制高分表位置 顶点( @0,@1) (@2,@3)
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x1: 默认 "0"
  arg1 [表达式] y1: 默认 "0"
  arg2 [表达式] x2: 默认 "0"
  arg3 [表达式] y2: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=87
invert=0
arg0=0
arg1=0
arg2=0
arg3=0
*/

```

### 90 绘制鼠标位置的提示框

```
动作 90「绘制鼠标位置的提示框」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：绘制提示信息 @0 在鼠标位置
参数提示：绘制提示信息 @0 在鼠标位置
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 文本: 默认 "'info'"
  arg1 [颜色] 背景颜色 默认 "16777215"
  arg2 [颜色] 文字颜色 默认 "0"
  arg3 [菜单] 背景填充 默认 "0" 可选值: 是|否
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=90
invert=0
arg0='info'
arg1=16777215
arg2=0
arg3=0
*/

```

### 999 条件

```
动作 999「条件」 — 增强二（09_advance_2.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 102 如果物体的方向 [ 0=右  90=上  180=左  270=下 ]

```
动作 102「如果物体的方向 [ 0=右  90=上  180=左  270=下 ]」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果物体的方向
参数提示：@w 如果物体的方向是 @1 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：可选｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 方向: 默认 "0"
  arg1 [菜单] 条件: 默认 "0" 可选值: 等于|小于|大于
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=102
applies_to=self
invert=0
arg0=0
arg1=0
*/

```

### 105 如果键盘按下

```
动作 105「如果键盘按下」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果键盘 @0  @N 按下
参数提示：如果键盘 @0  @N 按下
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [菜单] 键 : 默认 "0" 可选值: <no key>|<any key>|left|right|up|down|enter|escape|shift|control|alt|backspace|tab|space|insert|home|end|delete
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=105
invert=0
arg0=0
*/

```

### 106 如果手柄按钮按下

```
动作 106「如果手柄按钮按下」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果@0手柄按钮:   @1  @N
参数提示：如果@0手柄按钮:   @1  @N
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 手柄 [1 - 2]: 默认 "1"
  arg1 [菜单] 按钮: 默认 "0" 可选值: 左|右|上|下|按钮1|按钮2|按钮3|按钮4|按钮5|按钮6|按钮7|按钮8
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=106
invert=0
arg0=1
arg1=0
*/

```

### 115 如果目录存在

```
动作 115「如果目录存在」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果目录 @0 存在 @N
参数提示：如果目录 @0 存在 @N
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 目录地址: 默认 "'c:/'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=115
invert=0
arg0='c:/'
*/

```

### 116 如果目录存在

```
动作 116「如果目录存在」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果 @0 存在 @N
参数提示：如果 @0 存在 @N
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 文件地址: 默认 "'c:/file.ext'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=116
invert=0
arg0='c:/file.ext'
*/

```

### 117 如果是全屏模式

```
动作 117「如果是全屏模式」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果是全屏模式 @N 为真
参数提示：如果是全屏模式 @N 为真
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=117
invert=0
*/

```

### 118 如果玩家选择为真

```
动作 118「如果玩家选择为真」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果玩家选择 @1 按钮
参数提示：如果玩家选择 @1 按钮, 消息 @0
类型：普通（kind 0）｜执行：代码包装 action_if_question
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [字符串或表达式] text: 默认 "'Choose one option'"
  arg1 [表达式] button1: 默认 "'Yes'"
  arg2 [表达式] button2: 默认 "'No'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=118
invert=0
arg0='Choose one option'
arg1='Yes'
arg2='No'
*/

```

### 119 如果输入字符串为

```
动作 119「如果输入字符串为」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：如果输入字符串为 @4则真
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [菜单] 类型: 默认 "''" 可选值: 字符|数字
  arg1 [颜色] 输入颜色: 默认 ""
  arg2 [表达式] 标题: 默认 "\"Input\""
  arg3 [表达式] 默认: 默认 "\"\""
  arg4 [表达式] 验证字符串: 默认 "\"\""
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=119
invert=0
arg0=''
arg1=
arg2="Input"
arg3=""
arg4=""
*/

```

### 120 如果菜单选项为[注意是从0开始算第一项的]

```
动作 120「如果菜单选项为[注意是从0开始算第一项的]」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：如果菜单选项为
参数提示：如果菜单选项为:@4[注意是从0开始算第一项的]
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：是
参数：
  arg0 [表达式] 可选项: 默认 "'选择项目1|选择项目2|选择项目3'"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] 默认选择项: 默认 "0"
  arg4 [表达式] 选择项: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=120
invert=0
arg0='选择项目1|选择项目2|选择项目3'
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 999 设定

```
动作 999「设定」 — 增强二（09_advance_2.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 133 设置显示属性

```
动作 133「设置显示属性」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：宽 @0, 高 @1 刷新率 @2 颜色质量 @3
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 宽: 默认 "640"
  arg1 [表达式] 高: 默认 "480" 可选值: 320|640|800|1024|1280|1600
  arg2 [表达式] 刷新率: 默认 "60"
  arg3 [表达式] 颜色质量: 默认 "32"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=133
invert=0
arg0=640
arg1=480
arg2=60
arg3=32
*/

```

### 135 设置游戏优先权

```
动作 135「设置游戏优先权」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：设置游戏优先权为:@0
参数提示：设置游戏优先权为 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 优先权 [-3 - 3]: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=135
invert=0
arg0=0
*/

```

### 136 刷新窗口

```
动作 136「刷新窗口」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：刷新窗口
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=136
invert=0
*/

```

### 137 重绘窗口

```
动作 137「重绘窗口」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：重绘窗口
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=137
invert=0
*/

```

### 140 设置房间标题

```
动作 140「设置房间标题」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置房间标题为 :@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 标题: 默认 "'level'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=140
invert=0
arg0='level'
*/

```

### 141 设置窗口可见

```
动作 141「设置窗口可见」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口可见为@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 可见: 默认 "0" 可选值: 是|否
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=141
invert=0
arg0=0
*/

```

### 142 设置窗口是否可以重设大小

```
动作 142「设置窗口是否可以重设大小」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口是否可以重设大小:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 同意重设: 默认 "0" 可选值: 否|是
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=142
invert=0
arg0=0
*/

```

### 143 设置窗口是否位于其他窗口上面

```
动作 143「设置窗口是否位于其他窗口上面」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：设置窗口层次
参数提示：设置窗口 @0 位于其他窗口上面
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 位于上面: 默认 "0" 可选值: 是|否
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=143
invert=0
arg0=0
*/

```

### 144 设置窗口边框是否可见

```
动作 144「设置窗口边框是否可见」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口边框:@0 可见
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 显示边框: 默认 "0" 可选值: 显示|隐藏
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=144
invert=0
arg0=0
*/

```

### 145 设置窗口按钮是否可见

```
动作 145「设置窗口按钮是否可见」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口按钮 @0 可见
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 显示窗口按钮: 默认 "0" 可选值: 是|否
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=145
invert=0
arg0=0
*/

```

### 146 设置窗口边框颜色

```
动作 146「设置窗口边框颜色」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口边框颜色为:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [颜色] 颜色: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=146
invert=0
arg0=0
*/

```

### 147 设置窗口为默认设定

```
动作 147「设置窗口为默认设定」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置窗口为默认设定
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  （无参数）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=147
invert=0
*/

```

### 148 创建一个新文件夹

```
动作 148「创建一个新文件夹」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：创建一个新文件夹为:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 文件夹地址: 默认 "'c:/foldername'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=148
invert=0
arg0='c:/foldername'
*/

```

### 149 设置鼠标类型

```
动作 149「设置鼠标类型」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置鼠标类型为:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 鼠标: 默认 "0" 可选值: 默认|不显示|箭头|十字|工形|右斜双箭头|垂直双箭头|左斜双箭头|水平双箭头|上箭头|沙漏|拖拽选中|不能拖拽|水平分离|垂直分离|复数拖拽选中|SQL等待|拒绝|载入|帮助|手指|全向箭头
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=149
invert=0
arg0=0
*/

```

### 150 设置鼠标位置

```
动作 150「设置鼠标位置」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置鼠标位置为 @r (@0,@1)
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] x: 默认 "0"
  arg1 [表达式] y: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=150
invert=0
arg0=0
arg1=0
*/

```

### 152 区域截图

```
动作 152「区域截图」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：区域截图并保存为:@0 x:@1 y:@2 宽:@3 高:@4
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 文件地址: 默认 "'snapshot.bmp'"
  arg1 [表达式] x: 默认 "0"
  arg2 [表达式] y: 默认 "0"
  arg3 [表达式] 宽: 默认 "0"
  arg4 [表达式] 高: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=152
invert=0
arg0='snapshot.bmp'
arg1=0
arg2=0
arg3=0
arg4=0
*/

```

### 138 阻止截图  [位于Step]

```
动作 138「阻止截图  [位于Step]」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：阻止截图
参数提示：阻止截图
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 拷贝文本: 默认 "'copyrighted!'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=138
invert=0
arg0='copyrighted!'
*/

```

### 999 功能

```
动作 999「功能」 — 增强二（09_advance_2.lib，lib_id=740409）
类型：分组标题（kind 10）｜执行：无（IDE 按 id 硬编码转换）
适用对象(applies_to)：可选｜可相对(relative)：是｜条件动作(question)：否
参数：无（该 kind 不走 arg0..N 参数行）
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=999
relative=0
applies_to=self
*/

```

### 153 显示消息

```
动作 153「显示消息」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：显示消息: @0
参数提示：显示消息: @0 按钮 @1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] 文本: 默认 "'Message'"
  arg1 [表达式] 按钮名: 默认 "'OK'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=153
invert=0
arg0='Message'
arg1='OK'
*/

```

### 154 设置消息标题

```
动作 154「设置消息标题」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置消息标题状态 @0 文本为:@1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [菜单] 标题: 默认 "0" 可选值: 隐藏|显示
  arg1 [表达式] 文本: 默认 "'Notice!'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=154
invert=0
arg0=0
arg1='Notice!'
*/

```

### 155 设置消息背景和按钮图片

```
动作 155「设置消息背景和按钮图片」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：设置消息背景@0 和按钮图片@1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [背景] 背景: 默认 "-1"
  arg1 [精灵] 按钮: 默认 "-1"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=155
invert=0
arg0=-1
arg1=-1
*/

```

### 159 从文件载入游戏信息

```
动作 159「从文件载入游戏信息」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：从文件载入游戏信息 @0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 文件地址: 默认 "'c:/info.rtf'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=159
invert=0
arg0='c:/info.rtf'
*/

```

### 163 发送E-mail

```
动作 163「发送E-mail」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：发送E-mail给:@0
参数提示：发送E-mail给:@0 , 题目:@1 内容:@2
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 地址: 默认 "'bilvdehu@163.com'"
  arg1 [表达式] 题目: 默认 "'subject'"
  arg2 [表达式] 内容: 默认 "'Leave blank for no message'"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=163
invert=0
arg0='bilvdehu@163.com'
arg1='subject'
arg2='Leave blank for no message'
*/

```

### 164 显示文本文件

```
动作 164「显示文本文件」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：显示文本文件:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 文件地址: 默认 "'text.txt'"
  arg1 [布尔] 全屏: 默认 "0"
  arg2 [颜色] 背景色: 默认 "0"
  arg3 [表达式] 等待: 默认 "1000"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=164
invert=0
arg0='text.txt'
arg1=0
arg2=0
arg3=1000
*/

```

### 165 显示图片

```
动作 165「显示图片」 — 增强二（09_advance_2.lib，lib_id=740409）
参数提示：显示图片:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 图片地址: 默认 "'image.bmp'"
  arg1 [布尔] 全屏: 默认 "0"
  arg2 [表达式] 等待: 默认 "1000"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=165
invert=0
arg0='image.bmp'
arg1=0
arg2=1000
*/

```

### 167 在外壳中执行程序

```
动作 167「在外壳中执行程序」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：在外壳中执行程序:@0
参数提示：在外壳中执行程序:@0  参数 @1
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 执行程序地址: 默认 "'file.ext'"
  arg1 [表达式] 参数: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=167
invert=0
arg0='file.ext'
arg1=0
*/

```

### 168 运行EXE程序

```
动作 168「运行EXE程序」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：运行EXE程序:@0
参数提示：运行EXE文件:@0 参数:1 等待结束:@2
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [表达式] 程序地址: 默认 "'program.exe'"
  arg1 [表达式] 参数: 默认 "0"
  arg2 [布尔] 等待结束: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=168
invert=0
arg0='program.exe'
arg1=0
arg2=0
*/

```

### 169 运行 MCI 控制

```
动作 169「运行 MCI 控制」 — 增强二（09_advance_2.lib，lib_id=740409）
动作列表显示：运行 MCI 控制:@0
参数提示：运行 MCI 控制:@0
类型：普通（kind 0）｜执行：代码
适用对象(applies_to)：无此概念｜可相对(relative)：否｜条件动作(question)：否
参数：
  arg0 [字符串或表达式] string: 默认 "0"
YYD ACTION 模板（可直接粘进对象 .gml 的事件段，参数值按需替换）：
/*"/*'/**//* YYD ACTION
lib_id=740409
action_id=169
invert=0
arg0=0
*/

```
