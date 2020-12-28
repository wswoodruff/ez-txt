'use strict';

module.exports = (srv, options) => ({
    plugins: {
        plugin: require('@wswoodruff/ez-sse'),
        options
    }
});
