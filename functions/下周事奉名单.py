from .helper import *


"""
第十四部分 下周事奉名单
"""


def partFourteen(prs, r1, r2, r3, r4, r5, r6, r7, r8):
    """
        r1: 日期
        r2: 主题
        r3: 证道
        r4: 经文
        r5: 司会
        r6: PPT
        r7: 接待
        r8: 儿童主日学
    """
    slide = newSlide(prs, '下周事奉名单')
    table = slide.shapes.add_table(
        9, 2, Cm(4.81), Cm(4.73), Cm(15.77), Cm(12.81)).table
    table.columns[0].width = 1571911
    table.columns[1].width = 4106218

    _cellText(table, 0, 0, '日期', 20, isBold=True)
    _cellText(table, 1, 0, '主题', 20)
    _cellText(table, 2, 0, '证道', 20)
    _cellText(table, 3, 0, '经文', 20)
    _cellText(table, 4, 0, '司会', 20)
    _cellText(table, 5, 0, 'PPT', 20)
    _cellText(table, 6, 0, '接待', 20)
    _cellText(table, 7, 0, '儿童主日学', 20)

    table_values = [r2, r3, r4, r5, r6, r7, r8]
    for i in range(8):
        _cellText(table, i+1, 1, table_values[i], 20)
    _cellText(table, 0, 1, r1, 20, isBold=True)
    return slide


def _cellText(table, row, col, text, fontSize, isBold=False):
    table.rows[row].cells[col].text = text
    cell = table.rows[row].cells[col].text_frame
    p = cell.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE

    if isBold:
        p.font.bold = True
    setFont(p, fontSize)
