from functions.helper import *

verses = "$马太福音 3:7-10\n太3:7 约翰看见许多法利赛人和撒都该人也来受洗，就对他们说：毒蛇的种类！谁指示你们逃避将来的忿怒呢？\n太3:8 你们要结出果子来，与悔改的心相称。\n太3:9 不要自己心里说：有亚伯拉罕为我们的祖宗。我告诉你们，神能从这些石头中给亚伯拉罕兴起子孙来。\n太3:10 现在斧子已经放在树根上，凡不结好果子的树就砍下来，丢在火里。"
chunks = parseVerses(verses, isQiYing=True)
for chunk in chunks:
    groups = verseGroup(chunk[2], isQiYing=True)
    for group in groups:
        text = group[0]
        delimiters = ['，', '。', '：', '；', '？']
        substrings = []
        i = 0
        while i < len(text):
                line = text[i:i+15]
                if substrings and line[0] in delimiters:
                # If the first character of the line is a delimiter, append it to the previous line
                        substrings[-1] += line[0]
                        i += 1  # Move to the next character
                else:
                # Otherwise, add the line as a new entry
                        substrings.append(line)
                        i += 15  # Move to the next line
        print(substrings)