class FBTableModal
{
    table_fieldcode = "";
    table_dom;

    constructor(table_fieldcode)
    {
        this.#loadBootStrap()
        this.table_fieldcode = table_fieldcode
        this.table_dom = document.querySelector(`[data-vv-name="${this.table_fieldcode}"]`);
        if (this.table_dom == undefined) console.error(`fieldcode=${table_fieldcode} is not defined as Table element. Please check your FB setting.`)
        this.#setTableStateSync()
        this.#addEditButton()
    }

    getTableContents()
    {
        //result=[{id: fieldcode, name: 表示名, value:""}, {.}, ...]
        let result = []
        const ths = this.table_dom.getElementsByTagName("table")[0].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("th")
        const tableBodyRows = this.table_dom.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")
        for (let rown = 0; rown < tableBodyRows.length; rown++)
        {
            let row = []
            const tds = tableBodyRows[rown].getElementsByTagName("td")
            for (let i = 0; i < ths.length - 1; i++)//ボタンの列を除外するため、-1
            {
                const name = ths[i].getElementsByTagName("label")[0].innerText
                const dataVvName = tds[i].firstChild.getAttribute("data-vv-name")
                const id = dataVvName.split("-")[2]
                const value = tds[i].firstChild.getElementsByTagName("input")[0].value;
                row.push({ name: name, dataVvName: dataVvName, id: id, value: value })
            }
            result.push(row)
        }
        return result;
    }

    setTableVisible(is_visible)
    {
        if (is_visible) this.table_dom.computedStyleMap, display = ""
        else this.table_dom.computedStyleMap, display = "none"
    }

    addTableRow()
    {
        this.table_dom.getElementsByClassName("ui circular blue icon button")[0].click()
    }

    deleteTableRow(rowNum)
    {
        const targetRow = this.table_dom.getElementsByClassName("ui circular orange icon button")[rowNum]
        if (targetRow == undefined) console.error(`table ${this.table_fieldcode} has no row num=${rowNum}.`)
        else targetRow.click()
    }

    setRowValuesToTable(rowNum, valueObj)
    {
        // valueObj=[{dataVvName:"", value:""}, {.}, ...]
        const tableBody = this.table_dom.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")
        if (tableBody.length <= rowNum) console.error(`table ${this.table_fieldcode} haven't row num ${rowNum}.`)
        else
        {
            const targetRow = tableBody[rowNum]
            valueObj.forEach((elem) =>
            {
                const targetDiv = targetRow.querySelector(`[data-vv-name="${elem.dataVvName}"]`)
                if (targetDiv == undefined) console.error(`table ${this.table_fieldcode} haven't data-vv-name="${elem.dataVvName}" object.`)
                else
                {
                    const targetInput = targetDiv.getElementsByTagName("input")[0]
                    targetInput = elem.value
                }
            })
        }
    }

    setValuesToTable(valueObj)
    {
        // valueObj=[ rowObj1, rowObj2, ...]
        // rowObj=[ {dataVvName:"", value:""}, {.}, ... ]
        for (let i = 0; i < valueObj.length; i++)
            this.setRowValuesToTable(i, valueObj[i]);
    }

    #setTableStateSync()
    {//table単位でconfirm時にstate同期させる。インスタンス化時の一回の呼び出しだけでよい
        fb.events.form.confirm.push((state) =>
        {
            const table_contents = this.getTableContents();
            for (let rowNum = 0; rowNum < table_contents.length; rowNum++)
            {
                const row = table_contents[rowNum]
                row.forEach((element) =>
                {
                    const columnFieldcode = element.id
                    state.record[this.table_fieldcode].value[rowNum].value[columnFieldcode].value = element.value
                })
            }
            return state
        })
    }

    #addEditButton()
    {
        this.modalId = `${fieldcode}-${rowNum}`;
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


        // // ボタンがクリックされたときの処理を設定
        // button.addEventListener("click", () =>
        // {
        //     console.log("bined modal id is : ", modalId);
        //     const InputInfo = FBgetTableContents(fieldcode);
        //     console.log("tableInfo : ", InputInfo)
        //     const modalElement = makeModalDom(modalId, InputInfo[rowNum])
        //     // ページの適切な場所にモーダルを追加
        //     document.body.appendChild(modalElement);
        //     setAutoBankInput("金融機関名_0", "支店名_0")//modal


        //     $('#' + modalId).modal('show'); // モーダルを表示する

        //     // モーダル内の保存ボタンにクリックイベントを追加
        //     const saveButton = document.querySelector(`#${modalId} .btn-primary`); // モーダル内の保存ボタンを取得
        //     // モーダルが閉じられたときの処理を設定
        //     $('#' + modalId).on('hidden.bs.modal', function ()
        //     {
        //         handleModalClose(modalId);
        //     });
        // });
    }

    #addModalDOM()
    {

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

        if (typeof jQuery !== 'undefined') console.log('jQuery is loaded');
        else
        {
            console.log('jQuery is not loaded');
            const jqueryScriptUrl = "https://code.jquery.com/jquery-3.5.1.slim.min.js";
            await loadCDN(jqueryScriptUrl, "script");
        }

        if (typeof $().modal === 'function') console.log('Bootstrap is loaded');
        else
        {
            console.log('Bootstrap is not loaded');
            const bootstrapCssUrl = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
            const bootstrapJsUrl = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js";
            await loadCDN(bootstrapCssUrl, "link");
            await loadCDN(bootstrapJsUrl, "script");
        }
    }

}