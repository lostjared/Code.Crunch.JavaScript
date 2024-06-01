      function crunch(input) {
            let data = input;
            data = removeMlComment(data);
            const lines = data.split('\n');
            let output = '';

            lines.forEach(line => {
                if (line.trim() === '') {
                    // Skip empty lines
                    return;
                }
                if (line.trim().startsWith('#')) {
                    output += line + '\n';
                } else {
                    output += crunchLine(line) + ' ';
                }
            });

            // Replace multiple spaces with a single space
            output = output.replace(/\s\s+/g, ' ');

            return output.trim();
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