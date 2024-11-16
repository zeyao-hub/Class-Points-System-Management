import os
import time
from datetime import datetime

def clear_log_if_monday():
    log_file = "log.txt"
    
    # 如果文件存在，清空文件内容
    if os.path.exists(log_file):
        with open(log_file, 'w') as file:
            file.truncate(0)  # 清空文件
        print(f"{log_file} 已清空 - {datetime.now()}")

# 持续运行
while True:
    now = datetime.now()
    
    # 检查是否是星期一凌晨（比如 00:00），仅执行一次
    if now.weekday() == 0 and now.hour == 0 and now.minute == 0:
        clear_log_if_monday()
        
        # 等待 60 秒，避免同一分钟内多次清空
        time.sleep(60)
    else:
        # 每隔一分钟检查一次
        time.sleep(60)
