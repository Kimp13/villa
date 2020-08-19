module.exports = {
  shortenTextTo: (text, length, cutTags = false) => {
    if (cutTags) {
      text = text.replace(/<\/?.+?>/g, '');
    }

    if(text.length <= length) {
      return text;
    }

    let i = length;

    while(text.charCodeAt(--i) > 32) {
      if (i === 0) {
        return text.slice(0, length) + '...';
      }
    }

    let indexAfterFirstLoop = i;
    while(text.charCodeAt(--i) <= 32) {
      if (i === 0) {
        return text.slice(indexAfterFirstLoop + 1) + '...';
      }
    }
    return text.slice(0, i + 1) + '...';
  }
}