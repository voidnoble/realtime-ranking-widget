/**
 * @brief Realtime session on this web page
 * @author Created by cezips@gmail.com
 * @date 2016. 5. 10.
 * @description
 *  http://socket.io/docs/client-api/#socket
 */
'use strict';

var _host = "xxx.xxx.xxx.xxx";

var socket = io('http://'+ _host +':38000');

var _id = location.pathname.replace('/article/', '');
var _title = document.title;

socket.on('connect', function () {
    console.log('client socket.on:connect event fired.');

    let data = {
        id: _id,
        title: _title
    };

    console.log('client join.', data);
    socket.emit('join', data);
});

/**
 * emit('disconnect')
 */
socket.on('disconnect', function (data) {
    if (data == "transport close") {
        console.log('socket on:disconnect. Server crash.');
    } else {
        if (typeof data.id != 'undefined') {
            socket.emit('leave', { id: data.id });
        } else {
            socket.emit('leave', { id: _id });
        }
    }
});

socket.on('reconnect', function () {
    let data = {
        id: _id,
        title: _title
    };

    console.log('socket on:reconnect', data);
    //socket.emit('reconnect', data);   // Uncaught RangeError: Maximum call stack size exceeded
});

socket.on('top_articles', function (data) {
    console.log('socket on:top_articles', data);
});

socket.on('print_total_session_count', function (data) {
    console.log('socket on:print_total_session_count', data);
});

socket.on('print_top_news', function (data) {
    console.log('socket on:print_top_news', data);

    var html = "", rows = [], row = {}, spliced = [];

    while(true) {
        spliced = data.splice(0, 3);

        row = {
            gid: spliced[0],
            title: spliced[1].replace('CORP - ', ''),
            count: spliced[2]
        };

        rows.push(row);

        if (data.length == 0) break;
    }

    for(var i = 0; i < rows.length; i++) {
        html += '<li><a href="/article/'+ rows[i].gid +'">'+ rows[i].title +' ('+ rows[i].count +')</a></li>';
    }

    if ($('#aside2 .realtime__top-news').length == 0) {
        html = '<ol class="realtime__top-news">' + html + '</ol>';
        $('#aside2').append(html);
    } else {
        $('#aside2 .realtime__top-news').html(html);
    }
});

socket.on('print_socket_id', function (data) {
    console.log('socket on:print_socket_id', data.id);
});

socket.on('message', function (message) {
    console.log('socket on:message', message);
});
