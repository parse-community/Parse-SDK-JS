exports.handlers = {
  beforeParse(e) {
    const isTypes = process.argv.some(opt => opt === '-p')
    const string = [];
    const needle = isTypes ? '</docs>' : '</types>'
    const split = e.source.split(needle);
    for (const sub of split) {
      const newSplit = needle.replace('/','');
      if (sub.includes(newSplit)) {
        string.push(sub.split(newSplit)[0]);
      } else {
        string.push(sub);
      }
    }
    e.source = string.join('')
      .replaceAll('<types>', '')
      .replaceAll('</types>', '')
      .replaceAll('<docs>', '')
      .replaceAll('</docs>', '')
  }
}
