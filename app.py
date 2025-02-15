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

# Store the current working directory in the app's context
app.config['CWD'] = os.getcwd()

@app.route('/')
def home():
   return render_template('index.html')

@app.route('/process-form',methods = ['POST'])
def procee_from():
    try:
        data = request.json  
        if not data:
            return jsonify({"error": "No JSON received"}), 400
        # print(data_from_js)
        destination = app.config['CWD']
        # generate_pptx('docs/template.pptx', destination, config=data_from_js)
        print("Received data:", data)
        return jsonify({'message': 'Data received successfully'})

    except Exception as e:
        return jsonify({"error": str(e)}), 400
if __name__ == '__main__':
   dirPath = get_executable_dir()
   os.chdir(dirPath)
   app.run(debug = True)
#    webview.start()