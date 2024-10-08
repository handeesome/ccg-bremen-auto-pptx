# Project Name

不来梅教会每周日需要一个PPTX，往往做一个新的PPTX需要花费数个小时，这个项目可以通过用户的输入自动生成PPTX，从而大大减少制作时间。
## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/handeesome/ccg-bremen-auto-pptx.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd your-project
    ```

3. **Create and activate a virtual environment (optional but recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate   # On Windows, use 'venv\Scripts\activate'
    ```

4. **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

## Getting Started

1. **Run the project:**

    ```bash
    python app.py
    ```

2. **Open your browser and visit [http://localhost:5000/](http://localhost:5000/):**

    The application should be up and running.

## Usage

打开[http://localhost:5000/]后会跳转到(template.index.html)中的内容，如果需要修改可自行寻找。

这个网页中有一些已经记录的当月的活动报告和祷告会事项等，如果需要update，可以打开(static/changeMonthly.js)更改其中的变量。

**重要注意事项** 

所有自动生成的音频都是默认非跨页播放，需要人工调整。每次都需要改*奉献回应诗*，*圣餐诗*。

## Contributing

If you'd like to contribute to the project, please follow these guidelines:

1. Fork the project.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
