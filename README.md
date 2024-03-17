## Purpose

The purpose of this project is to enable the editing of tables within a Modal window using the FormBridge library.

## Function

This project provides the following functionalities:

1. **Include Bootstrap CDN**: If your FormBridge library doesn't already include the Bootstrap library, this program will include it automatically.

2. **Open Modal Button**: Allows users to open the Modal window for editing the table.
3. **Modal DOM**: Provides the necessary DOM structure for the Modal window.
4. **Reflect Modal Input to Table DOM**: Updates the content of the table in the Document Object Model (DOM) based on the input provided in the Modal.
5. **Reflect Table DOM Content to FormBridge Internal State**: Reflects the content of the table DOM to the internal state variables of FormBridge.

## Usage

1. formのdom生成が終わるまで待機

    ```js
        document.addEventListener("DOMContentLoaded", function (event){
            // すべてのスクリプトがロードされた後に実行
            your_function();
        });
    ```

2. classのインスタンスを作成

    ```js
    const インスタンス名 = new FBTableModal("テーブルのフィールドコード")
    ```

---

## References

1. [FormBridge JS customize reference](https://formbridge.kintoneapp.com/help/customize)