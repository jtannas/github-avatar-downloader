/**
 * CLI script to download all the contributors for a given repository
 * usage: $ node download_avatars.js <repoOwner> <repoName>
 */
console.log('Welcome to the GitHub Avatar Downloader!');


const request = require('request');
const fs = require('fs');
require('dotenv').config();


/**
 * Download an image at the specified URL
 *
 * @param url: The URL of the image
 * @param fileName: The name (without extension) of the downloaded file
 */
const downloadImage = function downloadImageByURL(url, fileName) {
  let fileType = '';
  request.get(url)
    .on('error', err => { throw err; })
    .on('response', response => {
      fileType = response.headers['content-type'].split('/')[1];
      console.log(`Response Code: ${response.statusCode} - ${response.statusMessage}`);
      console.log(`filename: ./avatars/${fileName}.${fileType}`);
    })
    .pipe(fs.createWriteStream('./avatars/' + fileName)
      .on('error', err => { throw err; })
      .on('finish', end => fs.renameSync('./avatars/' + fileName, `./avatars/${fileName}.${fileType}`))
    );
};

/**
 * Get the contributor information for a given GitHub repository
 *
 * @param repoOwner: The Github username of the repository owner
 * @param repoName: The Github repository name
 * @param callback: A callback function to process the github response
 */
const getRepoContributors = function getGithubRepoContributors(repoOwner, repoName, callback) {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      Authorization: process.env.GITHUB_API_TOKEN
    }
  };
  request(options, function(err, res, body) { callback(err, res, body); });
};

/**
 * Callback function to call for a download of each contributors avatar
 *
 * @param err: A 'require' response error object (not always present)
 * @param result: A 'require' response result object
 * @param body: A 'require' response body
 */
const constributorsCallback = function downloadAllContributorAvatars(err, result, body) {
  if (err) { throw err; }
  const contributors = JSON.parse(body);
  contributors.forEach(contributor => {
    downloadImage(contributor.avatar_url, contributor.login);
  });
};

/**
 * Main
 *
 * Validates CLI arguments and invokes the beginning of the callback chain
 */
const main = function runModuleMainFunction() {
  if (!process.argv[2] || !process.argv[3]) {
    console.log('usage: node download_avatars.js <repoOwner> <repoName>');
  } else {
    getRepoContributors(process.argv[2], process.argv[3], constributorsCallback);
  }
};
main();
