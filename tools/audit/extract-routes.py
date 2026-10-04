"""从前端 router 提取全部路由，路径参数用样例值填充。供巡检脚本使用。"""
import re
import sys
import os

SAMPLE = {
    'id': '1', 'userId': '2', 'teamId': '1', 'competitionId': '1',
    'majorId': '21', 'collegeId': '4', 'groupId': '1',
    'questionId': '1', 'answerId': '1', 'stageId': '1',
}


def extract(router_path):
    src = open(router_path, encoding='utf-8').read()
    out = []
    for p in re.findall(r"path:\s*'([^']+)'", src):
        if p == '*':
            continue
        p = re.sub(r':(\w+)', lambda m: SAMPLE.get(m.group(1), '1'), p)
        # 顶层路由写成 '/login'，子路由写成 'dashboard'，统一去掉前导斜杠，
        # 调用方按 '<base>/<route>' 拼接，避免出现 '//login'
        out.append(p.lstrip('/'))
    return list(dict.fromkeys(out))


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    default = os.path.join(here, '..', '..', 'web', 'src', 'router', 'index.tsx')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    path = args[0] if args else default
    routes = extract(path)
    if '--count' in sys.argv:
        print(len(routes))
    else:
        print(' '.join(routes))
