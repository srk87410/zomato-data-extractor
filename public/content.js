/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

timeout = (e) => {
  return new Promise((t, l) => {
    try {
      setTimeout(function () {
        t();
      }, e);
    } catch (e) {
      console.log(e);
    }
  });
};

scrapCurrentPage = async (col) => {
  let data = {};
  return new Promise(async (resolve, reject) => {
    try {
      try {
        const name = col
          .querySelectorAll(".sc-1hp8d8a-0")
          .item(0)
          .innerText.trim();
        data.name = name;
      } catch (e) {
        console.log("Error: Name", e);
      }

      try {
        const category = col.querySelector(".eWQqcH").innerText.trim();
        data.category = category;
      } catch (e) {
        console.log("Error: Category", e);
      }

      try {
        data.website =
          "https://www.zomato.com/" +
          col.querySelector("a").getAttribute("href");
      } catch (e) {
        console.log("Error: Link", e);
      }

      try {
        var rating = col.querySelector(".cILgox").innerText.trim();
        data.rating = rating;
      } catch (e) {
        console.log("Error: Rating", e);
      }

      resolve(data);
    } catch (e) {
      console.log(e);
      resolve(null);
    }
  });
};


const insertItem = (keyword, data) => {
  console.log("insertItem:", data);

  window.postMessage(
    { type: "INSERT_DATA", data: data, keyword: keyword },
    "*"
  );
};

// const range = (start, end, length = end - start + 1) =>
//   Array.from({ length }, (_, i) => start + i);

// startScraping = (startIndex, keyword, setting) => {
//   console.log("startScraping start: ", startIndex);

//   return new Promise(async (resolve, reject) => {
//     let rowItems = document.querySelectorAll(".bLMtNo");
//     const totalRow = rowItems.length;

//     if (totalRow > 0) {
//       console.log("startScraping total card:", totalRow);

//       //var keywordData = [];

//       const arr = range(startIndex, totalRow - 1);
//       console.log("arr:", JSON.stringify(arr));
//       await asyncForEach(arr, async (i, index) => {
//         console.log("Card scrap start:", index);
//         let colItems = rowItems[i].querySelectorAll(".jumbo-tracker");

//         const totalCol = colItems.length;

//         console.log("count Total totalCol in main card", totalCol);
//         if (totalCol > 0) {
//           await asyncForEach(colItems, async (col, colIndex) => {
//             var cardPopupResult = await scrapCurrentPage(col);

//             console.log(
//               "startScraping cardPopupResult:",
//               JSON.stringify(cardPopupResult)
//             );

//             if (cardPopupResult) {
//               await insertItem(keyword, cardPopupResult);
//             } else {
//               console.log(
//                 "startScraping col:" +
//                   colIndex +
//                   " row:" +
//                   i +
//                   " => data not found"
//               );
//             }
//           });
//         }

//         rowItems[i].scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//           inline: "nearest",
//         });
//       });

//       resolve(totalRow);
//     } else {
//       resolve(false);
//     }
//   });
// };



const startScraping = (cards, keyword, setting) => {
  console.log("startScraping start");

  return new Promise(async (resolve, reject) => {
    
    try{
    console.log("Total Cards:", cards.length);
    //console.log("Cards typeof",typeof cards);
    //console.log("Cards Is Array", Array.isArray(cards));

      await asyncForEach(cards, async (card, index) => {
        await timeout(500);
        console.log(`Card: ${index}/${cards.length}`);

        //scroll to card
        card.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        var cardPopupResult = await scrapCurrentPage(card);

        if (cardPopupResult) {
          await insertItem(keyword, cardPopupResult);
        } else {
          console.log(`Card ${index}/${cards.length} scrap failed`);
        }
      });

      console.log("New List Task Completed");
      await timeout((setting.delay ?? 1) * 1000);
      resolve(true);
    }catch(err){
      console.log("startScraping Error:",err);
      resolve(false);
    }
  });
};

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

(async () => {
  console.log("Scraping Started");
  //window.onload = async function() {

  //console.log("3. card size: "+document.querySelectorAll(".gAkuDn .sc-hAcydR").length)
  //console.log("3. row size: "+document.querySelectorAll(".sc-iBfVdv").length)


   


  //waitForElm(".sc-hAcydR").then(async (elm) => {
    //console.log("Card Tag found");

    //const c = getCards();
    //console.log("Total Card Tag found:",c.length)

    
    const searchParams = new URLSearchParams(window.location.search);
    const keyword = searchParams.get("KID"); //location.href.replace("https://www.zomato.com/","").inputKeyword.replace(/ /g, "_").toLowerCase()  //location.href.split("/").reverse()[1]; //getParameterByName(location.href, "keyword");
    console.log("Scraping keyword:", keyword);
    //const { setting } = await chrome.storage.local.get("setting");
    const setting = window.SETTING;
    console.log("Scraping setting:", setting);
    var isDone = false;
    var scrapingIndex = 0;

    //await timeout(5000);

    // try {
    //   console.log("scroll to title");
    //   const titleDiv = document.querySelector(".efBcpU");

    //   if (titleDiv) {
    //     //scroll to title
    //     titleDiv.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center",
    //       inline: "nearest",
    //     });
    //   }
    // } catch (e) {
    //   console.log("titleDiv:", titleDiv);
    // }



    const observer = new MutationObserver(mutations => {
      mutations.forEach(async mutation => {
        if (mutation.addedNodes.length) {

          const newElements = Array.from(mutation.addedNodes);

          console.log("Total newElements:", newElements.length);

          const cards = newElements; //document.querySelectorAll(".sc-hAcydR");
          console.log("Total Cards:", cards.length);

          if(Array.isArray(cards)){
            
          const newCardList = cards.slice(scrapingIndex); 

          const result = await startScraping(newCardList,keyword, setting);
          console.log("startScraping response:", result);
          if (result) {
            scrapingIndex = cards.length;
            //isDone = true;
            //window.postMessage({ type: "DOWNLOAD", keyword: keyword }, "*");
          }else{
            isDone = true;
          }

        }else{
          console.log("Cards Not Found");
          //window.scrollBy(0, 50);
        }


        }
      });
    });
    
    observer.observe(document.querySelector(".gAkuDn"), { childList: true });


    waitForElm(".jqxTcv").then(async (elm) => {
      console.log("task completed successfully");

      if(isDone){
        window.postMessage({ type: "DOWNLOAD", keyword: keyword }, "*");
      }

    })

   
    console.log("Scraping done:", isDone);

  //});

//}
})();
