// ==UserScript==
// @name         catbox++
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  a
// @author       pettankon
// @match        https://catbox.moe/user/view.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var userhash = $("input[name='userhash']").val();
    var results = document.querySelector("#results");
    var resultDivs = results.querySelectorAll(".col-1-8");
    var notesmall = document.querySelector(".notesmall");
    var toggleSelectionWrapper = document.createElement("DIV");
    var toggleSelection = document.createElement("A");
    toggleSelection.id = "toggleSelection";
    toggleSelection.style.cursor = "pointer";
    toggleSelection.classList.add("linkbutton");
    toggleSelection.appendChild(document.createTextNode("Toggle Selection"));
    toggleSelection.onclick = function()
    {
        for ( var i = 0; i < resultDivs.length; i++ )
        {
            var c = resultDivs[i];
            var checkboxes = c.querySelectorAll("input[type=checkbox]");
            for ( var j = 0; j < checkboxes.length; j++ )
            {
                checkboxes[j].checked = !checkboxes[j].checked;
            }
        }
    };
    toggleSelectionWrapper.appendChild(toggleSelection);
    var options = document.createElement("DIV");
    options.classList.add("options");
    options.appendChild(toggleSelectionWrapper);
    
    for ( var i = 0; i < resultDivs.length; i++ )
    {
        let c = resultDivs[i];
        c.id = c.querySelector("input[type=checkbox]").value;

        let quickDelete = document.createElement("A");
        quickDelete.enabled = true;
        quickDelete.style.fontSize = "0.8em";
        quickDelete.style.display = "block";
        quickDelete.style.cursor = "pointer";
        quickDelete.appendChild(document.createTextNode("Delete"));
        quickDelete.classList.add("linkbutton");
        quickDelete.addEventListener("click", function()
        {
            if ( quickDelete.enabled === true )
            {
                $.post("api.php", { reqtype: "deletefiles", files: c.id, userhash:  userhash}, function(data,textStatus,jqXHR) {
                    if ( textStatus === "success")
                    {
                        c.parentNode.removeChild(c);
                    }
                    else
                    {
                        quickDelete.enabled = true;
                    }
                });
                quickDelete.enabled = false;
            }
        });
        c.appendChild(quickDelete);
    }
    
    var _BeginEdit = BeginEdit;
    BeginEdit = function(num)
    {
        _BeginEdit(num);
        if ( num === 2 )
        {
            $("#toggleSelection").show();
        }
    };
    
    var _StopEdit = StopEdit;
    StopEdit = function()
    {
        _StopEdit();
        $("#toggleSelection").hide();
    };
    
    notesmall.querySelector("p:nth-child(2)").appendChild(options);
    $("#toggleSelection").hide();
})();
