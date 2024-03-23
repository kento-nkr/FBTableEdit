## 使い方

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

## Q&A
<details>
    
<summary>編集ボタンの表示位置がおかしな場合</summary>
    
###FormBridgeのフィールド配置の問題です
    
編集ボタンのDOMは、元のテーブルのあったDOMの、親のDOMの末尾に追加されます

```js
    this.table_dom.parentElement.parentElement.appendChild(buttonWrapper);
```

1. FormBridgeのコンソール画面を開き、「フォームのデザイン」を選択

    <img width="214" alt="image" src="https://github.com/kento-nkr/FBTableModal/assets/127807502/eb52bee1-306c-4fbc-ab1b-9370dafd5ff1">
    
2. 該当テーブルまで行き、以下の条件を満たすようにフィールドをドラッグして動かす
     
    ![FBTableEdit ボタン配置の説明](https://github.com/kento-nkr/FBTableModal/assets/127807502/ec72eaf0-415c-477f-bdce-837f677e9398)
    
</details>


---

## リファレンス

1. [FormBridge JS customize reference](https://formbridge.kintoneapp.com/help/customize)
