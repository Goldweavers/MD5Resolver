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

/**
 * INF36207_MD5
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

const moment = require('moment')
const inquirer = require('inquirer')
const figlet = require('figlet')
const numeral = require('numeral')
const fs = require('fs')

const TransformFileStream = require('./streams/TransformFileStream')
const TransformHashStream = require('./streams/TransformHashStream')
const logger = require('./utils/logger')

const config = require('./config')
const questions = require('./config/questions')

figlet(config.APP.NAME, (err, data) => {
  if (err) {
    logger.error(`échec du démarrage (${err.message})`)
    return process.exit(err.code || 1)
  }

  data.split('\n').forEach(logger.info.bind(logger))

  async function bootstrap () {
    const { dictionary, hash } = await inquirer.prompt(questions)
    const hashes = new TransformHashStream('MD5')
    const file = new TransformFileStream()
    const wordlist = fs.createReadStream(dictionary)

    let tries = 0
    const startedAt = moment()
    let found = false

    wordlist.pipe(file).pipe(hashes)

    return new Promise(resolve => {
      const timer = setInterval(statusReport, 5000);

      hashes
        .on('data', data => {
          const word = JSON.parse(data)

          if (word.hash === hash) {
            logger.warn(`Correspondance trouvée: ${word.text}`)
            logger.warn(`Votre hash: ${hash}`)
            wordlist.destroy()
            found = true
          } else if (found === false) {
              tries = tries + 1;
          }
        })

      wordlist
        .on('open', statusReport)
        .on('close', () => {
          clearInterval(timer)
          statusReport()
          return resolve()
        })
    })

    ////////////////////////////////////////:

    function statusReport () {
      const startedSince = moment().diff(startedAt, 'ms')

      logger.info(`Temps écoulé: ${numeral(startedSince).format('0,0')} millisecondes`)
      logger.info(`Nombre d'essais: ${numeral(tries).format('0,0')}/${numeral(file.lines).format('0,0')}`)
    }
  }

  const start = () => bootstrap()
    .catch(err => logger.error(err.message))
    .finally(start)

  return start()
})
