class FBTableModal {
  table_fieldcode = "";
  table_dom;

  constructor(table_fieldcode) {
    this.#loadBootStrap();
    this.table_fieldcode = table_fieldcode;
    this.table_dom = document.querySelector(
      `[data-vv-name="${this.table_fieldcode}"]`
    );
    if (this.table_dom == undefined)
      console.error(
        `fieldcode=${table_fieldcode} is not defined as Table element. Please check your FB setting.`
      );
    this.#setTableStateSync();
    this.#addEditButton();
    fb.events.form.mounted.push(() => {
      this.#addEditButton();
    });
  }

  getTableContents() {
    //result=[{id: fieldcode, name: 表示名, value:""}, {.}, ...]
    let result = [];
    const ths = this.table_dom
      .getElementsByTagName("table")[0]
      .getElementsByTagName("thead")[0]
      .getElementsByTagName("tr")[0]
      .getElementsByTagName("th");
    const tableBodyRows = this.table_dom
      .getElementsByTagName("table")[0]
      .getElementsByTagName("tbody")[0]
      .getElementsByTagName("tr");
    for (let rown = 0; rown < tableBodyRows.length; rown++) {
      let row = [];
      const tds = tableBodyRows[rown].getElementsByTagName("td");
      for (
        let i = 0;
        i < ths.length - 1;
        i++ //ボタンの列を除外するため、-1
      ) {
        const name = ths[i].getElementsByTagName("label")[0].innerText;
        const dataVvName = tds[i].firstChild.getAttribute("data-vv-name");
        const id = dataVvName.split("-")[2];
        const value = tds[i].firstChild.getElementsByTagName("input")[0].value;
        row.push({ name: name, dataVvName: dataVvName, id: id, value: value });
      }
      result.push(row);
    }
    return result;
  }

  setTableVisible(is_visible) {
    if (is_visible) this.table_dom.computedStyleMap, (display = "");
    else this.table_dom.computedStyleMap, (display = "none");
  }

  addTableRow() {
    this.table_dom
      .getElementsByClassName("ui circular blue icon button")[0]
      .click();
  }

  deleteTableRow(rowNum) {
    const targetRow = this.table_dom.getElementsByClassName(
      "ui circular orange icon button"
    )[rowNum];
    if (targetRow == undefined)
      console.error(`table ${this.table_fieldcode} has no row num=${rowNum}.`);
    else targetRow.click();
  }

  setRowValuesToTable(rowNum, valueObj) {
    // valueObj=[{dataVvName:"", value:""}, {.}, ...]
    const tableBody = this.table_dom
      .getElementsByTagName("table")[0]
      .getElementsByTagName("tbody")[0]
      .getElementsByTagName("tr");
    if (tableBody.length <= rowNum)
      console.error(`table ${this.table_fieldcode} haven't row num ${rowNum}.`);
    else {
      const targetRow = tableBody[rowNum];
      valueObj.forEach((elem) => {
        const targetDiv = targetRow.querySelector(
          `[data-vv-name="${elem.dataVvName}"]`
        );
        if (targetDiv == undefined)
          console.error(
            `table ${this.table_fieldcode} haven't data-vv-name="${elem.dataVvName}" object.`
          );
        else {
          const targetInput = targetDiv.getElementsByTagName("input")[0];
          targetInput = elem.value;
        }
      });
    }
  }

  setValuesToTable(valueObj) {
    // valueObj=[ rowObj1, rowObj2, ...]
    // rowObj=[ {dataVvName:"", value:""}, {.}, ... ]
    for (let i = 0; i < valueObj.length; i++)
      this.setRowValuesToTable(i, valueObj[i]);
  }

  #setTableStateSync() {
    //table単位でconfirm時にstate同期させる。インスタンス化時の一回の呼び出しだけでよい
    fb.events.form.confirm.push((state) => {
      const table_contents = this.getTableContents();
      for (let rowNum = 0; rowNum < table_contents.length; rowNum++) {
        const row = table_contents[rowNum];
        row.forEach((element) => {
          const columnFieldcode = element.id;
          state.record[this.table_fieldcode].value[rowNum].value[
            columnFieldcode
          ].value = element.value;
        });
      }
      return state;
    });
  }

  #addEditButton() {
    this.modalId = `${this.table_fieldcode}`;
    this.editButtonId = `${this.table_fieldcode}_editButton`;

    // ボタン要素を作成
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-primary");
    button.textContent = "編集";
    button.id = this.editButtonId;
    // div要素を作成してボタンをラップ
    const buttonWrapper = document.createElement("div");
    buttonWrapper.setAttribute("class", "edit-button-wrapper");
    buttonWrapper.appendChild(button);
    // 編集ボタンを追加
    this.table_dom.parentElement.parentElement.appendChild(buttonWrapper);

    // ボタンがクリックされたときの処理を設定
    // 追加のイベントを登録したい場合は、document.getElementById(this.editButtonId).addEventListener("click", () => { ... });
    button.addEventListener("click", () => {
      const modalElement = this.#makeModalDOM();
      document.body.appendChild(modalElement); // bodyの末尾にモーダルを追加
      $("#" + this.modalId).modal("show"); // モーダルを表示する
    });
  }

  #makeModalDOM() {
    const tableContents = this.getTableContents();
    const InputInfo = tableContents[0];
    // モーダル要素を生成
    const modalElement = document.createElement("div");
    modalElement.setAttribute("class", "modal fade");
    modalElement.setAttribute("id", this.modalId);
    modalElement.setAttribute("tabindex", "-1");
    modalElement.setAttribute("role", "dialog");
    modalElement.setAttribute("aria-labelledby", `${this.modalId}Label`);
    modalElement.setAttribute("aria-hidden", "true");

    // モーダルの中身を生成
    const modalDialog = document.createElement("div");
    modalDialog.setAttribute("class", "modal-dialog");
    modalElement.appendChild(modalDialog);

    const modalContent = document.createElement("div");
    modalContent.setAttribute("class", "modal-content");
    modalDialog.appendChild(modalContent);

    // ヘッダ部分を生成
    const modalHeader = document.createElement("div");
    modalHeader.setAttribute("class", "modal-header");
    modalHeader.innerHTML = `
        <h5 class="modal-title" id="${this.modalId}Label">${this.modalId}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    modalContent.appendChild(modalHeader);

    // ボディ部分を生成
    const modalBody = document.createElement("div");
    modalBody.setAttribute("class", "modal-body");

    // 入力フィールドを追加
    InputInfo.forEach((input) => {
      // 入力フィールドのラベルを生成
      const labelElement = document.createElement("label");
      labelElement.setAttribute("class", "col-sm-3 col-form-label"); // Bootstrapのクラスを追加
      labelElement.textContent = input.name;
      modalBody.appendChild(labelElement);

      // 入力フィールドを生成
      const inputDiv = document.createElement("div");
      inputDiv.setAttribute("class", "col-sm-9"); // Bootstrapのクラスを追加
      const inputElement = document.createElement("input");
      inputElement.setAttribute("type", "text");
      inputElement.setAttribute("class", "form-control"); // Bootstrapのクラスを追加
      inputElement.setAttribute("id", `${input.id}`);
      inputElement.setAttribute("data-vv-name", `${input.dataVvName}`);
      for (const key in input.attribute) {
        inputElement.setAttribute(key, input.attribute[key]);
      }
      inputElement.value = input.value;
      inputDiv.appendChild(inputElement);
      modalBody.appendChild(inputDiv);
    });
    modalContent.appendChild(modalBody);

    // フッタ部分を生成
    const modalFooter = document.createElement("div");
    modalFooter.setAttribute("class", "modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-dismiss="modal">閉じる</button>
    `;
    modalContent.appendChild(modalFooter);

    //modalが閉じられた時、modalを削除し、モーダルの中身をtableに反映させる
    modalElement.addEventListener("hidden.bs.modal", () => {
      modalElement.remove();
      const values = this.getValuesFromModal();
      this.setRowValuesToTable(0, values);
    });

    return modalElement;
  }

  getValuesFromModal() {
    let result = [];
    const modalContent = document.querySelector(
      `#${this.modalId} .modal-content`
    );
    const inputElements = modalContent.querySelectorAll(".modal-body input"); // モーダル内のすべての入力フィールドを取得
    inputElements.forEach((input) => {
      const id = input.getAttribute("id"); // 入力フィールドのIDを取得
      const dataVvName = input.getAttribute("data-vv-name"); // 入力フィールドのdataVvNameを取得
      const value = input.value; // 入力フィールドの値を取得
      result.push({ id: id, dataVvName: dataVvName, value: value }); // IDと値をオブジェクトとしてresultに追加
    });
    return result;
  }

  async #loadBootStrap() {
    function loadCDN(url, type) {
      return new Promise((resolve, reject) => {
        let scriptOrLink;
        if (type === "script") {
          scriptOrLink = document.createElement("script");
          scriptOrLink.onload = resolve;
          scriptOrLink.onerror = reject;
          scriptOrLink.src = url;
        } else if (type === "link") {
          scriptOrLink = document.createElement("link");
          scriptOrLink.onload = resolve;
          scriptOrLink.onerror = reject;
          scriptOrLink.rel = "stylesheet";
          scriptOrLink.href = url;
        } else {
          reject(new Error("Invalid type specified"));
          return;
        }
        document.head.appendChild(scriptOrLink);
      });
    }

    if (typeof jQuery !== "undefined") console.log("jQuery is loaded");
    else {
      console.log("jQuery is not loaded");
      const jqueryScriptUrl =
        "https://code.jquery.com/jquery-3.5.1.slim.min.js";
      await loadCDN(jqueryScriptUrl, "script");
    }

    if (typeof $().modal === "function") console.log("Bootstrap is loaded");
    else {
      console.log("Bootstrap is not loaded");
      const bootstrapCssUrl =
        "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
      const bootstrapJsUrl =
        "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js";
      await loadCDN(bootstrapCssUrl, "link");
      await loadCDN(bootstrapJsUrl, "script");
    }
  }
}
