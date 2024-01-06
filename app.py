from flask import Flask, render_template, request, jsonify
from functions.generate_pptx import generate_pptx
import webview
from pptx import Presentation
app = Flask(__name__, static_folder='./static', template_folder='./templates')
window = webview.create_window('app', app)

@app.route('/')
def home():
   return render_template('index.html')

@app.route('/result',methods = ['POST'])
def result():
    if request.method == 'POST':
      data_from_js = request.json  # Assuming the data is sent as JSON
      print(data_from_js)
      generate_pptx('docs/template.pptx', config=data_from_js)

      return jsonify({'message': 'Data received successfully'})

if __name__ == '__main__':
   webview.start()