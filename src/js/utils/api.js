/* globals fetch: false */
'use strict';
var _ = require('underscore');
var endpoint = require('../endpoint');
var urljoin = require('urljoin');

function stringifyGETParams(url, data) {
    var query = '';

    for (var key in data) {
        if (data.hasOwnProperty(key) && data[key] !== null) {
            query += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }
    }
    if (query) {
        url += (~url.indexOf('?') ? '&' : '?') + query.substring(1);
    }
    return url;
}

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    throw new Error(response.statusText);
}

function json(response) {
    return response.json();
}

module.exports.call = function call(options) {
    var url = urljoin(endpoint.rootUrl, '/api/', options.url);
    var data = options.data;
    var method = options.method;

    if(_.isString(data)) {
        data = JSON.parse(data);
    }

    data = _.extend({}, data, {
        appUserId: endpoint.appUserId
    });

    if (method === 'GET') {
        url = stringifyGETParams(url, data);
    } else {
        data = JSON.stringify(data);
    }

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if(endpoint.appToken) {
        headers['app-token'] = endpoint.appToken;
    }

    if (endpoint.jwt) {
        headers['Authorization'] = 'Bearer ' + endpoint.jwt;
    }

    var promise = new Promise(function(resolve, reject) {
        fetch(url, {
                method: method,
                headers: headers,
                body: data
            })
            .then(status)
            .then(json)
            .then(function(body) {
                if (typeof options.success === 'function') {
                    options.success(body);
                }
                resolve(body);
            })
            .catch(function(err) {
                if (typeof options.success === 'function') {
                    options.error(err);
                }
                reject(err);
            });

    });

    return promise;
};