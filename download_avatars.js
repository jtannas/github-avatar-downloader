/**
 * CLI script to download all the contributors for a given repository
 * usage: $ node download_avatars.js <repoOwner> <repoName>
 */
console.log('Welcome to the GitHub Avatar Downloader!');


const request = require('request');
const fs = require('fs');
if (!fs.existsSync('.env')) {
  throw 'The .env configuration file is missing';
}
require('dotenv').config({ silent: false });

/**
 * Download an image at the specified URL
 *
 * @param url: The URL of the image
 * @param fileDir: The directory to download the file into. Created if not already existing.
 * @param fileName: The name (without extension) of the downloaded file
 */
const downloadImage = function downloadImageByURL(url, fileDir, fileName) {
  let fileType = '';
  let filePath = fileDir + fileName;
  if (!fs.existsSync(fileDir)) { fs.mkdirSync(fileDir); }

  request.get(url)
    .on('error', err => { throw err; })
    .on('response', response => {
      fileType = response.headers['content-type'].split('/')[1];
      console.log(`Response Code: ${response.statusCode} - ${response.statusMessage}`);
      console.log(`filePath: ${filePath}.${fileType}`);
    })
    .pipe(fs.createWriteStream(fileDir + fileName)
      .on('error', err => { throw err; })
      .on('finish', end => fs.renameSync(filePath, `${filePath}.${fileType}`))
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
  if (!process.env.GITHUB_API_TOKEN) { throw 'The Github API Token is missing from the .env file'; }
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

  if (contributors.message === "Not Found") {
    console.log(" --- !!! --- Repo not found --- !!! --- ");
    return;
  }
  if (result.statusCode !== 200) {
    throw `${result.statusCode} - ${result.statusMessage}`;
  }

  contributors.forEach(contributor => {
    downloadImage(contributor.avatar_url, './avatars/', contributor.login);
  });
};

/**
 * Main
 *
 * Validates CLI arguments and invokes the beginning of the callback chain
 */
const main = function runModuleMainFunction() {
  if (process.argv.length !== 4) {
    console.log('usage: node download_avatars.js <repoOwner> <repoName>');
  } else {
    getRepoContributors(process.argv[2], process.argv[3], constributorsCallback);
  }
};
main();
