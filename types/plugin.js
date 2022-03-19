exports.handlers = {
  newDoclet({doclet}) {
    if (doclet.comment.includes("'-1'")) {
      doclet.comment = doclet.comment.split("'-1'").join('-1');
      const stringify = JSON.stringify(doclet.properties).split("'-1'").join('-1');
      doclet.properties = JSON.parse(stringify);
    }
  }
}