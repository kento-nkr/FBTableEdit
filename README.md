# FBTableModal

---

## 使い方

1. form の dom 生成が終わるまで待機

   ```js
   document.addEventListener("DOMContentLoaded", function (event) {
     // すべてのスクリプトがロードされた後に実行
     your_function();
   });
   ```

2. class のインスタンスを作成

   ```js
   const インスタンス名 = new FBTableModal(
       "テーブルのフィールドコード",
       <option: Attributeの設定オブジェクト>,
       <option: EventListenerの設定オブジェクト>,
       <option: windowの最大枚数>
   )
   ```

### 引数

- 1: 必須：<テーブルのフィールドコード> :string
- 2: オプション：<Attribute の設定オブジェクト>:Object
  - default は`{}`
- 3: オプション：<EventListener の設定オブジェクト>:Object
  - default は`{}`
- 4: オプション：<window の最大枚数>:number

  - 無制限の場合は`null`を指定
  - default は`null`

- オプションなしでインスタンス化する場合は
  ```js
  const インスタンス名 = new FBTableModal("テーブルのフィールドコード");
  // 第2,3,4引数はdefault値でインスタンス化される
  ```

1. Attribute の設定オブジェクト

   ```js
   {
       fieldcode : {
           attributeName:value,
           ...
       },
       ...
   }
   ```

   の形式。以下が例

   ```js
   const attribute_obj = {
     電話番号: {
       autocomplete: "tel",
       inputmode: "tel",
       placeholder: "ハイフンは自動挿入されます",
       initial: "初期値",
     },
   };
   ```

   `attributeName`は[こちら](https://developer.mozilla.org/ja/docs/Web/HTML/Attributes)を参照

   - original attribute
     - `initial`: input dom の初期値
     - `select`: select タグの作成
       - `select`の場合は、value に配列を渡す
       ```js
       const attribute_obj = {
         関係: {
           select: ["本人", "子供", "親"],
         },
       };
       ```

2. EventListener の設定オブジェクト

   ```js
   {fieldcode:{timing:function, ...}, ... }
   ```

   の形式。以下が例

   ```js
   const listener_obj = {
     電話番号: {
       // 設定した関数には、引数として設定に使用したFBTableModalのインスタンスが渡される。
       input: (FBTableModal) => {
         console.log(FBTableModal.modalId);
       },
     },
   };
   ```

   `timing`は[こちら](https://web-designer.cman.jp/javascript_ref/event_list/)を参照

3. datalist の設定
   ```js
   FBTableModalInstance.setDatalist("relationship", ["本人", "子供", "親"]); //datalistを設置
   ```
   FBTableModalInstance のインスタンス内の、setDatalist メソッドを使用。
   ### 引数
   - 1: Attribute で list として追加した`id`: string
   - 2: 選択肢の配列: Array

## サンプルプログラム

- [運用中コード](https://github.com/NKR-24/FB_415358)

```js
function allScriptsLoaded() {
  // すべてのスクリプトがロードされた後に実行される関数
  const emergency_list_attribute_obj = {
    電話番号: {
      autocomplete: "tel",
      inputmode: "tel",
      placeholder: "ハイフンは自動挿入されます",
    },
    関係: {
      select: ["本人", "子供", "親"],
    },
  }; //attributeの設定object
  const emergency_list_listener_obj = {
    電話番号: {
      // 設定した関数には、引数として設定に使用したFBTableModalのインスタンスが渡される。
      input: (FBTableModal) => {
        console.log(FBTableModal.modalId);
      },
    },
  }; //イベントリスナーの設定object
  const emergency_list = new FBTableModal(
    "緊急連絡先_0",
    emergency_list_attribute_obj,
    emergency_list_listener_obj,
    3
  ); //classのインスタンスを作成。自動でボタン設置やテーブル非表示などが実行される
  emergency_list.setDatalist("relationship", ["本人", "子供", "親"]); //datalistを設置
}

document.addEventListener("DOMContentLoaded", () => {
  // DOMContentLoadedイベントのリスナーを追加
  allScriptsLoaded(); // すべてのスクリプトがロードされた後にallScriptsLoaded関数を実行
});
```

## トラブルシューティング

<details><summary>編集ボタンの表示位置がおかしな場合</summary>

### FormBridge のフィールド配置の問題です

編集ボタンの DOM は、元のテーブルのあった DOM の、親の DOM の末尾に追加されます

```js
this.table_dom.parentElement.parentElement.appendChild(buttonWrapper);
```

1. FormBridge のコンソール画面を開き、「フォームのデザイン」を選択

<img width="214" alt="image" src="https://github.com/kento-nkr/FBTableModal/assets/127807502/eb52bee1-306c-4fbc-ab1b-9370dafd5ff1">

2. 該当テーブルまで行き、以下の条件を満たすようにフィールドをドラッグして動かす

   ![FBTableEdit ボタン配置の説明](https://github.com/kento-nkr/FBTableModal/assets/127807502/ec72eaf0-415c-477f-bdce-837f677e9398)

</details>

---

## リファレンス

1. [FormBridge JS customize reference](https://formbridge.kintoneapp.com/help/customize)
