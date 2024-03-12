
function addModalBtn(fieldcode, rowNum)
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
        elements[0].parentElement.parentElement.appendChild(button);
    else
    {
        console.error("要素が見つかりません。フィールドコードが正しいか確認してください。");
        return;
    }

    const modalId = `${fieldcode}-${rowNum}`;


    // ボタンがクリックされたときの処理を設定
    button.addEventListener("click", () =>
    {
        console.log("bined modal id is : ", modalId);
        const InputInfo = FBgetTableContents(fieldcode);
        console.log("tableInfo : ", InputInfo)
        const modalElement = makeModalDom(modalId, InputInfo[rowNum])
        // ページの適切な場所にモーダルを追加
        document.body.appendChild(modalElement);
        setAutoBankInput("金融機関名_0", "支店名_0")//modal


        $('#' + modalId).modal('show'); // モーダルを表示する

        // モーダル内の保存ボタンにクリックイベントを追加
        const saveButton = document.querySelector(`#${modalId} .btn-primary`); // モーダル内の保存ボタンを取得
        // モーダルが閉じられたときの処理を設定
        $('#' + modalId).on('hidden.bs.modal', function ()
        {
            handleModalClose(modalId);
        });
    });
}

function getValuesFromModal(modalId)
{
    let result = [];
    const modalContent = document.querySelector(`#${modalId} .modal-content`);
    const inputElements = modalContent.querySelectorAll('.modal-body input'); // モーダル内のすべての入力フィールドを取得
    inputElements.forEach(input =>
    {
        const id = input.getAttribute("id"); // 入力フィールドのIDを取得
        const value = input.value; // 入力フィールドの値を取得
        result.push({ id: id, value: value }); // IDと値をオブジェクトとしてresultに追加
    });
    return result;
}



// モーダルが閉じられたときのイベントハンドラー
function handleModalClose(modalId)
{
    console.log("モーダルが閉じられました。モーダルID:", modalId);
    const modalInputs = getValuesFromModal(modalId)
    modalInputs.forEach((input) =>
    {
        const queryStr = `[data-vv-name="${modalId}-${input.id}"]`
        const element = document.querySelector(queryStr);
        element.children[0].value = input.value;
    });

    //modalを削除する
    document.getElementById(modalId).remove();
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
        inputElement.setAttribute("id", `${input.id}`);
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
    `;
    modalContent.appendChild(modalFooter);

    return modalElement;
}




const fieldcode = "給与振込口座情報"
document.addEventListener("DOMContentLoaded", function (event)
{
    // すべてのスクリプトがロードされた後にallScriptsLoaded関数を実行

    addModalBtn(fieldcode, 0)
});


function setAutoBankInput(name_id, branch_id)
{
    const name_dom = document.getElementById(name_id);
    const branch_dom = document.getElementById(branch_id);
    name_dom.setAttribute("list", `datalist_${name_id}`)
    branch_dom.setAttribute("list", `datalist_${branch_id}`)
    if (name_dom == undefined || branch_dom == undefined)
    {
        console.error("bank name or branch field id is incorrect.")
        return
    }
    name_dom.addEventListener("keyup", () =>
    {
        let post_url = "https://bank.teraren.com/banks/search.json";
        const input = document.getElementById(name_id).value;
        if (isNaN(input)) //名前の場合
            post_url += `?name=${input}`;
        else
        {
            //金融機関コードの場合
            if (input.length < 4) return;
            post_url += `?code=${input}`;
        }

        const res = fetch(post_url, {
            timeout: 10000,
        });
        res
            .then((response) => response.json())
            .then((data) =>
            {
                let dataObject = [];
                data.forEach((eachData) =>
                {
                    dataObject.push({
                        name: eachData.normalize.name,
                        code: eachData.code,
                    });
                });
                console.log("金融機関名", dataObject)
                const AC = new AttributeControl()
                AC.update_datalist(
                    `datalist_${name_id}`,
                    dataObject
                );

                // if (data.length == 1)
                // {
                //     //検索候補が１つに絞れた場合
                //     state.record.金融機関名.value = data[0].normalize.name;
                //     const bank_code = data[0].code;
                //     post_url = `https://bank.teraren.com/banks/${bank_code}/branches.json`;
                //     const branch_list_res = fetch(post_url, {
                //         timeout: 10000,
                //     });
                //     branch_list_res
                //         .then((branch_list_response) => branch_list_response.json())
                //         .then((branch_list_data) =>
                //         {
                //             let dataObject = [];
                //             branch_list_data.forEach((eachData) =>
                //             {
                //                 dataObject.push({
                //                     name: eachData.normalize.name,
                //                     code: eachData.code,
                //                 });
                //             });
                //             update_datalist(
                //                 "支店名",
                //                 autocompleteList_obj.支店名.list,
                //                 dataObject
                //             );

                //             fb.getElementByCode(
                //                 "支店名"
                //             ).children[1].children[0].readOnly = false; //銀行名が確定して初めて支店名を入力可能に
                //             fb.getElementByCode(
                //                 "支店名"
                //             ).children[1].children[0].placeholder =
                //                 "支店名が見つからない場合は手入力";
                //             move_focus();
                //         });
                // }
            });
    })
}