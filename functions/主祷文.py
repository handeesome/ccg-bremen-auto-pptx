from .helper import *

"""
第七部分 启应经文
"""


def partSix(prs):
    slide = newSlide(prs, '主祷文')
    content = '我们在天上的父，\n愿人都尊你的名为圣。\n愿你的国降临。\n愿你的旨意行在地上，如同行在天上。\n我们日用的饮食，今日赐给我们。\n免我们的债，如同我们免了人的债。\n不叫我们遇见试探，救我们脱离凶恶。\n因为国度、权柄、荣耀，全是你的，\n直到永远。阿们。'
    txBox = addTextBox(slide, 2.91, 4.5, 20.9, 14.55)
    p = txBox.text_frame.paragraphs[0]
    p.text = content
    setFont(p, 32)
    return slide
