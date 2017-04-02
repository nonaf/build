function skipChars(text, index, ch1, ch2, ch3) {
   ch1 = ch1 || ' ';
   ch2 = ch2 || '\t';
   ch3 = ch3 || ch1;
   var ch = text[index];
   while (ch == ch1 || ch == ch2 || ch == ch3) {
      ch = text[++index];
   }
   return index;
}

function quotedString(text, index) {
   var scope = '';
   index++;//skip starting quote
   while (text[index] != '"' && text[index] != "'") {
      scope += text[index++];
   }
   index++;//skip ending quote
   return {
      scope: scope,
      index: index
   };
}

function getStyle(text, index) {
   var styleStart = '<style';
   var styleEnd = '</style>';
   var scopeStr = 'scope';
   var style = '';
   var scope = '';
   var result;
   var endIndex = -1;
   var startIndex = text.indexOf(styleStart, index);
   index = startIndex;
   if (index >= 0) {
      index += styleStart.length;
      index = skipChars(text, index);
      if (text[index] == '>') {
         index++;
      }
      else {
         index = text.indexOf(scopeStr, index);
         if (index >= 0) {
            index += scopeStr.length;
            index = skipChars(text, index, 0, 0, '=');
            result = quotedString(text, index);
            result.index = skipChars(text, result.index);
            if (text[result.index] != '>') {
               throw {error: '<style should close with ">"'};
            }
            index = result.index + 1; //add 1 for closing ">"
            scope = result.scope;
         }
      }
      endIndex = text.indexOf(styleEnd, index);
      if (endIndex < 0) {
         throw {error: 'Bad <style> block'};
      }
      style = text.substring(index, endIndex);
      endIndex += styleEnd.length;
   }
   if (scope) {
      style = scope + '{' + style + '}';
   }
   return {
      start: startIndex,
      end: endIndex,
      style: style
   };
}

function parseTemplate(text) {
   var list = [];
   var result = getStyle(text, 0);
   var styles = '';
   var html = '';
   var start = 0;
   while (result.start > -1) {
      list.push(result);
      styles += result.style + '\n';
      result = getStyle(text, result.end);
   }
   if (list.length > 0) {
      list.forEach(function (chunk) {
         html += text.slice(start, chunk.start);
         start = chunk.end;
      });
   }
   html += text.slice(start);
   return {
      styles: styles,
      html: html.trim() + '\n'
   }
}

module.exports = parseTemplate;
