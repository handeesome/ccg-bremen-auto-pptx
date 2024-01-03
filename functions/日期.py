"""
第二部分 日期
如果是第一周便改成 "圣餐崇拜"
"""


def partTwo(slide, year, month, day, communion=False):
    shape = slide.shapes[1]
    date = shape.text_frame.paragraphs[0]
    date.runs[0].text = year
    date.runs[2].text = month
    date.runs[4].text = day

    shape = slide.shapes[2]

    if communion == True:
        shape.text_frame.paragraphs[0].runs[0].text = '圣餐崇拜'
    return slide
