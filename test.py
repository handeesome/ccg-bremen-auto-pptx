def parseVerses(verses, isQiYing=False):
    verseArr = []
    verseFrom = int(verses["verseFrom"])
    for verse in verses["fullVerse"]:
        if isQiYing:# 启应经文 needs the verses without verse numbers
            verseArr.append(verse[1])
        else:
            verseArr.append(str(verseFrom) +' '+verse[1])
            verseFrom += 1
    return verseArr
    
obj = {'book': '创世记', 'chapter': '2', 'verseFrom': '1', 'verseTo': '2', 'fullVerse': [['创2:1', '天地万物都造齐了。'], ['创2:2', '到第七日，神造物的工已经完毕，就在第七日歇了他一切的工，安息了。']], 'fullName': '创世记 2:1-2', 'abbrName': '创 2:1', 'abbr': '创'}
print(parseVerses(obj)) # ['1 创2:1 天地万物都造齐了。', '2 创2:2 到第七日，神造物的工已经完毕，就在第七日歇了他一切的工，安息了。']