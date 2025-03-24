(() => {
  "use strict";

  window.addEventListener("message", (event) => {

    //console.log("message received:", event.data.type);

    if (event.data.type === "SETTING") {
        console.log("SETTING:",event.data.setting);
        window.SETTING = event.data.setting;

    }else if (event.data.type === "ON_LOAD_IS") {

        console.log("ON_LOAD_IS STARTED:");

      const divTag = document.createElement("div");
      let scriptTag = document.createElement("script");
      divTag.id = "main_section";
      scriptTag.text = event.data.scriptData;
      scriptTag.async = false;
      scriptTag.type = "text/javascript";
      scriptTag.defer = true;
      divTag.appendChild(scriptTag);
      document.body.appendChild(divTag);


      console.log("2. size: "+document.querySelectorAll(".sc-hAcydR").length)

    }

  });
})();
