# FBTableModal

---

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
    const インスタンス名 = new FBTableModal("テーブルのフィールドコード", <option: Attributeの設定オブジェクト>, <option: EventListenerの設定オブジェクト>)
    ```

3. Attributeの設定オブジェクト

    ```js
    {fieldcode:{attributeName:value, ...}, ... }
    ```

    の形式。以下が例

    ```js
     const attribute_obj = {
        電話番号: {
            autocomplete: "tel",
            inputmode: "tel",
            placeholder: "ハイフンは自動挿入されます",
        },
    }
    ```

4. EventListenerの設定オブジェクト

    ```js
    {fieldcode:{timing:function, ...}, ... }
    ```

    の形式。以下が例

    ```js
    const listener_obj = {
        電話番号: {
            input: () => { console.log("hello") }
        }
    }
    ```

5. datalistの設定
    ```js
    FBTableModalInstance.setDatalist("relationship", ["本人", "子供", "親"])  //datalistを設置
    ```
    FBTableModalInstanceのインスタンス内の、setDatalistメソッドを使用。  
    引数は、
    - Attributeでlistとして追加したid
    - 選択肢の配列

## サンプルプログラム

```js
function allScriptsLoaded()
{   // すべてのスクリプトがロードされた後に実行される関数
    const emergency_list_attribute_obj = {
        電話番号: {
            autocomplete: "tel",
            inputmode: "tel",
            placeholder: "ハイフンは自動挿入されます",
        },
    }   //attributeの設定object
    const emergency_list_listener_obj = {
        電話番号: {
            input: () => { console.log("hello") }
        }
    }   //イベントリスナーの設定object
    const emergency_list = new FBTableModal(
        "緊急連絡先_0",
        emergency_list_attribute_obj,
        emergency_list_listener_obj
    )   //classのインスタンスを作成。自動でボタン設置やテーブル非表示などが実行される
    emergency_list.setDatalist("relationship", ["本人", "子供", "親"])  //datalistを設置
}

document.addEventListener("DOMContentLoaded", () =>
{// DOMContentLoadedイベントのリスナーを追加
    allScriptsLoaded(); // すべてのスクリプトがロードされた後にallScriptsLoaded関数を実行
});
```

## トラブルシューティング

<details><summary>編集ボタンの表示位置がおかしな場合</summary>

### FormBridgeのフィールド配置の問題です

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
