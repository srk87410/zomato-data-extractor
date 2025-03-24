(async () => {
  "use strict";


  function getAPIData(ajaxurl) {
    return $.ajax({
      url: ajaxurl,
      type: "GET",
      cache: false,
    });
  }

  function getAddressData(data) {
    
    return new Promise( async(resolve, reject) => {

      var response = {};

      try {
        const html = await getAPIData(data.website);
        var domParser = new DOMParser();

        domParser = domParser.parseFromString(html, "text/html");

        try {
          const address = domParser.querySelector(".vNCcy").innerText.trim();
          response.address = address;
        } catch (e) {
          console.log("Error: Address", e);
        }

        try {
          const direction = domParser
            .querySelectorAll(".sc-hEEUtg")
            .getAttribute("href");
            response.direction = direction;
        } catch (e) {
          console.log("Error: Address", e);
        }


        resolve(response);
        
      } catch (e) {
        console.log("Error: domParc", e);
        resolve(response)
      }
    })

  }


  function getMobile(data) {

  return new Promise((t, n) => {
    try {
      const query =
        (data.title ?? "") !== "" ? data.title : data.name + " " + data.address;

      chrome.runtime.sendMessage(
        { type: "get_phone_from_address", query: query },
        (response) => {
          if (response) {
            console.log("getMobile - " + response);
            t(response ?? "");
          } else {
            t("");
          }
        }
      );
    } catch (e) {
      console.log(e);
      t("");
    }
  });

}
  

  window.addEventListener("message", async (event) => {
    if (event.data.type === "INSERT_DATA") {
      console.log("INSERT_DATA:");
      const keyword = event.data.keyword;
      var data = event.data.data;

      data.phone = await getMobile(data);
      const addressData = await getAddressData(data);

      data = {...data, ...addressData};

      chrome.storage.local.get("scrap", function (res) {
        if (res.scrap.hasOwnProperty(keyword)) {
          if (res.scrap[keyword].data instanceof Array) {
            res.scrap[keyword].data.push(data);
          } else {
            res.scrap[keyword].data = [data];
          }
        } else {
          res.scrap[keyword] = {
            name: keyword,
            data: [data],
          };
        }
        chrome.storage.local.set({ scrap: res.scrap });
      });
    } else if (event.data.type === "DOWNLOAD") {

      const keyword = event.data.keyword;

      //auto download file
      chrome.runtime.sendMessage({
        type: "download",
        keyword: keyword,
      });

    }
  });

  function getSetting() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("setting", function (data) {
        if (data) {
          resolve(data.setting);
        } else {
          resolve(null);
        }
      });
    });
  }

  function fetchScript() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("script", function (data) {
        console.log("script.data", data);

        if (data) {
          resolve(data.script);
        } else {
          resolve(null);
        }
      });
    });
  }

  console.log("1. size: "+document.querySelectorAll(".sc-hAcydR").length)


  const setting = await getSetting();
  console.log("setting:", setting);
  window.SETTING = setting;

  const scriptData = await fetchScript();
  if (scriptData) {


    //window.onload = async function() {

    const divTag = document.createElement("div");
    let scriptTag = document.createElement("script");
    divTag.id = "main_section_inject";
    scriptTag.src = chrome.runtime.getURL("injectScript.bundle.js");
    //scriptTag.text = scriptData;
    scriptTag.async = false;
    scriptTag.type = "text/javascript";
    divTag.appendChild(scriptTag);
    document.body.appendChild(divTag);

    scriptTag.onload = async function () {
      console.log("script loaded!");
      window.postMessage({ type: "SETTING", setting: setting }, "*");
      window.postMessage({ type: "ON_LOAD_IS", scriptData: scriptData }, "*");

      
    };

  //}
  }
})();
