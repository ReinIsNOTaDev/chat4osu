import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'parse' })
export class ParsePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): any {
    // Parse links
    const parsedValue = this.parseForLinks(value);

    // TODO: Parse #channels

    return this.sanitizer.bypassSecurityTrustHtml(parsedValue);
  }

  parseForLinks(value: string) {
    let parsedValue = value;

    // Escape message from all injected scripts and html tags
    parsedValue = parsedValue.replace('<', '&lt;').replace('>', '&gt;');

    // Search for all links in a message
    const pattern = /(?:\[(https?:\/\/[^\s]+)\s([^[]+|(?:.*\[.+\][^[]*))\]|(https?:\/\/[^\s]+))/gi;
    let match;
    const matches = [];

    // Replace each match with a functional link
    while ((match = pattern.exec(parsedValue)) !== null) {
      let newText;

      // Regular link
      if (match[3]) {
        newText = `<a href='${match[3]}' title='${match[3]}' class='link' target="_blank">${match[3]}</a>`;
      }

      // Bracket link
      if (match[1] && match[2]) {
        newText = `<a href='${match[1]}' title='${match[1]}' class='link' target="_blank">${match[2]}</a>`;
      }

      matches.push({
        indexStart: match.index,
        indexEnd: match.index + match[0].length,
        oldText: match[0],
        newText
      });
    }

    let output = '';
    let index = 0;
    for (const mch of matches) {
      const textBefore = parsedValue.slice(index, mch.indexStart);
      output += textBefore + mch.newText;
      index = mch.indexEnd;
    }

    output += parsedValue.slice(index, parsedValue.length);

    return output;
  }
}
