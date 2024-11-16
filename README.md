# README

## 中文版

### 项目说明
此程序为小组计分制管理系统，适用于学校或团队项目的计分管理。系统提供了简单的管理员密码管理以及班级口令存储功能。请注意，保存的信息并不安全，因此不建议在高安全性场景中使用。

### 使用说明

#### `code.txt`
- `code.txt` 文件用于存储管理员的密码。
- **重要提示：** 请注意保存的信息并不安全，密码可能以明文形式存储，请务必避免在高安全性环境下使用本程序。

#### `cipher.txt`
- `cipher.txt` 文件用于存储进入班级的口令（密码），用于限制访问权限。

### 注意
- **红字提示：** 本程序采用 [GPL 许可证](https://www.gnu.org/licenses/gpl-3.0.html)，请在使用时遵守该协议的要求。
- 本程序仅适用于学校或非商业用途，不保证其安全性，切勿在需要高度安全保护的场合使用。

---

## English Version

### Project Description
This program is a group scoring management system, suitable for use in schools or team projects. The system provides simple administrator password management and stores class entry passwords. Please note that the stored information is not secure and should not be used in high-security environments.

### Usage Instructions

#### `code.txt`
- The `code.txt` file is used to store the administrator's password.
- **Important Notice:** Please be aware that the stored information is not secure, and passwords may be stored in plain text. Do not use this program in high-security environments.

#### `cipher.txt`
- The `cipher.txt` file stores the password for accessing the class, which is used to restrict access.

### Note
- **Red Alert:** This program is licensed under the [GPL License](https://www.gnu.org/licenses/gpl-3.0.html). Please make sure to comply with the terms of the license when using it.
- This program is only for use in schools or non-commercial purposes. It does not guarantee security, and it should not be used in situations requiring high levels of security.

---

## 日本語版

### プロジェクトの説明
このプログラムは、学校やチームプロジェクトに適したグループスコアリング管理システムです。システムは、管理者パスワード管理とクラスのパスワード保存機能を提供します。ただし、保存される情報は安全ではないため、高セキュリティ環境での使用は避けてください。

### 使用方法

#### `code.txt`
- `code.txt` ファイルは、管理者のパスワードを保存するために使用されます。
- **重要な注意:** 保存される情報は安全ではないことにご注意ください。パスワードはプレーンテキストで保存される可能性があり、高セキュリティ環境では使用しないでください。

#### `cipher.txt`
- `cipher.txt` ファイルは、クラスにアクセスするためのパスワードを保存します。これにより、アクセスを制限することができます。

### ご注意
- **赤字の警告：** 本プログラムは [GPLライセンス](https://www.gnu.org/licenses/gpl-3.0.html) の下でライセンスされています。使用する際は、そのライセンスの条件を遵守してください。
- このプログラムは学校や非商業目的にのみ使用されることを想定しています。セキュリティは保証されていないため、高度なセキュリティを必要とする状況では使用しないでください。

---

### 更改语言按钮

如果您的应用程序有前端界面，您可以添加一个语言选择按钮。以下是一个简单的 HTML 示例，展示如何为用户提供语言切换功能：

```html
<div>
    <button onclick="changeLanguage('zh')">中文</button>
    <button onclick="changeLanguage('en')">English</button>
    <button onclick="changeLanguage('ja')">日本語</button>
</div>
