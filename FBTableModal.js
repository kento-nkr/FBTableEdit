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

    setValuesToTable(rowNum, valueObj)
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

                }
            })
        }
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