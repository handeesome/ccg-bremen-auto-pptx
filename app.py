from flask import Flask, render_template, request, jsonify
from functions.generate_pptx import generate_pptx
import webview
from pptx import Presentation
import os
import sys
def get_executable_dir():
    if getattr(sys, 'frozen', False):
        # Get the path to the templates folder in the temporary extraction directory
        working_folder = os.path.join(sys._MEIPASS)
    else:
        # Use a relative path if running in a regular Python environment
        working_folder = os.path.join(os.getcwd())
    return working_folder

 
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
    #   dirpath = get_executable_dir()
    #   templatepath = os.path.join(get_executable_dir(),'docs','template.pptx')
      destination = os.path.dirname(os.path.abspath(sys.executable))
      generate_pptx('docs/template.pptx', destination, config=data_from_js)

      return jsonify({'message': 'Data received successfully'})

if __name__ == '__main__':
   dirPath = get_executable_dir()
   os.chdir(dirPath)
   webview.start()