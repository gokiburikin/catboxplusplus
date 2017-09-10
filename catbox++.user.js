// ==UserScript==
// @name         catbox++
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  a
// @author       pettankon
// @match        https://catbox.moe/user/view.php*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.12/URI.min.js
// ==/UserScript==

(function() {
    'use strict';

    var currentUriQuery = new URI(window.location.href).search(true);
    var currentPage = currentUriQuery.page || 1;
    currentPage = Number(currentPage);
    var sortBy = currentUriQuery.sortby || "oldest";
    var maxPage = Number(new URI($("#pageinator").children().last().attr("href")).search(true).page);
    
    var nextPageQueried = false;
    var userhash = $("input[name='userhash']").val();
    var results = document.querySelector("#results");
    var notesmall = document.querySelector(".notesmall");
    var toggleSelectionWrapper = document.createElement("DIV");
    var toggleSelection = document.createElement("A");
    toggleSelection.id = "toggleSelection";
    toggleSelection.style.cursor = "pointer";
    toggleSelection.classList.add("linkbutton");
    toggleSelection.appendChild(document.createTextNode("Toggle Selection"));
    toggleSelection.onclick = function()
    {
        var checkboxes = $("#results").children().children().filter("input[type=checkbox]").get();
        for ( var k in checkboxes )
            checkboxes[k].checked = !checkboxes[k].checked;
    };
    toggleSelectionWrapper.appendChild(toggleSelection);
    var options = document.createElement("DIV");
    options.classList.add("options");
    options.appendChild(toggleSelectionWrapper);
    
    function QuickDelete(node,callback)
    {
        $.post("api.php", { reqtype: "deletefiles", files: node.querySelector("input[type=checkbox]").value, userhash:  userhash}, function(data,textStatus,jqXHR) {
            if ( callback != null )
                callback(null,textStatus);
        }).fail(function(err)
        {
            if ( callback != null )
                callback(err,null);
        });
    }
    
    function ModifyResults(results)
    {
        var resultsDivs = results.querySelectorAll(".col-1-8");
        for ( var i = 0; i < resultsDivs.length; i++ )
        {
            let c = resultsDivs[i];
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
                    QuickDelete(c,function(err,status)
                    {
                        if ( err !== null )
                        {
                            console.log(err);
                            quickDelete.enabled = true;
                        }
                        else
                        {
                            c.parentNode.removeChild(c);
                        }
                    });
                    quickDelete.enabled = false;
                }
            });
            c.appendChild(quickDelete);
        }
    }
    
    ModifyResults(results);
    
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
    
    window.addEventListener("scroll", function(event)
    {
        var maximum = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        if ( window.scrollY >= maximum-window.innerHeight && nextPageQueried === false && currentPage < maxPage )
        {
            nextPageQueried = true;
            $.get("view.php",{page:++currentPage,sortBy:sortBy},function(data)
            {
                nextPageQueried = false;
                var tempDom = $('<output>').append($.parseHTML(data));
                var newResults = $('#results', tempDom);
                ModifyResults(newResults.get(0));
                //newResults.children().appendTo(results);
                var newChildren = newResults.children();
                newChildren.each(function(index,obj){
                    var id = "#"+obj.id.replace(/\./g,"\\.");
                    if ( $(id,results).get(0) === undefined )
                    {
                        results.appendChild(obj);
                    }
                });
            }).fail(function(err)
                    {
                console.log(err);
            });
        }
    });
})();
