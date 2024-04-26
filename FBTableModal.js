class FBTableModal
{
    table_fieldcode = "";
    table_dom;
    add_button_dom;
    table_values = []  //[[{id: fieldcode, name: 表示名, value:""}, {.}, ...]]
    template_row_value = []
    attribute_obj = {} //{fieldcode:{attributeName:value, ...}, ... }
    listener_obj = {} //{fieldcode:{timing:function, ...}, ... }
    max_len = null //max window len

    constructor(table_fieldcode, attribute_obj = {}, listener_obj = {}, max_len = null)
    {
        this.#loadBootStrap();
        this.table_fieldcode = table_fieldcode;
        this.attribute_obj = attribute_obj
        this.listener_obj = listener_obj
        this.max_len = max_len
        this.table_dom = document.querySelector(
            `[data-vv-name="${this.table_fieldcode}"]`
        );
        this.table_values = this.#getTableContents()
        if (this.table_values.length < 1) console.error(`fieldcode=${table_fieldcode} have no row. We can get content template.`)
        else
        {
            this.table_values[0].forEach((elem) =>
            {
                let write_elem = elem;
                write_elem.value = "";
                this.template_row_value.push(write_elem);
            })
        }
        if (this.table_dom == undefined)
            console.error(
                `fieldcode=${table_fieldcode} is not defined as Table element. Please check your FB setting.`
            );
        this.#setTableStateSync();
        this.addEditButton()
        this.setTableVisible(false)
    }

    #makeModalDOM()
    {
        const modalElement = document.createElement("div");
        modalElement.setAttribute("class", "modal fade");
        modalElement.setAttribute("id", this.modalId);
        modalElement.setAttribute("tabindex", "-1");
        modalElement.setAttribute("role", "dialog");
        modalElement.setAttribute("aria-labelledby", `${this.modalId}Label`);
        modalElement.setAttribute("aria-hidden", "true");

        const modalDialog = document.createElement("div");
        modalDialog.setAttribute("class", "modal-dialog");
        modalElement.appendChild(modalDialog);

        const modalContent = document.createElement("div");
        modalContent.setAttribute("class", "modal-content");
        modalDialog.appendChild(modalContent);

        const modalHeader = document.createElement("div");
        modalHeader.setAttribute("class", "modal-header");
        modalHeader.innerHTML = `
        <h5 class="modal-title" id="${this.modalId}Label">${this.modalId}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
        modalContent.appendChild(modalHeader);

        const modalBody = document.createElement("div");
        modalBody.setAttribute("class", "modal-body");

        // 最初のページの入力フィールドを表示
        this.#showPageContent(modalBody, 0);

        modalContent.appendChild(modalBody);

        return modalElement;
    }

    #showPageContent(modalBody, rowNum)
    {
        // ページ切り替え時にモーダルボディをクリア
        modalBody.innerHTML = "";

        const pageContent = document.createElement("div");
        pageContent.setAttribute("id", `${this.modalId}_pageContent`);
        pageContent.setAttribute("class", "page-content");
        pageContent.setAttribute("rowNum", rowNum);
        const pageButtonArea = document.createElement("div");
        pageButtonArea.setAttribute("class", "page-button-area");
        const pageFormArea = document.createElement("div");
        pageFormArea.setAttribute("class", "page-form-area");

        //pageButtonArea内のbutton同士にmarginを追加
        const style = document.createElement("style");
        style.textContent = `
        .page-button-area button {
          margin-right: 5px;
        }
      `;
        pageButtonArea.appendChild(style);

        // ページ切り替えボタンを追加
        // const pageCount = this.tableContents.length;
        const pageCount = this.table_values.length;
        for (let i = 0; i < pageCount; i++)
        {
            const pageButton = document.createElement("button");
            pageButton.setAttribute("type", "button");
            pageButton.setAttribute("class", "btn btn-outline-secondary page-switch-button");
            pageButton.textContent = `${i + 1}`;
            pageButton.setAttribute("data-page", i);
            if (i == rowNum)
            {
                pageButton.setAttribute(
                    "class",
                    "btn btn-primary page-switch-button"
                );
                pageButton.setAttribute("disabled", "true");
            } else
            {
                pageButton.addEventListener("click", () =>
                {
                    const modalRowNumAndValue = this.getValuesFromModal();
                    this.table_values[rowNum] = modalRowNumAndValue.values
                    this.#showPageContent(modalBody, i);
                });
            }
            pageButtonArea.appendChild(pageButton);
        }
        //追加ボタンを追加
        const addButton = document.createElement("button");
        addButton.setAttribute("type", "button");
        addButton.setAttribute("class", "btn btn-outline-primary");
        addButton.textContent = "追加";
        addButton.addEventListener("click", async () =>
        {
            const modalRowNumAndValue = this.getValuesFromModal();
            this.table_values[rowNum] = modalRowNumAndValue.values
            // this.#showPageContent(modalBody, this.tableContents.length - 1);
            if (this.check_addable() == false) return
            this.table_values.push(this.template_row_value)
            this.#showPageContent(modalBody, this.table_values.length - 1);
            this.addTableRow();
        });
        pageButtonArea.appendChild(addButton);
        this.add_button_dom = addButton
        this.check_addable()

        // const targetTableContent = this.tableContents[rowNum];
        const targetTableContent = this.table_values[rowNum];

        // ページの入力フィールドを表示
        targetTableContent.forEach((input) =>
        {
            const labelElement = document.createElement("label");
            labelElement.setAttribute("class", "col-sm-6 col-form-label");
            labelElement.textContent = input.name;
            pageFormArea.appendChild(labelElement);

            const inputDiv = document.createElement("div");
            inputDiv.setAttribute("class", "col-sm-9");
            const inputElement = document.createElement("input");
            inputElement.setAttribute("class", "form-control");
            inputElement.setAttribute("id", input.id);
            inputElement.setAttribute("name", input.name);
            inputElement.setAttribute("type", "text");
            if (this.attribute_obj != undefined && this.attribute_obj[input.id] != undefined)
            {//attribute_obj内で指定されている場合、Attributeの設定を行う。
                const keys = Object.keys(this.attribute_obj[input.id])
                keys.forEach((key) =>
                {
                    if (key == "list")//datalist_idにはtable_fieldcodeが自動で前方付与されるため
                        inputElement.setAttribute(key, `${this.table_fieldcode}_${this.attribute_obj[input.id][key]}`)
                    else
                        inputElement.setAttribute(key, this.attribute_obj[input.id][key])
                })
            }
            if (this.listener_obj != undefined && this.listener_obj[input.id] != undefined)
            {//listener_obj内で指定されている場合、EventListenerの設定を行う
                const keys = Object.keys(this.listener_obj[input.id])
                keys.forEach((key) =>
                {
                    inputElement.addEventListener(key, () => this.listener_obj[input.id][key](this))
                })
            }
            inputElement.value = input.value;
            inputDiv.appendChild(inputElement);
            pageFormArea.appendChild(inputDiv);
        });

        const deleteButton = document.createElement("button");
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("class", "btn btn-danger");
        deleteButton.textContent = "削除";
        deleteButton.addEventListener("click", async () =>
        { //削除イベント
            if (this.table_values.length == 1)
            {
                // 削除せず初期化.
                // table_valuesへの変更は$("#" + this.modalId).on("hidden.bs.modal", () => { })が行う
                // modal内のinputを初期化するだけでいい
                const modal_dom = document.getElementById(this.modalId)
                const inputs = modal_dom.getElementsByTagName("input")
                for (let i = 0; i < inputs.length; i++)
                    inputs[i].value = ""
                $("#" + this.modalId).modal("hide"); //modalを終了
            }
            else
            {
                this.check_addable()
                this.table_values.splice(rowNum, 1) //table_valuesを削除
                if (rowNum > 0) this.#showPageContent(modalBody, rowNum - 1);  //消したrowの一個前を表示
                else this.#showPageContent(modalBody, rowNum);//0を消した場合は、元1を表示
                this.deleteTableRow(rowNum);

            }
        });

        // div要素を作成してボタンをラップし、中央揃えのスタイルを適用する
        const deleteButtonArea = document.createElement("div");
        deleteButtonArea.style.textAlign = "center"; // ボタンを中央に配置する
        deleteButtonArea.appendChild(deleteButton);


        pageContent.appendChild(pageButtonArea);
        pageContent.appendChild(document.createElement("hr"));
        pageContent.appendChild(pageFormArea);
        pageContent.appendChild(document.createElement("hr"));
        pageContent.appendChild(deleteButtonArea)
        modalBody.appendChild(pageContent);
    }

    check_addable()
    {
        if (this.max_len != null)
        {
            const window_num = this.table_values.length
            if (window_num >= this.max_len)
            {
                this.add_button_dom.disabled = true;
                return false
            }
        }
        this.add_button_dom.disabled = false;
        return true
    }

    setDatalist(id, valueArray)  //idにはtable_fieldcodeが勝手に前方付与される
    {
        // 引数の形式が正しいことを確認
        if (!Array.isArray(valueArray) || valueArray.length === 0 || id === undefined)
        {
            console.error("setDatalist関数の引数に誤りがあります。(id:str, valueArray:Arrat)")
            return;
        }

        const datalist_id = `${this.table_fieldcode}_${id}`

        // 二重で定義され内容に、過去のDOMがあれば自動削除
        this.rmDatalist(datalist_id)

        // datalist要素を作成
        var dataList = document.createElement("datalist");
        dataList.id = datalist_id

        // dataObject.value配列からoption要素を作成してdatalistに追加
        valueArray.forEach(function (value)
        {
            var option = document.createElement("option");
            option.value = value;
            dataList.appendChild(option);
        });

        // datalistをbodyに追加
        document.body.appendChild(dataList);
    }

    rmDatalist(id)
    {
        const target = document.getElementById(id)
        if (target != undefined)
            target.remove()
    }

    #getTableContents()
    {
        //result=[[{id: fieldcode, name: 表示名, value:""}, {.}, ...]]
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
        for (let rown = 0; rown < tableBodyRows.length; rown++)
        {
            let row = [];
            const tds = tableBodyRows[rown].getElementsByTagName("td");
            for (
                let i = 0;
                i < ths.length - 1;
                i++ //ボタンの列を除外するため、-1
            )
            {
                const name = ths[i].getElementsByTagName("label")[0].innerText;
                const dataVvName = tds[i].firstChild.getAttribute("data-vv-name");
                const id = dataVvName.split("-")[2];
                const value = tds[i].firstChild.getElementsByTagName("input")[0].value;
                row.push({ name: name, id: id, value: value });
            }
            result.push(row);
        }
        console.log("table data: ", result)
        return result;
    }

    setTableVisible(is_visible)
    {
        if (is_visible) this.table_dom.style.display = ""; // 表示する
        else this.table_dom.style.display = "none"; // 非表示にする
    }

    addTableRow()
    {
        this.table_dom
            .getElementsByClassName("ui circular blue icon button")[0]
            .click();
    }

    deleteTableRow(rowNum)
    {
        const targetRow = this.table_dom.getElementsByClassName(
            "ui circular orange icon button"
        )[rowNum];
        if (targetRow == undefined)
            console.error(`table ${this.table_fieldcode} has no row num=${rowNum}.`);
        else
        {
            targetRow.click();
        }
    }

    #setTableStateSync()
    {
        //table単位でconfirm時にstate同期させる。インスタンス化時の一回の呼び出しだけでよい
        const updateState = (state) =>
        {
            const table_contents = this.table_values
            for (let rowNum = 0; rowNum < table_contents.length; rowNum++)
            {
                const row = table_contents[rowNum];
                row.forEach((element) =>
                {
                    const columnFieldcode = element.id;
                    state.record[this.table_fieldcode].value[rowNum].value[
                        columnFieldcode
                    ].value = element.value;
                });
            }
            return state;
        }
        // fb.events.fields[this.table_fieldcode].add.push(updateState)
        // fb.events.fields[this.table_fieldcode].remove.push(updateState)
        fb.events.form.confirm.push(updateState);
    }

    addEditButton()
    {
        this.modalId = `${this.table_fieldcode}`;
        this.editButtonId = `${this.table_fieldcode}_editButton`;

        if (document.getElementById(this.editButtonId) != undefined)
        {
            console.log("already exist")
            return//既に存在していれば、追加しない
        }

        // ボタン要素を作成
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-primary");
        button.textContent = "編集";
        button.id = this.editButtonId;
        // div要素を作成してボタンをラップ
        const buttonWrapper = document.createElement("div");
        buttonWrapper.setAttribute("class", "edit-button-wrapper");
        buttonWrapper.style.marginLeft = "5%"; // 左側に10%のマージンを設定
        buttonWrapper.appendChild(button);
        // 編集ボタンを追加
        this.table_dom.parentElement.parentElement.appendChild(buttonWrapper);

        // ボタンがクリックされたときの処理を設定
        // 追加のイベントを登録したい場合は、document.getElementById(this.editButtonId).addEventListener("click", () => { ... });
        button.addEventListener("click", () =>
        {
            const modalElement = this.#makeModalDOM();
            document.body.appendChild(modalElement); // bodyの末尾にモーダルを追加
            $("#" + this.modalId).modal("show"); // モーダルを表示する
            //modalが閉じられた時、modalを削除し、モーダルの中身をtableに反映させる
            $("#" + this.modalId).on("hidden.bs.modal", () =>
            {
                const modalRowNumAndValue = this.getValuesFromModal();
                this.table_values[modalRowNumAndValue.rowNum] = modalRowNumAndValue.values

                modalElement.remove(); //最後に実行
            });
        });
    }

    getValuesFromModal()
    {
        let result = {}; //{rowNum: . , values: [{id: , name: , value: }, {.}, ...]}
        const modalContent = document.getElementById(`${this.modalId}_pageContent`);
        result.rowNum = modalContent.getAttribute("rowNum");
        result.values = [];
        const inputElements = modalContent.getElementsByTagName("input");
        for (let i = 0; i < inputElements.length; i++)
        {
            const input = inputElements[i];
            const id = input.getAttribute("id"); // 入力フィールドのIDを取得
            const name = input.getAttribute("name"); // 入力フィールドのnameを取得
            const value = input.value; // 入力フィールドの値を取得
            result.values.push({ id: id, name: name, value: value }); // IDと値をオブジェクトとしてresultに追加
        }
        return result;
    }

    async #loadBootStrap()
    {
        function loadCDN(url, type)
        {
            return new Promise((resolve, reject) =>
            {
                let scriptOrLink;
                if (type === "script")
                {
                    scriptOrLink = document.createElement("script");
                    scriptOrLink.onload = resolve;
                    scriptOrLink.onerror = reject;
                    scriptOrLink.src = url;
                } else if (type === "link")
                {
                    scriptOrLink = document.createElement("link");
                    scriptOrLink.onload = resolve;
                    scriptOrLink.onerror = reject;
                    scriptOrLink.rel = "stylesheet";
                    scriptOrLink.href = url;
                } else
                {
                    reject(new Error("Invalid type specified"));
                    return;
                }
                document.head.appendChild(scriptOrLink);
            });
        }

        if (typeof jQuery !== "undefined") console.log("jQuery is loaded");
        else
        {
            console.log("jQuery is not loaded");
            const jqueryScriptUrl =
                "https://code.jquery.com/jquery-3.5.1.slim.min.js";
            await loadCDN(jqueryScriptUrl, "script");
        }

        if (typeof $().modal === "function") console.log("Bootstrap is loaded");
        else
        {
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
