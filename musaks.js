;(function() {
    'use strict';

    var audioCtx = new AudioContext();
    var paper = new Raphael(document.getElementById('canvas'), 800, 600);
    var sourceNodes = [];
    var currentTool = 'move';
    var currentConnection = null;

    function linePath(startX, startY, endX, endY) {
        return 'M' + startX + ' '+ startY + ' L' + endX + ' ' + endY;
    }

    Raphael.fn.line = function(startX, startY, endX, endY) {
        var line = this.path(linePath(startX, startY, endX, endY));
        line.startX = startX;
        line.startY = startY;
        line.endX = endX;
        line.endY = endY;
        line.redraw = function() {
            this.attr('path', linePath(this.startX, this.startY, this.endX, this.endY));
        };

        return line;
    };

    Raphael.fn.circleConnection = function(startCircle, endCircle) {
        var connection = this.line(startCircle.attr('cx'), startCircle.attr('cy'),
                                   endCircle.attr('cx'), endCircle.attr('cy'));
        connection.startCircle = startCircle;
        connection.endCircle = endCircle;
        connection.redraw = function() {
            this.attr('path', linePath(
                this.startCircle.attr('cx'), this.startCircle.attr('cy'),
                this.endCircle.attr('cx'), this.endCircle.attr('cy'))
            );
        };

        return connection;
    };

    function VisualNode(x, y, audioNode, color) {
        var self = this;
        this.connections = [];
        this.audioNode = audioNode;

        this.circle = paper.circle(x, y, 10).attr('fill', color || '#F00');
        this.circle.visualNode = this;
        this.circle.isNode = true;
        this.circle.drag(function(dx, dy) {
            if (currentTool == 'move') {
                this.attr({cx: x + dx, cy: y + dy});
                self.connections.forEach(function(connection) {
                    connection.redraw();
                });
            } else if (currentTool == 'connect') {
                currentConnection.endX = x + dx;
                currentConnection.endY = y + dy;
                currentConnection.redraw();
            }
        }, function() {
            if (currentTool == 'move') {
                x = this.attr('cx');
                y = this.attr('cy');
            } else if (currentTool == 'connect') {
                currentConnection = paper.line(x, y, x, y);
            }
        }, function() {
            if (currentConnection) {
                var elements = paper.getElementsByPoint(currentConnection.endX,
                                                        currentConnection.endY);
                if (elements) {
                    var topNode = null;
                    for (var k = 0; k < elements.length; k++) {
                        var element = elements[k];
                        if (element.isNode) {
                            topNode = element;
                            break;
                        }
                    }

                    if (topNode) {
                        self.connections.push(paper.circleConnection(this, topNode));
                        self.audioNode.connect(topNode.visualNode.audioNode);
                    }
                }

                currentConnection.remove();
                currentConnection = null;
            }
        });
    }

    paper.canvas.onclick = function(e) {
        e.preventDefault();
        if (currentTool == 'sourcenode') {
            var oscillator = audioCtx.createOscillator();
            oscillator.type = 'square';
            var gain = audioCtx.createGain();
            oscillator.connect(gain);
            gain.gain.value = 0;
            oscillator.start(0);
            sourceNodes.push(new VisualNode(e.pageX, e.pageY, gain));
        }
    };

    var $tools = $('#tools li');
    $tools.click(function(e) {
        var $newTool = $(this);
        currentTool = $newTool.data('tool');
        $tools.removeClass('selected');
        $newTool.addClass('selected');
    });

    $('#play').click(function() {
        sourceNodes.forEach(function(sourceNode) {
            sourceNode.audioNode.gain.value = 1;
        });
    });

    $('#stop').click(function() {
        sourceNodes.forEach(function(sourceNode) {
            sourceNode.audioNode.gain.value = 0;
        });
    });

    // Create node for destination.
    var destinationNode = new VisualNode(700, 300, audioCtx.destination, '#66F');
})();
