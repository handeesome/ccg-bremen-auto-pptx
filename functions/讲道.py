from .helper import *

"""
第七部分 启应经文
"""


def partNine(prs, title, preacher, verses):
    slide = newSlide(prs, '讲道')
    txBox = addTextBox(slide, 0.12, 4.14, 25.15, 5.39)
    txBox.text_frame.vertical_anchor = MSO_ANCHOR.BOTTOM
    p = txBox.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = title
    setFont(p, 60)

    txBox = addTextBox(slide, 0.12, 10.28, 25.12, 3.42)
    p = txBox.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = '证道：' + preacher
    setFont(p, 32)
    p = txBox.text_frame.add_paragraph()
    p.alignment = PP_ALIGN.CENTER
    p.text = '经文：' + verses
    setFont(p, 32)
    p.space_before = Pt(12)
    return slide
