(function () {
  var images = window.EasifyBoxBuilderImages || {};
  var script = document.currentScript;
  var scriptDirectory = "";
  if (script && script.src) {
    scriptDirectory = new URL(".", script.src).href;
  }

  function resolve(keyOrSource) {
    var source = images[keyOrSource];
    if (typeof source === "string" && source) {
      return source;
    }
    if (typeof keyOrSource !== "string") {
      return keyOrSource;
    }
    if (!scriptDirectory || keyOrSource.indexOf("://") !== -1 || keyOrSource.indexOf("//") === 0) {
      return keyOrSource;
    }
    return new URL(keyOrSource, scriptDirectory).href;
  }

  images.resolve = resolve;
  window.EasifyBoxBuilderImages = images;
}());
