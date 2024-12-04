from pypinyin import pinyin, lazy_pinyin, Style
from collections import defaultdict

# 定义读取、排序和分组函数
def sort_and_group_names_by_pinyin(input_file, output_file):
    # 读取文件内容
    with open(input_file, "r", encoding="utf-8") as f:
        names = f.readlines()

    # 去掉换行符和多余空格
    names = [name.strip() for name in names if name.strip()]

    # 按拼音排序
    sorted_names = sorted(names, key=lambda x: ''.join(lazy_pinyin(x)))

    # 按拼音首字母分组
    grouped_names = defaultdict(list)
    for name in sorted_names:
        first_letter = lazy_pinyin(name)[0][0].upper()  # 获取拼音首字母并大写
        grouped_names[first_letter].append(name)

    # 将结果写入输出文件
    with open(output_file, "w", encoding="utf-8") as f:
        for letter in sorted(grouped_names.keys()):  # 按字母顺序写入
            f.write(letter + "\n")
            f.write("\n".join(grouped_names[letter]))
            f.write("\n\n")

# 调用函数
input_file = "girls_names.txt"  # 原始文件
output_file = "sorted_girls_names.txt"  # 按拼音分类后的文件
sort_and_group_names_by_pinyin(input_file, output_file)

print("Names have been sorted by pinyin and grouped into", output_file)
