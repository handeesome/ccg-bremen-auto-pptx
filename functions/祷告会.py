from .helper import *


"""
第二十一部分 祷告会
"""


def partTwentyOne(prs, prayersWorld, prayersChurch):
    slide = newSlide(prs, '')
    slide.shapes.add_picture('docs/封面.png', 0, 0, Cm(25.4), Cm(19.05))
    txBox = addTextBox(slide, 7.23, 4.55, 10.95, 3.08)
    p = txBox.text_frame.paragraphs[0]
    p.text = '祷告会'
    setFont(p, 66)
    p.alignment = PP_ALIGN.CENTER
    p.font.bold = True

    titleWorld = '祷告事项：世界及社会'
    titleChurch = '祷告事项：教会及个人'
    # slide = newSlide(prs, titleWorld)
    # txBox = addTextBox(slide, 1.72, 3.45, 21.8, 15.61)
    # p = txBox.text_frame.paragraphs[0]

    # add numbers for each item
    # itemsPagesHasSpace(prs, titleWorld, prayersWorld,
    #                    18, fontSize=30, isNumber=True)
    # itemsPagesHasSpace(prs, titleChurch, prayersChurch,
    #                    18, fontSize=30, isNumber=True)
    itemsPages(prs, titleWorld, prayersWorld, fontSize=30,
               isNumber=True, character_limit=150)
    itemsPages(prs, titleChurch, prayersChurch, fontSize=30,
               isNumber=True, character_limit=150)
