from .helper import *


"""
第十二部分 活动报告
"""


def partTwelve(prs, items, isBirthday=False, birthdayList=None):
    slide = newSlide(prs, '')
    txBox = newCenterBox(slide, '活动报告')
    txBox.text_frame.paragraphs[0].font.color.rgb = RGBColor(0x2E, 0x75, 0xB6)

    title = '活动报告'

    # itemsPagesHasSpace(prs, title, items, 18, fontSize=30, isNumber=True)
    itemsPages(prs, title, items, fontSize=30,
               isNumber=True, character_limit=150)
    # add birthday page
    if isBirthday:
        slide = newSlide(prs, title)
        txBox = addTextBox(slide, 1.72, 4.5, 21.8, 14.55)
        p = txBox.text_frame.paragraphs[0]
        p.text = '本月寿星：' + birthdayList
        setFont(p, 30)
        addAudio(slide, 'docs/生日歌.mp3')
