from flask import Flask, render_template, request, jsonify
from generate_pptx import generate_pptx
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/')
def student():
   return render_template('index.html')

@app.route('/result',methods = ['POST'])
def result():
    if request.method == 'POST':
      data_from_js = request.json  # Assuming the data is sent as JSON
      # print(data_from_js)
      generate_pptx('docs/template.pptx', config=data_from_js)

      return jsonify({'message': 'Data received successfully'})

    
if __name__ == '__main__':
   app.run(debug = True)