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
from functions.启应经文 import partSix
from functions.主祷文 import partSeven
from functions.读经 import partEight
from functions.讲道 import partNine
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


def generate_pptx(templatePath, destination, config):
    prs = Presentation(templatePath)
    # 今日事奉名单
    slide = prs.slides[0]
    证道 = config['zhengdao1'] + ' ' + config['suffixZhengdao1']
    司会 = config['sihui1'] + ' ' + config['suffixSihui1']
    PPT = config['ppt1'] + ' ' + config['suffixPpt1']
    场务 = config['changwu1'] + ' ' + config['suffixChangwu1']
    接待 = config['jiedai1'] + ' ' + config['suffixJiedai1']
    儿童主日学 = config['ertongxue1'] + ' ' + config['suffixErtongxue1']
    partOne(slide, 证道, 司会, PPT, 场务, 接待, 儿童主日学)

    # 日期
    slide = prs.slides[1]
    date = config['date1'].split('-')
    year = date[0]
    month = date[1]
    day = date[2]
    partTwo(slide, year, month, day, communion=False)

    # 主在圣殿中
    partThree(prs)

    # 宣召
    xuanzhaoLines = config['xuanzhaoLines']
    partFour(prs, xuanzhaoLines)

    # 敬拜赞美 TODO

    # 启应经文
    qiyingLines = config['qiyingLines']
    partSix(prs, qiyingLines)

    # 主祷文
    partSeven(prs)

    # 读经 
    dujingLines = config['dujingLines']
    partEight(prs, dujingLines)

    # 讲道
    title = config['jiangdaotimu']
    经文 = config['dujing']
    partNine(prs, title, 证道, 经文)

    # 回应诗歌 TODO

    # 奉献回应礼
    fengxianjingwen = config['fengxianjingwen']
    partEleven(prs, fengxianjingwen)

    # 活动报告
    counter = 1
    items = []
    while(True):
        key = 'huodongbaogao'+str(counter)
        if key in config:
            items.append(config['huodongbaogao'+str(counter)])
            counter +=1
        else:
            break
    partTwelve(prs, items, isBirthday=config['birthday']=='true', birthdayList=config['birthdayList'])

    # 每月金句
    jinjuLines = config['meiyuejinjuLines']
    partThirteen(prs, int(month), jinjuLines)

    # 下周事奉名单
    日期 = config['date2']
    主题 = config['zhuti']
    证道 = config['zhengdao2'] + config['suffixZhengdao2']
    经文 = config['jingwen']
    司会 = config['sihui2'] + config['suffixSihui2']
    PPT = config['ppt2'] + config['suffixPpt2']
    场务 = config['changwu2'] + config['suffixChangwu2']
    接待 = config['jiedai2'] + config['suffixJiedai2']
    儿童主日学 = config['ertongxue2'] + config['suffixErtongxue2']
    partFourteen(prs, 日期, 主题, 证道, 经文, 司会, PPT, 场务, 接待, 儿童主日学)

    # 欢迎新朋友
    partFifteen(prs)

    # 圣餐礼
    shengcanSong = config['shengcan']
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
    counter = 1
    prayerWorld = []
    while(True):
        key = 'daogaoshijie'+str(counter)
        if key in config:
            prayerWorld.append(config['daogaoshijie'+str(counter)])
            counter +=1
        else:
            break
    counter = 1
    prayerChurch = []
    while(True):
        key = 'daogaojiaohui'+str(counter)
        if key in config:
            prayerChurch.append(config['daogaojiaohui'+str(counter)])
            counter +=1
        else:
            break
    partTwentyOne(prs, prayerWorld, prayerChurch)

    os.chdir(destination)
    fileName = config['date1'] + '.pptx'
    prs.save(fileName)
    print(fileName + "生成成功，请在app文件夹中查看")

