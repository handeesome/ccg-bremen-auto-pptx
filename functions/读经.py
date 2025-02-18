from .helper import *

"""
第八部分 读经
"""

def partEight(prs, verseLines):
    firstSlide = newSlide(prs, '读经')
    fullNames = '\n'.join(verses["fullName"] for verses in verseLines)
    newCenterBox(firstSlide, fullNames)

    for verses in verseLines:
        verse = parseVerses(verses)
        abbrName = verses["abbrName"]
        title = '读经（' + abbrName + '）'
        itemsPagesHasSpace(prs, title, verse, charPerLine=15)
        # itemsPages(prs, title, chunk[2], fontSize=36)
        
