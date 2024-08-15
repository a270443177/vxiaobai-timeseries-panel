# Grafana Basic Panel Plugin example

[feature-request] Labels/metadata on tooltips   

说明：
   主要解决在ToolTip中增加Label标签的功能
   其余功能不变


1. 下载Plane插件:

   ```bash
   wget https://github.com/a270443177/vxiaobai-timeseries-panel/releases/download/3.0/vxiaobai-timeseries-panel.zip
   ```
2. 解压插件到grafana插件目录

      ```bash
   unzip  vxiaobai-timeseries-panel.zip
   ```

4. 修改grafana.ini配置文件

      ```bash
   
   allow_loading_unsigned_plugins = vxiaobai-timeseries-panel

   ```

3. 重启grafana
      ```bash
   根据自行情况重启

   ```

4. 面板选择

      ```bash
   选择面板为Time Series+
   ```
