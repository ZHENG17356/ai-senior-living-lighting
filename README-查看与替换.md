# LUMA / Many People 展示版本

本版本从 GitHub 原版创建，后续开发分支统一使用 `luma-development`。通过该分支的 Vercel Preview Deployment 预览；只有得到用户明确确认后才允许合并到 `main` 或更新正式网站。

这是无构建步骤的静态网站：项目根目录的 `index.html` 为入口，使用 `css/`、`js/` 和 `assets/`。Vercel 应使用静态站点配置（Framework Preset 为 Other；不要把本地 `dist/` 设为此分支的输出目录）。本地 `dist/` 与 `.openai/` 是先前预览尝试留下的文件，已保留并通过 `.gitignore` 排除。

## 最简单的查看方式

1. 在 Windows 文件资源管理器中右键 ZIP →「全部解压」。
2. 打开解压后的 `luma-project-preview` 文件夹。
3. 双击 `index.html`，用 Edge 或 Chrome 打开。页面不需要安装依赖，可以离线查看。
4. 点击页眉的「Many People」直接进入新项目；手机上使用「MENU」。

如需编辑，在 VS Code 中「文件 → 打开文件夹」，选择整个 `luma-project-preview` 文件夹。安装了 Live Server 的情况下，可以右键 `index.html` →「Open with Live Server」。

请不要把 ZIP 作为文本文件直接放进编辑器打开。

## 展示顺序

LUMA 首页与理念 → 理念到项目的过渡 → Many People 项目介绍 → 全院照明示意总览 → 廊下、共用空间、居室三个对比章节 → 总结 → 一日时间轴 → 系统框架 → 三种传感器场景 → 结尾。

## 以后怎样替换照片

图片放在 `assets/images/demo/`。用自己的 JPG 覆盖下列同名文件即可，无需改代码：

| 空间 | 现状照片 | 自己的3D渲染 |
| --- | --- | --- |
| 廊下 | corridor-before.jpg | corridor-proposal.jpg |
| 共用空间 | lounge-before.jpg | lounge-proposal.jpg |
| 居室 | bedroom-before.jpg | bedroom-proposal.jpg |

项目开头横幅还引用了 `lounge-proposal.jpg`；总览侧栏也会使用所选空间对应的 `*-proposal.jpg`。

建议图片至少 1400px 宽，横向构图更适合版式。替换时尽量让同一空间的现场照片和渲染使用一致的相机位置。现在的素材来自不同空间，所以采用并排展示，手机端采用现状／提案按钮切换。

替换为正式素材后，请同时更新 `index.html` 中相应图片的 `alt` 描述，移除对应的临时图片标签，并把「现地で確かめること」改成已确认的问题。保留仍然属于示意内容的说明。

全部临时图的来源记录在 `assets/images/demo/ASSET-SOURCES.md`，页面页脚也有来源。

## 以后怎样替换整体图

`index.html` 中搜索 `class="floorplan-svg"`。这个 SVG 是仮配置的空间示意，不是 Many People 的真实图纸。可以在获得真实平面或俯视渲染后，将这个 SVG 替换为 `<img>`，保留外层 `.plan-map` 与三个热点按钮。

热点位置在 `css/project.css`：`.hotspot-corridor`、`.hotspot-lounge`、`.hotspot-bedroom`，通过 `top` / `left` 百分比定位。

现有昼夜灯光切换针对 SVG 内的 `.ambient-light`、`.route-light`、`.bed-light` 图层；替换为单张渲染图片时，需要提供日／夜两张渲染或重新配置叠加光层。

## 主要文件

- `index.html`：内容、全院 SVG 示意图、照片对比。
- `css/style.css`：原有 LUMA 样式。
- `css/project.css`：新项目版式、整体图、移动布局与可读性调整。
- `css/scenarios.css` / `js/scenarios.js`：三种连续场景动画。
- `js/main.js`：原首页滚动和一日时间轴。
- `js/project.js`：总览热点、日夜切换、照片对比和手机导航。

## 检查情况

已检查 HTML 结构、本地资源路径、页面锚点、JavaScript 语法与交互逻辑。当前执行环境的内置浏览器无法访问本地服务，且禁止 file:// 预览，因此尚未完成实际浏览器的视觉检查。请在本机打开后确认字体、间距及各尺寸效果。
