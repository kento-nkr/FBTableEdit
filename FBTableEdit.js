function addModalBtn(fieldcode, modalId)
{
    // ボタン要素を作成
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-primary");
    button.textContent = "編集";
    // フィールドコードに対応する要素を取得
    const elements = document.querySelectorAll(`[data-vv-name="${fieldcode}"]`);
    // 要素が見つかった場合にボタンを追加
    if (elements.length > 0)
        elements[0].appendChild(button);
    else
    {
        console.error("要素が見つかりません。フィールドコードが正しいか確認してください。");
        return;
    }


    // ボタンがクリックされたときの処理を設定
    button.addEventListener("click", () =>
    {
        const InputInfo = FBgetTableContents(fieldcode);
        console.log("tableInfo : ", InputInfo)
        const modalElement = makeModalDom(modalId, InputInfo[0])
        // ページの適切な場所にモーダルを追加
        document.body.appendChild(modalElement);
        $('#' + modalId).modal('show'); // モーダルを表示する
    });
}

function makeModalDom(modalId, InputInfo)
{
    // モーダル要素を生成
    const modalElement = document.createElement("div");
    modalElement.setAttribute("class", "modal fade");
    modalElement.setAttribute("id", modalId);
    modalElement.setAttribute("tabindex", "-1");
    modalElement.setAttribute("role", "dialog");
    modalElement.setAttribute("aria-labelledby", `${modalId}Label`);
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
        <h5 class="modal-title" id="${modalId}Label">${modalId}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    modalContent.appendChild(modalHeader);

    // ボディ部分を生成
    const modalBody = document.createElement("div");
    modalBody.setAttribute("class", "modal-body");

    // 入力フィールドを追加
    InputInfo.forEach((input) =>
    {
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
        inputElement.setAttribute("id", `${modalId}_${input.id}`);
        for (const key in input.attribute)
        {
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
        <button type="button" class="btn btn-primary">保存する</button>
    `;
    modalContent.appendChild(modalFooter);

    return modalElement;
}

function makeDomTest()
{
    const InputInfo = [[{ "name": "姓", "id": "緊急連絡先姓_0", "value": "a" },
    { "name": "名", "id": "緊急連絡先名_0", "value": "" }, { "name": "セイ", "id": "緊急連絡先姓カナ_0", "value": "" }, { "name": "メイ", "id": "緊急連絡先名カナ_0", "value": "" }, { "name": "関係", "id": "続柄_0", "value": "" }, { "name": "電話番号", "id": "電話番号_0", "value": "" }, { "name": "電話番号（予備）", "id": "電話番号予備_0", "value": "" }, { "name": "住所", "id": "住所_0", "value": "" }], [{ "name": "姓", "id": "緊急連絡先姓_0", "value": "b" }, { "name": "名", "id": "緊急連絡先名_0", "value": "" }, { "name": "セイ", "id": "緊急連絡先姓カナ_0", "value": "" }, { "name": "メイ", "id": "緊急連絡先名カナ_0", "value": "" }, { "name": "関係", "id": "続柄_0", "value": "" }, { "name": "電話番号", "id": "電話番号_0", "value": "" }, { "name": "電話番号（予備）", "id": "電話番号予備_0", "value": "" }, { "name": "住所", "id": "住所_0", "value": "" }]]

    //InputInfoの長さInputInfo.length分だけmodalのページを作る。
    //複数枚のmodalページはラジオボタンで切り替え可能
    const modalElement = makeModalDom(modalId, InputInfo[0])

}

function FBgetTableContents(fieldcode)
{
    let result = []
    const elements = document.querySelectorAll(`[data-vv-name="${fieldcode}"]`);

    const ths = elements[0].getElementsByTagName("table")[0].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("th")
    const tableBodyRows = elements[0].getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")
    for (let rown = 0; rown < tableBodyRows.length; rown++)
    {
        let row = []
        const tds = tableBodyRows[rown].getElementsByTagName("td")
        for (let i = 0; i < ths.length - 1; i++)//ボタンの列を除外するため、-1
        {
            const name = ths[i].getElementsByTagName("label")[0].innerText
            const id = tds[i].firstChild.getAttribute("data-vv-name").split("-")[2]
            const value = tds[i].firstChild.getElementsByTagName("input")[0].value;
            row.push({ name: name, id: id, value: value })
        }
        result.push(row)
    }
    return result;
}

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


function testModal()
{

    const fieldcode = "緊急連絡先_0"
    const modalId = "testModal"

    // const InputInfo = [{
    //     id: "tel", name: "telephone", attribute: {
    //         autocomplete: "tel",
    //         inputmode: "tel",
    //         placeholder: "08012345678",
    //     }, value: undefined
    // }, {
    //     id: "name", name: "name", attribute: {
    //         autocomplete: "family-name"
    //     }, value: undefined
    // },]
    addModalBtn(fieldcode, modalId)
}

async function main()
{
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

    testModal()
}

main();