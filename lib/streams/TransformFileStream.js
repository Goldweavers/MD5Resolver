/**
 * md5resolver
 * Copyright (c) Julien Sarriot 2020.
 * All rights reserved.
 *
 * This code is licensed under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files(the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions :
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const stream = require('stream')
const detectNewline = require('detect-newline')
const iconv = require('iconv-lite')

class TransformFileStream extends stream.Transform {
  constructor (options) {
    super(options);

    this.lines = 0
    this._partialLine = ''
  }

  _transform(chunk, encoding, callback) {
    let string = iconv.decode(chunk, 'latin1')
    const EOL = detectNewline(string)

    if (EOL === undefined) {
      this._partialLine = this._partialLine.concat(string)

      return callback()
    }
    if (this._partialLine.length > 0) {
      string = this._partialLine.concat(string)
      this._partialLine = ''
    }

    const lines = string.split(EOL)
    this.lines += lines.length
    lines.forEach(line => this.push(line))

    return callback()
  }
}

module.exports = TransformFileStream
