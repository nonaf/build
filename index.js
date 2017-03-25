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
   var endIndex;
   index = text.indexOf(styleStart, index);
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
      index = endIndex + styleEnd.length;
   }
   if (scope) {
      style = scope + '{' + style + '}';
   }
   return {
      index: index,
      style: style
   };
}

function getStyles(text) {
   var index = 0;
   var result = getStyle(text, index);
   var styles = '';
   while (result.index > index) {
      index = result.index;
      styles += result.style;
      result = getStyle(text, index);
   }
   return {
      styles: styles,
      index: index
   }
}

module.exports = getStyles;
