# Auto PPTX Generator for Bremen Church

不来梅教会每周日需要一个 PPTX，往往做一个新的 PPTX 需要花费数个小时，这个项目可以通过用户的输入自动生成 PPTX，从而大大减少制作时间。

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To set up the project on your local machine, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/handeesome/ccg-bremen-auto-pptx.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd ccg-bremen-auto-pptx
   ```

3. **Create and activate a virtual environment (optional but recommended):**

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows, use 'venv\Scripts\activate'
   ```

4. **Install the required dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

## Getting Started

To start the application:

1. **Run the project:**

   ```bash
   python app.py
   ```

2. **Access the application:**

   Open your browser and visit [http://localhost:5000/](http://localhost:5000/). The application should be running and accessible.

## Usage

After opening [http://localhost:5000/], you will be redirected to the content defined in `template.index.html`. You can modify this template as needed.

**重要注意事项**

所有自动生成的音频都是默认非跨页播放，需要人工调整。每次都需要改*奉献回应诗*，_圣餐诗_。

## Contributing

If you wish to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your modifications.
4. Submit a pull request for review.

## License

This project is licensed under the [MIT License](LICENSE).
