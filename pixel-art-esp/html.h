#pragma once

#include <Arduino.h>

static const char WS_TEST_HTML[] PROGMEM = R"KEY(
<html>
<head>
    <script>
        var connection = new WebSocket('ws://'+location.hostname+':81/ws/', ['arduino']);
        connection.onopen = function() {
            console.log('WebSocket connection established.', connection);
        };
        connection.onclose = function() {
            console.log('WebSocket connection closed.', connection);
        };
        connection.onerror = function(error) {
            console.log('WebSocket error ', error);
        };
        connection.onmessage = function(e) {
            console.log('Server: ', e.data);
        };
        function sendValue() {  
            var value = parseInt(document.getElementById('input').value, 10);
            connection.send('{\"value\":' + value + '}');
        }
    </script>
</head>
<body>
    <div>
        Input:<input id="input" type="range" min="-25" max="25" step="5" oninput="sendValue();"/>
    </div>
</body>
</html>
)KEY";