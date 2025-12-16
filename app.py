# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import sys
import requests
from dotenv import load_dotenv

# 设置Windows终端UTF-8编码（解决中文乱码问题）
if sys.platform == 'win32':
    try:
        # Python 3.7+
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python 3.6及以下
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 从环境变量获取API配置
API_KEY = os.getenv('AI_API_KEY', '')
API_URL = os.getenv('AI_API_URL', '')
MODEL = os.getenv('AI_MODEL', '')

# 自动补全API URL（如果只提供了基础URL）
if API_URL and not API_URL.endswith('/chat/completions'):
    if API_URL.endswith('/v1'):
        API_URL = API_URL + '/chat/completions'
    elif not API_URL.endswith('/'):
        API_URL = API_URL + '/chat/completions'
    else:
        API_URL = API_URL + 'chat/completions'

@app.route('/')
def index():
    """渲染主页面"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """处理聊天请求"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': '请求数据格式错误'}), 400
            
        user_message = data.get('message', '')
        print(f"收到消息: {user_message}")  # 调试日志
        
        if not user_message:
            return jsonify({'error': '消息不能为空'}), 400
        
        if not API_KEY:
            print("警告: API_KEY未配置")
            return jsonify({'error': 'API密钥未配置，请在.env文件中设置AI_API_KEY'}), 500
        
        if not API_URL:
            print("警告: API_URL未配置")
            return jsonify({'error': 'API地址未配置，请在.env文件中设置AI_API_URL'}), 500
        
        if not MODEL:
            print("警告: MODEL未配置")
            return jsonify({'error': '模型名称未配置，请在.env文件中设置AI_MODEL'}), 500
        
        # 调用AI API
        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': MODEL,
            'messages': [
                {'role': 'user', 'content': user_message}
            ],
            'temperature': 0.7,
            'max_tokens': 1000
        }
        
        print(f"调用AI API: {API_URL}, 模型: {MODEL}")
        response = requests.post(API_URL, json=payload, headers=headers, timeout=30)
        
        print(f"API响应状态: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            # 兼容不同的API响应格式
            if 'choices' in result and len(result['choices']) > 0:
                ai_message = result['choices'][0]['message']['content']
            elif 'data' in result and 'choices' in result['data']:
                ai_message = result['data']['choices'][0]['message']['content']
            else:
                print(f"未知的API响应格式: {result}")
                return jsonify({'error': 'API返回格式异常，请检查API配置'}), 500
            print(f"AI回复: {ai_message[:50]}...")  # 只打印前50个字符
            return jsonify({'message': ai_message})
        else:
            try:
                error_data = response.json()
                # 兼容不同的错误格式
                if isinstance(error_data.get('error'), dict):
                    error_msg = error_data['error'].get('message', 'API调用失败')
                elif isinstance(error_data.get('error'), str):
                    error_msg = error_data['error']
                else:
                    error_msg = error_data.get('message', f'HTTP {response.status_code}')
            except:
                error_msg = f'HTTP {response.status_code}: {response.text[:200]}'
            print(f"API错误: {error_msg}")
            return jsonify({'error': f'API错误: {error_msg}'}), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': '请求超时，请稍后重试'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'网络错误: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

