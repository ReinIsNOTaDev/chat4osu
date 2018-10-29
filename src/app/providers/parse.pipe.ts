import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'parse' })
export class ParsePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

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
    const pattern = /(\[(https?:\/\/[^\]\s]+)\s(.*(((\[)[^\[\]]*)+((\])[^\[\]]*)+)*)\]|(https?:\/\/[^\]\s]+))/gi;
    let match;

    // Temporary var to store message, prevent infinite loop
    let output = parsedValue;

    // Replace each match with a functional link
    while ((match = pattern.exec(parsedValue)) !== null) {
      // Regular link
      if (match[9]) {
        output = output.replace(
          match[0],
          `<a href='${match[9]}' title='${
            match[9]
          }' class='link' target="_blank">${match[9]}</a>`
        );
      }

      // Bracket link
      if (match[2] && match[3]) {
        output = output.replace(
          match[0],
          `<a href='${match[2]}' title='${
            match[2]
          }' class='link' target="_blank">${match[3]}</a>`
        );
      }
    }

    return output;
  }
}
