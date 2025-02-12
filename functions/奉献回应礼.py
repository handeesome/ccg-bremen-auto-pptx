from .helper import *
import textwrap

"""
第十一部分 奉献回应礼
"""


def partEleven(prs, choice):
    _bankPage(prs)
    # choice must be 林后 9:6-7 or 罗12:1
    _versePage(prs, choice)
    _lyricsPage(prs)


def _cellText(table, row, col, text, fontSize, fontName='Calibri', isBold=False):
    table.rows[row].cells[col].text = text
    p = table.rows[row].cells[col].text_frame.paragraphs[0]
    if isBold:
        p.font.bold = True
    setFont(p, fontSize, fontName)


def _bankPage(prs):
    slide = newSlide(prs, '奉献回应礼')
    txBox = addTextBox(slide, 1.09, 3.94, 22.91, 15.11)
    p = txBox.text_frame.paragraphs[0]
    p.text = '教会奉献账号：'
    setFont(p, 34)
    p = txBox.text_frame.add_paragraph()
    p.text = '\n\n\n\n'
    p = txBox.text_frame.add_paragraph()
    p.text = '如果奉献给神学教育基金，请备注“10”'
    setFont(p, 34)


    # first table
    table = slide.shapes.add_table(
        2, 4, Cm(1.4), Cm(6.03), Cm(22.6), Cm(1.85)).table
    table.columns[0].width = 915240
    table.columns[1].width = 2722951
    table.columns[2].width = 1047136
    table.columns[3].width = 3451122

    _cellText(table, 0, 0, '户名：', 20, '宋体')
    _cellText(table, 0, 1, 'Chinesische Christliche Gemeinde Bremen e.V.', 20, isBold=True)
    _cellText(table, 0, 2, 'IBAN：', 20, isBold=True)
    _cellText(table, 0, 3, 'DE91 2905 0101 0084 0053 47', 20, isBold=True)
    _cellText(table, 1, 0, '银行：', 20, '宋体')
    _cellText(table, 1, 1, 'Sparkasse Bremen', 20)
    _cellText(table, 1, 2, 'BIC：', 20)
    _cellText(table, 1, 3, 'SBREDE22XXX', 20)
    # set first cell in second row as the cells in first row
    # i.e. blue back color and white font
    cell = table.rows[1].cells[0]
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(0x44, 0x72, 0xC4)
    cell.text_frame.paragraphs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # # second table
    # table = slide.shapes.add_table(
    #     2, 4, Cm(1.4), Cm(12.09), Cm(22.6), Cm(2.01)).table
    # table.columns[0].width = 915240
    # table.columns[1].width = 2722951
    # table.columns[2].width = 1047136
    # table.columns[3].width = 3451122

    # _cellText(table, 0, 0, '户名：', 20, '宋体')
    # _cellText(table, 0, 1, 'CCG Hamburg e.V', 20, isBold=True)
    # _cellText(table, 0, 2, 'IBAN：', 20, isBold=True)
    # _cellText(table, 0, 3, 'DE42200100200003351200', 20, isBold=True)
    # _cellText(table, 1, 0, '银行：', 20, '宋体')
    # _cellText(table, 1, 1, 'Postbank', 20)
    # _cellText(table, 1, 2, 'BIC：', 20)
    # _cellText(table, 1, 3, 'PBNKDEFF', 20)

    # cell = table.rows[1].cells[0]
    # cell.fill.solid()
    # cell.fill.fore_color.rgb = RGBColor(0x44, 0x72, 0xC4)
    # cell.text_frame.paragraphs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)


def _versePage(prs, choice):
    slide = newSlide(prs, '奉献回应礼')
    verse1 = [
        '“少种的少收，多种的多收”，这话是真的。各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。”', '林后 9:6-7']
    verse2 = ['“所以，弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的；你们如此事奉乃是理所当然的。”', '罗12:1']
    txBox = addTextBox(slide, 1.83, 4.5, 21.75, 14.55)
    p = txBox.text_frame.paragraphs[0]
    if choice == verse1[1]:
        p.text = verse1[0]
    elif choice == verse2[1]:
        p.text = verse2[0]
    else:
        raise ValueError('Invalid choice. Must be 林后 9:6-7 or 罗12:1')

    setFont(p, 34)
    p = txBox.text_frame.add_paragraph()
    p.text = choice
    setFont(p, 34)
    p.alignment = PP_ALIGN.RIGHT


def _lyricsPage(prs):
    
    #2024 奉献回应诗
    audioPath = 'docs/一切全献上.mp3'
    lyrics = textwrap.dedent("""
    [Page 1]
    主啊  我今完全献上
    一切所有归于祢
    一生行事尽依靠祢
    日日与祢不分离
                             
    [Page 2]
    一切全献上
    一切全献上
    我将所有全归耶稣
    一切全献上
    """)
    song = '奉献回应诗：一切全献上'
    lyricsPages(prs, song, lyrics, audioPath, titleFontSize=36)

    song = '奉献回应礼'
    lyrics = textwrap.dedent("""
    万物都是从主而来
    我们把从主而来的献给主
    阿们
    """)
    audioPath = 'docs/万物都是从主而来.WAV'
    lyricsPages(prs, song, lyrics, audioPath, isOnePage=True)
