"""
第一部分 今日事奉名单
"""


def partOne(slide, r1, r2, r3, r4, r5):
    """
    parameters:
    r1: 证道
    r2: 司会
    r3: PPT
    r4: 接待
    r5: 儿童主日学
    """
    shape = slide.shapes[1]
    table_values = [r1, r2, r3, r4, r5]
    rows = shape.table.rows

    for i in range(5):
        cell = rows[i+1].cells[1]
        new_text = table_values[i]
        cell.text_frame.paragraphs[0].runs[0].text = new_text
    return slide
