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
const crypto = require('crypto')

class TransformHashStream extends stream.Transform {
  constructor (algorithm, options) {
    super(options)

    this._algorithm = algorithm
  }

  _transform (chunk, encoding, callback) {
    const hash = crypto.createHash(this._algorithm)

    hash.update(chunk)
    this.push(JSON.stringify({
      text: chunk.toString(),
      hash: hash.digest('hex')
    }))
    callback()
  }
}

module.exports = TransformHashStream
