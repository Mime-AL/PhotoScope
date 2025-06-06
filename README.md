# PhotoScope
A Photoshop plug-in for add vectorscope and waveformscope.

***
## summary
This plugin requires **fullaccess permission** for automatic compute server startup! You can remove permissions and start the server manually; automatic startup is only available for Windows.

为了自动启动计算服务器，本插件需要**完全访问权限**！你可以移除权限，并且手动启动服务器，自动启动功能仅可用于windows。

This plugin uses WebSocket to send Photoshop images to a server for vectorscope and wavefromscope result calculation and displays the results within the panel. It supports both CUDA acceleration and CPU computation.

本插件使用websocket将photoshop图像传输至服务器计算示波器结果并显示在面板中。支持CUDA加速和CPU计算。

## Requirements
- Python 3.10 or later
- Photoshop CC 2023 or later
- CUDA 11.8 or later (for windows and GPU version)

## TODO
- plug-in websocket transfer
- all calculate server function

## Acknowledgment
vectorscope background photo is from Wikipedia (https://commons.wikimedia.org/w/index.php?title=File:Vectorscope_graticule.png&oldid=631836838)
