from .helper import *


"""
第十五部分 欢迎新朋友
"""


def partFifteen(prs):
    slide = newSlide(prs, '欢迎')
    content = '新朋友自我介绍''\n\n欢迎你来到我们中间\n不莱梅华人基督教会热烈欢迎你'
    txBox = newCenterBox(slide, content, 32)
    p = txBox.text_frame.paragraphs[0]
    setFont(p.runs[0], 42, fontName='华文细黑')
    p.runs[1].font.color.rgb = RGBColor(0xCC, 0x00, 0x00)
    p.runs[2].font.color.rgb = RGBColor(0xCC, 0x00, 0x00)

    slide = newSlide(prs, '欢迎歌')
    lyrics = """我们欢迎你 真欢迎你
在主里诚心欢迎
哈利路亚
我们欢迎你 真欢迎你
在主里诚心欢迎"""
    txBox = newCenterBox(slide, lyrics, 42)
    addAudio(slide, 'docs/欢迎歌.mp3')
