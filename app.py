from flask import Flask, request, jsonify, render_template, make_response
import os
import json
from datetime import datetime
import time

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['JSON_AS_ASCII'] = False

def ensure_files_exist():
    if not os.path.exists('code.txt'):
        with open('code.txt', 'w', encoding='utf-8') as f:
            f.write('user0:xcbdybc\nuser1:123\nuser2:345')
    
    if not os.path.exists('cipher.txt'):
        with open('cipher.txt', 'w', encoding='utf-8') as f:
            f.write('123456')
    
    if not os.path.exists('log.txt'):
        with open('log.txt', 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False)

def read_manager_codes():
    with open('code.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    codes = {}
    for line in lines:
        if ':' in line:
            user, pwd = line.strip().split(':')
            codes[user] = pwd
    return codes

def read_class_cipher():
    with open('cipher.txt', 'r', encoding='utf-8') as f:
        return f.read().strip()

def read_logs():
    if os.path.exists('log.txt'):
        with open('log.txt', 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except:
                return []
    return []

def write_log(log_entry):
    logs = read_logs()
    logs.append(log_entry)
    with open('log.txt', 'w', encoding='utf-8') as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        codes = read_manager_codes()
        if username in codes and codes[username] == password:
            response = make_response(jsonify({'status': 'success'}))
            response.set_cookie('manager', username, max_age=30*24*60*60)
            return response
        return jsonify({'status': 'error', 'message': '用户名或密码错误'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/verify_class_cipher', methods=['POST'])
def verify_class_cipher():
    try:
        data = request.get_json()
        input_cipher = data.get('cipher')
        correct_cipher = read_class_cipher()
        
        if input_cipher == correct_cipher:
            response = make_response(jsonify({'status': 'success'}))
            response.set_cookie('class_access', 'true', max_age=30*24*60*60)
            return response
        return jsonify({'status': 'error', 'message': '班级密码错误'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/add_score', methods=['POST'])
def add_score():
    try:
        if not request.cookies.get('manager'):
            return jsonify({'status': 'error', 'message': '未登录'})
        
        data = request.get_json()
        log_entry = {
            'type': 'add',
            'group': data.get('group'),
            'score': float(data.get('score')),
            'reason': data.get('reason'),
            'operator': request.cookies.get('manager'),
            'target': data.get('target'),
            'timestamp': datetime.now().strftime('%d/%m/%H')
        }
        write_log(log_entry)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/deduct_score', methods=['POST'])
def deduct_score():
    try:
        if not request.cookies.get('manager'):
            return jsonify({'status': 'error', 'message': '未登录'})
        
        data = request.get_json()
        log_entry = {
            'type': 'deduct',
            'group': data.get('group'),
            'score': -abs(float(data.get('score'))),
            'reason': data.get('reason'),
            'operator': request.cookies.get('manager'),
            'target': data.get('target'),
            'timestamp': datetime.now().strftime('%d/%m/%H')
        }
        write_log(log_entry)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/get_scores')
def get_scores():
    try:
        logs = read_logs()
        has_class_access = request.cookies.get('class_access') == 'true'
        
        groups_scores = {str(i): {'add': 0, 'deduct': 0} for i in range(1, 6)}
        for log in logs:
            group = str(log['group'])
            score = float(log['score'])
            if score > 0:
                groups_scores[group]['add'] += score
            else:
                groups_scores[group]['deduct'] += score

        total_scores = {group: data['add'] + data['deduct'] 
                       for group, data in groups_scores.items()}
        
        if total_scores:
            max_score = max(total_scores.values())
            # 找出所有得分等于最高分的组
            leading_groups = [group for group, score in total_scores.items() 
                            if score == max_score]
        else:
            leading_groups = ['1']
        
        response = {
            'groups_scores': groups_scores,
            'leading_groups': leading_groups,
            'logs': logs if has_class_access else [
                {k: v for k, v in log.items() 
                 if k not in ['operator', 'target']} 
                for log in logs
            ]
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/get_period_leaders', methods=['POST'])
def get_period_leaders():
    try:
        if not request.cookies.get('class_access'):
            return jsonify({'status': 'error', 'message': '需要班级访问权限'})
        
        data = request.get_json()
        period_type = data.get('type')
        logs = read_logs()
        
        current_time = time.time()
        time_ranges = {
            'week': 7 * 24 * 3600,
            'month': 30 * 24 * 3600,
            'quarter': 90 * 24 * 3600
        }
        
        period_logs = []
        for log in logs:
            try:
                log_time = time.mktime(time.strptime(log['timestamp'], '%d/%m/%H'))
                if current_time - log_time <= time_ranges[period_type]:
                    period_logs.append(log)
            except:
                continue
        
        groups_scores = {str(i): 0 for i in range(1, 6)}
        for log in period_logs:
            if str(log['group']) in groups_scores:
                groups_scores[str(log['group'])] += float(log['score'])
        
        if groups_scores:
            leading_group = max(groups_scores.items(), key=lambda x: x[1])[0]
        else:
            leading_group = '1'
        
        return jsonify({
            'status': 'success',
            'leading_group': leading_group,
            'scores': groups_scores
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    ensure_files_exist()
    app.run(debug=True)