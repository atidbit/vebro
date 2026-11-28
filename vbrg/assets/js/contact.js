(function () {
  var parts = ["nworb.rd", "moc.yeh"];
  var address = parts[0].split("").reverse().join("") + "@" + parts[1].split("").reverse().join("");
  document.querySelectorAll('a[href$="#email-me"]').forEach(function (link) {
    link.href = "mailto:" + address;
  });
})();
