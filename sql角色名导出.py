#云端读数据
import mysql.connector

# 云端数据库配置
config = {
    'host': 'sh-cynosdbmysql-grp-0gdb5fkg.sql.tencentcdb.com',  # 云端数据库的主机地址
    'user': 'root',        # 数据库用户名
    'password': 'Yushuhang=2002',# 数据库密码
    'database': 'paper_society',# 数据库名称
    'port': 28223,               # 默认端口号
}

# 连接到数据库
conn = mysql.connector.connect(**config)
cursor = conn.cursor()

# 执行查询
query = "SELECT name FROM girls"
cursor.execute(query)

# 保存到本地文件
with open("girls_names.txt", "w") as f:
    for name, in cursor.fetchall():
        f.write(name + "\n")

print("Data exported to girls_names.txt")
cursor.close()
conn.close()
