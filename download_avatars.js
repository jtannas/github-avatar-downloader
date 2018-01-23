const request = require('request');
const fs = require('fs');
const apiToken = require('./secrets').GITHUB_API_TOKEN;

console.log('Welcome to the GitHub Avatar Downloader!');

const getRepoContributors = function getGithubRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      Authorization: apiToken
    }
  };
  request(options, function(err, res, body) {
    cb(err, body);
  });
};

getRepoContributors("jquery", "jquery", function(err, result) {
  if (err) { throw err; }

  const contributors = JSON.parse(result);
  contributors.forEach(contributor => {
    console.log(contributor.avatar_url);
  });
});


const downloadImage = function downloadImageByURL(url, fileName) {
  request.get(url)
    .on('error', err => { throw err; })
    .on('response', response => {
      console.log(`Response Code: ${response.statusCode} - ${response.statusMessage}`);
      console.log(`content-type: ${response.headers['content-type']}`);
      console.log('... Download beginning ...');
    })
    .pipe(fs.createWriteStream(`./avatars/${fileName}`)
      .on('error', err => { throw err; })
      .on('finish', end => console.log('--- Download Complete ---'))
    );
};

downloadImage("https://avatars2.githubusercontent.com/u/2741?v=3&s=466", "kvirani.jpg");
