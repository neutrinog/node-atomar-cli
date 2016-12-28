'use strict';

let shell = require('shelljs');
const semver = require('./semver');

/**
 * Searches for a module on github
 * @return {Promise}
 */
function lookup_github(name, version) {
    if(typeof version == 'undefined') version = '*';
    let fullname = name.split('/');
    if(fullname.length > 2 || fullname.length == 0) return Promise.reject('Invalid module name: "' + fullname + '"');

    // default to atomar-php owner
    if(fullname.length == 1) fullname.unshift('atomar-php');

    let owner = fullname[0];
    let module_slug = fullname[1].replace(/^atomar\-/, '');
    let repo = /^atomar/.test(module_slug) ? module_slug : 'atomar-' + module_slug;


    let tags_url = 'https://api.github.com/repos/' + owner + '/' + repo + '/tags';
    let tags = curl(tags_url);

    // repo does not exist
    if(tags.message) return null;

    let tag = null;
    if(typeof version === 'string') {
        for(let i = 0; i < tags.length; i ++) {
            if(semver(tags[i].name, version) === 0) {
                tag = tags[i];
                break;
            }
        }
    } else {
        tag = tag[0];
    }


    return {
        commit: tag ? tag.commit.sha : null,
        version: tag ? tag.name : '*',
        owner: owner,
        slug: module_slug,
        repo: repo,
        tags_url: tags_url,
        clone: {
            http: 'https://github.com/' + owner + '/' + repo,
            ssh: 'git@github.com:' + owner + '/' + repo
        }
    };
}

/**
 * Performs a curl and gives the response as a json object
 * @param url
 * @return
 */
function curl(url) {
    let stdout = shell.exec('curl ' + url, {silent:true}).stdout;
    return JSON.parse(stdout);
    // TODO: handle curl errors
}

module.exports.lookup_module = lookup_github;