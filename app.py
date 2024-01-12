from flask import Flask, render_template, request, jsonify
from functions.generate_pptx import generate_pptx
import webview
from pptx import Presentation
import os
import sys
def get_executable_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

 
app = Flask(__name__, static_folder='./static', template_folder='./templates')
window = webview.create_window('app', app)

@app.route('/')
def home():
   return render_template('index.html')

@app.route('/result',methods = ['POST'])
def result():
    if request.method == 'POST':
      data_from_js = request.json  # Assuming the data is sent as JSON
      # print(data_from_js)
      templatepath = os.path.join(get_executable_dir(),'docs','template.pptx')
      generate_pptx(templatepath, config=data_from_js)

      return jsonify({'message': 'Data received successfully'})

if __name__ == '__main__':
   dirPath = get_executable_dir()
   os.chdir(dirPath)
   webview.start()