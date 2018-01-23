const request = require('request');
const fs = require('fs');
const apiToken = require('./secrets').GITHUB_API_TOKEN;

console.log('Welcome to the GitHub Avatar Downloader!');

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


const getRepoContributors = function getGithubRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      Authorization: apiToken
    }
  };
  request(options, function(err, res, body) {
    cb(err, res, body);
  });
};

getRepoContributors("jquery", "jquery", function(err, result, body) {
  if (err) { throw err; }

  const contributors = JSON.parse(body);
  contributors.forEach(contributor => {
    downloadImage(contributor.avatar_url, contributor.login);
  });
});
