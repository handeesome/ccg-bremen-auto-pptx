import os
from pptx import Presentation
from pptx.enum.text import PP_ALIGN
from pptx.enum.text import MSO_ANCHOR
from functions.helper import *
import re
from functions.今日事奉名单 import partOne
from functions.日期 import partTwo
from functions.主在圣殿中 import partThree
from functions.宣召 import partFour
from functions.敬拜赞美 import partFive
from functions.启应经文 import partSeven
from functions.主祷文 import partSix
from functions.读经 import partEight
from functions.讲道 import partNine
from functions.回应诗歌 import partTen
from functions.奉献回应礼 import partEleven
from functions.活动报告 import partTwelve
from functions.每月金句 import partThirteen
from functions.下周事奉名单 import partFourteen
from functions.欢迎新朋友 import partFifteen
from functions.圣餐礼 import partSixteen
from functions.三一颂 import partSeventeen
from functions.牧师祝福 import partEighteen
from functions.阿们颂 import partNineteen
from functions.默祷 import partTwenty
from functions.祷告会 import partTwentyOne


def generate_pptx(templatePath, formData):
    prs = Presentation(templatePath)
    # 今日事奉名单
    slide = prs.slides[0]
    证道 = ''.join(formData['thisWeekListzhengDao'])
    司会 = ''.join(formData['thisWeekListsiHui'])
    PPT = ''.join(formData['thisWeekListppt'])
    接待 = ''.join(formData['thisWeekListjieDai'])
    儿童主日学 = ''.join(formData['thisWeekListerTong'])
    partOne(slide, 证道, 司会, PPT, 接待, 儿童主日学)

    # 日期
    slide = prs.slides[1]
    date = formData['date1'].split('-')
    year = date[0]
    month = date[1]
    day = date[2]
    partTwo(slide, year, month, day, communion=formData['shengcan']!="None")

    # 主在圣殿中
    partThree(prs)

    # 宣召
    xuanzhaoLines = formData['xuanzhaoLines']
    partFour(prs, xuanzhaoLines)

    # 敬拜赞美 
    songOne = formData['songOne']
    songTwo = formData['songTwo']
    songThree = formData['songThree']
    partFive(prs, songOne, songTwo, songThree)

    # 为儿童祷告
    slide = newSlide(prs, '')
    slide.shapes.add_picture('docs/为儿童祷告.jpg', 0, 0, Cm(25.4), Cm(19.05))
    # 主祷文
    partSix(prs)

    # 启应经文
    qiyingLines = formData['qiyingLines']
    partSeven(prs, qiyingLines)

    # 读经 
    dujingLines = formData['dujingLines']
    partEight(prs, dujingLines)
    # 讲道
    title = formData['jiangdaotimu']
    经文 = formData['dujing']
    partNine(prs, title, 证道, 经文)

    # 回应诗歌 
    songHuiying = formData['songHuiying']
    partTen(prs, songHuiying)

    # 奉献回应礼
    fengxianjingwen = formData['fengxianjingwen']
    partEleven(prs, fengxianjingwen)

    # 活动报告
    pattern = r'\d+\.\s'
    reports = re.split(pattern, formData['huodongbaogao'])
    reports = [item.strip() for item in reports if item.strip()]
    partTwelve(prs, reports, isBirthday=formData['birthday']=='true', birthdayList=formData['birthdayList'])

    # 每月金句
    jinjuLines = formData['meiyuejinjuLines']
    partThirteen(prs, int(month), jinjuLines)

    # 下周事奉名单
    日期 = formData['date2']
    主题 = formData['zhuti']
    证道 = formData['zhengdao2'] + formData['suffixZhengdao2']
    经文 = formData['jingwen']
    司会 = formData['sihui2'] + formData['suffixSihui2']
    PPT = formData['ppt2'] + formData['suffixPpt2']
    接待 = formData['jiedai2'] + formData['suffixJiedai2']
    儿童主日学 = formData['ertongxue2'] + formData['suffixErtongxue2']
    partFourteen(prs, 日期, 主题, 证道, 经文, 司会, PPT, 接待, 儿童主日学)

    # 欢迎新朋友
    partFifteen(prs)

    # 圣餐礼
    shengcanSong = formData['shengcan']
    if shengcanSong != 'None':
        partSixteen(prs, shengcanSong)

    # 三一颂
    partSeventeen(prs)

    # 牧师祝福
    partEighteen(prs)

    # 阿们颂
    partNineteen(prs)

    # 默祷
    partTwenty(prs)

    # 祷告会
    pattern = r'\d+\.\s'
    prayerWorld = re.split(pattern, formData['daogaoshijie'])
    prayerWorld = [item.strip() for item in prayerWorld if item.strip()]
    prayerChurch = re.split(pattern, formData['daogaojiaohui'])
    prayerChurch = [item.strip() for item in prayerChurch if item.strip()]
    partTwentyOne(prs, prayerWorld, prayerChurch)

    os.chdir(destination)
    fileName = formData['date1'] + '.pptx'
    prs.save(fileName)
    print(fileName + "生成成功，请在" + destination + "中查看")

