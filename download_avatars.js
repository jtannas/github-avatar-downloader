const request = require('request');
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
