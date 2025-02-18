from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from functions.generate_pptx import generate_pptx

 
app = Flask(__name__, static_folder='./static', template_folder='./templates')
CORS(app)

@app.route('/', methods = ['GET'])
def index():
   return render_template('index.html')

@app.route('/process-form',methods = ['POST'])
def procee_from():
    try:
        data = request.json  # Parse JSON
        print("Parsed JSON data:", data)  # Debugging output

        if not data:
            return jsonify({"error": "No JSON received"}), 400
        generate_pptx("./docs/template.pptx", data)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        print("Error processing form:", str(e))
        return jsonify({"error": str(e)}), 400
    
if __name__ == '__main__':

   app.run(debug = True)
