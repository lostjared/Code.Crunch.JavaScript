const cppOperators = [
    "=", "==", "!=", "<", ">", "<=", ">=", "+", "-", "*", "/", "%",
    "++", "--", "&&", "||", "!", "&", "|", "^", "~", "<<", ">>",
    "?", ":", "::", ".", "->", "[]", "()", "{}", "[]=", "->*", ".*", "+=", "-=", "*=", "/=", "%=",
    "&=", "|=", "^=", "<<=", ">>=", ",", ";", "."
];

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeSpaces(input) {
    let regexParts = cppOperators.map(op => escapeRegExp(op));
    let allSymbols = [...regexParts, '\\{', '\\}', '\\(', '\\)', '\\[', '\\]'];
    let combinedRegex = new RegExp(`\\s*(${allSymbols.join('|')})\\s*`, 'g');
    let result = input.replace(combinedRegex, '$1');
    result = result.replace(/(\w)\s+([\{\}\(\)\[\]\,;])/g, '$1$2');
    result = result.replace(/([\{\}\(\)\[\]\,;])\s+(\w)/g, '$1$2');
    return result;
}

function filterString(input) {
    let left = '';
    let quoted = '';
    let right = '';
    let i = 0;

    for (i = 0; i < input.length; ++i) {

        if(input[i] == '/'  && i + 1 < input.length && input[i+1] == '/') {
            // eat comment
            while(i < input.length && input[i] != '\n')
            i++;
            continue;
        }

        if (input[i] == '\"')
            break;
        else
            left += input[i];
    }

    let rightPart = input.substring(i);
    let quotedResult = filterQuote(rightPart);

    if (quotedResult) {
        quoted = quotedResult[0];
        let quoteEndIndex = quotedResult[1];
        right = rightPart.substring(quoteEndIndex);

        return [left, quoted, right];
    }
}

function filterQuote(input) {
    let quoted = '\"';
    for (let i = 1; i < input.length; ++i) {
        if (input[i] == '\\' && i < input.length - 1) {
            quoted += input[i];
            quoted += input[i + 1];
            i += 1;
            continue;
        }
        if (input[i] == '\"') {
            quoted += '\"';
            return [quoted, i + 1];
        } else {
            quoted += input[i];
        }
    }
    return null;
}

function parseInput(input) {
    let arr = [];
    let pos = input.indexOf("\"");

    while (input.length > 0) {
        if (pos === -1) {
            let lines = input.split('\n');
            for (let line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('#')) {
                    arr.push(line);
                } else {
                    let words = line.split(' ').filter(word => word.trim() !== '');
                    arr.push(...words);
                }
            }
            break;
        } else {
            let filter_str = filterString(input);
            let left = filter_str[0];
            let quotedValue = filter_str[1];
            let remaining = filter_str[2];

            if (left.length > 0) {
                let lines = left.split('\n');
                for (let line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('#')) {
                        arr.push(line);
                    } else {
                        let words = line.split(' ').filter(word => word.trim() !== '');
                        arr.push(...words);
                    }
                }
            }

            arr.push(quotedValue.trim());

            input = remaining;
        }

        pos = input.indexOf("\"");
    }

    return arr;
}

function procLine(line, last = false) {
    let output = '';
    if (line.trim() === '') {
        return '';
    }
    if (line.trim().startsWith("\"")) {
        output += line;
    } else if (line.trim().startsWith('#')) {
        if (last === true)
            output += "\n";

        output += line + "\n";
    } else {
        let linez = crunchLine(line) + ' ';
        linez = linez.replace(/\s\s+/g, ' ');
        linez = removeSpaces(linez);
        output += linez;
    }
    return output;
}

function crunch(input) {
    let data = input;
    data = removeMlComment(data);
    const lines = parseInput(data);
    let output = '';
    for (let i = 0; i < lines.length - 1; ++i) {
        let line = lines[i];
        output += procLine(line);
    }
    if (lines.length - 1 > 0)
        output += procLine(lines[lines.length - 1], true);
    return output;
}

function removeMlComment(text) {
    let temp = '';
    for (let i = 0; i < text.length; i++) {
        if (chkChr(text, i, '/') && chkChr(text, i + 1, '*')) {
            i++;
            do {
                i++;
            } while (!(chkChr(text, i, '*') && chkChr(text, i + 1, '/')));
            i++;
        } else {
            temp += text[i];
        }
    }
    return temp;
}

function chkChr(text, i, c) {
    return i < text.length && text[i] === c;
}

function crunchLine(s) {
    let output = '';
    let grabString = false;
    let grabChar = false;

    for (let i = 0; i < s.length; i++) {
        if (!grabString && !grabChar) {
            if (!testchr(s, i)) {
                continue;
            }
            if (s[i] === '/' && i + 1 < s.length && s[i + 1] === '/') {
                if (output.endsWith(' ')) {
                    output = output.slice(0, -1);
                }
                return output;
            }
        }

        if (s[i] === '\\' && (grabString || grabChar)) {
            output += s[i];
            if (i + 1 < s.length) {
                output += s[i + 1];
                i++;
            }
            continue;
        } else if (s[i] === '\"') {
            grabString = !grabString;
        } else if (s[i] === '\'' && !grabString) {
            grabChar = !grabChar;
        }

        output += s[i];
    }
    return output;
}

function testchr(s, i) {
    if (s[i] === '\t' || s[i] === '\r' || s[i] === '\n') {
        return false;
    }
    if (s[i] === ' ' && i + 1 < s.length && s[i + 1] === ' ') {
        i++;
        return false;
    }
    if (s[i] === '\\' && i + 1 < s.length && s[i + 1] !== '\\') {
        return false;
    }
    return true;
}

function crunchText() {
    const inputText = document.getElementById('inputText').value;
    const outputText = crunch(inputText);
    document.getElementById('output').innerText = outputText;
}