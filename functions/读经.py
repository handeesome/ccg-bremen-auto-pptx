from .helper import *

"""
第八部分 读经
"""

def partEight(prs, verseLines):
    firstSlide = newSlide(prs, '读经')
    chunks = parseVerses(verseLines)
    fullNames = '\n'.join([chunk[0] for chunk in chunks])
    newCenterBox(firstSlide, fullNames)

    for chunk in chunks:
        abbrName = chunk[1]
        title = '读经（' + abbrName + '）'
        itemsPagesHasSpace(prs, title, chunk[2], charPerLine=15)
        # itemsPages(prs, title, chunk[2], fontSize=36)
        
