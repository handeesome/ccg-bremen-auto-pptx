from .helper import *


"""
第十三部分 每月金句
"""


def partThirteen(prs, month, verseLines):
    chinese_numbers = ["一", "二", "三", "四", "五",
                       "六", "七", "八", "九", "十", "十一", "十二"]
    if 1 <= month <= 12:
        month = chinese_numbers[month - 1]
    else:
        ValueError("Invalid input, must be between 1 and 12.")
    title = month + '月份金句'
    fullName = verseLines[0]["fullName"]
    verses = [verses[1] for verses in verseLines[0]["fullVerse"]]
    slide = newSlide(prs, title)
    txBox = addTextBox(slide, 1.72, 4.5, 21.8, 14.55)
    p = txBox.text_frame.paragraphs[0]
    p.text = ''.join(verses)
    setFont(p, 30)
    p = txBox.text_frame.add_paragraph()
    p.text = fullName
    setFont(p, 30)
    p.alignment = PP_ALIGN.RIGHT

    return slide
